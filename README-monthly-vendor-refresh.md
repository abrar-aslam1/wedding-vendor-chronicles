# Monthly Vendor Refresh System

This system automatically collects fresh vendor data from Google Maps via the DataForSEO API and stores it in Supabase for improved search results.

## Overview

The monthly vendor refresh system consists of:

1. **Database Schema**: New `vendors_google` table to store Google Maps vendor data
2. **Collection Script**: Node.js script that calls DataForSEO API and populates the database
3. **Edge Function**: Supabase Edge Function for scheduled execution
4. **Updated Search**: Enhanced search function that includes Google Maps data from the database
5. **Automation**: Shell scripts and scheduling options

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DataForSEO    │    │  Monthly Refresh │    │   Supabase      │
│   Google Maps   │───▶│     Script       │───▶│ vendors_google  │
│      API        │    │                  │    │     Table       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Scheduling     │    │  Search Results │
                       │ (Cron/GitHub     │    │   (Enhanced)    │
                       │   Actions)       │    │                 │
                       └──────────────────┘    └─────────────────┘
```

## Database Schema

### vendors_google Table

```sql
CREATE TABLE vendors_google (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id text UNIQUE NOT NULL,           -- Google's unique identifier
  business_name text NOT NULL,
  category text NOT NULL,                  -- Maps to your 11 categories
  city text NOT NULL,
  state text NOT NULL,
  state_code text NOT NULL,
  address text,
  phone text,
  website_url text,
  email text,
  rating jsonb,                           -- Google rating data
  description text,
  images text[],
  business_hours jsonb,
  price_range text,
  coordinates point,                      -- PostGIS point
  latitude decimal,
  longitude decimal,
  reviews_count integer,
  year_established integer,
  payment_methods text[],
  service_area text[],
  categories text[],
  postal_code text,
  last_updated timestamp with time zone DEFAULT now(),
  data_source text DEFAULT 'google_maps',
  created_at timestamp with time zone DEFAULT now()
);
```

### all_vendors View

A unified view combining all vendor sources:
- `vendors_google` (Google Maps data)
- `instagram_vendors` (Instagram data)
- `vendors` (Regular database vendors)

## Components

### 1. Database Migration

**File**: `supabase/migrations/20250102000000_create_vendors_google_table.sql`

Creates the database schema, indexes, RLS policies, and unified view.

```bash
# Apply migration
supabase db push
```

### 2. Collection Script

**File**: `scripts/data-collection/monthly-vendor-refresh.js`

Node.js script that:
- Processes 20 major wedding cities
- Searches 11 vendor categories per city
- Calls DataForSEO Google Maps API
- Filters for wedding-related businesses
- Stores data in `vendors_google` table
- Implements smart caching to avoid duplicate API calls

**Features**:
- Batch processing with rate limiting
- Error handling and retry logic
- Dry-run mode for testing
- Comprehensive logging
- Cost tracking

### 3. Edge Function

**File**: `supabase/functions/monthly-vendor-refresh/index.ts`

Supabase Edge Function for scheduled execution:
- Smaller scope (5 cities) to fit within timeout limits
- Configurable via request body
- Suitable for cron scheduling
- Returns execution summary

### 4. Enhanced Search Function

**File**: `supabase/functions/search-vendors/index.ts`

Updated to include Google Maps data from database:
1. Instagram vendors (most wedding-focused)
2. **Google vendors database** (NEW - from `vendors_google`)
3. Regular vendors table
4. Google Maps API (live, with caching)

### 5. Shell Script Runner

**File**: `scripts/data-collection/run-monthly-vendor-refresh.sh`

Bash script for easy execution:
- Environment variable validation
- Command-line options
- Error handling
- Logging

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# DataForSEO API (required for vendor refresh)
DATAFORSEO_LOGIN=your_dataforseo_login
DATAFORSEO_PASSWORD=your_dataforseo_password
```

### 2. Database Setup

Apply the migration:

```bash
supabase db push
```

### 3. Install Dependencies

The script uses ES modules, ensure your `package.json` has:

```json
{
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.7.1",
    "dotenv": "^16.0.0"
  }
}
```

### 4. Make Scripts Executable

```bash
chmod +x scripts/data-collection/run-monthly-vendor-refresh.sh
```

## Usage

### Manual Execution

#### Using Node.js Script

```bash
# Production run
node scripts/data-collection/monthly-vendor-refresh.js

# Dry run (testing)
node scripts/data-collection/monthly-vendor-refresh.js --dry-run

# Help
node scripts/data-collection/monthly-vendor-refresh.js --help
```

#### Using Shell Script

```bash
# Production run
./scripts/data-collection/run-monthly-vendor-refresh.sh

# Dry run
./scripts/data-collection/run-monthly-vendor-refresh.sh --dry-run

# Help
./scripts/data-collection/run-monthly-vendor-refresh.sh --help
```

#### Using Edge Function

```bash
# Test the edge function
curl -X POST https://your-project.supabase.co/functions/v1/monthly-vendor-refresh \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "maxCities": 2}'
```

### Scheduled Execution

#### Option 1: Cron Job

Add to your crontab:

```bash
# Run on the 1st of every month at 2 AM
0 2 1 * * /path/to/your/project/scripts/data-collection/run-monthly-vendor-refresh.sh
```

#### Option 2: GitHub Actions

Create `.github/workflows/monthly-vendor-refresh.yml`:

```yaml
name: Monthly Vendor Refresh

on:
  schedule:
    - cron: '0 2 1 * *'  # 1st of every month at 2 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  refresh-vendors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run vendor refresh
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          DATAFORSEO_LOGIN: ${{ secrets.DATAFORSEO_LOGIN }}
          DATAFORSEO_PASSWORD: ${{ secrets.DATAFORSEO_PASSWORD }}
        run: node scripts/data-collection/monthly-vendor-refresh.js
```

#### Option 3: Supabase Cron (pg_cron)

```sql
-- Schedule the edge function to run monthly
SELECT cron.schedule(
  'monthly-vendor-refresh',
  '0 2 1 * *',  -- 1st of every month at 2 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/monthly-vendor-refresh',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}',
    body := '{"maxCities": 5}'
  );
  $$
);
```

## Configuration

### Script Configuration

Edit `CONFIG` object in `monthly-vendor-refresh.js`:

```javascript
const CONFIG = {
  batchSize: 5,                    // Concurrent API requests
  delayBetweenBatches: 2000,      // Delay in milliseconds
  maxResultsPerQuery: 50,         // Results per API call
  dryRun: false,                  // Test mode
  onlyRefreshOlderThan: 30        // Days before refresh
};
```

### Cities and Categories

The script processes:
- **20 major wedding cities** (Tier 1 from `src/config/cities.ts`)
- **11 vendor categories** (from `src/config/categories.ts`)

To modify, edit the arrays in the script:
- `TOP_WEDDING_CITIES`
- `VENDOR_CATEGORIES`

## Monitoring and Costs

### API Costs

- **DataForSEO**: ~$1 per API call
- **Monthly estimate**: 20 cities × 11 categories = 220 calls = ~$220/month
- **Smart caching**: Only refreshes data older than 30 days

### Monitoring

The script provides detailed logging:
- Vendors collected per city/category
- API calls made and costs
- Errors encountered
- Execution time

### Success Metrics

Monitor these in your logs:
- Total vendors collected
- API cost per execution
- Error rate
- Execution time

## Data Quality

### Wedding Vendor Filtering

The script filters businesses using:

**Wedding Keywords**:
- wedding, bride, bridal, groom, marriage, nuptials
- ceremony, reception, engagement, matrimony

**Category Keywords**:
- Specific to each vendor type (photographer, planner, etc.)

### Deduplication

- Uses Google's `place_id` as unique identifier
- Upsert strategy prevents duplicates
- Updates existing records with fresh data

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   Error: Missing Supabase credentials
   ```
   Solution: Ensure all required env vars are set

2. **API Rate Limiting**
   ```bash
   API request failed: 429 Too Many Requests
   ```
   Solution: Increase delays in CONFIG

3. **Database Connection Issues**
   ```bash
   Error: Supabase credentials not configured
   ```
   Solution: Check SUPABASE_URL and SERVICE_ROLE_KEY

4. **TypeScript Errors in Edge Function**
   - The Edge Function has some TypeScript warnings but functions correctly
   - These are due to Deno's type system and don't affect execution

### Debugging

Enable verbose logging by setting:
```bash
DEBUG=true node scripts/data-collection/monthly-vendor-refresh.js --dry-run
```

### Testing

Always test with dry-run first:
```bash
node scripts/data-collection/monthly-vendor-refresh.js --dry-run
```

## Integration with Search

The enhanced search function now returns vendors from 4 sources:

1. **Instagram vendors** (`vendor_source: 'instagram'`)
2. **Google database** (`vendor_source: 'google_database'`) - NEW
3. **Regular vendors** (`vendor_source: 'database'`)
4. **Google API live** (`vendor_source: 'google'`)

This provides comprehensive coverage with fresh, cached data from the monthly refresh.

## Future Enhancements

1. **Expand to Tier 2 cities** (Charleston, Savannah, Newport, etc.)
2. **Add vendor quality scoring** based on ratings and reviews
3. **Implement vendor contact verification**
4. **Add vendor website screenshot capture**
5. **Create vendor change detection and notifications**
6. **Add vendor social media link discovery**

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Test with `--dry-run` flag first
3. Verify environment variables are set correctly
4. Check DataForSEO API quota and billing
5. Monitor Supabase database storage and usage
