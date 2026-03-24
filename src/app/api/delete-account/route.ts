import { NextRequest, NextResponse } from 'next/server'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: NextRequest) {
  // Authenticate
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Strict rate limit: 3 attempts/min per user
  const { allowed, retryAfter } = rateLimit(`delete-account:${user.id}`, 3)
  if (!allowed) return tooManyRequests(retryAfter)

  const userId = user.id
  const errors: string[] = []

  // ── Step 1: Cancel active Stripe subscription ─────────────────────────────
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      console.log('[DeleteAccount] Cancelled Stripe subscription:', subscription.stripe_subscription_id)
    }
  } catch (err) {
    // Non-fatal: log but continue — subscription may already be cancelled
    console.error('[DeleteAccount] Stripe cancellation error:', err)
    errors.push('stripe_cancel')
  }

  // ── Step 2: Delete Supabase rows in dependency order ─────────────────────
  // Tables keyed by user_id
  const userIdTables = [
    'user_activity',
    'exam_attempts',
    'revision_plans',
    'subscriptions',
    'profiles',
  ]

  for (const table of userIdTables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error(`[DeleteAccount] Failed to delete from ${table}:`, error.message)
      errors.push(`db:${table}`)
    } else {
      console.log(`[DeleteAccount] Deleted rows from ${table} for user ${userId}`)
    }
  }

  // mock_exams uses created_by instead of user_id
  const { error: mockExamsError } = await supabase
    .from('mock_exams')
    .delete()
    .eq('created_by', userId)

  if (mockExamsError) {
    console.error('[DeleteAccount] Failed to delete from mock_exams:', mockExamsError.message)
    errors.push('db:mock_exams')
  } else {
    console.log(`[DeleteAccount] Deleted mock_exams for user ${userId}`)
  }

  // Abort if any DB deletions failed — do not delete the auth account
  // if user data could not be cleared (avoids orphaned data)
  if (errors.some(e => e.startsWith('db:'))) {
    return NextResponse.json(
      {
        error: 'Failed to delete all account data. Please contact support@revisioncity.net.',
        details: errors,
      },
      { status: 500 }
    )
  }

  // ── Step 3: Delete Clerk user ─────────────────────────────────────────────
  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
    console.log('[DeleteAccount] Deleted Clerk user:', userId)
  } catch (err) {
    console.error('[DeleteAccount] Clerk deleteUser error:', err)
    return NextResponse.json(
      {
        error: 'Account data was cleared but the auth account could not be deleted. Please contact support@revisioncity.net.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
