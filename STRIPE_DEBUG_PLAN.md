# 🔍 Stripe Integration Debug & Fix Plan

## 🎯 Goal
Get Stripe live mode working in production so users can subscribe and pay.

---

## ✅ What We Know Works
- ✅ Stripe products created (Pro, Premium)
- ✅ Live API keys valid (tested locally)
- ✅ Price IDs correct (retrieved successfully)
- ✅ Webhook endpoint created
- ✅ Subscriptions table exists in Supabase
- ✅ Local tests pass perfectly
- ✅ Code looks correct

## ❌ What's Failing
- ❌ Production checkout fails with "Failed to start checkout"
- ❓ Environment variables in Vercel (uncertain)

---

## 📋 Step-by-Step Debug Plan

### **Step 1: Deploy Debug Endpoint** (5 minutes)
**What:** Deploy `/api/debug/env` to check environment variables in production

**Actions:**
1. Commit and push the new debug endpoint
2. Wait for Vercel deployment (2-3 minutes)
3. Visit: `https://revisioncity.net/api/debug/env`
4. Check the response

**What to Look For:**
```json
{
  "stripe": {
    "hasSecretKey": true,  // Should be true
    "secretKeyPrefix": "sk_live_51Stv...",  // Should start with sk_live
    "hasPriceIds": {
      "proMonthly": true,  // All should be true
      ...
    }
  }
}
```

**If FALSE:** Environment variables NOT set in Vercel (main suspect)
**If TRUE:** Environment variables are set, issue is elsewhere

---

### **Step 2: Fix Environment Variables** (10 minutes)
**If Step 1 shows FALSE values:**

Go to: https://vercel.com/theodormans-projects/revision-city-3/settings/environment-variables

**Check for these 7 variables:**
1. `STRIPE_SECRET_KEY`
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. `STRIPE_WEBHOOK_SECRET`
4. `STRIPE_PRO_MONTHLY_PRICE_ID`
5. `STRIPE_PRO_YEARLY_PRICE_ID`
6. `STRIPE_PREMIUM_MONTHLY_PRICE_ID`
7. `STRIPE_PREMIUM_YEARLY_PRICE_ID`

**If they exist but show old test values:**
- Delete the old ones
- Add new ones with live values
- Redeploy

**If they don't exist:**
- Add all 7 with values from `.env.local`
- Save each one
- Redeploy

---

### **Step 3: Check Vercel Logs** (5 minutes)
**What:** See actual error messages from production

**Actions:**
1. Go to: https://vercel.com/theodormans-projects/revision-city-3
2. Click on latest deployment
3. Click "Functions" tab
4. Find `/api/stripe/checkout` function
5. Look at logs/errors

**Common Errors to Look For:**
- "STRIPE_SECRET_KEY is not set" → Environment variable issue
- "Invalid API key" → Wrong key or test key used
- "No such price" → Price ID wrong or from test mode
- "Webhook signature verification failed" → Webhook secret wrong

---

### **Step 4: Test Checkout Again** (2 minutes)
**After fixing environment variables:**

1. Go to: https://revisioncity.net/pricing
2. Click "Get Started" on Pro plan
3. Try to checkout
4. Check browser console for errors (F12 → Console tab)
5. Check network tab for API responses (F12 → Network tab)

**Success Signs:**
- Redirected to Stripe checkout page
- Can enter payment details
- Payment goes through

**Failure Signs:**
- "Failed to start checkout" error
- Stays on same page
- Console shows error

---

### **Step 5: Test Webhook** (5 minutes)
**After checkout works:**

**Option A: Use Stripe CLI (Recommended)**
```bash
stripe listen --forward-to https://revisioncity.net/api/webhooks/stripe
stripe trigger checkout.session.completed
```

**Option B: Stripe Dashboard**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Send it
6. Check response (should be 200 OK)

**What to Verify:**
- Webhook receives event (200 OK response)
- Subscription created in Supabase `subscriptions` table
- User's tier updated

---

### **Step 6: End-to-End Test** (10 minutes)
**Complete payment flow test:**

1. Create new test account on revisioncity.net
2. Go to /pricing
3. Choose Pro Monthly plan
4. Enter real payment details (will charge €4.99!)
5. Complete payment
6. Verify redirect to /dashboard?success=true
7. Check subscription in Stripe Dashboard
8. Check subscription in Supabase `subscriptions` table
9. Verify user has "pro" access in app

---

## 🔧 Alternative Solutions (If Above Doesn't Work)

### **Plan B: Use Vercel + Stripe Integration**
Instead of manual environment variables, use Vercel's official Stripe integration:

1. Go to: https://vercel.com/integrations/stripe
2. Click "Add Integration"
3. Connect your Stripe account
4. Vercel automatically sets environment variables
5. Redeploy

**Pros:**
- Easier to set up
- Automatically syncs updates
- More reliable

**Cons:**
- Less control
- Might need code changes

---

### **Plan C: Move to Environment-Specific Config**
Create a server-side config that loads differently per environment:

```typescript
// src/lib/config.ts
export const getStripeConfig = () => {
  const config = {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    // ... etc
  }

  // Validate all keys are present
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      console.error(`Missing Stripe config: ${key}`)
      throw new Error(`Stripe not configured: ${key} missing`)
    }
  })

  return config
}
```

This would give clearer error messages if something's missing.

---

### **Plan D: Use Stripe's Customer Portal**
Instead of custom checkout, redirect to Stripe's hosted solution:

**Pros:**
- Stripe handles everything
- No environment variable issues
- Easier to maintain

**Cons:**
- Less customization
- External redirect

---

## 📊 Expected Timeline

| Step | Time | Difficulty |
|------|------|-----------|
| 1. Deploy debug endpoint | 5 min | ⭐ Easy |
| 2. Fix env variables | 10 min | ⭐⭐ Medium |
| 3. Check logs | 5 min | ⭐ Easy |
| 4. Test checkout | 2 min | ⭐ Easy |
| 5. Test webhook | 5 min | ⭐⭐ Medium |
| 6. End-to-end test | 10 min | ⭐ Easy |
| **Total** | **~40 min** | If everything works |
| **With issues** | **2-3 hours** | If need Plan B/C |

---

## 🎯 Success Criteria

### **Minimum (MVP):**
- ✅ User can click "Get Started" button
- ✅ Redirects to Stripe checkout
- ✅ Can complete payment
- ✅ Redirects back to dashboard
- ✅ Subscription saved in database

### **Complete:**
- ✅ All above working
- ✅ Webhook receives events
- ✅ User tier updates correctly
- ✅ Can access paid features
- ✅ Customer portal works (manage subscription)

### **Production Ready:**
- ✅ All above working
- ✅ Error handling for failed payments
- ✅ Email notifications working
- ✅ Tested with real payment
- ✅ Documented for future

---

## 🚨 Red Flags to Watch For

1. **Environment variables look right but still failing:**
   - Might need to restart Vercel functions (redeploy)
   - Check if there are multiple versions of same variable

2. **Works in preview but not production:**
   - Environment variables might be set for preview only
   - Need to set for "Production" specifically

3. **Checkout creates session but immediately fails:**
   - Check Stripe Dashboard for declined payments
   - Verify webhook is receiving events

4. **Database has subscription but user doesn't have access:**
   - Check how app reads subscription tier
   - Verify tier mapping (Stripe price ID → 'pro'/'premium')

---

## 📝 Next Steps After This Works

1. **Test all subscription flows:**
   - Monthly to yearly upgrade
   - Pro to Premium upgrade
   - Cancellation
   - Reactivation

2. **Add monitoring:**
   - Sentry for errors
   - Stripe webhooks monitoring
   - Failed payment alerts

3. **User experience improvements:**
   - Loading states during checkout
   - Better error messages
   - Success/failure pages

4. **Documentation:**
   - How to test payments
   - How to handle refunds
   - How to debug subscription issues

---

## 🎓 Lessons Learned (To Add to Journal)

**After we fix this:**
- What was the actual root cause?
- How long did it take to fix?
- What worked? What didn't?
- How could we have avoided this?
- What would we do differently next time?

---

**Ready to start?** Let's begin with Step 1: Deploy the debug endpoint!

