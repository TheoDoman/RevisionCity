import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/exams/list — returns user's recent attempts + exam metadata
export async function GET(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ attempts: [] })

  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subjectId')

  // Fetch user's exam attempts with exam metadata
  let query = supabase
    .from('exam_attempts')
    .select(`
      id,
      exam_id,
      score,
      max_score,
      percentage,
      grade,
      started_at,
      completed_at,
      mock_exams!inner (
        id,
        subject_id,
        subject_name,
        exam_board,
        difficulty,
        total_marks,
        total_time_minutes,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  if (subjectId) {
    query = query.eq('mock_exams.subject_id', subjectId)
  }

  const { data: attempts, error } = await query

  if (error) {
    console.error('[Exam List] Error:', error)
    return NextResponse.json({ attempts: [] })
  }

  return NextResponse.json({ attempts: attempts ?? [] })
}
