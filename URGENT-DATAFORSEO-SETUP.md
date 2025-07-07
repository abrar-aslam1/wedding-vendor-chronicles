# URGENT: Set DataForSEO Credentials in Supabase Dashboard

## Why This Is Needed
The collection is currently using fallback sample data because the DataForSEO API credentials are not available to the edge function. You need to set these in your Supabase dashboard.

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard
- Open: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw
- Make sure you're logged in

### 2. Navigate to Edge Functions
- In the left sidebar, click **"Edge Functions"**
- You should see your functions listed (search-google-vendors, etc.)

### 3. Set Environment Variables
Look for one of these options:
- **"Environment Variables"** tab/section
- **"Settings"** for Edge Functions
- **"Secrets"** section
- **"Configuration"** area

### 4. Add These Two Variables
**Variable 1:**
- Name: `DATAFORSEO_LOGIN`
- Value: `abrar@amarosystems.com`

**Variable 2:**
- Name: `DATAFORSEO_PASSWORD`
- Value: `69084d8c8dcf81cd`

### 5. Save and Deploy
- Click **"Save"** or **"Update"**
- If there's a **"Deploy"** or **"Redeploy"** button, click it

## Alternative: Direct Function Environment
If you can't find the general Edge Functions environment variables:

1. Click on the **"search-google-vendors"** function specifically
2. Look for **"Environment Variables"** or **"Settings"** for that function
3. Add the same two variables there

## Test After Setup
Once you've added the credentials:

1. Run: `node test-final-subcategory.js`
2. You should see:
   - Real business names (not "elegant wedding venue in...")
   - Varying result counts (not always exactly 2)
   - Actual costs being tracked
   - Source showing "google_api" instead of "google_fallback"

## If You Can't Find Environment Variables
If you can't locate where to set environment variables in the Supabase dashboard:

1. Take a screenshot of your Edge Functions page
2. Look for any **"Settings"**, **"Configuration"**, or **"Environment"** options
3. The exact location may vary based on Supabase UI updates

## Verification
After setting up, the edge function logs should show:
- "Making DataForSEO API call..."
- Real API costs
- Actual business data being returned
