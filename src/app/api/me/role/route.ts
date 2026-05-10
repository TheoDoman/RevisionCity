import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { readRole } from '@/lib/classes'

// GET — return my role
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ role: null })
  return NextResponse.json({ role: readRole(user.publicMetadata) })
}

// POST — set my role (one-time onboarding, but can be re-called to switch)
export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: { role?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.role !== 'student' && body.role !== 'teacher') {
    return NextResponse.json({ error: 'role must be "student" or "teacher"' }, { status: 400 })
  }

  const client = await clerkClient()
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { ...user.publicMetadata, role: body.role },
  })

  return NextResponse.json({ ok: true, role: body.role })
}
