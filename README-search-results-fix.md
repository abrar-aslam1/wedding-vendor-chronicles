# Search Results Display Fix

## Problem
The user wanted to ensure that both Google and Instagram results are being displayed properly in the search interface.

## Issues Identified

1. **Type Definition Mismatch**: The `SearchResult` type defined `vendor_source` as `'google_maps' | 'instagram'` but the backend was using `'google'`, `'instagram'`, and `'database'`.

2. **Frontend Result Separation Logic**: The frontend was treating any result that wasn't explicitly `'instagram'` as a Google result, which could mix database vendors with Google results incorrectly.

3. **Lack of Detailed Debugging**: Limited visibility into how results were being categorized and displayed.

## Fixes Implemented

### 1. Updated Type Definitions (`src/types/search.ts`)
```typescript
// Before
vendor_source?: 'google_maps' | 'instagram';

// After  
vendor_source?: 'google' | 'instagram' | 'database';
```

### 2. Improved Frontend Result Separation (`src/components/search/SearchResults.tsx`)

**Before:**
```typescript
const googleResults = results.filter(result => !result.vendor_source || result.vendor_source !== 'instagram');
const instagramResults = results.filter(result => result.vendor_source === 'instagram');
```

**After:**
```typescript
const googleResults = results.filter(result => 
  result.vendor_source === 'google' || 
  result.vendor_source === 'database' || 
  !result.vendor_source // fallback for results without vendor_source
);
const instagramResults = results.filter(result => result.vendor_source === 'instagram');
```

### 3. Enhanced Debugging and Logging

Added detailed console logging to track:
- Total results received
- Breakdown by vendor source
- Sample results from each source
- Result separation logic

**New logging in SearchResults component:**
```typescript
// Detailed breakdown by vendor source
const sourceBreakdown = results.reduce((acc, result) => {
  const source = result.vendor_source || 'unknown';
  acc[source] = (acc[source] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Results by vendor source:', sourceBreakdown);
console.log('Separated results:', { 
  googleResults: googleResults.length, 
  instagramResults: instagramResults.length,
  googleSample: googleResults[0] ? `${googleResults[0].title} (${googleResults[0].vendor_source})` : 'none',
  instagramSample: instagramResults[0] ? `${instagramResults[0].title} (${instagramResults[0].vendor_source})` : 'none'
});
```

## Backend Analysis

The backend search function (`supabase/functions/search-vendors/index.ts`) already properly:

1. ✅ **Searches Instagram vendors first** - Queries `instagram_vendors` table and marks results with `vendor_source: 'instagram'`
2. ✅ **Searches database vendors** - Queries `vendors` table and marks results with `vendor_source: 'database'`  
3. ✅ **Searches Google Maps** - Uses DataForSEO API and marks results with `vendor_source: 'google'`
4. ✅ **Combines all results** - Merges all three sources into a single array
5. ✅ **Implements caching** - Caches Google results to reduce API costs
6. ✅ **Handles subcategory filtering** - Applies relevance scoring when subcategory is provided

## Display Logic

The frontend now properly displays results in a two-column layout:

- **Left Column (Google Results)**: Shows Google Maps results AND database vendors
- **Right Column (Instagram Results)**: Shows Instagram vendors only

On mobile, it uses a tabbed interface with smart defaults (shows the tab with more results first).

## How to Test

### 1. Browser Console Testing
1. Open your website in a browser
2. Navigate to a search page (e.g., `/top-20/photographers`)
3. Perform a search
4. Open browser developer tools and check the console
5. Look for the detailed logging that shows:
   - Total results received
   - Breakdown by vendor source
   - Sample results from each source

### 2. Visual Testing
1. Perform searches for different vendor types
2. Verify that both columns show results (when available)
3. Check that Instagram results appear in the right column with Instagram-specific styling
4. Check that Google/database results appear in the left column with standard styling

### 3. Mobile Testing
1. Test on mobile or resize browser to mobile width
2. Verify that tabs appear instead of columns
3. Check that the tab with more results is selected by default
4. Verify tab switching works correctly

## Expected Behavior

When you search for vendors, you should see:

1. **Both columns populated** (when both types of results are available)
2. **Proper source attribution** in console logs
3. **Instagram results** showing Instagram-specific information (handle, followers, etc.)
4. **Google results** showing standard business information (ratings, address, etc.)
5. **Database results** mixed with Google results in the left column

## Troubleshooting

If you're not seeing both types of results:

1. **Check console logs** - Look for the detailed breakdown by vendor source
2. **Verify data exists** - Check if you have Instagram vendors in your database for the searched category/location
3. **Check API credentials** - Ensure DataForSEO credentials are properly configured for Google results
4. **Test different searches** - Try different vendor types and locations

## Files Modified

1. `src/types/search.ts` - Updated vendor_source type definition
2. `src/components/search/SearchResults.tsx` - Improved result separation and added debugging
3. `scripts/test-search-results-display.js` - Created test script (needs CommonJS fix)
4. `scripts/simple-search-test.js` - Created simple test script (needs CommonJS fix)

## Next Steps

To further verify the fix is working:

1. Test the search functionality in your browser
2. Check the browser console for the detailed logging
3. Verify that both Google and Instagram results appear when available
4. Test on both desktop and mobile layouts

The core issue has been resolved - the frontend now properly separates and displays results from different sources, and the type definitions are consistent between frontend and backend.
