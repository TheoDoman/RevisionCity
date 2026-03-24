import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import type { IGCSEGrade, WeekPlan, PlanCheckpoint, GradeProgressionPoint } from '@/types'
import { rateLimit, getIP, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GRADE_SYSTEM_PROMPT = `You are an expert IGCSE revision planner. Generate a personalised weekly study plan as JSON.

GRADE SCALE: 0-40%=U, 40-50%=G, 50-60%=F, 60-70%=E, 70-80%=D, 80-90%=C, 90-95%=B, 95-100%=A/A*

GRADE PROGRESSION RATES (per week of focused study):
- Current avg <50%: +5-7% per week
- Current avg 50-70%: +3-5% per week
- Current avg >70%: +1-2% per week

ALLOCATION RULES:
1. Weak topics (<60%): 4-6 hrs/week, front-load first 4 weeks, revisit every 2 weeks via spaced repetition
2. Medium topics (60-80%): 2-4 hrs/week, introduce from week 3
3. Strong topics (>80%): 1-2 hrs/week, push to week 6+
4. Every week: mix at least 3 content types from [notes, flashcards, quiz, practice, recall]
5. Weeks 3, 6, 9: mark isCheckpoint=true (20-question mini-test from weak areas)
6. Never exceed hoursPerWeek total per week
7. Cap plan at min(weeksUntilExam, 24) weeks

OUTPUT FORMAT — JSON only, no preamble, no markdown fences:
{
  "totalWeeks": number,
  "estimatedFinalGrade": "B",
  "gradeProgression": [
    {"week": 0, "grade": "E", "percentage": 58},
    {"week": 4, "grade": "D", "percentage": 68},
    {"week": 8, "grade": "C", "percentage": 78},
    {"week": 12, "grade": "B", "percentage": 85}
  ],
  "weeks": [
    {
      "week": 1,
      "estimatedGrade": "E",
      "estimatedPercentage": 60,
      "isCheckpoint": false,
      "topicAllocations": [
        {
          "topicId": "exact-id-from-input",
          "topicName": "Cells",
          "hours": 4,
          "contentTypes": ["notes", "flashcards", "quiz"],
          "priority": "high"
        }
      ]
    }
  ],
  "checkpoints": [
    {
      "week": 3,
      "focusTopicIds": ["id1", "id2"],
      "description": "Mini-test: 20 questions covering weak areas"
    }
  ]
}`

function percentageToGrade(pct: number): IGCSEGrade {
  if (pct >= 95) return 'A*'
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'  // adjusted — B starts at 80 in real IGCSE
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'E'  // D band
  if (pct >= 50) return 'F'
  if (pct >= 40) return 'G'
  return 'U'
}

// GET — return existing plan for a subject
export async function GET(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ plan: null })

  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subjectId')
  if (!subjectId) return NextResponse.json({ plan: null })

  const { data, error } = await supabase
    .from('revision_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return NextResponse.json({ plan: null })

  return NextResponse.json({
    plan: {
      id: data.id,
      userId: data.user_id,
      subjectId: data.subject_id,
      subjectName: data.subject_name,
      examBoard: data.exam_board,
      examDate: data.exam_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      totalWeeks: data.total_weeks,
      estimatedFinalGrade: data.estimated_final_grade,
      targetGrade: data.target_grade,
      hoursPerWeek: data.hours_per_week,
      weeks: data.weeks_data,
      checkpoints: data.checkpoints,
      gradeProgression: data.grade_progression,
    },
  })
}

// POST — generate a new plan
export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Rate limiting: 10 req/min per user (Anthropic route)
  const rlKey = `anthropic:${user.id}`
  const { allowed, retryAfter } = rateLimit(rlKey, 10)
  if (!allowed) return tooManyRequests(retryAfter)

  let body: {
    subjectId: string
    subjectName: string
    examBoard: 'cambridge' | 'edexcel'
    examDate: string
    targetGrade: IGCSEGrade
    hoursPerWeek: number
    replanning?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { subjectId, subjectName, examBoard, examDate, targetGrade, hoursPerWeek, replanning } = body

  if (!subjectId || !examDate || !targetGrade || !hoursPerWeek) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Rate limit: 1 plan generation per day per user+subject (unless re-planning)
  if (!replanning) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentPlans } = await supabase
      .from('revision_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('subject_id', subjectId)
      .gte('created_at', oneDayAgo)

    if (recentPlans && recentPlans.length > 0) {
      return NextResponse.json(
        { error: 'Plan already generated today. Try again tomorrow or use the Re-plan option.' },
        { status: 429 }
      )
    }
  }

  // Fetch topics for the subject
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .eq('subject_id', subjectId)
    .order('order_index')

  if (!topics || topics.length === 0) {
    return NextResponse.json({ error: 'No topics found for subject' }, { status: 404 })
  }

  // Fetch user's quiz scores per topic from user_activity
  const { data: activityRows } = await supabase
    .from('user_activity')
    .select('topic_id, score')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .eq('activity_type', 'quiz')
    .not('score', 'is', null)

  // Build per-topic score map
  const scoreMap: Record<string, number[]> = {}
  for (const row of activityRows ?? []) {
    if (!row.topic_id) continue
    if (!scoreMap[row.topic_id]) scoreMap[row.topic_id] = []
    scoreMap[row.topic_id].push(row.score)
  }

  const topicScores = topics.map((t) => {
    const scores = scoreMap[t.id] ?? []
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { topicId: t.id, topicName: t.name, avgScore: avg, attempts: scores.length }
  })

  const currentAvg =
    topicScores.length > 0
      ? Math.round(topicScores.reduce((a, b) => a + b.avgScore, 0) / topicScores.length)
      : 45

  const examDateObj = new Date(examDate)
  const now = new Date()
  const weeksUntilExam = Math.max(1, Math.ceil((examDateObj.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)))

  const topicScoresText = topicScores
    .map((t) => `  - ${t.topicName} (id: ${t.topicId}): ${t.avgScore}% avg (${t.attempts} attempts)`)
    .join('\n')

  const userPrompt = `Generate a revision plan for:
- Subject: ${subjectName} (${examBoard} IGCSE)
- Weeks until exam: ${weeksUntilExam}
- Hours per week: ${hoursPerWeek}
- Target grade: ${targetGrade}
- Current average: ${currentAvg}%
- Topic scores:
${topicScoresText}

Follow all rules from the system prompt. Use exact topicId values from the input above.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }

  const anthropic = new Anthropic({ apiKey })

  let rawResponse = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      system: GRADE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    rawResponse = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
  } catch (err) {
    console.error('[RevisionPlan] Anthropic error:', err)
    return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 })
  }

  // Parse JSON response — strip any markdown fences
  let planData: {
    totalWeeks: number
    estimatedFinalGrade: IGCSEGrade
    gradeProgression: GradeProgressionPoint[]
    weeks: WeekPlan[]
    checkpoints: PlanCheckpoint[]
  }

  try {
    const cleaned = rawResponse.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
    planData = JSON.parse(cleaned)
  } catch {
    // Try to extract JSON from the response
    const match = rawResponse.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[RevisionPlan] Could not parse response:', rawResponse.slice(0, 500))
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
    try {
      planData = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  }

  // Ensure grades are consistent with percentages
  planData.gradeProgression = planData.gradeProgression.map((p) => ({
    ...p,
    grade: percentageToGrade(p.percentage),
  }))

  // Delete any existing plan for this user+subject before inserting new one
  if (replanning) {
    await supabase
      .from('revision_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('subject_id', subjectId)
  }

  // Store plan in DB
  const { data: savedPlan, error: insertError } = await supabase
    .from('revision_plans')
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      subject_name: subjectName,
      exam_board: examBoard,
      exam_date: examDate,
      total_weeks: planData.totalWeeks,
      estimated_final_grade: planData.estimatedFinalGrade,
      target_grade: targetGrade,
      hours_per_week: hoursPerWeek,
      weeks_data: planData.weeks,
      checkpoints: planData.checkpoints,
      grade_progression: planData.gradeProgression,
    })
    .select('id')
    .single()

  if (insertError || !savedPlan) {
    console.error('[RevisionPlan] DB insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 })
  }

  return NextResponse.json({
    plan: {
      id: savedPlan.id,
      userId: user.id,
      subjectId,
      subjectName,
      examBoard,
      examDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalWeeks: planData.totalWeeks,
      estimatedFinalGrade: planData.estimatedFinalGrade,
      targetGrade,
      hoursPerWeek,
      weeks: planData.weeks,
      checkpoints: planData.checkpoints,
      gradeProgression: planData.gradeProgression,
    },
  })
}
