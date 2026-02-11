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

    // Get subscription from database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error || !subscription) {
      return NextResponse.json({ tier: 'free' })
    }

    return NextResponse.json({
      tier: subscription.tier,
      interval: subscription.interval,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ tier: 'free' })
  }
}
