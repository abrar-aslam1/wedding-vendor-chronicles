# DataForSEO API Credentials Setup

## Your Credentials
- **Login**: abrar@amarosystems.com
- **Password**: 69084d8c8dcf81cd

## How to Set Up in Supabase

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw
2. Navigate to **Edge Functions** in the left sidebar
3. Click on **Environment Variables** or **Settings**
4. Add these environment variables:
   - **Name**: `DATAFORSEO_LOGIN`
   - **Value**: `abrar@amarosystems.com`
   
   - **Name**: `DATAFORSEO_PASSWORD` 
   - **Value**: `69084d8c8dcf81cd`

5. Save the changes
6. Redeploy your edge functions (if needed)

### Method 2: Using Supabase CLI
If you have the Supabase CLI set up, you can run:

```bash
supabase secrets set DATAFORSEO_LOGIN=abrar@amarosystems.com
supabase secrets set DATAFORSEO_PASSWORD=69084d8c8dcf81cd
```

## After Setting Up Credentials

1. **Test the API**: Run `node test-final-subcategory.js` to verify real data is being fetched
2. **Resume Collection**: Run `node scripts/collect-all-vendors.js` to continue with real vendor data

## Expected Changes
- API calls will return real vendor data instead of sample data
- Costs will be tracked (DataForSEO charges per API call)
- Results will vary in count (not always exactly 2)
- Vendor names and details will be real businesses

## Important Notes
- These credentials are for your DataForSEO account
- API calls will incur costs based on your DataForSEO plan
- The collection script has rate limiting (10 requests/minute, 200/day) to manage costs
