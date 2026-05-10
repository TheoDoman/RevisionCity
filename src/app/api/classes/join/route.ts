import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/classes/join — join a class by code
export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = (body.code ?? '').trim().toUpperCase()
  if (!code || code.length !== 6) {
    return NextResponse.json({ error: 'Enter the 6-character class code' }, { status: 400 })
  }

  const { data: cls, error } = await supabase
    .from('classes')
    .select('id, name, teacher_user_id, archived_at')
    .eq('join_code', code)
    .maybeSingle()

  if (error || !cls) {
    return NextResponse.json({ error: 'Class code not found' }, { status: 404 })
  }
  if (cls.archived_at) {
    return NextResponse.json({ error: 'This class is archived' }, { status: 410 })
  }
  if (cls.teacher_user_id === user.id) {
    return NextResponse.json({ error: "You're the teacher of this class" }, { status: 400 })
  }

  // Check if already a member (active or removed)
  const { data: existing } = await supabase
    .from('class_memberships')
    .select('id, removed_at')
    .eq('class_id', cls.id)
    .eq('student_user_id', user.id)
    .maybeSingle()

  if (existing && !existing.removed_at) {
    return NextResponse.json({ classId: cls.id, alreadyMember: true })
  }

  if (existing && existing.removed_at) {
    // Re-activate previously removed membership
    const { error: updErr } = await supabase
      .from('class_memberships')
      .update({ removed_at: null, joined_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (updErr) {
      console.error('[classes/join] reactivate error:', updErr)
      return NextResponse.json({ error: 'Failed to rejoin class' }, { status: 500 })
    }
  } else {
    const { error: insErr } = await supabase
      .from('class_memberships')
      .insert({ class_id: cls.id, student_user_id: user.id })
    if (insErr) {
      console.error('[classes/join] insert error:', insErr)
      return NextResponse.json({ error: 'Failed to join class' }, { status: 500 })
    }
  }

  return NextResponse.json({ classId: cls.id, className: cls.name })
}
