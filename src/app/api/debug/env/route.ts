import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development or with a secret key
  const isDev = process.env.NODE_ENV === 'development'
  const debugKey = process.env.DEBUG_SECRET_KEY

  // For production, require a secret key in the URL
  // Usage: /api/debug/env?key=YOUR_SECRET_KEY

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 15) + '...',
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 15) + '...',
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 15) + '...',
      hasPriceIds: {
        proMonthly: !!process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        proYearly: !!process.env.STRIPE_PRO_YEARLY_PRICE_ID,
        premiumMonthly: !!process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        premiumYearly: !!process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
      },
      priceIds: {
        proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        proYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
        premiumMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        premiumYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
      }
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    clerk: {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    },
    app: {
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    },
    allEnvVars: Object.keys(process.env).filter(key =>
      key.includes('STRIPE') ||
      key.includes('SUPABASE') ||
      key.includes('CLERK') ||
      key.includes('APP_URL')
    ).sort(),
  })
}
