# 🚀 DEPLOYMENT GUIDE - LAUNCH REVISION CITY

**Status:** Ready to deploy
**Time Required:** 30-45 minutes
**Platform:** Vercel (recommended)
**Date:** January 26, 2026

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before deploying, make sure you've completed:

- ✅ Clerk authentication setup with API keys
- ✅ Stripe payment integration with products created
- ✅ Supabase database with subscriptions table
- ✅ Legal pages (Privacy Policy & Terms of Service)
- ✅ Logo and branding
- ✅ Competitive pricing configured

---

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Vercel (Recommended - Easiest)
- **Best for:** Next.js apps (native support)
- **Price:** Free for hobby projects, $20/month for Pro
- **Deploy time:** 5 minutes
- **Features:** Auto-scaling, edge functions, analytics

### Option 2: Netlify
- **Best for:** Static sites and apps
- **Price:** Free for personal, $19/month for Pro
- **Deploy time:** 5-10 minutes

### Option 3: Railway
- **Best for:** Full-stack apps with databases
- **Price:** Pay-as-you-go, ~$5-10/month
- **Deploy time:** 10 minutes

**We'll use Vercel for this guide** (it's the easiest for Next.js).

---

## 🚀 STEP 1: PREPARE YOUR CODE

### 1.1 Initialize Git Repository

```bash
cd "/Users/theodordoman/Downloads/revision-city 3"

# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Revision City launch ready"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `revision-city`
3. Description: "IGCSE revision platform with AI-powered learning"
4. **Private** (recommended for now)
5. Don't add README, .gitignore, or license (we already have them)
6. Click "Create repository"

### 1.3 Push Code to GitHub

```bash
# Add GitHub as remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/revision-city.git

# Push code
git branch -M main
git push -u origin main
```

---

## 🚀 STEP 2: DEPLOY TO VERCEL

### 2.1 Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub (easiest)
3. Authorize Vercel to access your repositories

### 2.2 Import Project

1. Click "Add New..." → "Project"
2. Find your `revision-city` repository
3. Click "Import"

### 2.3 Configure Build Settings

Vercel will auto-detect Next.js settings:

- **Framework Preset:** Next.js ✅ (auto-detected)
- **Root Directory:** ./
- **Build Command:** `npm run build`
- **Output Directory:** .next
- **Install Command:** `npm install`

Don't change these! Click "Deploy" ... wait, not yet! First, we need to add environment variables.

---

## 🔐 STEP 3: ADD ENVIRONMENT VARIABLES

Before deploying, add ALL your environment variables:

### 3.1 In Vercel Dashboard

Click "Environment Variables" section, then add each one:

#### Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://waqvyqpomedcejrkoikl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Clerk Authentication

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### Stripe Payment

```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
```

#### Anthropic AI

```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

#### App Configuration

```
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.vercel.app
```

**Important:** For each variable:
- Click "Add Variable"
- Name: Copy the name exactly
- Value: Paste your key
- Environment: Select all three (Production, Preview, Development)
- Click "Add"

### 3.2 Update App URL Later

You'll need to update `NEXT_PUBLIC_APP_URL` after deployment with your actual domain.

---

## 🚀 STEP 4: DEPLOY!

1. Click "Deploy" button
2. Wait 2-3 minutes while Vercel builds your app
3. You'll see a progress screen with build logs
4. When complete, you'll get a URL like: `https://revision-city-xxxx.vercel.app`

**Your app is now LIVE!** 🎉

---

## 🔧 STEP 5: POST-DEPLOYMENT CONFIGURATION

### 5.1 Update Clerk URLs

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to your Revision City application
3. Go to **Domains** in the sidebar
4. Add your Vercel domain: `https://revision-city-xxxx.vercel.app`
5. Update the authorized domains

### 5.2 Update Stripe Webhook

For production webhooks:

1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Click "Add endpoint"
4. Endpoint URL: `https://YOUR_DOMAIN.vercel.app/api/stripe/webhook`
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click "Add endpoint"
7. **Copy the webhook signing secret** (starts with `whsec_`)
8. Go back to Vercel → Settings → Environment Variables
9. Update `STRIPE_WEBHOOK_SECRET` with the new production secret
10. Redeploy the app (Vercel → Deployments → Redeploy)

### 5.3 Update App URL Environment Variable

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Find `NEXT_PUBLIC_APP_URL`
4. Update value to your actual domain: `https://revision-city-xxxx.vercel.app`
5. Click "Save"
6. Redeploy the app

### 5.4 Test Everything

Visit your live site and test:

- ✅ Homepage loads correctly
- ✅ Sign up with a new account
- ✅ Check that sign-in works
- ✅ Visit dashboard (should show your name)
- ✅ Go to pricing page
- ✅ Click "Get Pro" (test mode still uses test cards)
- ✅ Complete a test payment with card: 4242 4242 4242 4242
- ✅ Check you're redirected back to dashboard
- ✅ Check Stripe dashboard for the test payment
- ✅ Check Supabase for the subscription record

---

## 🌐 STEP 6: CUSTOM DOMAIN (OPTIONAL)

### 6.1 Buy a Domain

Popular registrars:
- **Namecheap:** ~£10/year
- **Google Domains:** ~£12/year
- **GoDaddy:** ~£15/year

Suggested domains:
- revisioncity.com
- revisioncity.co.uk
- studyrevisioncity.com
- getrevisioncity.com

### 6.2 Connect Domain to Vercel

1. In Vercel dashboard, go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `revisioncity.com`)
4. Click "Add"
5. Vercel will show DNS records to add

### 6.3 Configure DNS

In your domain registrar (Namecheap, etc.):

1. Go to DNS settings
2. Add an A record:
   - **Type:** A
   - **Host:** @
   - **Value:** 76.76.21.21 (Vercel's IP)
   - **TTL:** Automatic
3. Add a CNAME record:
   - **Type:** CNAME
   - **Host:** www
   - **Value:** cname.vercel-dns.com
   - **TTL:** Automatic
4. Save changes

Wait 5-30 minutes for DNS to propagate. Vercel will automatically configure SSL certificate.

### 6.4 Update Environment Variables

After custom domain is live:

1. Update `NEXT_PUBLIC_APP_URL` to `https://revisioncity.com`
2. Update Clerk authorized domains
3. Update Stripe webhook URL
4. Redeploy

---

## 🔄 STEP 7: SWITCH TO PRODUCTION MODE

### 7.1 Stripe Production Keys

1. In Stripe dashboard, toggle from "Test mode" to "Live mode"
2. Go to Developers → API Keys
3. Copy your LIVE keys (start with `pk_live_` and `sk_live_`)
4. Create the same 4 products in LIVE mode:
   - Pro Monthly (£5.99)
   - Pro Yearly (£47.99)
   - Premium Monthly (£9.99)
   - Premium Yearly (£79.99)
5. Copy the LIVE price IDs

### 7.2 Update Vercel Environment Variables

Replace these with LIVE values:

```
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx (live)
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx (live)
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx (live)
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx (live)
```

### 7.3 Clerk Production Keys (Optional)

Clerk test keys work in production, but for a professional setup:

1. In Clerk dashboard, create a production instance
2. Get production keys
3. Update Vercel environment variables
4. Redeploy

### 7.4 Redeploy with Production Keys

1. Go to Vercel → Deployments
2. Click "Redeploy" on latest deployment
3. Wait for build to complete
4. Test with a REAL card (you'll be charged!)

---

## 📊 STEP 8: MONITORING & ANALYTICS

### 8.1 Vercel Analytics

1. In Vercel dashboard, go to Analytics
2. Click "Enable"
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### 8.2 Stripe Dashboard

Monitor:
- Total revenue
- Monthly recurring revenue (MRR)
- Active subscriptions
- Churn rate
- Failed payments

### 8.3 Supabase Logs

Check database activity:
- New user signups
- Subscription creations
- Active users

---

## 🔧 CONTINUOUS DEPLOYMENT

Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys to production
4. Updates your live site

To deploy changes:

```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically deploys!
```

---

## 🚨 TROUBLESHOOTING

### Deployment Failed

**Error:** Build failed
- Check build logs in Vercel
- Ensure all dependencies are in package.json
- Test build locally: `npm run build`

### Environment Variables Not Working

**Error:** Missing required environment variables
- Check spelling (case-sensitive!)
- Ensure selected for Production environment
- Redeploy after adding variables

### Stripe Payments Not Working

**Error:** Invalid price ID
- Check you're using LIVE price IDs in production
- Verify `STRIPE_SECRET_KEY` is the live key
- Check webhook is configured for production URL

### Authentication Not Working

**Error:** Clerk initialization failed
- Check Clerk authorized domains include your Vercel domain
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Ensure URLs in .env match (starts with https://)

### Domain Not Resolving

**Error:** DNS_PROBE_FINISHED_NXDOMAIN
- Wait 30 minutes for DNS propagation
- Check DNS records are correct
- Try clearing DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

## 📈 PERFORMANCE OPTIMIZATION

### Enable Edge Functions

In `next.config.js`:

```javascript
module.exports = {
  experimental: {
    runtime: 'edge',
  },
}
```

### Enable Image Optimization

Already configured! Next.js Image component auto-optimizes.

### Enable Caching

Vercel automatically caches static assets and API routes.

---

## 🎉 YOU'RE LIVE!

Congratulations! Your Revision City platform is now:

✅ **Deployed** to production
✅ **Secured** with SSL certificate
✅ **Accepting** real payments
✅ **Authenticating** users
✅ **Tracking** subscriptions
✅ **Monitoring** performance

---

## 📝 POST-LAUNCH CHECKLIST

- [ ] Test all features on live site
- [ ] Share with friends/family for feedback
- [ ] Set up customer support email
- [ ] Create social media accounts
- [ ] Launch marketing campaign
- [ ] Monitor Stripe for first real payment 🎉
- [ ] Celebrate! 🍾

---

## 🔗 USEFUL LINKS

- **Your Vercel Dashboard:** https://vercel.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## 📞 NEED HELP?

**Vercel Support:**
- Help: https://vercel.com/help
- Discord: https://vercel.com/discord

**Stripe Support:**
- Help: https://support.stripe.com
- Docs: https://stripe.com/docs

**Clerk Support:**
- Help: https://clerk.com/support
- Docs: https://clerk.com/docs

---

## 🚀 NEXT STEPS AFTER LAUNCH

1. **Marketing:**
   - Create TikTok/Instagram content
   - Reach out to IGCSE study groups
   - Create YouTube tutorials
   - Partner with teachers

2. **Content:**
   - Add more subjects
   - Create exam-style questions
   - Build more AI features
   - Add video explanations

3. **Growth:**
   - Monitor analytics
   - Collect user feedback
   - Iterate on features
   - Scale infrastructure

---

*Deployment Guide Created: January 26, 2026*
*Status: Ready for Production*
*Estimated Launch Time: 30-45 minutes*

**Good luck with your launch! 🚀**
