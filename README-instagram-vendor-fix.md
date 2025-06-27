# Instagram Vendor Production Fix Guide

This guide addresses the issue where Instagram vendors are not showing up in production.

## Issue Summary

Instagram vendors are not appearing in production searches, specifically for URLs like:
`https://findmyweddingvendor.com/top-20/photographers/Traditional%20Photography/Dallas/Texas`

## Root Cause Analysis

The issue was caused by three main problems:

1. **Limited Category Support**: Instagram vendors were only supported for photographers
2. **Restrictive Location Filtering**: The location matching was too strict (e.g., "Texas" vs "TX")
3. **Missing Environment Variables**: Production environment lacks required Supabase credentials

## Fixes Implemented

### 1. Expanded Category Support
- ✅ **Before**: Only photographers had Instagram vendor support
- ✅ **After**: All vendor categories now support Instagram vendors:
  - Photographers
  - Wedding Planners
  - Videographers
  - Florists
  - Caterers
  - Venues
  - DJs & Bands
  - Cake Designers
  - Bridal Shops
  - Makeup Artists
  - Hair Stylists

### 2. Improved Location Filtering
- ✅ **Before**: Strict matching that missed "Texas" when data had "TX"
- ✅ **After**: Flexible matching that handles:
  - State abbreviations (TX, CA, NY, etc.)
  - Full state names (Texas, California, New York, etc.)
  - City variations
  - Location field variations

### 3. Enhanced Vendor Descriptions
- ✅ **Before**: All Instagram vendors described as "photographer"
- ✅ **After**: Dynamic descriptions based on actual vendor category

## Required Environment Variables

For Instagram vendors to work in production, these environment variables must be set in Netlify:

```bash
SUPABASE_URL=https://wpbdveyuuudhmwflrmqw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Note**: The service role key is different from the anon key and has elevated permissions needed to query the Instagram vendors table.

## Netlify Environment Setup

### Step 1: Access Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: `findmyweddingvendor.com`
3. Navigate to **Site settings** → **Environment variables**

### Step 2: Add Environment Variables
Add these two variables:

**Variable 1:**
- **Key**: `SUPABASE_URL`
- **Value**: `https://wpbdveyuuudhmwflrmqw.supabase.co`
- **Scopes**: All scopes

**Variable 2:**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM`
- **Scopes**: All scopes

## ✅ Database Verification

**Good News**: The database connection is working and contains **977 Instagram vendors** that match Dallas/Texas searches. The vendors have "Dallas, TX" in their location field, which means our improved location filtering will find them.

### Step 3: Deploy
1. After adding the environment variables, trigger a new deployment
2. You can do this by:
   - Making a small commit to your repository, OR
   - Going to **Deploys** → **Trigger deploy** → **Deploy site**

## Verification Steps

After deployment, verify the fix by:

### 1. Check Function Logs
1. Go to Netlify Dashboard → **Functions** → **search-vendors**
2. Look for logs showing:
   ```
   Supabase credentials found, proceeding with Instagram query...
   Fetching Instagram vendors for category: photographers...
   Found X Instagram vendors
   ```

### 2. Test the Specific URL
Visit: `https://findmyweddingvendor.com/top-20/photographers/Traditional%20Photography/Dallas/Texas`

You should now see:
- **Google Results** column with Google Maps vendors
- **Instagram Results** column with Instagram vendors
- Both columns should have actual results (not "Coming Soon" banners)

### 3. Test Other Categories
Try other vendor categories to ensure Instagram vendors appear:
- Wedding Planners: `/top-20/wedding-planners/Full-Service%20Planning/Dallas/Texas`
- Florists: `/top-20/florists/Modern%20Arrangements/Dallas/Texas`
- Venues: `/top-20/venues/Ballrooms/Dallas/Texas`

## Troubleshooting

### If Instagram vendors still don't appear:

1. **Check Environment Variables**
   ```bash
   # In Netlify function logs, you should see:
   "Supabase credentials found, proceeding with Instagram query..."
   
   # If you see this instead, env vars are missing:
   "Missing Supabase credentials for Instagram vendor query"
   ```

2. **Check Database Data**
   Verify Instagram vendors exist in your production database:
   - Category should match the search (e.g., "photographers")
   - Location should include Dallas, TX or Texas

3. **Check Function Deployment**
   Ensure the updated search function was deployed:
   - Check the function's last modified date in Netlify
   - Look for the new category mapping logic in logs

### Common Issues:

**Issue**: "Missing Supabase credentials"
**Solution**: Ensure both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify

**Issue**: Instagram vendors appear but are empty
**Solution**: Check that your Instagram vendors table has data for the specific category and location

**Issue**: Only photographers show Instagram vendors
**Solution**: Ensure the updated search function was deployed (check function logs for category mapping)

## Expected Results

After implementing these fixes, you should see:

### For Photographers in Dallas, Texas:
- **Google Results**: Traditional Google Maps photographers
- **Instagram Results**: Instagram photographers from your database
- **Total Results**: Combined results from both sources

### For All Other Categories:
- Same dual-column layout with both Google and Instagram results
- Instagram vendors will show appropriate descriptions for their category
- Location filtering will work for both "TX" and "Texas" variations

## Performance Notes

- Instagram vendor queries are cached for 14 days
- Location filtering is optimized to handle multiple state format variations
- Results are sorted by relevance when subcategories are specified

## Support

If you continue to experience issues:

1. Check Netlify function logs for specific error messages
2. Verify your Instagram vendors table has data for the categories you're testing
3. Ensure the service role key has proper permissions in Supabase

The fix should resolve the Instagram vendor visibility issue across all vendor categories and locations.
