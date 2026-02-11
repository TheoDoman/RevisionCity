# 📖 Revision City - Development Journal

> A comprehensive record of the development process, challenges, solutions, and lessons learned.

---

## 🎯 Project Overview

**App Name:** Revision City
**Purpose:** IGCSE revision platform with AI-powered content
**Tech Stack:** Next.js 14, Supabase, Stripe, Clerk, Anthropic AI
**Domain:** revisioncity.net
**Started:** January 2026

---

## 📊 Difficulty Rating System

- ⭐ **Easy** - Quick fix, clear error messages, straightforward
- ⭐⭐ **Medium** - Required some debugging, took 15-30 minutes
- ⭐⭐⭐ **Hard** - Multiple attempts, unclear errors, took 1+ hours
- ⭐⭐⭐⭐ **Very Hard** - Multiple sessions, production issues, still ongoing

---

## 🏗️ Major Features Completed

### ✅ **1. Content Generation System** ⭐
**What:** Generate flashcards, practice questions, recall prompts using AI
**Difficulty:** Easy
**Time:** ~2 hours total
**Why Easy:**
- Claude API straightforward to use
- Clear JSON responses
- Good error messages

**Lessons Learned:**
- AI-generated content needs strict JSON formatting prompts
- Rate limiting (1 second between calls) prevents API errors
- Always validate JSON before parsing

**Code Pattern:**
```javascript
const prompt = `Generate content... Return ONLY valid JSON (no line breaks in strings)`;
const message = await anthropic.messages.create({ model, max_tokens, messages });
const jsonMatch = content.match(/\[[\s\S]*\]/);
return JSON.parse(jsonMatch[0]);
```

---

### ✅ **2. Content Balance & Gap Detection** ⭐⭐
**What:** Identify subtopics with missing content and fill gaps
**Difficulty:** Medium
**Time:** ~3 hours
**Challenges:**
- Ensuring no duplicates when generating additional content
- Managing 473 subtopics efficiently
- Cost control (limiting to 50 subtopics per batch)

**What Went Well:**
- Created audit scripts (`find-missing-content.js`) to identify gaps
- Generated ~600 new items across 3-4 batches
- Maintained content quality

**Final Result:**
- 4,807 flashcards (10.2 per subtopic)
- 3,508 practice questions (7.4 per subtopic)
- 2,524 recall prompts (5.3 per subtopic)
- **All 473 subtopics now complete!**

**Lessons Learned:**
- Break large tasks into batches
- Create verification scripts before and after
- Log everything for debugging

---

### ⚠️ **3. JSON Parsing from AI Responses** ⭐⭐
**What:** Parse AI-generated content that sometimes has formatting issues
**Difficulty:** Medium
**Time:** Ongoing (~2-3 hours across sessions)
**Challenges:**
- AI occasionally includes literal newlines in JSON strings
- Special characters breaking JSON.parse()
- ~10-20% failure rate on complex content

**Solutions Tried:**
1. ❌ String replacement (`\n` → `\\n`) - caused double-escaping
2. ✅ Better prompts ("no line breaks in strings")
3. ✅ Error handling with try-catch and retries

**Success Rate:** 80-90% on first try, 95%+ with retries

**Lessons Learned:**
- Prompt engineering is crucial for structured output
- Always have fallback/retry logic
- Log failures to identify patterns

---

### ✅ **4. Database Schema & Migrations** ⭐
**What:** Supabase PostgreSQL tables for all content types
**Difficulty:** Easy
**Time:** ~30 minutes per table
**Why Easy:**
- SQL is straightforward
- Supabase UI is clear
- Good documentation

**Tables Created:**
- subjects, topics, subtopics
- flashcards, flashcard_sets
- practice_questions
- recall_prompts
- quiz_questions
- notes
- subscriptions
- user_activity

**Lessons Learned:**
- Create indexes for foreign keys immediately
- Use `IF NOT EXISTS` for idempotent migrations
- Always test with sample data first

---

### ⚠️ **5. User Progress Tracking Dashboard** ⭐⭐
**What:** Replace fake hardcoded stats with real user progress
**Difficulty:** Medium
**Time:** ~2 hours
**Before:** Dashboard showed fake numbers (3 subjects, 12 topics, 85% quiz avg)
**After:** Real stats from database (subjects started, topics completed, actual quiz scores)

**Challenges:**
- Dashboard component had hardcoded values scattered throughout
- Needed to create new `user_activity` table
- Calculate study streaks from activity dates

**Solution:**
Created `src/lib/user-progress.ts` with:
- `getUserProgress()` - calculate real stats
- `getRecentActivity()` - fetch user actions
- `logUserActivity()` - track user actions
- `calculateStudyStreak()` - consecutive days

**Lessons Learned:**
- Always plan for real data from the start
- Separate data fetching logic into library functions
- Test with multiple users to verify isolation

---

### 🔴 **6. React Component Bugs** ⭐⭐⭐
**What:** Multiple component crashes with unclear errors
**Difficulty:** Hard
**Time:** ~4-5 hours total

#### **Bug 1: useEffect Inside renderContent Function**
**Symptom:** Practice/Recall tabs showed error page
**Root Cause:** `useEffect` hook placed inside `renderContent()` function (invalid React)
**Time to Fix:** 1 hour (hard to spot initially)
**Solution:** Move `useEffect` to component level

**Code:**
```typescript
// ❌ WRONG
const renderContent = () => {
  useEffect(() => { ... }, []);
  // ...
}

// ✅ CORRECT
useEffect(() => { ... }, []);
const renderContent = () => { ... }
```

**Why Hard:**
- Error message wasn't clear
- Only failed in production, worked locally sometimes
- Required understanding React hooks rules

#### **Bug 2: Null Values in ActiveRecall Component**
**Symptom:** Recall tab crashed with "cannot read .length of null"
**Root Cause:** New recall prompts had `hints: null`, component expected array
**Time to Fix:** 45 minutes
**Solution:** Add null checks throughout

**Pattern:**
```typescript
// ❌ WRONG
{currentPrompt.hints.length} hints

// ✅ CORRECT
{currentPrompt.hints?.length || 0} hints
```

**Lessons Learned:**
- Always add null checks for optional fields
- Test with minimal data, not just complete data
- Show helpful fallback messages instead of crashing

---

### 🔴 **7. Vercel Deployment Issues** ⭐⭐⭐
**What:** Code works locally but fails in production
**Difficulty:** Hard
**Time:** 2-3 hours per issue

#### **Issue 1: TypeScript Errors**
**Symptom:** Vercel build fails with `React.NodeNode` type error
**Root Cause:** Typo in type definition
**Why Hard:** Only caught during Vercel build, not local dev

#### **Issue 2: Environment Variables**
**Symptom:** API keys work locally but not in Vercel
**Root Cause:** Needed manual configuration in Vercel dashboard
**Why Hard:**
- Multiple places to check (.env.local, Vercel dashboard, code)
- No clear error messages
- 2-3 minute wait for each deploy to test

**Lessons Learned:**
- Always check Vercel dashboard for environment variables
- Test deploys early and often
- Use deployment preview URLs to test before production

---

### 🔴 **8. AI Test Generator Token Limits** ⭐⭐
**What:** Test generator failed at 30 questions / high difficulty
**Difficulty:** Medium
**Time:** 1 hour
**Root Cause:** `max_tokens: 4000` insufficient for 30 questions with answers/explanations

**Solution:** Dynamic token calculation
```typescript
const maxTokens = Math.min(8000, (questionCount * 200) + 500);
```

**User Decision:** Reduced max questions from 30 to 15 instead

**Lessons Learned:**
- Always calculate token needs based on expected output
- Add buffer for JSON formatting overhead
- Consider UX tradeoffs (15 questions is fine)

---

### ✅ **9. Pricing Updates** ⭐
**What:** Update subscription prices across the app
**Difficulty:** Easy
**Time:** 15 minutes
**Changed:**
- Pro: €3.99 → €4.99 monthly, €29.99 → €39.99 yearly
- Premium: €5.99 → €7.99 monthly, €49.99 → €63.99 yearly

**Files Updated:**
- `src/lib/utils.ts` - SUBSCRIPTION_PRICES
- `src/lib/stripe.ts` - STRIPE_PLANS amounts
- `src/app/pricing/page.tsx` - Display prices
- `src/app/faq/page.tsx` - FAQ text
- `src/app/about/page.tsx` - Marketing copy

**Lessons Learned:**
- Centralize constants in one place when possible
- Use find-and-replace carefully
- Test all pages where pricing appears

---

### 🔴🔴 **10. Stripe Live Mode Integration** ⭐⭐⭐⭐
**What:** Connect Stripe live payments to the app
**Difficulty:** Very Hard (ONGOING)
**Time:** 4+ hours (still not fully working)

**Steps Completed:**
1. ✅ Created Stripe products (Pro, Premium)
2. ✅ Created 4 prices (monthly/yearly for each)
3. ✅ Got live API keys (pk_live, sk_live)
4. ✅ Updated .env.local with live keys
5. ✅ Created webhook endpoint
6. ✅ Got webhook secret (whsec_...)
7. ✅ Created subscriptions table in Supabase
8. ⚠️ Set environment variables in Vercel (unclear if working)

**Current Status:** ❌ Checkout fails with "Failed to start checkout"

**Why This Is So Hard:**
1. **Multiple moving parts:**
   - Stripe Dashboard (products, webhooks)
   - Vercel (environment variables)
   - Supabase (subscriptions table)
   - Code (checkout endpoint, webhook handler)

2. **Silent failures:**
   - No clear error messages
   - Works locally, fails in production
   - Can't easily see Vercel production logs

3. **Long feedback loops:**
   - Each test requires: update env → redeploy (2-3 min) → test → repeat
   - Can't debug in real-time

4. **Environment variable confusion:**
   - Set in .env.local ✅
   - Set in Vercel dashboard ✅
   - But still failing ❌
   - No way to verify they're actually loading in production

**Attempted Solutions:**
1. ❌ Vercel CLI - installation failed (permissions)
2. ❌ Automated script - requires auth
3. ✅ Manual dashboard - unclear if working
4. ⏳ Debug endpoint - next step

**What We Know Works:**
- ✅ Local Stripe test passes (can retrieve prices)
- ✅ Subscriptions table exists and is accessible
- ✅ Webhook endpoint exists at correct URL
- ✅ API keys are valid (tested locally)

**What's Failing:**
- ❌ Production checkout creation
- ❓ Environment variables in Vercel (suspect this is the issue)

**Lessons Learned So Far:**
- Production environment debugging is exponentially harder
- Need better observability (logging, monitoring)
- Should have tested deployment earlier
- Environment variable management is a common pain point

**Next Steps:**
1. Create debug endpoint to show loaded env vars
2. Check Vercel logs directly
3. Test webhook manually with Stripe CLI
4. Consider alternative: Vercel + Stripe integration

---

## 🎓 General Lessons Learned

### **What Makes Things EASY:**
1. ✅ **Clear error messages** - TypeScript type errors, SQL syntax errors
2. ✅ **Immediate feedback** - Local development, instant previews
3. ✅ **Good documentation** - Supabase, Stripe docs were helpful
4. ✅ **Isolated components** - Fix one thing without breaking others
5. ✅ **Direct causation** - Change X → breaks Y (obvious)

### **What Makes Things HARD:**
1. ❌ **Silent failures** - No error, just doesn't work
2. ❌ **Production vs local differences** - Works locally but not deployed
3. ❌ **Long feedback loops** - Wait minutes to test each change
4. ❌ **Multiple dependencies** - A needs B needs C needs D
5. ❌ **Unclear error messages** - "Failed to start checkout" (why?)
6. ❌ **Environment variables** - Never clear what's actually loaded where

### **Time Distribution:**
- **Easy tasks:** 60% of features, 20% of time
- **Medium tasks:** 30% of features, 40% of time
- **Hard tasks:** 10% of features, 40% of time

**One hard problem can take as long as 5-10 easy features!**

---

## 🛠️ Best Practices Developed

### **Development Workflow:**
1. ✅ Make changes locally first
2. ✅ Test thoroughly before deploying
3. ✅ Commit frequently with clear messages
4. ✅ Push to GitHub triggers auto-deploy
5. ✅ Wait 2-3 minutes for deployment
6. ✅ Hard refresh browser (Cmd+Shift+R)
7. ✅ Test in production

### **Debugging Strategy:**
1. ✅ Check error message (if any)
2. ✅ Test locally first (works or fails?)
3. ✅ Check environment variables
4. ✅ Check database (tables exist? data correct?)
5. ✅ Check API responses (browser network tab)
6. ✅ Add console.logs liberally
7. ✅ Create test scripts to isolate issues

### **Code Quality:**
1. ✅ Add null checks for all optional fields
2. ✅ Use try-catch for external API calls
3. ✅ Log errors with context
4. ✅ Test with empty/minimal data, not just complete data
5. ✅ Show helpful error messages to users
6. ✅ Fail gracefully, don't crash

### **Database:**
1. ✅ Always use `IF NOT EXISTS` in migrations
2. ✅ Create indexes for foreign keys
3. ✅ Test migrations with sample data first
4. ✅ Keep SQL files in version control
5. ✅ Document required manual steps

---

## 📈 Productivity Patterns

### **Most Productive:**
- 🟢 Direct code changes (components, styling)
- 🟢 Database queries and content generation
- 🟢 Bug fixes with clear error messages

### **Least Productive:**
- 🔴 Production deployment debugging
- 🔴 Environment variable configuration
- 🔴 Waiting for deploys to test

### **Interruptions:**
- Medium: JSON parsing issues (10-20% AI failure rate)
- High: Production environment differences
- Severe: Environment variable mysteries

---

## 🎯 Future Recommendations

### **For Next Projects:**

1. **Set Up Observability Early:**
   - Add Sentry or similar error tracking DAY 1
   - Log all API calls with request/response
   - Create health check endpoints
   - Monitor environment variable loading

2. **Test Deployment Early:**
   - Deploy "Hello World" on day 1
   - Test environment variables immediately
   - Don't wait until features are complete

3. **Create Debug Endpoints:**
   ```typescript
   // /api/debug/env
   GET → { hasStripeKey: true, hasSupabaseUrl: true, ... }

   // /api/debug/health
   GET → { database: "connected", stripe: "configured", ... }
   ```

4. **Use Vercel CLI from Start:**
   - Set up authentication early
   - Use `vercel env pull` to sync local/production
   - Use `vercel logs` to debug production

5. **Environment Variable Strategy:**
   - Document every required variable
   - Create setup script that validates all are present
   - Use Vercel integrations (Stripe, Supabase) when available

6. **Time Estimates:**
   - Easy feature: 1-2 hours
   - Medium feature: 4-6 hours
   - Hard feature: 1-2 days
   - **Production issues: Add 2-4 hours buffer**

7. **Testing Strategy:**
   - Unit tests for critical functions
   - Integration tests for API endpoints
   - E2E tests for payment flows
   - **Test in production-like environment**

---

## 📊 Metrics

### **Content Generated:**
- 4,807 flashcards
- 3,508 practice questions
- 2,524 recall prompts
- **10,839 total items**
- 473 subtopics (all complete!)

### **Development Stats:**
- **Sessions:** ~8-10 sessions
- **Total Time:** ~25-30 hours
- **Features Completed:** ~15 major features
- **Bugs Fixed:** ~12 significant bugs
- **Deployments:** ~20+ deploys

### **Success Rate:**
- Easy tasks: 95%+ success
- Medium tasks: 85% success
- Hard tasks: 70% success (with retries)
- **Production environment: 60% success** ⚠️

---

## 🔄 Current Status

### ✅ **Working:**
- Content generation and display
- User authentication (Clerk)
- Dashboard with real progress tracking
- AI test generator
- All revision modes (flashcards, quiz, practice, recall)
- Database fully populated
- Stripe test mode (was working)

### ⚠️ **In Progress:**
- Stripe live mode checkout (failing)
- Environment variables in Vercel (unclear)

### 📋 **Not Started:**
- Email notifications
- Social sharing
- Mobile app
- Analytics dashboard
- User feedback system

---

## 💭 Reflections

### **What Went Well:**
1. AI content generation exceeded expectations
2. Database design was solid from the start
3. Component architecture allows easy fixes
4. Supabase has been reliable
5. Most features worked on first or second try

### **What Was Harder Than Expected:**
1. Production vs local environment differences
2. Environment variable management
3. Stripe integration (still ongoing)
4. Silent failures with no error messages

### **What Would I Do Differently:**
1. Set up monitoring/logging on day 1
2. Test production deployment earlier
3. Use Vercel integrations instead of manual env vars
4. Create more debug/health check endpoints
5. Document required env vars as I go

### **Most Valuable Skills:**
1. Systematic debugging (isolate, test, verify)
2. Reading error messages carefully
3. Creating test scripts to verify behavior
4. Patience with long feedback loops
5. Knowing when to try a different approach

---

## 🎯 Next Steps

### **Immediate (Blocking):**
1. 🔴 Fix Stripe checkout in production
2. 🔴 Verify environment variables in Vercel
3. 🔴 Test complete payment flow

### **Short Term (Days):**
1. Test webhook with real payment
2. Verify subscription updates work
3. Test customer portal
4. Document payment flow

### **Medium Term (Weeks):**
1. Add error monitoring (Sentry)
2. Add analytics (PostHog/Mixpanel)
3. Create admin dashboard
4. Add email notifications
5. Improve content quality

### **Long Term (Months):**
1. Mobile app
2. Social features
3. Teacher accounts
4. Content marketplace
5. Advanced analytics

---

## 📚 Resources & Tools Used

### **Development:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Clerk (Auth)
- Supabase (Database)
- Stripe (Payments)
- Anthropic Claude (AI)

### **Deployment:**
- Vercel (Hosting)
- GitHub (Version control)
- Domain: Namecheap/GoDaddy

### **Tools:**
- VS Code
- Supabase Dashboard
- Stripe Dashboard
- Vercel Dashboard
- Claude Code (AI Assistant)

---

## 📝 Key Takeaways for Future Projects

1. **Easy != Fast:** 10 easy things can be faster than 1 hard thing
2. **Production is different:** Always test deployed version early
3. **Environment variables are deceptively hard:** Plan for this
4. **Silent failures are the worst:** Add logging everywhere
5. **Feedback loops matter:** Faster testing = faster development
6. **Documentation saves time:** Future you will thank present you
7. **Break down hard problems:** Test each piece independently
8. **Trust but verify:** Just because it works locally doesn't mean it's done

---

**Last Updated:** February 10, 2026
**Status:** Active Development
**Next Review:** After Stripe integration complete

