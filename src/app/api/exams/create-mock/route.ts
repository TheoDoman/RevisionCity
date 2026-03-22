import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import type { ExamSection, ExamDifficulty } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const EXAM_SYSTEM_PROMPT = `You are an expert IGCSE examiner. Generate a realistic mock exam as strict JSON.

QUALITY RULES:
1. Questions must be genuine IGCSE-level difficulty — not trivial
2. Distribute questions across DIFFERENT topics (no topic > 35% of questions)
3. Multiple choice: 4 options labeled A/B/C/D, one correct, plausible distractors
4. Short answer: 2-4 marks, specific bullet-pointed mark scheme
5. Extended: 6-10 marks, level-descriptor mark scheme (L3/L2/L1)
6. Options must be on one line each (no sub-bullets inside options)

OUTPUT — JSON ONLY, no markdown fences, no preamble:
{
  "sections": [
    {
      "id": "section-a",
      "name": "Section A: Multiple Choice",
      "timeMinutes": 25,
      "totalMarks": 15,
      "questions": [
        {
          "id": "q-a-1",
          "type": "multiple_choice",
          "text": "Which process produces ATP in the absence of oxygen?",
          "marks": 1,
          "topic": "Respiration",
          "options": ["A. Aerobic respiration", "B. Anaerobic respiration", "C. Photosynthesis", "D. Transpiration"],
          "correctAnswer": "B",
          "markScheme": ["B"],
          "modelAnswer": "B. Anaerobic respiration"
        }
      ]
    },
    {
      "id": "section-b",
      "name": "Section B: Short Answer",
      "timeMinutes": 40,
      "totalMarks": 20,
      "questions": [
        {
          "id": "q-b-1",
          "type": "short_answer",
          "text": "Explain how a muscle contracts. [4]",
          "marks": 4,
          "topic": "Human Biology",
          "markScheme": ["Nerve impulse arrives at neuromuscular junction", "Acetylcholine released", "Action potential spreads along muscle fibre", "Actin and myosin filaments slide together"],
          "modelAnswer": "A nerve impulse travels to the muscle, causing acetylcholine release. This triggers an action potential that causes actin and myosin filaments to slide, shortening the sarcomere."
        }
      ]
    },
    {
      "id": "section-c",
      "name": "Section C: Extended Response",
      "timeMinutes": 25,
      "totalMarks": 8,
      "questions": [
        {
          "id": "q-c-1",
          "type": "extended_response",
          "text": "Describe and explain the process of photosynthesis, including the role of chlorophyll and the products formed. [8]",
          "marks": 8,
          "topic": "Photosynthesis",
          "markScheme": ["L3 (7-8): Detailed account of light and dark reactions, named products (glucose/oxygen/ATP), role of chlorophyll absorbing light, mentions NADPH/Calvin cycle", "L2 (4-6): Describes overall equation and mentions light energy and chlorophyll, some product detail", "L1 (1-3): Basic equation or simple description, limited detail"],
          "modelAnswer": "Photosynthesis occurs in two stages. In the light-dependent reactions, chlorophyll absorbs light energy to split water molecules (photolysis), releasing oxygen and producing ATP and NADPH. In the light-independent reactions (Calvin cycle), CO2 is fixed using ATP and NADPH to produce glucose. The overall equation is: 6CO2 + 6H2O → C6H12O6 + 6O2."
        }
      ]
    }
  ]
}`

function percentageToGrade(pct: number): string {
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
percentageToGrade // suppress unused warning (used by submit route pattern)

function buildUserPrompt(
  subjectName: string,
  examBoard: string,
  difficulty: ExamDifficulty,
  durationMinutes: number,
  topics: { name: string }[],
  focusTopics?: string[],
): string {
  const topicList = topics.map((t) => t.name).join(', ')
  const focusLine = focusTopics?.length
    ? `Prioritise these topics: ${focusTopics.join(', ')}.`
    : ''

  const sectionSpec =
    durationMinutes >= 80
      ? '3 sections: Section A 15 MC questions (25 min, 15 marks), Section B 5 short-answer questions (40 min, 4 marks each = 20 marks), Section C 1 extended response (25 min, 8 marks). Total: 43 marks.'
      : durationMinutes >= 55
        ? '2 sections: Section A 12 MC questions (20 min, 12 marks), Section B 4 short-answer questions (30 min, 3 marks each = 12 marks). Total: 24 marks.'
        : '2 sections: Section A 15 MC questions (30 min, 15 marks), Section B 2 short-answer questions (15 min, 3 marks each = 6 marks). Total: 21 marks.'

  const difficultyNote =
    difficulty === 'easy'
      ? 'Questions should be accessible, testing recall and basic understanding.'
      : difficulty === 'hard'
        ? 'Questions should be challenging, requiring analysis, evaluation, and application.'
        : difficulty === 'medium'
          ? 'Questions should be moderate difficulty, mixing recall and application.'
          : 'Mix of easy (40%), medium (40%), and hard (20%) questions.'

  return `Generate a ${durationMinutes}-minute ${examBoard} IGCSE ${subjectName} mock exam.

Topics available: ${topicList}
${focusLine}
Structure: ${sectionSpec}
Difficulty: ${difficultyNote}

Ensure questions are specific, realistic, and test different skills. Use precise scientific/subject language.`
}

export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Free tier: max 1 exam per month
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentExams } = await supabase
    .from('mock_exams')
    .select('id')
    .eq('created_by', user.id)
    .gte('created_at', monthAgo)

  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .single()

  const isPremium =
    subscription?.status === 'active' &&
    (subscription?.tier === 'pro' || subscription?.tier === 'premium')

  if (!isPremium && recentExams && recentExams.length >= 1) {
    return NextResponse.json(
      {
        error: 'Free tier allows 1 mock exam per month. Upgrade to Premium for unlimited exams.',
        upgradeRequired: true,
      },
      { status: 403 }
    )
  }

  let body: {
    subjectId: string
    subjectName: string
    examBoard: 'cambridge' | 'edexcel'
    difficulty: ExamDifficulty
    durationMinutes: number
    focusTopics?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { subjectId, subjectName, examBoard, difficulty, durationMinutes, focusTopics } = body

  if (!subjectId || !subjectName || !examBoard || !durationMinutes) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch topics for the subject
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('subject_id', subjectId)
    .order('order_index')

  if (!topics?.length) {
    return NextResponse.json({ error: 'No topics found for this subject' }, { status: 404 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })

  const anthropic = new Anthropic({ apiKey })
  const userPrompt = buildUserPrompt(subjectName, examBoard, difficulty, durationMinutes, topics, focusTopics)

  let rawResponse = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 5000,
      system: EXAM_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    rawResponse = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
  } catch (err) {
    console.error('[Exam] Anthropic error:', err)
    return NextResponse.json({ error: 'Failed to generate exam. Please try again.' }, { status: 500 })
  }

  // Parse JSON — strip markdown fences if present
  let examData: { sections: ExamSection[] }
  try {
    const cleaned = rawResponse.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
    examData = JSON.parse(cleaned)
  } catch {
    const match = rawResponse.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[Exam] Parse error:', rawResponse.slice(0, 300))
      return NextResponse.json({ error: 'Failed to parse generated exam' }, { status: 500 })
    }
    try {
      examData = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'Failed to parse generated exam' }, { status: 500 })
    }
  }

  const sections: ExamSection[] = examData.sections ?? []
  const totalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0)
  const totalTimeMinutes = sections.reduce((sum, s) => sum + s.timeMinutes, 0)

  // Store exam in DB (WITH correct answers — never sent to client directly)
  const { data: savedExam, error: insertError } = await supabase
    .from('mock_exams')
    .insert({
      subject_id: subjectId,
      subject_name: subjectName,
      exam_board: examBoard,
      difficulty,
      sections,
      total_marks: totalMarks,
      total_time_minutes: totalTimeMinutes,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !savedExam) {
    console.error('[Exam] DB insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save exam' }, { status: 500 })
  }

  // Return public version (strip correct answers + mark schemes)
  const publicSections = sections.map((section) => ({
    ...section,
    questions: section.questions.map(({ correctAnswer: _ca, markScheme: _ms, modelAnswer: _ma, ...q }) => q),
  }))

  return NextResponse.json({
    examId: savedExam.id,
    exam: {
      id: savedExam.id,
      subjectId,
      subjectName,
      examBoard,
      difficulty,
      sections: publicSections,
      totalMarks,
      totalTimeMinutes,
    },
  })
}
