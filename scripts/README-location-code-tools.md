# DataForSEO Location Code Tools

This directory contains several tools to help you find and manage DataForSEO location codes for expanding your wedding vendor coverage to additional Texas cities.

## Overview

Your project currently uses DataForSEO location codes to search for vendors in specific cities. The location codes are stored in `/src/config/locations.ts` and currently include:

**Current Texas Cities:**
- Dallas: 1003735
- Houston: 1003811
- Austin: 1003550
- San Antonio: 1004100

## Available Tools

### 1. Quick Texas Lookup (`quick-texas-lookup.js`)

**Purpose:** Quickly find location codes for specific Texas cities
**Best for:** Looking up a few specific cities

```bash
# Look up specific cities
node scripts/quick-texas-lookup.js "Fort Worth" "Plano" "Arlington"

# Show popular Texas cities
node scripts/quick-texas-lookup.js
```

**Example output:**
```
✅ Fort Worth → Fort Worth (1003762)
✅ Plano → Plano (1004033)
✅ Arlington → Arlington (1003541)

=== Location Codes for Config File ===

"Texas": {
  code: 2840,
  cities: {
    // Existing cities
    "Dallas": 1003735,
    "Houston": 1003811,
    "Austin": 1003550,
    "San Antonio": 1004100,
    // New cities
    "Fort Worth": 1003762,
    "Plano": 1004033,
    "Arlington": 1003541
  }
},
```

### 2. Full Location Code Fetcher (`fetch-location-codes.js`)

**Purpose:** Comprehensive tool for exploring all DataForSEO locations
**Best for:** Detailed exploration and finding obscure cities

```bash
# Search for a specific city in Texas
node scripts/fetch-location-codes.js --city "Fort Worth" --state "Texas"

# List all cities in Texas
node scripts/fetch-location-codes.js --state "Texas" --list-cities

# General search
node scripts/fetch-location-codes.js --search "Plano"

# Show major Texas cities
node scripts/fetch-location-codes.js --texas-cities
```

### 3. Database Location Checker (`check-database-locations.js`)

**Purpose:** Check what location data is already in your Supabase database
**Best for:** Working with cached location data from your database

```bash
# Check Texas cities in database
node scripts/check-database-locations.js --texas

# Search database for specific cities
node scripts/check-database-locations.js --search "Fort Worth"

# Show database statistics
node scripts/check-database-locations.js
```

## How Location Codes Work

### DataForSEO API Structure
- **Country Code (US):** 2840
- **State Codes:** Each state has a unique code (e.g., Texas state code)
- **City Codes:** Each city has a unique code linked to its parent state

### Your Current Implementation

1. **Static Config:** `/src/config/locations.ts` contains hardcoded location codes
2. **Database Cache:** `/supabase/migrations/20250102_create_dataforseo_locations.sql` creates a table for caching location data
3. **Sync Function:** `/supabase/functions/sync-dataforseo-locations/index.ts` can populate the database with fresh location data
4. **Location Service:** `/src/services/locationService.ts` handles location lookups with database fallback

## Adding New Texas Cities

### Step 1: Find Location Codes
Use the quick lookup tool to find codes for your target cities:

```bash
node scripts/quick-texas-lookup.js "Fort Worth" "Plano" "Arlington" "Garland" "Irving"
```

### Step 2: Update Config File
Add the new cities to `/src/config/locations.ts`:

```typescript
"Texas": {
  code: 2840,
  cities: {
    "Dallas": 1003735,
    "Houston": 1003811,
    "Austin": 1003550,
    "San Antonio": 1004100,
    "Fort Worth": 1003762,    // New
    "Plano": 1004033,         // New
    "Arlington": 1003541,     // New
    // ... add more cities
  }
}
```

### Step 3: Update Shared Location Codes (if needed)
Also update `/supabase/functions/_shared/locationCodes.ts` with the same data.

### Step 4: Test the Integration
Test that the new cities work with your search functionality:

```bash
# Test the new locations in your app
npm run dev
# Navigate to search and try the new cities
```

## Popular Texas Cities to Consider

Based on population and wedding market size, consider adding these cities:

### Major Cities (Population 200k+)
- Fort Worth: ~900k population
- El Paso: ~680k population
- Arlington: ~400k population
- Corpus Christi: ~320k population
- Plano: ~290k population
- Lubbock: ~260k population
- Garland: ~240k population
- Irving: ~240k population
- Laredo: ~260k population

### Growing Wedding Markets
- McKinney: ~200k population (Dallas suburbs)
- Frisco: ~200k population (Dallas suburbs)
- Grand Prairie: ~190k population (Dallas-Fort Worth)
- Denton: ~140k population (University town)
- Richardson: ~120k population (Dallas suburb)
- Lewisville: ~110k population (Dallas-Fort Worth)
- Round Rock: ~130k population (Austin suburb)
- Sugar Land: ~110k population (Houston suburb)
- Pearland: ~130k population (Houston suburb)

## Troubleshooting

### API Rate Limits
DataForSEO has rate limits. If you hit them:
1. Wait a few minutes between requests
2. Use the database checker first to see what's already cached
3. Query smaller batches of cities

### Invalid Location Codes
If a city code doesn't work:
1. Double-check the spelling
2. Try variations (e.g., "Ft Worth" vs "Fort Worth")
3. Check if it's a neighborhood vs. city in the API
4. Use the general search to find alternatives

### Database Issues
If the database tools don't work:
1. Ensure your `.env` file has correct Supabase credentials
2. Run the dataforseo_locations migration
3. Call the sync-dataforseo-locations function to populate data

## API Credentials

The tools use the existing DataForSEO credentials from your project:
- Username: `abrar@amarosystems.com`
- Password: `69084d8c8dcf81cd`

These are already configured in the scripts and match your existing setup.

## Best Practices

1. **Start Small:** Add 5-10 major cities first, test, then expand
2. **Test Thoroughly:** Verify each new city works in your search before moving to production
3. **Document Changes:** Update this README when you add new cities
4. **Monitor Performance:** More cities = more search options, ensure your caching handles the load
5. **Consider Market Research:** Focus on cities with active wedding markets

## Next Steps

1. Choose 5-10 target Texas cities
2. Use `quick-texas-lookup.js` to get their codes
3. Update your config files
4. Test the integration
5. Deploy and monitor
6. Gradually expand to more cities based on usage and demand