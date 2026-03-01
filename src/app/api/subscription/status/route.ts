import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ tier: 'free' })
    }

    // Get subscription from database - don't filter by status yet
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      return NextResponse.json({ tier: 'free' })
    }

    // Check if subscription has expired
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    const hasExpired = periodEnd < now

    // If expired, automatically update status to expired
    if (hasExpired && subscription.status !== 'expired' && subscription.status !== 'canceled') {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id)

      console.log('✅ Subscription expired:', subscription.id)
      return NextResponse.json({ tier: 'free' })
    }

    // If subscription is active or trialing, they have access
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      return NextResponse.json({
        tier: subscription.tier,
        interval: subscription.interval,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      })
    }

    // For any other status (canceled, expired, etc.), return free
    return NextResponse.json({ tier: 'free' })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ tier: 'free' })
  }
}
