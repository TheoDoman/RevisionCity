# Google Analytics Setup Guide

Google Analytics is now integrated into Revision City. Follow these steps to activate it.

## Step 1: Create Google Analytics Account

1. **Go to Google Analytics:**
   - Visit: https://analytics.google.com
   - Sign in with your Google account

2. **Create Account:**
   - Click "Start measuring" or "Admin" (gear icon)
   - Click "Create Account"
   - Account name: `Revision City`
   - Check data sharing settings (optional)
   - Click "Next"

3. **Create Property:**
   - Property name: `Revision City`
   - Reporting time zone: Your timezone
   - Currency: EUR - Euro (€)
   - Click "Next"

4. **Business Information:**
   - Industry: Education
   - Business size: Small (1-10 employees)
   - How you plan to use Google Analytics: Check relevant options
   - Click "Create"

5. **Accept Terms of Service:**
   - Select your country
   - Accept the terms
   - Click "I Accept"

## Step 2: Set Up Data Stream

1. **Choose Platform:**
   - Select "Web"

2. **Set Up Web Stream:**
   - Website URL: `https://revisioncity.net`
   - Stream name: `Revision City Production`
   - Click "Create stream"

3. **Get Measurement ID:**
   - You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
   - **Copy this ID** - you'll need it for the next step

## Step 3: Add Measurement ID to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click on **RevisionCity** project

2. **Add Environment Variable:**
   - Settings → Environment Variables
   - Click "Add New"
   - **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value:** Your Measurement ID (e.g., `G-ABC123XYZ`)
   - Select: Production, Preview, Development (all three)
   - Click "Save"

3. **Redeploy:**
   - Go to Deployments tab
   - Click three dots on latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

## Step 4: Add to Local Environment (Optional)

For local development tracking:

1. Open `.env.local` file
2. Add this line:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR-ID-HERE
   ```
3. Save the file
4. Restart your development server

## Step 5: Verify It's Working

1. **Real-Time Testing:**
   - Go to Google Analytics → Reports → Realtime
   - Open https://revisioncity.net in a new tab
   - You should see yourself in the real-time report within 30 seconds

2. **Check Installation:**
   - Right-click on revisioncity.net → Inspect
   - Go to Console tab
   - Look for any Google Analytics errors (there should be none)
   - Go to Network tab → Filter by "collect"
   - You should see requests to google-analytics.com

## What Google Analytics Will Track

Once set up, GA will automatically track:

✅ **Page Views** - Which pages users visit
✅ **User Sessions** - How long users stay on your site
✅ **Traffic Sources** - Where your users come from (Google, social media, direct, etc.)
✅ **User Demographics** - Location, device, browser
✅ **User Flow** - How users navigate through your app
✅ **Bounce Rate** - How many leave without interacting
✅ **Conversions** - When users sign up or subscribe

## Useful Reports to Check

After a few days of data:

1. **Realtime** - See who's on your site right now
2. **Acquisition → Traffic acquisition** - Where users come from
3. **Engagement → Pages and screens** - Most popular pages
4. **User → Demographics** - Age, location, interests
5. **Events** - Track specific actions (we can add custom events later)

## Next Steps (Optional Advanced Tracking)

Later, you can add:
- **Custom Events** - Track button clicks, form submissions, etc.
- **E-commerce Tracking** - Track subscription purchases
- **Goal Conversions** - Track sign-ups, trial starts
- **User ID Tracking** - Track logged-in users across devices

## Troubleshooting

**Not seeing data?**
- Wait 24-48 hours for first data
- Check Measurement ID is correct
- Make sure ad blockers are disabled
- Verify environment variable is set in Vercel

**Still not working?**
- Check browser console for errors
- Verify the GoogleAnalytics component is rendering
- Make sure you redeployed after adding the env var

---

**Your Measurement ID:** `_________________` (write it here for reference)

**Date Set Up:** `_________________`

**Verified Working:** ⬜ Yes / ⬜ No / ⬜ Waiting for data
