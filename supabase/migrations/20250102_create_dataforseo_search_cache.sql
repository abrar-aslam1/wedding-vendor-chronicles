-- Create enhanced search cache table for DataForSEO results with location optimization
CREATE TABLE IF NOT EXISTS public.dataforseo_search_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_key TEXT UNIQUE NOT NULL,
    keyword TEXT NOT NULL,
    location_code INTEGER NOT NULL REFERENCES public.dataforseo_locations(location_code),
    location_name TEXT NOT NULL,
    subcategory TEXT,
    search_type TEXT NOT NULL DEFAULT 'google_maps' CHECK (search_type IN ('google_maps', 'google_search', 'bing', 'yelp')),
    results JSONB NOT NULL DEFAULT '[]',
    result_count INTEGER NOT NULL DEFAULT 0,
    api_cost NUMERIC(10, 6) DEFAULT 0,
    api_response_time INTEGER, -- milliseconds
    error_message TEXT,
    is_successful BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient lookups
CREATE INDEX idx_search_cache_keyword ON public.dataforseo_search_cache(keyword);
CREATE INDEX idx_search_cache_location ON public.dataforseo_search_cache(location_code);
CREATE INDEX idx_search_cache_expires ON public.dataforseo_search_cache(expires_at);
CREATE INDEX idx_search_cache_created ON public.dataforseo_search_cache(created_at DESC);
CREATE INDEX idx_search_cache_composite ON public.dataforseo_search_cache(keyword, location_code, subcategory);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_dataforseo_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.dataforseo_search_cache
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get cache statistics
CREATE OR REPLACE FUNCTION get_dataforseo_cache_stats()
RETURNS TABLE (
    total_entries BIGINT,
    expired_entries BIGINT,
    total_api_cost NUMERIC,
    avg_result_count NUMERIC,
    cache_hit_potential NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_entries,
        COUNT(*) FILTER (WHERE expires_at < CURRENT_TIMESTAMP)::BIGINT as expired_entries,
        COALESCE(SUM(api_cost), 0)::NUMERIC as total_api_cost,
        COALESCE(AVG(result_count), 0)::NUMERIC as avg_result_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE expires_at > CURRENT_TIMESTAMP)::NUMERIC / COUNT(*)::NUMERIC * 100)
            ELSE 0 
        END as cache_hit_potential
    FROM public.dataforseo_search_cache;
END;
$$ LANGUAGE plpgsql;

-- Create function to update cache timestamp
CREATE OR REPLACE FUNCTION update_dataforseo_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dataforseo_cache_timestamp
    BEFORE UPDATE ON public.dataforseo_search_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_dataforseo_cache_updated_at();

-- Enable Row Level Security
ALTER TABLE public.dataforseo_search_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.dataforseo_search_cache
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.dataforseo_search_cache
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users" ON public.dataforseo_search_cache
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only" ON public.dataforseo_search_cache
    FOR DELETE USING (auth.role() = 'service_role');

-- Create view for active cache entries
CREATE OR REPLACE VIEW public.active_dataforseo_cache AS
SELECT 
    id,
    search_key,
    keyword,
    location_code,
    location_name,
    subcategory,
    search_type,
    result_count,
    api_cost,
    created_at,
    expires_at,
    (expires_at - CURRENT_TIMESTAMP) as time_until_expiry
FROM public.dataforseo_search_cache
WHERE expires_at > CURRENT_TIMESTAMP
    AND is_successful = true
ORDER BY created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON public.active_dataforseo_cache TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.dataforseo_search_cache IS 'Enhanced cache table for DataForSEO API results with location optimization';
COMMENT ON COLUMN public.dataforseo_search_cache.search_key IS 'Unique key combining keyword, location_code, and optional subcategory';
COMMENT ON COLUMN public.dataforseo_search_cache.location_code IS 'DataForSEO location code reference';
COMMENT ON COLUMN public.dataforseo_search_cache.api_cost IS 'Cost of the API call in USD';
COMMENT ON COLUMN public.dataforseo_search_cache.api_response_time IS 'API response time in milliseconds';
COMMENT ON VIEW public.active_dataforseo_cache IS 'View of non-expired, successful cache entries with time until expiry';