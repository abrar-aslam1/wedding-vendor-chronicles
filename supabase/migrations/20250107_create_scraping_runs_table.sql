-- Create table for tracking Instagram scraping runs
CREATE TABLE IF NOT EXISTS scraping_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id TEXT UNIQUE,
    category TEXT,
    location TEXT,
    status TEXT,
    profiles_discovered INTEGER DEFAULT 0,
    profiles_validated INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_scraping_runs_status ON scraping_runs(status);
CREATE INDEX idx_scraping_runs_category ON scraping_runs(category);
CREATE INDEX idx_scraping_runs_started_at ON scraping_runs(started_at);

-- Add RLS policies
ALTER TABLE scraping_runs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage scraping runs" ON scraping_runs
    FOR ALL USING (auth.role() = 'service_role');

-- Add function to get vendor stats by category (used by the Python script)
CREATE OR REPLACE FUNCTION get_vendor_stats_by_category()
RETURNS TABLE(category TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
    SELECT category, COUNT(*) as count
    FROM instagram_vendors
    GROUP BY category
    ORDER BY count DESC;
$$;