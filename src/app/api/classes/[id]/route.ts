import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { fetchClerkUsers } from '@/lib/classes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Ctx {
  params: Promise<{ id: string }>
}

// GET — class detail. Teacher sees full roster + each student's activity.
// A student member sees the class summary + their own activity only.
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data: cls, error: classErr } = await supabase
    .from('classes')
    .select('id, name, teacher_user_id, join_code, archived_at, created_at')
    .eq('id', id)
    .single()

  if (classErr || !cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

  const isTeacher = cls.teacher_user_id === user.id

  // For non-teachers, confirm they're a member
  let isMember = false
  if (!isTeacher) {
    const { data: mem } = await supabase
      .from('class_memberships')
      .select('id')
      .eq('class_id', id)
      .eq('student_user_id', user.id)
      .is('removed_at', null)
      .maybeSingle()
    isMember = !!mem
  }
  if (!isTeacher && !isMember) {
    return NextResponse.json({ error: 'Not a member of this class' }, { status: 403 })
  }

  // Roster (only for teacher; student gets their own row)
  const { data: memberships } = await supabase
    .from('class_memberships')
    .select('id, student_user_id, joined_at')
    .eq('class_id', id)
    .is('removed_at', null)
    .order('joined_at', { ascending: true })

  const memberRows = memberships ?? []
  const studentIds = isTeacher ? memberRows.map((m) => m.student_user_id) : [user.id]

  // Fetch Clerk profile data
  const teacherInfo = (await fetchClerkUsers([cls.teacher_user_id])).get(cls.teacher_user_id)
  const studentMap = await fetchClerkUsers(studentIds)

  // Fetch each student's recent activity in parallel
  const studentsWithActivity = await Promise.all(
    studentIds.map(async (sid) => {
      const profile = studentMap.get(sid) ?? { id: sid, fullName: 'Unknown', email: null, imageUrl: null }
      const joinedAt = memberRows.find((m) => m.student_user_id === sid)?.joined_at ?? null

      // Recent mock-exam attempts
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select(`
          id, score, max_score, percentage, grade, completed_at,
          mock_exams!inner ( subject_name, exam_board, difficulty )
        `)
        .eq('user_id', sid)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5)

      // Recent AI tests taken
      const { data: aiTests } = await supabase
        .from('ai_generated_tests')
        .select('id, subject_name, topic_name, last_score, last_max_score, last_taken_at, attempt_count, created_at')
        .eq('user_id', sid)
        .order('created_at', { ascending: false })
        .limit(5)

      // Activity counts (for sparkline-style stats)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: activityCount } = await supabase
        .from('user_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', sid)
        .gte('created_at', since)

      // Average exam %
      const examScores = (attempts ?? []).filter((a) => typeof a.percentage === 'number')
      const avgExamPct = examScores.length
        ? Math.round(examScores.reduce((s, a) => s + (a.percentage as number), 0) / examScores.length)
        : null

      return {
        id: sid,
        name: profile.fullName,
        email: profile.email,
        imageUrl: profile.imageUrl,
        joined_at: joinedAt,
        recent_exam_attempts: attempts ?? [],
        recent_ai_tests: aiTests ?? [],
        activity_count_30d: activityCount ?? 0,
        avg_exam_percentage: avgExamPct,
      }
    })
  )

  // Aggregates (only meaningful for teacher view)
  const totalExams = studentsWithActivity.reduce((s, st) => s + st.recent_exam_attempts.length, 0)
  const allPcts = studentsWithActivity.flatMap((st) =>
    st.recent_exam_attempts.map((a) => a.percentage).filter((p): p is number => typeof p === 'number')
  )
  const classAvg = allPcts.length ? Math.round(allPcts.reduce((s, p) => s + p, 0) / allPcts.length) : null

  return NextResponse.json({
    class: {
      id: cls.id,
      name: cls.name,
      join_code: cls.join_code,
      archived_at: cls.archived_at,
      created_at: cls.created_at,
      teacher_id: cls.teacher_user_id,
      teacher_name: teacherInfo?.fullName ?? 'Unknown teacher',
      is_teacher: isTeacher,
      member_count: memberRows.length,
    },
    students: studentsWithActivity,
    aggregates: {
      total_exams_taken: totalExams,
      class_avg_percentage: classAvg,
    },
  })
}

// PATCH — rename / regenerate join code / archive (teacher only)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data: cls } = await supabase
    .from('classes')
    .select('teacher_user_id')
    .eq('id', id)
    .single()

  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  if (cls.teacher_user_id !== user.id) {
    return NextResponse.json({ error: 'Only the class owner can edit' }, { status: 403 })
  }

  let body: { name?: string; archive?: boolean; regenerate_code?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim().slice(0, 100)
  if (body.archive === true) update.archived_at = new Date().toISOString()
  if (body.archive === false) update.archived_at = null
  if (body.regenerate_code) {
    const { generateJoinCode } = await import('@/lib/classes')
    update.join_code = generateJoinCode()
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabase.from('classes').update(update).eq('id', id)
  if (error) {
    console.error('[classes] update error:', error)
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
