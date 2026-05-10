import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/ai/generated-tests/list — list signed-in user's saved AI tests
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ tests: [] })

  const { data, error } = await supabase
    .from('ai_generated_tests')
    .select('id, subject_name, topic_name, exam_board, difficulty, question_count, total_marks, last_score, last_max_score, last_taken_at, attempt_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[AI Tests] List error:', error)
    return NextResponse.json({ tests: [] })
  }

  return NextResponse.json({ tests: data ?? [] })
}
