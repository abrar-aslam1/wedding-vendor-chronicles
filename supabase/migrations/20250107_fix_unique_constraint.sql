-- Fix unique constraint to allow subcategories
-- This migration removes the old constraint that blocks subcategories
-- and ensures the new subcategory-aware constraint is in place

-- Drop the old constraint that doesn't include subcategory
DROP INDEX IF EXISTS unique_vendor_cache_entry;

-- Ensure the new constraint exists (this should already be there from previous migration)
-- This allows multiple entries for same category/city/state with different subcategories
CREATE UNIQUE INDEX IF NOT EXISTS vendor_cache_unique_subcategory_idx 
ON vendor_cache (category, city, state, COALESCE(subcategory, ''));

-- Verify the constraint was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vendor_cache' 
        AND indexname = 'vendor_cache_unique_subcategory_idx'
    ) THEN
        RAISE NOTICE 'SUCCESS: New subcategory-aware constraint is active';
    ELSE
        RAISE EXCEPTION 'FAILED: New constraint was not created';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vendor_cache' 
        AND indexname = 'unique_vendor_cache_entry'
    ) THEN
        RAISE EXCEPTION 'FAILED: Old constraint still exists and will block subcategories';
    ELSE
        RAISE NOTICE 'SUCCESS: Old blocking constraint has been removed';
    END IF;
END $$;
