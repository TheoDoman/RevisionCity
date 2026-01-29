# Launch Prep - Revision City

## 🐦 Launch Tweet for X

**Option 1 (Direct & Bold):**
```
Just launched Revision City 🚀

AI-powered IGCSE revision with:
✅ 9 subjects, 473 topics covered
✅ Unlimited AI-generated tests
✅ 1000s of flashcards & practice questions
✅ £4.99/month (cheaper than one coffee a week)

Stop stressing. Start revising smart.
👉 revisioncity.net

#IGCSE #StudyTips #EdTech
```

**Option 2 (Problem-Focused):**
```
Spent £1000s on tutors for IGCSE?
Still struggling to revise effectively?

I built Revision City - AI that generates unlimited practice tests tailored to YOU.

9 subjects. 473 topics. £4.99/month.

Try it free: revisioncity.net

#IGCSE #Revision #AI
```

**Option 3 (Story-Based):**
```
I was tired of overpriced revision apps with outdated content.

So I built Revision City:
• AI-generated tests for YOUR weaknesses
• Complete IGCSE coverage (Bio, Chem, Physics, Maths, etc)
• Actually affordable at £4.99/month

revisioncity.net

#IGCSE #EdTech
```

---

## ✅ Pre-Launch Testing Checklist

### After Content Generation Completes:

**Local Testing (5 minutes):**
- [ ] Run `npm run dev`
- [ ] Browse 5 random subjects → topics → subtopics
- [ ] Verify NO "Practice questions not yet available" errors
- [ ] Generate an AI test (confirm it works)
- [ ] Check flashcards load
- [ ] Check practice questions display

**Deployment (2 minutes):**
- [ ] `git add .`
- [ ] `git commit -m "Complete all content for 473 subtopics"`
- [ ] `git push origin main`
- [ ] Wait for Vercel auto-deploy (~2 minutes)

**Live Site Testing (10 minutes):**
- [ ] Visit revisioncity.net
- [ ] Sign up with new account
- [ ] Browse subjects and topics
- [ ] Generate AI test (free tier - 3 tests)
- [ ] Use flashcards
- [ ] Try practice questions
- [ ] Test on mobile phone (CRITICAL - your users are mobile-first!)

**Payment Flow (Tomorrow with Dad):**
- [ ] Click "Upgrade to Pro"
- [ ] Verify pricing displays correctly (£4.99/month)
- [ ] Complete test payment
- [ ] Verify features unlock after payment

---

## 💰 Fiverr Marketing Plan (€30 Budget)

### Recommended Services:

**Option 1: TikTok Content Creation**
- **Budget**: €15 for script writing + €15 for video editing
- **Search**: "TikTok study content creator" or "educational video editor"
- **Deliverables**: 5-7 short TikTok videos (15-30 seconds each)
- **Content ideas**:
  - "3 IGCSE Biology hacks students don't know"
  - "How I went from failing to A* with one app"
  - "POV: You discover AI test generation"
  - "Study smarter not harder - IGCSE edition"

**Option 2: Instagram Reel Package**
- **Budget**: €30 for 10 Instagram Reels
- **Search**: "Instagram reels for education" or "study content creator"
- **Deliverables**: 10 ready-to-post Reels with captions
- **Include**: Hook, value, CTA to revisioncity.net

**Option 3: Split Approach (RECOMMENDED)**
- **€15**: TikTok video scripts (3-5 scripts)
- **€15**: Thumbnail/graphic design for Instagram posts
- **Why**: You can film TikToks yourself, just need good scripts
- **Search**: "TikTok script writer" + "educational graphic design"

### What to Provide to Freelancer:
- Target audience: IGCSE students (14-16 years old)
- Key features: AI tests, flashcards, practice questions
- Pricing: £4.99/month
- USP: Complete IGCSE coverage, AI-powered, affordable
- Website: revisioncity.net
- Tone: Relatable, not boring, slightly stressed student energy

### Where to Post Gig Request:
1. Go to Fiverr.com
2. Search "TikTok education content" or "student social media"
3. Filter: Budget €15-30, Good reviews (4.5+ stars)
4. Message 3-5 sellers, pick best response

---

## 🔐 Stripe Setup Guide (Tomorrow with Dad)

### What You'll Need from Dad:
- Business bank account details (or his personal account)
- Business name/your name for Stripe account
- Tax ID or personal ID number
- Address information

### Steps (15 minutes total):

1. **Activate Live Mode in Stripe:**
   - Log into dashboard.stripe.com
   - Complete business verification (Dad's info)
   - Toggle to "Live mode"

2. **Get Live API Keys:**
   - Go to Developers → API keys
   - Copy "Publishable key" (pk_live_...)
   - Copy "Secret key" (sk_live_...)

3. **Create Products & Prices:**
   - Products → Add Product
   - Create "Pro Plan": £4.99/month and £49.90/year
   - Create "Premium Plan": £9.99/month and £99.90/year
   - Copy all 4 Price IDs

4. **Set Up Webhook:**
   - Developers → Webhooks → Add endpoint
   - URL: https://revisioncity.net/api/webhooks/stripe
   - Select events: checkout.session.completed, subscription.*
   - Copy webhook secret

5. **Add to Vercel:**
   - vercel.com → Your project → Settings → Environment Variables
   - Add all Stripe live keys (see DEPLOYMENT_CHECKLIST.md)
   - Redeploy

6. **Test Payment:**
   - Go to revisioncity.net
   - Click "Upgrade to Pro"
   - Use REAL card (Dad's)
   - Complete payment
   - Cancel subscription immediately in Stripe dashboard

---

## 📊 Current Status

- ✅ Domain: revisioncity.net (live)
- 🔄 Content: ~200/473 complete (~20 min remaining)
- ⏳ Testing: Pending content completion
- ⏳ Deployment: Pending testing
- ⏳ Stripe: Tomorrow with Dad
- ⏳ Marketing: Ready to execute after launch

**ETA to Launch: ~1 hour** (content generation + testing + deploy)
