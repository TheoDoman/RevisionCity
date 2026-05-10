import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { generateJoinCode, readRole, fetchClerkUsers } from '@/lib/classes'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/classes — return classes I'm in (student) and classes I own (teacher)
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ teacherClasses: [], studentClasses: [] })

  const role = readRole(user.publicMetadata)

  // Owned (teacher)
  const { data: owned } = await supabase
    .from('classes')
    .select('id, name, join_code, archived_at, created_at')
    .eq('teacher_user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  // Joined (student)
  const { data: memberships } = await supabase
    .from('class_memberships')
    .select('class_id, joined_at, classes!inner(id, name, teacher_user_id, created_at, archived_at)')
    .eq('student_user_id', user.id)
    .is('removed_at', null)

  // Look up student counts for owned classes
  const ownedClasses = await Promise.all(
    (owned ?? []).map(async (c) => {
      const { count } = await supabase
        .from('class_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', c.id)
        .is('removed_at', null)
      return { ...c, student_count: count ?? 0 }
    })
  )

  // Look up teacher names for student-side classes
  type MembershipRow = {
    class_id: string
    joined_at: string
    classes: {
      id: string
      name: string
      teacher_user_id: string
      created_at: string
      archived_at: string | null
    }
  }
  const memRows = (memberships ?? []) as unknown as MembershipRow[]
  const teacherIds = Array.from(new Set(memRows.map((m) => m.classes.teacher_user_id)))
  const teacherMap = await fetchClerkUsers(teacherIds)

  const studentClasses = memRows
    .filter((m) => m.classes.archived_at === null)
    .map((m) => ({
      id: m.classes.id,
      name: m.classes.name,
      joined_at: m.joined_at,
      teacher_name: teacherMap.get(m.classes.teacher_user_id)?.fullName ?? 'Unknown teacher',
    }))

  return NextResponse.json({
    role,
    teacherClasses: ownedClasses,
    studentClasses,
  })
}

// POST /api/classes — create a new class (must be a teacher)
export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  if (readRole(user.publicMetadata) !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can create classes' }, { status: 403 })
  }

  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  if (!name || name.length > 100) {
    return NextResponse.json({ error: 'Class name is required (max 100 chars)' }, { status: 400 })
  }

  // Try a few times in case of (very rare) collision
  let saved: { id: string; join_code: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const join_code = generateJoinCode()
    const { data, error } = await supabase
      .from('classes')
      .insert({
        teacher_user_id: user.id,
        name,
        join_code,
      })
      .select('id, join_code')
      .single()

    if (!error && data) {
      saved = data
      break
    }
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      console.error('[classes] create error:', error)
      return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
    }
  }

  if (!saved) {
    return NextResponse.json({ error: 'Failed to generate a unique join code' }, { status: 500 })
  }

  return NextResponse.json({ class: saved })
}
