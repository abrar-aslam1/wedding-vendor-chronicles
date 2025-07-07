-- Fix the unique constraint to allow subcategories
-- Drop the old constraint that doesn't include subcategory
DROP INDEX IF EXISTS unique_vendor_cache_entry;

-- The new constraint should already exist from the migration, but let's ensure it's there
-- This allows multiple entries for the same category/city/state with different subcategories
CREATE UNIQUE INDEX IF NOT EXISTS vendor_cache_unique_subcategory_idx 
ON vendor_cache (category, city, state, COALESCE(subcategory, ''));

-- Check what constraints exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'vendor_cache' 
AND indexname LIKE '%unique%';
