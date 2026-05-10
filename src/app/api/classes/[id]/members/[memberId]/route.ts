import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Ctx {
  params: Promise<{ id: string; memberId: string }>
}

// DELETE — remove a student from a class. Either the teacher (kicking) or the
// student themselves (leaving) can call this. Soft-delete by setting removed_at.
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id: classId, memberId: studentUserId } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data: cls } = await supabase
    .from('classes')
    .select('teacher_user_id')
    .eq('id', classId)
    .single()

  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

  const isTeacher = cls.teacher_user_id === user.id
  const isSelf = studentUserId === user.id
  if (!isTeacher && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('class_memberships')
    .update({ removed_at: new Date().toISOString() })
    .eq('class_id', classId)
    .eq('student_user_id', studentUserId)

  if (error) {
    console.error('[classes] remove member error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
