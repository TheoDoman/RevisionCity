import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const attemptId = searchParams.get('attemptId')
  if (!attemptId) return NextResponse.json({ error: 'attemptId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('exam_attempts')
    .select(`
      id,
      user_id,
      exam_id,
      score,
      max_score,
      percentage,
      grade,
      analysis,
      started_at,
      completed_at,
      mock_exams!inner (
        subject_name,
        exam_board,
        difficulty,
        total_time_minutes
      )
    `)
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  const examMeta = Array.isArray(data.mock_exams) ? data.mock_exams[0] : data.mock_exams

  return NextResponse.json({
    attemptId: data.id,
    analysis: data.analysis,
    subjectName: examMeta?.subject_name ?? 'Exam',
    examBoard: examMeta?.exam_board ?? 'cambridge',
    score: data.score,
    maxScore: data.max_score,
    percentage: data.percentage,
    grade: data.grade,
    completedAt: data.completed_at,
  })
}
