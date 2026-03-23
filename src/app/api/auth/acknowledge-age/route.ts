import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { acknowledgedAt } = await request.json()
  const timestamp = acknowledgedAt || new Date().toISOString()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, age_acknowledged_at: timestamp },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )

  if (error) {
    // Table may not exist yet — log but don't fail the user flow
    console.error('[AgeAcknowledgement] Supabase upsert error:', error.message)
  }

  return NextResponse.json({ ok: true })
}
