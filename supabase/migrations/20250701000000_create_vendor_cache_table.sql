-- Create vendor_cache table for caching DataForSEO API results
CREATE TABLE IF NOT EXISTS public.vendor_cache (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  search_key text NOT NULL UNIQUE, -- Combination of keyword + location + subcategory
  keyword text NOT NULL,
  location text NOT NULL,
  subcategory text,
  results jsonb NOT NULL, -- Cached search results
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL, -- Cache expiration (30 days from creation)
  result_count integer DEFAULT 0,
  api_cost numeric(10,6) DEFAULT 0 -- Track API costs
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendor_cache_search_key ON public.vendor_cache(search_key);
CREATE INDEX IF NOT EXISTS idx_vendor_cache_expires_at ON public.vendor_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_vendor_cache_keyword_location ON public.vendor_cache(keyword, location);

-- Function to generate search key
CREATE OR REPLACE FUNCTION generate_search_key(keyword text, location text, subcategory text DEFAULT NULL)
RETURNS text AS $$
BEGIN
  IF subcategory IS NULL OR subcategory = '' THEN
    RETURN lower(trim(keyword)) || '|' || lower(trim(location));
  ELSE
    RETURN lower(trim(keyword)) || '|' || lower(trim(location)) || '|' || lower(trim(subcategory));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.vendor_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set search_key and expires_at
CREATE OR REPLACE FUNCTION set_cache_metadata()
RETURNS trigger AS $$
BEGIN
  -- Set search_key
  NEW.search_key := generate_search_key(NEW.keyword, NEW.location, NEW.subcategory);
  
  -- Set expires_at to 30 days from now if not already set
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + INTERVAL '30 days';
  END IF;
  
  -- Set result_count from jsonb array length
  IF NEW.results IS NOT NULL THEN
    NEW.result_count := jsonb_array_length(NEW.results);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_cache_metadata
  BEFORE INSERT OR UPDATE ON public.vendor_cache
  FOR EACH ROW
  EXECUTE FUNCTION set_cache_metadata();

-- Enable RLS (policies will be set in the existing migration file)
ALTER TABLE public.vendor_cache ENABLE ROW LEVEL SECURITY;
