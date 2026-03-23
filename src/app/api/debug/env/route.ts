import { NextResponse } from 'next/server'

export async function GET() {
  // Restricted to development only — never exposes key values or prefixes
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasPriceIds: {
        proMonthly: !!process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        proYearly: !!process.env.STRIPE_PRO_YEARLY_PRICE_ID,
        premiumMonthly: !!process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        premiumYearly: !!process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
      },
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    clerk: {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    },
    anthropic: {
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    },
  })
}
