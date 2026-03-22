import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import type { ExamSection, ExamAnalysis, IGCSEGrade, TopicScore, SectionScore, QuestionTiming } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function pctToGrade(pct: number): IGCSEGrade {
  if (pct >= 90) return 'A*'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B'
  if (pct >= 60) return 'C'
  if (pct >= 50) return 'D'
  if (pct >= 40) return 'E'
  if (pct >= 30) return 'F'
  if (pct >= 20) return 'G'
  return 'U'
}

function nextGrade(g: IGCSEGrade): IGCSEGrade {
  const order: IGCSEGrade[] = ['U', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'A*']
  const idx = order.indexOf(g)
  return idx < order.length - 1 ? order[idx + 1] : g
}

function gradeMinPct(g: IGCSEGrade): number {
  const map: Record<IGCSEGrade, number> = { U: 0, G: 20, F: 30, E: 40, D: 50, C: 60, B: 70, A: 80, 'A*': 90 }
  return map[g]
}

const GRADING_SYSTEM_PROMPT = `You are a strict but fair IGCSE examiner grading student responses.

For each written question provided:
1. Compare the student answer against the mark scheme
2. Award marks fairly — partial credit where appropriate
3. For extended responses, apply level descriptors

OUTPUT — JSON only, no preamble:
{
  "gradings": [
    {
      "questionId": "q-b-1",
      "marksAwarded": 3,
      "maxMarks": 4,
      "feedback": "Good explanation of X but missed Y"
    }
  ]
}`

export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: {
    examId: string
    answers: Record<string, string>
    timingData: Record<string, number>
    markedForReview: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { examId, answers, timingData, markedForReview } = body
  if (!examId) return NextResponse.json({ error: 'examId required' }, { status: 400 })

  // Check for duplicate submission
  const { data: existing } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('user_id', user.id)
    .eq('exam_id', examId)
    .not('completed_at', 'is', null)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Exam already submitted', attemptId: existing.id }, { status: 409 })
  }

  // Fetch exam with correct answers
  const { data: examRow, error: examErr } = await supabase
    .from('mock_exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (examErr || !examRow) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const sections: ExamSection[] = examRow.sections ?? []
  const allQuestions = sections.flatMap((s) => s.questions)
  const maxScore = examRow.total_marks

  // ── Step 1: Auto-grade multiple choice ─────────────────────────────────────
  const mcGrades: Record<string, number> = {}
  for (const q of allQuestions) {
    if (q.type === 'multiple_choice') {
      const studentAns = (answers[q.id] ?? '').trim().toUpperCase().charAt(0)
      const correct = (q.correctAnswer ?? '').trim().toUpperCase().charAt(0)
      mcGrades[q.id] = studentAns === correct ? q.marks : 0
    }
  }

  // ── Step 2: Grade written answers via Claude ────────────────────────────────
  const writtenQuestions = allQuestions.filter((q) => q.type !== 'multiple_choice')
  const writtenGrades: Record<string, number> = {}
  const writtenFeedback: Record<string, string> = {}

  if (writtenQuestions.length > 0) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const anthropic = new Anthropic({ apiKey })

      const questionBlocks = writtenQuestions
        .map((q) => {
          const studentAnswer = answers[q.id] ?? '(no answer provided)'
          return `Q${q.id} [${q.marks} marks] — ${q.topic}
Question: ${q.text}
Mark scheme: ${q.markScheme.join(' | ')}
Student answer: ${studentAnswer}`
        })
        .join('\n\n')

      try {
        const msg = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1500,
          system: GRADING_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Grade these student responses:\n\n${questionBlocks}` }],
        })
        const raw = msg.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as { type: 'text'; text: string }).text)
          .join('')

        const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
        const parsed: { gradings: { questionId: string; marksAwarded: number; feedback: string }[] } =
          JSON.parse(cleaned)

        for (const g of parsed.gradings ?? []) {
          writtenGrades[g.questionId] = g.marksAwarded
          writtenFeedback[g.questionId] = g.feedback
        }
      } catch (err) {
        console.error('[Exam] Grading error:', err)
        // Fallback: award 50% for written if AI fails
        for (const q of writtenQuestions) {
          writtenGrades[q.id] = Math.round(q.marks * 0.5)
        }
      }
    }
  }

  // ── Step 3: Calculate scores ────────────────────────────────────────────────
  const allGrades = { ...mcGrades, ...writtenGrades }
  const totalScore = Object.values(allGrades).reduce((a, b) => a + b, 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  const grade = pctToGrade(percentage)

  // By topic
  const topicMap: Record<string, { score: number; max: number }> = {}
  for (const q of allQuestions) {
    if (!topicMap[q.topic]) topicMap[q.topic] = { score: 0, max: 0 }
    topicMap[q.topic].score += allGrades[q.id] ?? 0
    topicMap[q.topic].max += q.marks
  }
  const byTopic: TopicScore[] = Object.entries(topicMap).map(([topic, { score, max }]) => ({
    topic,
    score,
    maxScore: max,
    accuracy: max > 0 ? Math.round((score / max) * 100) : 0,
  }))

  // By section
  const bySection: SectionScore[] = sections.map((s) => {
    const sScore = s.questions.reduce((sum, q) => sum + (allGrades[q.id] ?? 0), 0)
    return {
      section: s.name,
      score: sScore,
      maxScore: s.totalMarks,
      accuracy: s.totalMarks > 0 ? Math.round((sScore / s.totalMarks) * 100) : 0,
    }
  })

  // Timing analysis
  let qNum = 0
  const timingAnalysis: QuestionTiming[] = allQuestions.map((q) => {
    qNum++
    const timeSpent = (timingData[q.id] ?? 0)
    const marksAwarded = allGrades[q.id] ?? 0
    const mins = timeSpent / 60
    return {
      questionId: q.id,
      questionNum: qNum,
      timeSpent,
      marksAwarded,
      efficiency: mins > 0 ? Math.round((marksAwarded / mins) * 10) / 10 : 0,
    }
  })

  // Confidence analysis
  const reviewSet = new Set(markedForReview)
  const reviewedCorrect = markedForReview.filter((id) => {
    const q = allQuestions.find((q) => q.id === id)
    return q && (allGrades[id] ?? 0) >= q.marks * 0.7
  }).length
  const notReviewedIds = allQuestions.map((q) => q.id).filter((id) => !reviewSet.has(id))
  const notReviewedCorrect = notReviewedIds.filter((id) => {
    const q = allQuestions.find((q) => q.id === id)
    return q && (allGrades[id] ?? 0) >= q.marks * 0.7
  }).length

  // Weak areas & strengths
  const weakAreas = byTopic.filter((t) => t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((t) => t.topic)
  const strengths = byTopic.filter((t) => t.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy).slice(0, 3).map((t) => t.topic)

  // Grade improvement
  const gradeForImprovement = nextGrade(grade)
  const gradeMinScore = Math.ceil((gradeMinPct(gradeForImprovement) / 100) * maxScore)
  const marksNeeded = Math.max(0, gradeMinScore - totalScore)

  // Next steps
  const nextSteps: string[] = []
  if (weakAreas.length > 0) nextSteps.push(`Focus on ${weakAreas[0]} — your weakest area at ${byTopic.find((t) => t.topic === weakAreas[0])?.accuracy ?? 0}% accuracy`)
  if (marksNeeded > 0) nextSteps.push(`You need ${marksNeeded} more marks to reach Grade ${gradeForImprovement}`)
  const slowQuestions = timingAnalysis.filter((t) => t.timeSpent > 300 && t.marksAwarded < 3)
  if (slowQuestions.length > 0) nextSteps.push(`Practice time management — ${slowQuestions.length} question(s) took over 5 minutes`)
  if (bySection.find((s) => s.section.toLowerCase().includes('extended') && s.accuracy < 60)) {
    nextSteps.push('Extended response answers need more detail — practice writing structured answers')
  }
  if (nextSteps.length < 2) nextSteps.push('Take another mock exam in 1-2 weeks to track your improvement')

  // ── Step 4: Class comparison ────────────────────────────────────────────────
  const { data: classData } = await supabase
    .from('exam_attempts')
    .select('score, max_score')
    .eq('exam_id', examId)
    .not('completed_at', 'is', null)
    .not('score', 'is', null)
    .not('max_score', 'is', null)

  let classComparison: ExamAnalysis['classComparison'] | undefined
  if (classData && classData.length >= 5) {
    const classScores = classData.map((r) => (r.max_score > 0 ? (r.score / r.max_score) * 100 : 0))
    const classAvg = Math.round(classScores.reduce((a, b) => a + b, 0) / classScores.length)
    const rank = classScores.filter((s) => s < percentage).length
    classComparison = {
      yourScore: percentage,
      classAverage: classAvg,
      percentile: Math.round((rank / classScores.length) * 100),
      totalStudents: classScores.length,
    }
  }

  const analysis: ExamAnalysis = {
    overallScore: totalScore,
    maxScore,
    percentage,
    gradePrediction: grade,
    gradeForImprovement,
    marksNeeded,
    byTopic,
    bySection,
    timingAnalysis,
    weakAreas,
    strengths,
    confidenceAccuracy: {
      markedForReview: {
        attempted: markedForReview.length,
        correct: reviewedCorrect,
        accuracy: markedForReview.length > 0 ? Math.round((reviewedCorrect / markedForReview.length) * 100) : 0,
      },
      notMarked: {
        attempted: notReviewedIds.length,
        correct: notReviewedCorrect,
        accuracy: notReviewedIds.length > 0 ? Math.round((notReviewedCorrect / notReviewedIds.length) * 100) : 0,
      },
    },
    nextSteps,
    classComparison,
  }

  // ── Step 5: Save attempt ────────────────────────────────────────────────────
  const { data: attempt, error: attemptErr } = await supabase
    .from('exam_attempts')
    .insert({
      user_id: user.id,
      exam_id: examId,
      answers,
      timing_data: timingData,
      marked_for_review: markedForReview,
      score: totalScore,
      max_score: maxScore,
      percentage,
      grade,
      analysis,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (attemptErr || !attempt) {
    console.error('[Exam] Attempt insert error:', attemptErr)
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  }

  // Increment exam total_attempts
  try { await supabase.rpc('increment_exam_attempts', { exam_id_param: examId }) } catch { /* ignore */ }

  // Log to user_activity for revision plan integration
  supabase.from('user_activity').insert({
    user_id: user.id,
    activity_type: 'quiz',
    subject_id: examRow.subject_id,
    score: percentage,
    created_at: new Date().toISOString(),
  }).then(() => {})

  return NextResponse.json({ attemptId: attempt.id, analysis })
}
