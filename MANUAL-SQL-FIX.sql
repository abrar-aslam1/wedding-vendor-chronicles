-- COPY AND PASTE THIS INTO YOUR SUPABASE SQL EDITOR
-- This will fix the unique constraint that's blocking subcategories

-- Step 1: Drop ALL old constraints that block subcategories
ALTER TABLE vendor_cache DROP CONSTRAINT IF EXISTS unique_vendor_cache_entry;
ALTER TABLE vendor_cache DROP CONSTRAINT IF EXISTS vendor_cache_unique_search;

-- Step 2: Ensure the new subcategory-aware constraint exists
CREATE UNIQUE INDEX IF NOT EXISTS vendor_cache_unique_subcategory_idx 
ON vendor_cache (category, city, state, COALESCE(subcategory, ''));

-- Step 3: Verify the fix worked
DO $$
BEGIN
    -- Check if old constraint is gone
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vendor_cache' 
        AND indexname = 'unique_vendor_cache_entry'
    ) THEN
        RAISE EXCEPTION 'FAILED: Old constraint still exists!';
    ELSE
        RAISE NOTICE 'SUCCESS: Old blocking constraint removed';
    END IF;
    
    -- Check if new constraint exists
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vendor_cache' 
        AND indexname = 'vendor_cache_unique_subcategory_idx'
    ) THEN
        RAISE NOTICE 'SUCCESS: New subcategory-aware constraint is active';
    ELSE
        RAISE EXCEPTION 'FAILED: New constraint was not created!';
    END IF;
END $$;

-- Step 4: Test the fix by inserting test data
INSERT INTO vendor_cache (category, city, state, subcategory, location_code, search_results, expires_at)
VALUES 
    ('test_category', 'TestCity', 'TX', 'elegant', 2840, '[{"title": "Test Elegant"}]', NOW() + INTERVAL '1 day'),
    ('test_category', 'TestCity', 'TX', 'rustic', 2840, '[{"title": "Test Rustic"}]', NOW() + INTERVAL '1 day');

-- Step 5: Verify both entries were inserted
SELECT category, city, state, subcategory, 
       jsonb_array_length(search_results) as result_count
FROM vendor_cache 
WHERE category = 'test_category' 
AND city = 'TestCity' 
AND state = 'TX';

-- Step 6: Clean up test data
DELETE FROM vendor_cache 
WHERE category = 'test_category' 
AND city = 'TestCity' 
AND state = 'TX';

-- If you see both 'elegant' and 'rustic' entries above, the fix worked!
