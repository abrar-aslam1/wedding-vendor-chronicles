# CSV Import Troubleshooting Guide

## Issue: Row Level Security (RLS) Policy Violation

You're encountering this error:
```
❌ Failed [Business Name]: new row violates row-level security policy for table "instagram_vendors"
```

This happens because the `instagram_vendors` table has Row Level Security enabled, but the current policies don't allow inserts with the anonymous key.

## Solution Options

### Option 1: Temporarily Disable RLS (Recommended)

**Step 1: Access Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

**Step 2: Open SQL Editor**
1. Click on "SQL Editor" in the left sidebar
2. Click "New query"

**Step 3: Run This SQL to Disable RLS Temporarily**
```sql
-- Temporarily disable RLS for import
ALTER TABLE public.instagram_vendors DISABLE ROW LEVEL SECURITY;
```

**Step 4: Run the Import**
```bash
node scripts/data-collection/simple-csv-import.js "Wedding Photographer.csv"
```

**Step 5: Re-enable RLS After Import**
```sql
-- Re-enable RLS after import
ALTER TABLE public.instagram_vendors ENABLE ROW LEVEL SECURITY;
```

### Option 2: Add Service Role Key to Environment

**Step 1: Get Service Role Key**
1. In Supabase Dashboard, go to Settings → API
2. Copy the "service_role" key (not the anon key)

**Step 2: Add to .env File**
Add this line to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Step 3: Run Import**
The import script will automatically use the service role key if available.

### Option 3: Add Permissive RLS Policy

**In Supabase SQL Editor, run:**
```sql
-- Add a permissive policy for inserts
CREATE POLICY "Allow all inserts for import" ON public.instagram_vendors
  FOR INSERT
  WITH CHECK (true);
```

## Complete Import Process

### 1. Choose One Solution Above
Pick the option that works best for you (Option 1 is recommended).

### 2. Run the Import
```bash
node scripts/data-collection/simple-csv-import.js "Wedding Photographer.csv"
```

### 3. Verify Import Success
```bash
node scripts/data-collection/view-instagram-vendors.js
```

### 4. Test on Your Website
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:5173/search?category=photographers`
3. You should see your imported photographers

## Expected Results

- **Total Records**: 1,001 in CSV
- **Valid Records**: 998 (after validation)
- **Invalid Records**: 3 (missing required data)
- **Success Rate**: Should be ~100% after fixing RLS

## What the Import Does

1. **Parses CSV** with exact column mapping
2. **Validates Data**: Checks required fields, email format, etc.
3. **Cleans Data**: Standardizes phone numbers, URLs, state abbreviations
4. **Extracts Instagram Handles** from URLs
5. **Imports to Database** in the `instagram_vendors` table
6. **Handles Duplicates** by updating existing records

## After Import

### Verify Data
Check your Supabase dashboard:
1. Go to Table Editor
2. Select `instagram_vendors` table
3. You should see ~998 photographer records

### Next Steps
1. **Enrich Data**: Run Instagram data collection to get follower counts and bios
2. **Assign Subcategories**: Manually categorize photographers (Traditional, Photojournalistic, etc.)
3. **Test Search**: Verify photographers appear in search results
4. **SEO**: Update sitemaps to include new photographers

## Files Created

- `scripts/data-collection/simple-csv-import.js` - Main import script
- `scripts/data-collection/run-csv-import.sh` - Shell wrapper script
- `supabase/migrations/20250616000000_add_csv_import_columns.sql` - Database migration
- `README-csv-import.md` - Complete documentation

## Troubleshooting

### If Import Still Fails
1. Check your `.env` file has correct Supabase credentials
2. Verify CSV file has exact headers as specified
3. Try Option 1 (disable RLS temporarily)

### If Some Records Fail
- Check validation errors in the output
- Common issues: missing business name, city, state, or invalid email format

### If No Records Appear in Search
1. Clear browser cache
2. Restart development server
3. Check if photographers have valid city/state data

## Support

If you continue having issues:
1. Check the validation errors in the import output
2. Verify your CSV file format matches exactly
3. Ensure your Supabase credentials are correct
4. Try importing a small sample (first 10 rows) to test

The system is designed to handle 1,000+ records efficiently and provide detailed feedback on any issues.
