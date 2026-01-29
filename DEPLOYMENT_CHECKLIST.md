# Deployment Checklist - Revision City

## Pre-Deployment Tasks

### ✅ Content Generation (In Progress)
- [x] Remove all duplicate content (424 duplicates removed)
- [ ] Complete content generation for all 473 subtopics (currently at ~150/473)
- [ ] Verify all content is accessible (run `node verify-content.js`)
- [ ] Test app locally to ensure no "not available" messages

---

## Stripe Live Payment Setup

### Step 1: Get Live API Keys from Stripe
1. Go to https://dashboard.stripe.com
2. Toggle from "Test mode" to "Live mode" (top right)
3. Navigate to **Developers → API keys**
4. Copy your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### Step 2: Create Live Products & Prices
1. In Stripe Dashboard (Live mode), go to **Products**
2. Create these products:

#### Pro Plan
- **Name**: Revision City Pro
- **Description**: Unlimited AI tests, full flashcard library, all practice questions
- **Pricing**:
  - Monthly: £4.99/month (recurring)
  - Yearly: £49.90/year (recurring, save 17%)

#### Premium Plan
- **Name**: Revision City Premium
- **Description**: Everything in Pro + priority support, offline access, advanced analytics
- **Pricing**:
  - Monthly: £9.99/month (recurring)
  - Yearly: £99.90/year (recurring, save 17%)

3. Copy the **Price IDs** for each:
   - Pro Monthly: `price_xxxxx`
   - Pro Yearly: `price_xxxxx`
   - Premium Monthly: `price_xxxxx`
   - Premium Yearly: `price_xxxxx`

### Step 3: Set Up Webhook for Live Mode
1. Go to **Developers → Webhooks** in Stripe Dashboard (Live mode)
2. Click **Add endpoint**
3. Enter endpoint URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

### Step 4: Update Environment Variables

**Important**: These should be added to Vercel, NOT committed to git!

```env
# Stripe Live Keys (DO NOT COMMIT)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Stripe Live Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_PRO_YEARLY_PRICE_ID
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_YOUR_PREMIUM_MONTHLY_PRICE_ID
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_YOUR_PREMIUM_YEARLY_PRICE_ID
```

### Step 5: Configure Currency (GBP)
Since you're targeting UK students, ensure your Stripe account is set to GBP:
1. Go to **Settings → Account details**
2. Verify currency is set to **GBP (£)**
3. If not, you may need to create prices in GBP specifically

---

## Vercel Deployment

### Current Setup
- **GitHub Repo**: https://github.com/TheoDoman/RevisionCity.git
- **Domain**: Set up with Vercel (verify at vercel.com)

### Step 1: Update Production URL
Update `.env.local` → `NEXT_PUBLIC_APP_URL` to your live domain before deployment

### Step 2: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Select your Revision City project
3. Go to **Settings → Environment Variables**
4. Add ALL variables from `.env.local`:

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

#### Anthropic AI
- `ANTHROPIC_API_KEY`

#### Stripe (LIVE KEYS)
- `STRIPE_SECRET_KEY` (sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`
- `STRIPE_PREMIUM_MONTHLY_PRICE_ID`
- `STRIPE_PREMIUM_YEARLY_PRICE_ID`

#### App Config
- `NEXT_PUBLIC_APP_URL` (your live domain)

**Important**: Set all variables for **Production** environment

### Step 3: Deploy to Vercel
```bash
# Make sure all content is generated and verified first!
git add .
git commit -m "Complete all 473 subtopics with flashcards, questions, and recall prompts"
git push origin main
```

Vercel will automatically deploy from your GitHub repository.

### Step 4: Verify Deployment
1. Visit your live domain
2. Test the following:
   - [ ] Can browse all subjects/topics/subtopics
   - [ ] No "Practice questions not yet available" messages
   - [ ] AI test generator works
   - [ ] Flashcards display correctly
   - [ ] Practice questions load
   - [ ] Recall prompts appear
3. Test authentication:
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Redirects to dashboard correctly

### Step 5: Test Live Payments (CRITICAL!)
1. Go to pricing page on your live site
2. Click "Subscribe to Pro"
3. Use a **real card** (start with a small amount or use Stripe test card if you want to verify flow first)
4. Complete checkout
5. Verify:
   - [ ] Payment processes successfully
   - [ ] User is redirected back to app
   - [ ] Subscription is active in Stripe dashboard
   - [ ] User has access to Pro features in app
6. **Cancel the test subscription** in Stripe dashboard if it was just for testing

---

## Post-Deployment Verification

### Database Check
```bash
node verify-content.js
```
Should show:
- 473/473 subtopics with flashcards
- 473/473 subtopics with practice questions
- 473/473 subtopics with recall prompts

### Security Check
- [ ] `.env.local` is in `.gitignore` (verify no secrets in git)
- [ ] All sensitive keys are only in Vercel environment variables
- [ ] Webhook endpoint is secured (Stripe signature verification)

### Performance Check
- [ ] Test on mobile device (your target audience!)
- [ ] Check page load speeds
- [ ] Verify images load properly
- [ ] Test on slow 3G connection

### User Experience Check
- [ ] Try the free tier (3 AI tests limit)
- [ ] Upgrade to Pro and verify features unlock
- [ ] Generate an AI test
- [ ] Use flashcards
- [ ] Complete practice questions

---

## Rollback Plan (If Something Goes Wrong)

If you encounter issues after deployment:

1. **Revert to previous deployment** in Vercel dashboard
2. Check Vercel logs for errors
3. Verify all environment variables are set correctly
4. Test webhook locally first using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## After Successful Deployment

### Marketing Launch
- [ ] Update social media with live link
- [ ] Post on X (Twitter) about launch
- [ ] Implement Fiverr marketing strategy (€30 budget)
- [ ] Begin content marketing plan from MARKETING_PLAN.md

### Monitoring
- [ ] Set up Google Analytics (if not already done)
- [ ] Monitor Stripe dashboard for first payments
- [ ] Track signup conversion rates
- [ ] Monitor error logs in Vercel

### Support
- [ ] Set up support email
- [ ] Monitor user feedback
- [ ] Be ready to fix bugs quickly

---

## Quick Reference

**What's your domain?** [Add your domain here]

**Vercel Project URL**: https://vercel.com/[your-username]/revision-city

**Stripe Dashboard**: https://dashboard.stripe.com

**Expected Timeline**:
1. Content generation completes: ~30 minutes
2. Stripe setup: ~15 minutes
3. Vercel environment variables: ~10 minutes
4. Deploy + verify: ~15 minutes
5. **Total: ~70 minutes to go live**

---

## Current Status

- ✅ Duplicates removed (424 items)
- 🔄 Content generation in progress (~150/473 subtopics)
- ⏳ Waiting for generation to complete
- ⏳ Stripe live setup pending
- ⏳ Deployment pending
