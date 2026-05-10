import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteCtx {
  params: Promise<{ id: string }>
}

// GET — fetch a saved AI test (only the owner can read it)
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data, error } = await supabase
    .from('ai_generated_tests')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

  return NextResponse.json({ test: data })
}

// POST — record a retake attempt (score + max_score)
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: { score?: number; maxScore?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const score = Number(body.score)
  const maxScore = Number(body.maxScore)
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
    return NextResponse.json({ error: 'score and maxScore required' }, { status: 400 })
  }

  // Fetch current attempt_count to increment (avoids needing an RPC)
  const { data: existing } = await supabase
    .from('ai_generated_tests')
    .select('attempt_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

  const { error } = await supabase
    .from('ai_generated_tests')
    .update({
      last_score: score,
      last_max_score: maxScore,
      last_taken_at: new Date().toISOString(),
      attempt_count: (existing.attempt_count ?? 0) + 1,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[AI Tests] Record attempt error:', error)
    return NextResponse.json({ error: 'Failed to record attempt' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — let users prune saved tests
export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { error } = await supabase
    .from('ai_generated_tests')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
