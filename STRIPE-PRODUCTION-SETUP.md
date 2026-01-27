# 🔐 STRIPE PRODUCTION MODE SETUP
## Switch from Test to Live Payments

**Created:** January 27, 2026
**Current Status:** Test mode active
**Goal:** Enable real payments

---

## ⚠️ IMPORTANT: Before Switching to Production

### Prerequisites Checklist:
- [ ] Stripe account fully verified
- [ ] Business information completed in Stripe
- [ ] Bank account connected for payouts
- [ ] Tax information submitted
- [ ] Test payments working perfectly
- [ ] All features tested in test mode
- [ ] Ready to accept real payments

**DO NOT** switch to production until all the above are complete!

---

## 📋 CURRENT TEST MODE SETUP

### Your Current Keys (Test Mode):
```bash
# These are in your .env.local - TEST MODE
STRIPE_SECRET_KEY=sk_test_51Stv7EKh1pH8t4mtL4ZBWz3rVhcokVZXib6zSAYnW8OMSPhbF73u65FD0NaHrePBTKX5uwvn6S4yrux6WbRGeDp400hm7Kv3Fx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Stv7EKh1pH8t4mt47QGY62Q0dCksronNrPWx4DBfRLWekTHbrMMntekNnSxtNc3BvyUKkbX3bhi00a18iyueFhN00KfYBF1F4

# Test mode Price IDs:
STRIPE_PRO_MONTHLY_PRICE_ID=price_1StvuEKh1pH8t4mtPrTNI3ww
STRIPE_PRO_YEARLY_PRICE_ID=price_1StvvUKh1pH8t4mt3QgJQvZL
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1Stw1EKh1pH8t4mtOf2HQidL
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_1Stw1nKh1pH8t4mtUcKvMPCG
```

---

## 🚀 SWITCHING TO PRODUCTION MODE

### Step 1: Complete Stripe Account Verification (30 min)

1. **Login to Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com
   - Click "Activate your account" banner if shown

2. **Complete Business Information:**
   - Dashboard → Settings → Business settings
   - Fill in:
     - Business type (Individual or Company)
     - Business name: "Revision City" or your legal name
     - Business address
     - Phone number
     - Business website (your domain once live)
     - Business description: "Online IGCSE revision platform"

3. **Add Bank Account for Payouts:**
   - Dashboard → Settings → Bank accounts and scheduling
   - Click "Add bank account"
   - Enter your bank details:
     - Account holder name
     - Sort code
     - Account number
   - **Important:** Use a business account if you have one

4. **Submit Tax Information:**
   - Dashboard → Settings → Tax settings
   - Provide:
     - Tax ID / VAT number (if applicable)
     - National Insurance number (UK)
     - Address for tax purposes
   - **UK VAT Note:** If turnover > £85k/year, you need VAT registration

5. **Identity Verification:**
   - Stripe will ask for ID verification
   - Upload:
     - Passport or driving license
     - Proof of address (utility bill, bank statement)
   - Verification usually takes 1-3 business days

---

### Step 2: Get Production API Keys (2 min)

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com
   - **Toggle to "Live mode"** (top right corner)

2. **Get API Keys:**
   - Go to: Developers → API Keys
   - You'll see:
     - **Publishable key** (starts with `pk_live_`)
     - **Secret key** (starts with `sk_live_`)
   - Click "Reveal live key token" for the secret key
   - **COPY BOTH KEYS** - keep them secure!

**⚠️ SECURITY WARNING:**
- Never commit live keys to GitHub
- Never share live keys
- Treat them like passwords
- If leaked, immediately roll them in Stripe dashboard

---

### Step 3: Create Production Products (15 min)

Your test products need to be recreated in live mode.

1. **In Stripe Dashboard (LIVE MODE):**
   - Go to: Products → Add Product

2. **Create Pro Plan:**
   - Name: `Pro Plan`
   - Description: `Pro tier subscription for Revision City`
   - Pricing:
     - **Monthly:** £5.99/month
       - Click "Add price"
       - Recurring: Monthly
       - Price: £5.99 GBP
       - **COPY THE PRICE ID** (starts with `price_`)
     - **Yearly:** £47.99/year
       - Click "Add another price"
       - Recurring: Yearly
       - Price: £47.99 GBP
       - **COPY THE PRICE ID**

3. **Create Premium Plan:**
   - Name: `Premium Plan`
   - Description: `Premium tier subscription for Revision City`
   - Pricing:
     - **Monthly:** £9.99/month
       - Click "Add price"
       - Recurring: Monthly
       - Price: £9.99 GBP
       - **COPY THE PRICE ID**
     - **Yearly:** £79.99/year
       - Click "Add another price"
       - Recurring: Yearly
       - Price: £79.99 GBP
       - **COPY THE PRICE ID**

4. **Save All Price IDs:**
   You'll need these 4 price IDs for your environment variables.

---

### Step 4: Update Environment Variables (5 min)

1. **Update `.env.local` with LIVE keys:**

```bash
# LIVE STRIPE KEYS - Replace with your actual live keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE

# LIVE PRICE IDs - Replace with your live price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_PRO_YEARLY_PRICE_ID
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_YOUR_PREMIUM_MONTHLY_PRICE_ID
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_YOUR_PREMIUM_YEARLY_PRICE_ID

# Webhook secret (will update after Vercel deployment)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET_HERE
```

2. **Important: Keep Test Keys Safe!**
   - Don't delete your test keys
   - Create a backup file: `.env.test` with test keys
   - You'll want to test new features in test mode before production

---

### Step 5: Set Up Production Webhook (After Vercel Deploy)

**⚠️ CRITICAL:** Do this AFTER you deploy to Vercel and have your production URL

1. **In Stripe Dashboard (LIVE MODE):**
   - Go to: Developers → Webhooks
   - Click "Add endpoint"

2. **Configure Webhook:**
   - Endpoint URL: `https://YOUR-PRODUCTION-DOMAIN.com/api/stripe/webhook`
   - Events to send: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret:**
   - After creating, click on the webhook
   - Click "Reveal" on "Signing secret"
   - **COPY THE WEBHOOK SECRET** (starts with `whsec_`)
   - Update your `.env.local` and Vercel environment variables

---

### Step 6: Update Vercel Environment Variables (5 min)

1. **Go to Vercel Dashboard:**
   - Your project → Settings → Environment Variables

2. **Update these variables:**
   - Delete old test mode variables
   - Add new production variables:
     - `STRIPE_SECRET_KEY` = your live secret key
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your live publishable key
     - `STRIPE_PRO_MONTHLY_PRICE_ID` = your live pro monthly price ID
     - `STRIPE_PRO_YEARLY_PRICE_ID` = your live pro yearly price ID
     - `STRIPE_PREMIUM_MONTHLY_PRICE_ID` = your live premium monthly price ID
     - `STRIPE_PREMIUM_YEARLY_PRICE_ID` = your live premium yearly price ID
     - `STRIPE_WEBHOOK_SECRET` = your live webhook secret

3. **Redeploy:**
   - Go to Deployments
   - Click "..." menu
   - Click "Redeploy"
   - Wait for deployment to complete

---

## 🧪 TESTING PRODUCTION PAYMENTS

### ⚠️ WARNING: These are REAL payments!

1. **Small Test Payment:**
   - Use your own credit card
   - Subscribe to the cheapest plan (Pro Monthly - £5.99)
   - Complete the full checkout flow
   - Verify:
     - Charge appears in Stripe dashboard
     - Subscription created in Stripe
     - User granted premium access in your app
     - Webhook received (check Stripe logs)

2. **Check Stripe Dashboard:**
   - Go to: Payments → All payments
   - You should see your test payment
   - Status should be "Succeeded"
   - Webhook should show "Succeeded" in Webhooks logs

3. **Cancel Test Subscription:**
   - In Stripe Dashboard → Customers
   - Find your test customer
   - Cancel the subscription
   - You can refund the payment if desired:
     - Click payment → "Refund payment"

---

## 💰 UNDERSTANDING STRIPE FEES

### UK Pricing:
- **Per transaction:** 1.4% + 20p
- **For £9.99 subscription:**
  - Stripe fee: £0.34
  - You receive: £9.65

### Monthly Revenue Example:
```
10 Premium subscriptions (£9.99 each):
Gross: £99.90
Stripe fees: £3.40
Net revenue: £96.50
```

### Payout Schedule:
- **First payout:** 7-14 days after first payment
- **After that:** Rolling 7-day schedule
- **Example:** Payment on Monday → Payout next Monday

---

## 🔒 SECURITY BEST PRACTICES

### 1. Key Management:
- ✅ Never commit live keys to git
- ✅ Use environment variables only
- ✅ Different keys for development/production
- ✅ Rotate keys if compromised
- ✅ Use Stripe's "Restricted keys" for specific permissions

### 2. Webhook Security:
- ✅ Always verify webhook signatures
- ✅ Use HTTPS only (HTTP will be rejected)
- ✅ Log all webhook events
- ✅ Handle webhook failures gracefully
- ✅ Implement idempotency (same webhook received twice)

### 3. Customer Data:
- ✅ Never store credit card numbers
- ✅ Use Stripe Customer Portal for management
- ✅ Comply with GDPR (data deletion requests)
- ✅ Log all subscription changes
- ✅ Encrypt sensitive data

### 4. Fraud Prevention:
- ✅ Enable Stripe Radar (fraud detection)
- ✅ Block suspicious countries if needed
- ✅ Set up email receipts
- ✅ Monitor for unusual patterns
- ✅ Require 3D Secure for high-risk payments

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks:
- [ ] Check Stripe dashboard for payments
- [ ] Monitor webhook delivery (any failures?)
- [ ] Check for failed payments
- [ ] Review any disputes/chargebacks

### Weekly Checks:
- [ ] Review subscription metrics
- [ ] Check churn rate
- [ ] Analyze payment success rate
- [ ] Review customer feedback

### Monthly Checks:
- [ ] Verify payouts received
- [ ] Reconcile payments vs. database
- [ ] Review pricing strategy
- [ ] Check for API updates

---

## 🚨 TROUBLESHOOTING

### Issue: Webhook Not Receiving Events
**Symptoms:** Payments succeed but users don't get access

**Fix:**
1. Check webhook URL is correct (https, correct domain)
2. Verify webhook secret in environment variables
3. Check Vercel logs for errors
4. Test webhook in Stripe Dashboard → "Send test webhook"

### Issue: Payment Declined
**Symptoms:** Customer reports card declined

**Fix:**
1. Check Stripe Dashboard → Payments → Find the payment
2. Look at decline reason
3. Common causes:
   - Insufficient funds
   - Card blocked by bank
   - Incorrect card details
   - 3D Secure required
4. Customer should contact their bank

### Issue: Duplicate Charges
**Symptoms:** Customer charged twice

**Fix:**
1. Check Stripe Dashboard for both charges
2. Refund duplicate charge immediately
3. Check webhook idempotency
4. Add idempotency keys to API calls

### Issue: Subscription Not Cancelled
**Symptoms:** User cancelled but still has access

**Fix:**
1. Check Stripe Dashboard → Subscriptions
2. Verify subscription status
3. Check webhook for `customer.subscription.deleted` event
4. Manually update database if needed
5. Review cancellation logic in code

---

## 📱 STRIPE DASHBOARD MOBILE APP

**Highly Recommended:** Install Stripe Dashboard app

- iOS: https://apps.apple.com/app/stripe-dashboard/id978516833
- Android: https://play.google.com/store/apps/details?id=com.stripe.android.dashboard

**Benefits:**
- Get notified of payments instantly
- Monitor revenue on the go
- Respond to disputes quickly
- Refund payments from phone

---

## 💡 OPTIMIZATION TIPS

### 1. Reduce Churn:
- Send reminder email before cancellation
- Offer pause subscription option
- Survey users who cancel
- Win-back campaigns for cancelled users

### 2. Increase Conversions:
- Show pricing in local currency
- Add "Most Popular" badge to best plan
- Offer annual discount (2 months free)
- Show total savings on annual plan
- Add testimonials near pricing

### 3. Revenue Optimization:
- A/B test pricing (£8.99 vs £9.99)
- Add middle-tier option
- Create limited-time offers
- Seasonal pricing (higher during exams)
- Bundle deals (annual + extras)

### 4. Customer Experience:
- Clear cancellation process
- Instant email receipts
- Easy to update payment method
- Customer portal for self-service
- Proactive support for failed payments

---

## ✅ PRODUCTION READINESS CHECKLIST

### Before Going Live:
- [ ] Stripe account fully verified
- [ ] Bank account connected and verified
- [ ] Tax information submitted
- [ ] Live API keys obtained
- [ ] Production products created
- [ ] All 4 price IDs copied
- [ ] Environment variables updated locally
- [ ] Tested one real payment successfully
- [ ] Webhook configured and working
- [ ] Webhook secret added to environment
- [ ] Vercel environment variables updated
- [ ] Production deployment successful
- [ ] End-to-end payment flow tested
- [ ] Cancellation flow tested
- [ ] Email receipts working
- [ ] Legal pages updated (refund policy)
- [ ] Customer support email set up
- [ ] Stripe Dashboard mobile app installed

### After Going Live:
- [ ] Monitor first 10 payments closely
- [ ] Check webhook delivery for each
- [ ] Verify users get access immediately
- [ ] Test cancellation with real subscription
- [ ] Monitor Stripe Dashboard hourly (first day)
- [ ] Set up email alerts for failed payments
- [ ] Create internal payment log/dashboard
- [ ] Document any issues and fixes

---

## 🎉 YOU'RE READY FOR PRODUCTION!

Once all the above is complete, you'll be accepting real payments!

**Key Points:**
- ✅ Test thoroughly before going live
- ✅ Monitor closely in first 48 hours
- ✅ Have customer support ready
- ✅ Keep test mode available for development
- ✅ Regular backups of subscription data
- ✅ Clear communication with customers

**Support:**
- Stripe Support: https://support.stripe.com
- Stripe Discord: https://stripe.com/discord
- Stripe Docs: https://stripe.com/docs

---

*Last Updated: January 27, 2026*
*Status: Ready to switch to production when verification complete*
