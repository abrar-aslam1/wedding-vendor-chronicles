-- ============================================================================
-- Clear Bad Cart Cache Script
-- ============================================================================
-- This script removes cached cart search results that may contain
-- inappropriate results (e.g., golf carts, shopping carts instead of
-- wedding mobile service carts).
--
-- IMPORTANT: Review the results of Step 1 before running Step 2!
-- ============================================================================

-- ============================================================================
-- STEP 1: REVIEW WHAT WILL BE DELETED
-- ============================================================================
-- Run this query first to see what cart-related cache entries exist
-- and verify they should be deleted.

SELECT 
  id,
  category,
  city,
  state,
  subcategory,
  created_at,
  expires_at,
  jsonb_array_length(search_results) as result_count,
  -- Show first result title as sample
  search_results->0->>'title' as sample_result_title
FROM vendor_cache
WHERE category ILIKE '%cart%'
   OR category = 'carts'
ORDER BY created_at DESC;

-- ============================================================================
-- EXPECTED OUTPUT:
-- You should see entries with:
-- - category: 'carts'
-- - Various cities and states
-- - Possibly incorrect subcategories or NULL subcategories
-- - Sample titles that may include "Golf Cart" or other non-wedding items
-- ============================================================================

-- ============================================================================
-- STEP 2: DELETE BAD CART CACHE (RUN AFTER REVIEWING STEP 1)
-- ============================================================================
-- This will permanently delete all cart-related cache entries.
-- After deletion, new searches will use the updated wedding-specific queries.

-- UNCOMMENT THE LINES BELOW TO EXECUTE THE DELETION:

-- DELETE FROM vendor_cache 
-- WHERE category ILIKE '%cart%'
--    OR category = 'carts';

-- ============================================================================
-- STEP 3: VERIFY DELETION
-- ============================================================================
-- Run this to confirm all cart cache has been cleared.

-- SELECT COUNT(*) as remaining_cart_cache_entries
-- FROM vendor_cache 
-- WHERE category ILIKE '%cart%'
--    OR category = 'carts';

-- Expected result: 0 rows

-- ============================================================================
-- OPTIONAL: CLEAR ALL CACHE (USE WITH CAUTION)
-- ============================================================================
-- If you want to regenerate ALL cached searches with the new wedding-specific
-- queries, uncomment the line below. This will force fresh API calls for
-- all vendor types on the next search.
--
-- WARNING: This will increase DataForSEO API usage temporarily as the cache
-- rebuilds with wedding-specific searches.

-- DELETE FROM vendor_cache;

-- ============================================================================
-- POST-DELETION ACTIONS
-- ============================================================================
-- After running this script:
--
-- 1. Deploy the updated Edge Functions:
--    - search-google-vendors (with wedding-specific queries)
--    - search-database-vendors (with wedding prefix stripping)
--    - search-instagram-vendors (with wedding prefix stripping)
--
-- 2. Test cart searches:
--    - Search for "carts" in any major city
--    - Search for "coffee cart" (with subcategory)
--    - Verify results show wedding-related mobile services
--    - Verify no golf carts or shopping carts appear
--
-- 3. Monitor cache regeneration:
--    - First searches will be slower (5-10 seconds) as cache rebuilds
--    - Subsequent searches will be fast (<2 seconds) using new cache
--    - New cache will include "wedding" in the DataForSEO queries
--
-- 4. Check DataForSEO costs:
--    - Monitor API usage in DataForSEO dashboard
--    - Expect temporary increase as cache rebuilds
--    - Cost should stabilize after popular searches are cached
--
-- ============================================================================
