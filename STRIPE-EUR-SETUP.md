# Stripe EUR Pricing Setup - CRITICAL FOR LAUNCH

## Current Status:
- App is configured for EUR (€6.99 Pro, €11.99 Premium)
- BUT: Stripe price IDs in environment variables are still GBP prices
- **You MUST create new EUR prices in Stripe before going live**

## Quick Setup (15 minutes):

### 1. Create EUR Prices in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create **Pro Monthly**:
   - Name: "Revision City Pro - Monthly"
   - Price: €6.99 EUR
   - Recurring: Monthly
   - Copy the price ID (starts with `price_`)

4. Create **Pro Yearly**:
   - Same product as above
   - Click "Add another price"
   - Price: €55.99 EUR
   - Recurring: Yearly
   - Copy the price ID

5. Create **Premium Monthly**:
   - Name: "Revision City Premium - Monthly"
   - Price: €11.99 EUR
   - Recurring: Monthly
   - Copy the price ID

6. Create **Premium Yearly**:
   - Same product as above
   - Price: €95.99 EUR
   - Recurring: Yearly
   - Copy the price ID

### 2. Update Vercel Environment Variables

1. Go to https://vercel.com/theo-domans-projects/revision-city/settings/environment-variables

2. Update these 4 variables with your NEW price IDs:
   ```
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx (your new €6.99 monthly)
   STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx (your new €55.99 yearly)
   STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx (your new €11.99 monthly)
   STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx (your new €95.99 yearly)
   ```

3. Click "Save"

4. Redeploy your app (Vercel will prompt you)

### 3. Test Payment Flow

1. Visit https://revision-city.vercel.app/pricing
2. Click "Get Pro"
3. Should redirect to Stripe checkout with €6.99
4. Use test card: 4242 4242 4242 4242
5. Verify payment works

## Going Live (When Ready):

1. Switch Stripe to Live mode
2. Create same 4 products/prices in LIVE mode
3. Update Vercel env vars with LIVE price IDs and LIVE secret key
4. Update webhook endpoint
5. Test with real card

## Current Price IDs (GBP - DO NOT USE):
These are the OLD GBP prices currently in your env:
- `price_1StvuEKh1pH8t4mtPrTNI3ww` (Pro Monthly - GBP)
- `price_1StvvUKh1pH8t4mt3QgJQvZL` (Pro Yearly - GBP)
- `price_1Stw1EKh1pH8t4mtOf2HQidL` (Premium Monthly - GBP)
- `price_1Stw1nKh1pH8t4mtUcKvMPCG` (Premium Yearly - GBP)

**Replace these with EUR prices ASAP!**
