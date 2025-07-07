-- Add indexes to improve vendor search performance
-- This migration safely adds indexes only for existing tables

-- Enable the pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add conditional indexes for instagram_vendors table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'instagram_vendors') THEN
    CREATE INDEX IF NOT EXISTS idx_instagram_vendors_category ON instagram_vendors(category);
    CREATE INDEX IF NOT EXISTS idx_instagram_vendors_city ON instagram_vendors(city);
    CREATE INDEX IF NOT EXISTS idx_instagram_vendors_state ON instagram_vendors(state);
    CREATE INDEX IF NOT EXISTS idx_instagram_vendors_category_city_state ON instagram_vendors(category, city, state);
    RAISE NOTICE 'Created indexes for instagram_vendors table';
  ELSE
    RAISE NOTICE 'Table instagram_vendors does not exist, skipping indexes';
  END IF;
END $$;

-- Add conditional indexes for vendors_google table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendors_google') THEN
    -- Check if indexes don't already exist before creating
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_vendors_google_state') THEN
      CREATE INDEX idx_vendors_google_state ON vendors_google(state);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_vendors_google_category_city_state_new') THEN
      CREATE INDEX idx_vendors_google_category_city_state_new ON vendors_google(category, city, state);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_vendors_google_business_name_gin') THEN
      CREATE INDEX idx_vendors_google_business_name_gin ON vendors_google USING gin(business_name gin_trgm_ops);
    END IF;
    
    RAISE NOTICE 'Created additional indexes for vendors_google table';
  ELSE
    RAISE NOTICE 'Table vendors_google does not exist, skipping indexes';
  END IF;
END $$;

-- Add conditional indexes for vendors table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendors') THEN
    CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
    CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
    CREATE INDEX IF NOT EXISTS idx_vendors_state ON vendors(state);
    CREATE INDEX IF NOT EXISTS idx_vendors_category_city_state ON vendors(category, city, state);
    CREATE INDEX IF NOT EXISTS idx_vendors_business_name_gin ON vendors USING gin(business_name gin_trgm_ops);
    RAISE NOTICE 'Created indexes for vendors table';
  ELSE
    RAISE NOTICE 'Table vendors does not exist, skipping indexes';
  END IF;
END $$;

-- Add conditional indexes for cache tables (if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendor_cache') THEN
    CREATE INDEX IF NOT EXISTS idx_vendor_cache_search_key ON vendor_cache(search_key);
    CREATE INDEX IF NOT EXISTS idx_vendor_cache_expires_at ON vendor_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_vendor_cache_keyword_location ON vendor_cache(keyword, city, state);
    RAISE NOTICE 'Created indexes for vendor_cache table';
  ELSE
    RAISE NOTICE 'Table vendor_cache does not exist, skipping indexes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dataforseo_search_cache') THEN
    CREATE INDEX IF NOT EXISTS idx_dataforseo_search_cache_search_key ON dataforseo_search_cache(search_key);
    CREATE INDEX IF NOT EXISTS idx_dataforseo_search_cache_expires_at ON dataforseo_search_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_dataforseo_search_cache_keyword_location ON dataforseo_search_cache(keyword, location_code);
    RAISE NOTICE 'Created indexes for dataforseo_search_cache table';
  ELSE
    RAISE NOTICE 'Table dataforseo_search_cache does not exist, skipping indexes';
  END IF;
END $$;