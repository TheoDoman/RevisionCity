import { NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'

export async function GET() {
  try {
    // Test 1: Check if environment variables are loaded
    const envCheck = {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 15),
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
    }

    // Test 2: Try to retrieve a price from Stripe
    const priceId = STRIPE_PLANS.pro.monthly.priceId
    let priceTest: any = null
    let priceError: any = null

    try {
      const price = await stripe.prices.retrieve(priceId)
      priceTest = {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        type: price.type,
      }
    } catch (err: any) {
      priceError = {
        message: err.message,
        type: err.type,
        statusCode: err.statusCode,
        raw: err.raw,
        headers: err.headers,
        requestId: err.requestId,
      }
    }

    // Test 3: Try a direct fetch to Stripe API
    let directFetchTest: any = null
    let directFetchError: any = null

    try {
      const response = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      })

      if (response.ok) {
        directFetchTest = await response.json()
      } else {
        directFetchError = {
          status: response.status,
          statusText: response.statusText,
          body: await response.text(),
        }
      }
    } catch (err: any) {
      directFetchError = {
        message: err.message,
        name: err.name,
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envCheck,
      stripeApiTest: {
        priceId,
        result: priceTest,
        error: priceError,
      },
      directFetchTest: {
        result: directFetchTest,
        error: directFetchError,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
