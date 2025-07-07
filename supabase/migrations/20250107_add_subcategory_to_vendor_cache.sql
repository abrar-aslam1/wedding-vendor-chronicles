-- Add subcategory column to vendor_cache table to support subcategory-specific caching
-- This allows us to cache different results for "engagement specialists photographer" vs "traditional photographer"

ALTER TABLE vendor_cache 
ADD COLUMN subcategory TEXT;

-- Create a unique index to prevent duplicate cache entries for the same category+city+state+subcategory combination
-- Drop the old index first if it exists
DROP INDEX IF EXISTS vendor_cache_unique_idx;

-- Create new unique index that includes subcategory
CREATE UNIQUE INDEX vendor_cache_unique_subcategory_idx 
ON vendor_cache (category, city, state, COALESCE(subcategory, ''));

-- Add a comment to document the purpose
COMMENT ON COLUMN vendor_cache.subcategory IS 'Subcategory for more specific vendor searches (e.g., "engagement specialists", "traditional", "modern")';
