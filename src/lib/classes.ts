import { clerkClient } from '@clerk/nextjs/server'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // unambiguous: no I/O/0/1

/** Generate a random 6-char join code from an unambiguous alphabet. */
export function generateJoinCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export interface ClerkUserLite {
  id: string
  fullName: string
  email: string | null
  imageUrl: string | null
}

/** Fetch Clerk users by id in one batch; missing ids produce a placeholder. */
export async function fetchClerkUsers(userIds: string[]): Promise<Map<string, ClerkUserLite>> {
  const out = new Map<string, ClerkUserLite>()
  if (!userIds.length) return out

  try {
    const client = await clerkClient()
    const { data } = await client.users.getUserList({ userId: userIds, limit: userIds.length })
    for (const u of data) {
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
      const email = u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null
      out.set(u.id, {
        id: u.id,
        fullName: fullName || (email ? email.split('@')[0] : 'Unknown'),
        email,
        imageUrl: u.imageUrl ?? null,
      })
    }
  } catch (err) {
    console.error('[classes] fetchClerkUsers error:', err)
  }

  // Fill in any missing ids with placeholders so callers never get undefined
  for (const id of userIds) {
    if (!out.has(id)) {
      out.set(id, { id, fullName: 'Unknown student', email: null, imageUrl: null })
    }
  }
  return out
}

export type Role = 'student' | 'teacher'

export function readRole(publicMetadata: unknown): Role {
  if (publicMetadata && typeof publicMetadata === 'object' && 'role' in publicMetadata) {
    const r = (publicMetadata as { role?: unknown }).role
    if (r === 'teacher') return 'teacher'
  }
  return 'student'
}
