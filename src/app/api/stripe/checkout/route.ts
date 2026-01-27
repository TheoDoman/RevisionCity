import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tier, interval } = body

    if (!tier || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: tier and interval' },
        { status: 400 }
      )
    }

    if (!['pro', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "premium"' },
        { status: 400 }
      )
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    const userEmail = user.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail,
      tier,
      interval,
      successUrl: `${appUrl}/dashboard?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
