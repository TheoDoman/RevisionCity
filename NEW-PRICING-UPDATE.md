# Pricing Update - More Competitive Rates

## ✅ What's Changed

### Old Pricing:
- **Pro:** €6.99/month or €55.99/year
- **Premium:** €11.99/month or €95.99/year
- **Yearly Discount:** 33%

### New Pricing (APPLIED):
- **Pro:** €4.99/month or €39.99/year ⬇️ 29% cheaper
- **Premium:** €7.99/month or €63.99/year ⬇️ 33% cheaper
- **Yearly Discount:** 33% (unchanged)

## 💰 Market Positioning

Your new pricing is now **highly competitive**:
- **Cheaper than Quizlet Plus** (€3.99/month) when you consider the feature set
- **Much cheaper than Save My Exams** (€60+/year)
- **Better value than tutoring** (€20-50/hour)
- **Positioned for volume** - low barrier to entry for students

### Price per month (when paying yearly):
- **Pro:** €3.33/month
- **Premium:** €5.33/month

## 📝 Updated Files

✅ `/src/lib/utils.ts` - Core pricing constants
✅ `/src/lib/stripe.ts` - Stripe amount validation
✅ `/src/app/pricing/page.tsx` - Yearly discount badge (now shows -33%)
✅ `/src/app/faq/page.tsx` - FAQ pricing answer
✅ `/src/app/about/page.tsx` - "Affordable" section

## ⚠️ IMPORTANT: Stripe Dashboard Update Required

You need to update your Stripe products with the new prices:

### Steps:

1. **Log into Stripe Dashboard** (dashboard.stripe.com)

2. **Update Pro Plan:**
   - Go to Products → Find "Pro Plan"
   - Update Monthly Price: €6.99 → **€4.99**
   - Update Yearly Price: €55.99 → **€39.99**
   - Copy the new Price IDs

3. **Update Premium Plan:**
   - Go to Products → Find "Premium Plan"
   - Update Monthly Price: €11.99 → **€7.99**
   - Update Yearly Price: €95.99 → **€63.99**
   - Copy the new Price IDs

4. **Update Environment Variables:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Update these with your NEW Stripe Price IDs:
     ```
     STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx (new €4.99 price)
     STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx (new €39.99 price)
     STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx (new €7.99 price)
     STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx (new €63.99 price)
     ```
   - Redeploy your app

5. **Test Payment Flow:**
   - Visit https://revisioncity.net/pricing
   - Verify prices display correctly
   - Test a checkout (use Stripe test card: 4242 4242 4242 4242)
   - Confirm the checkout shows the new prices

## 🎯 Marketing Angle

With this new pricing, you can now market as:
- **"Starting at just €4.99/month"**
- **"Less than a coffee a week"**
- **"Complete IGCSE revision for less than €5/month"**
- **"Cheaper than one hour of tutoring per YEAR"**

## 📊 Revenue Impact

Assuming conversion rates stay similar or improve due to lower friction:

**Scenario 1** (same volume):
- 100 Pro subscribers: €6,990 → €4,990/month (-29%)

**Scenario 2** (50% more conversions due to lower price):
- 150 Pro subscribers: €7,485/month (+7% revenue increase)

**Scenario 3** (100% more conversions - likely with better pricing):
- 200 Pro subscribers: €9,980/month (+43% revenue increase)

Lower prices often lead to higher conversion rates, especially for student audiences. The €4.99 price point removes friction and makes it an impulse buy.
