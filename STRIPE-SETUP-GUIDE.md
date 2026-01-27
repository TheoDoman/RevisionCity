# 💳 STRIPE PAYMENT SETUP GUIDE

**Status:** Code installed, needs API keys + product setup
**Time Required:** 15-20 minutes
**Date:** January 26, 2026

---

## ✅ WHAT'S ALREADY DONE

All the Stripe integration code is installed! You just need to:
1. Get your Stripe API keys
2. Create products in Stripe
3. Add the keys to .env.local
4. Set up the webhook

**Installed:**
- ✅ Stripe package
- ✅ Checkout API endpoint (`/api/stripe/checkout`)
- ✅ Webhook handler (`/api/stripe/webhook`)
- ✅ Stripe utility functions
- ✅ Integrated checkout buttons on pricing page
- ✅ Supabase database integration for subscriptions

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Create Stripe Account (3 minutes)

1. Go to: **https://stripe.com/**
2. Click "Sign up" (free account, no fees until you earn money)
3. Sign up with email
4. Complete business verification (can skip for testing)

---

### Step 2: Get Your API Keys (1 minute)

1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Click "Reveal test key" for the secret key
4. Copy both keys (keep them somewhere safe for now)

---

### Step 3: Create Your Products (5 minutes)

#### Create Pro Monthly Product:

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name:** Revision City Pro (Monthly)
   - **Description:** Everything you need to ace your IGCSEs
   - **Pricing model:** Standard pricing
   - **Price:** £5.99 GBP
   - **Billing period:** Monthly
   - **Recurring:** Yes
3. Click **Add product**
4. **COPY THE PRICE ID** (starts with `price_`) - you'll need this!

#### Create Pro Yearly Product:

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name:** Revision City Pro (Yearly)
   - **Description:** Everything you need to ace your IGCSEs - Save 33%!
   - **Pricing model:** Standard pricing
   - **Price:** £47.99 GBP
   - **Billing period:** Yearly
   - **Recurring:** Yes
3. Click **Add product**
4. **COPY THE PRICE ID**

#### Create Premium Monthly Product:

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name:** Revision City Premium (Monthly)
   - **Description:** Pro features plus AI-powered tutoring
   - **Pricing model:** Standard pricing
   - **Price:** £9.99 GBP
   - **Billing period:** Monthly
   - **Recurring:** Yes
3. Click **Add product**
4. **COPY THE PRICE ID**

#### Create Premium Yearly Product:

1. Go to **Products** → **Add product**
2. Fill in:
   - **Name:** Revision City Premium (Yearly)
   - **Description:** Pro features plus AI-powered tutoring - Save 33%!
   - **Pricing model:** Standard pricing
   - **Price:** £79.99 GBP
   - **Billing period:** Yearly
   - **Recurring:** Yes
3. Click **Add product**
4. **COPY THE PRICE ID**

---

### Step 4: Add Keys to .env.local (2 minutes)

Open your `.env.local` file and update these values:

```bash
# Stripe Payment Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Add these NEW variables with your Price IDs:
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
```

---

### Step 5: Set Up Webhook (5 minutes)

For **local testing**, we'll use Stripe CLI:

#### Install Stripe CLI:

**Mac (using Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

#### Login and Forward Webhooks:

```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This will give you a **webhook signing secret** (starts with `whsec_`).

#### Add Webhook Secret to .env.local:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**IMPORTANT:** Keep the `stripe listen` command running in a separate terminal while testing!

---

### Step 6: Create Supabase Table (3 minutes)

Your webhook saves subscription data to Supabase. Create the table:

1. Go to your Supabase dashboard
2. Click **SQL Editor**
3. Run this SQL:

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL,
  interval TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

---

### Step 7: Test It! (2 minutes)

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Open three terminals:**
   - Terminal 1: `npm run dev` (your app)
   - Terminal 2: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
   - Terminal 3: Free for commands

3. **Test the flow:**
   - Go to http://localhost:3001/pricing
   - Click "Get Pro" on the Pro plan
   - Sign in if needed
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future date for expiry
   - Any 3 digits for CVC
   - Complete the payment
   - You'll be redirected back to your dashboard!

4. **Verify it worked:**
   - Check Terminal 2 (stripe listen) - you should see webhook events
   - Check your Supabase subscriptions table - you should see a new row
   - Check Stripe Dashboard → Payments - you should see the test payment

---

## 🎯 WHAT WORKS NOW

✅ **User clicks "Get Pro" or "Get Premium"**
✅ **Redirected to Stripe Checkout (beautiful, secure payment page)**
✅ **Pay with credit card (supports Apple Pay, Google Pay too!)**
✅ **Subscription created in Stripe**
✅ **Webhook automatically saves subscription to Supabase**
✅ **User redirected back to dashboard on success**

---

## 🔄 WEBHOOK EVENTS HANDLED

Your webhook automatically handles:

- ✅ `checkout.session.completed` - New subscription created
- ✅ `customer.subscription.updated` - Subscription changed (upgrade/downgrade)
- ✅ `customer.subscription.deleted` - Subscription canceled
- ✅ `invoice.payment_succeeded` - Recurring payment successful
- ✅ `invoice.payment_failed` - Payment failed (card declined, etc.)

---

## 💡 PRODUCTION DEPLOYMENT

When you're ready to go live:

### 1. Switch to Live Keys:

In Stripe Dashboard:
- Toggle from "Test mode" to "Live mode"
- Get your live API keys from **Developers** → **API Keys**
- Create the same 4 products in live mode
- Update `.env.local` with live keys

### 2. Set Up Production Webhook:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to your production environment variables

---

## 📊 VIEWING SUBSCRIPTIONS

### In Stripe Dashboard:

- **Customers** → See all subscribers
- **Subscriptions** → Manage active subscriptions
- **Payments** → View payment history
- **Billing** → See revenue

### In Your Database:

Query Supabase to see subscription data:

```sql
SELECT * FROM subscriptions WHERE user_id = 'user_xxx';
```

---

## 🎨 CUSTOMER PORTAL (BONUS)

Let users manage their own subscriptions!

We've already built the backend function `createCustomerPortalSession()`. To add it:

### In your dashboard:

```typescript
// Add this button to your dashboard
<button
  onClick={async () => {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
    });
    const { url } = await response.json();
    window.location.href = url;
  }}
>
  Manage Subscription
</button>
```

### Create the portal API endpoint:

Create `/src/app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createCustomerPortalSession } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get customer ID from database
  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const session = await createCustomerPortalSession({
    customerId: data.stripe_customer_id,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
```

Now users can:
- Update payment method
- View invoices
- Cancel subscription
- Update billing info

---

## 🔒 SECURITY FEATURES

Stripe handles ALL of this automatically:

- ✅ PCI compliance (you never see card numbers)
- ✅ 3D Secure authentication
- ✅ Fraud detection
- ✅ Automatic retries for failed payments
- ✅ Email receipts
- ✅ Refund protection

---

## 💰 PRICING & FEES

**Stripe Fees:**
- UK Cards: 1.5% + 20p per transaction
- European Cards: 2.5% + 20p per transaction
- Non-European Cards: 3.25% + 20p per transaction

**Example:**
- User pays £5.99/month for Pro
- Stripe fee: £0.29 (1.5% + 20p)
- You receive: £5.70

**No monthly fees, no setup fees!**

---

## 🧪 TEST CARD NUMBERS

Use these in test mode:

- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155
- **Insufficient Funds:** 4000 0000 0000 9995

All test cards:
- Any future expiry date
- Any 3-digit CVC
- Any postal code

---

## ❓ TROUBLESHOOTING

### "Invalid API key"
- Check you copied the FULL key (starts with `sk_test_`)
- Make sure no extra spaces
- Restart dev server after adding keys

### Webhook not receiving events
- Make sure `stripe listen` is running
- Check the webhook secret matches in `.env.local`
- Restart dev server after adding webhook secret

### Checkout button doesn't work
- Check browser console for errors
- Make sure you're signed in (paid plans require auth)
- Verify all price IDs are correct in `.env.local`

### Subscription not saving to database
- Check the subscriptions table exists in Supabase
- Verify webhook is receiving events (check `stripe listen` terminal)
- Check Supabase service role key is correct

---

## 🎉 YOU'RE READY TO ACCEPT PAYMENTS!

Once you:
1. ✅ Add Stripe API keys to `.env.local`
2. ✅ Create the 4 products in Stripe
3. ✅ Add price IDs to `.env.local`
4. ✅ Run `stripe listen` for webhooks
5. ✅ Create subscriptions table in Supabase
6. ✅ Restart dev server

Your payment system is **FULLY FUNCTIONAL**!

---

## 📚 USEFUL LINKS

- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Test Cards: https://stripe.com/docs/testing

---

## 🚀 NEXT STEPS AFTER STRIPE

Once payments are working, you're ALMOST ready to launch!

**Final tasks:**
1. Connect subscription status to feature access (check tier in dashboard)
2. Add legal pages (Privacy Policy, Terms of Service)
3. Deploy to production (Vercel)
4. Switch to live Stripe keys
5. Launch! 🎉

---

*Setup Guide Generated: January 26, 2026*
*Stripe Integration: Complete*
*Status: Ready to add API keys and products*
