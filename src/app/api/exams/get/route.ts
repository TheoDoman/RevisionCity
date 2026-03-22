import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import type { ExamSection } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const examId = searchParams.get('examId')
  if (!examId) return NextResponse.json({ error: 'examId required' }, { status: 400 })

  const { data: exam, error } = await supabase
    .from('mock_exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (error || !exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  // Strip correct answers & mark schemes before sending to client
  const sections: ExamSection[] = exam.sections ?? []
  const publicSections = sections.map((section) => ({
    ...section,
    questions: section.questions.map(({ correctAnswer: _ca, markScheme: _ms, modelAnswer: _ma, ...q }) => q),
  }))

  return NextResponse.json({
    exam: {
      id: exam.id,
      subjectId: exam.subject_id,
      subjectName: exam.subject_name,
      examBoard: exam.exam_board,
      difficulty: exam.difficulty,
      sections: publicSections,
      totalMarks: exam.total_marks,
      totalTimeMinutes: exam.total_time_minutes,
      createdAt: exam.created_at,
      totalAttempts: exam.total_attempts,
    },
  })
}
