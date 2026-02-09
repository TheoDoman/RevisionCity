import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const STRIPE_PLANS = {
  pro: {
    monthly: {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      amount: 499, // €4.99
    },
    yearly: {
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
      amount: 3999, // €39.99
    },
  },
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      amount: 799, // €7.99
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
      amount: 6399, // €63.99
    },
  },
}

export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type BillingInterval = 'monthly' | 'yearly'

export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  interval,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  tier: 'pro' | 'premium'
  interval: BillingInterval
  successUrl: string
  cancelUrl: string
}) {
  const priceId = STRIPE_PLANS[tier][interval].priceId

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      interval,
    },
  })

  return session
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}
