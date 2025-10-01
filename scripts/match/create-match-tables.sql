-- Match Me Feature - Database Schema
-- All tables prefixed with match_ to avoid conflicts with existing schema
-- Created: 2025-01-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: match_requests
-- Stores quiz submissions from couples
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT NOT NULL,
  
  -- Core filters (Step 1: Essentials)
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_radius_miles INT DEFAULT 25 CHECK (location_radius_miles >= 0 AND location_radius_miles <= 200),
  date DATE,
  date_flexible BOOLEAN DEFAULT false,
  date_season TEXT CHECK (date_season IN ('spring', 'summer', 'fall', 'winter', NULL)),
  guest_count_band TEXT NOT NULL CHECK (guest_count_band IN ('0-50', '50-100', '100-150', '150-200', '200+')),
  categories TEXT[] NOT NULL,
  budget_mode TEXT NOT NULL CHECK (budget_mode IN ('overall', 'per_category')),
  budget_overall NUMERIC(10, 2),
  budget_by_category JSONB,
  style_vibe TEXT[],
  
  -- Optional toggles (Step 2: Optional)
  cultural_needs TEXT[],
  language_mc TEXT[],
  accessibility TEXT[],
  venue_type TEXT CHECK (venue_type IN ('indoor', 'outdoor', 'both_with_backup', NULL)),
  alcohol_policy TEXT CHECK (alcohol_policy IN ('byo', 'bar_packages', 'dry', NULL)),
  travel_willingness TEXT CHECK (travel_willingness IN ('local_only', 'statewide', 'destination', NULL)),
  
  -- Category-specific filters (Step 3: Conditional)
  category_filters JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  quiz_completion_time_seconds INT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_budget CHECK (
    (budget_mode = 'overall' AND budget_overall IS NOT NULL) OR
    (budget_mode = 'per_category' AND budget_by_category IS NOT NULL) OR
    (budget_mode = 'overall' AND budget_overall IS NULL AND budget_by_category IS NULL)
  )
);

-- Indexes for match_requests
CREATE INDEX IF NOT EXISTS idx_match_requests_categories ON match_requests USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_match_requests_location ON match_requests(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_match_requests_date ON match_requests(date) WHERE date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_match_requests_session ON match_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_created ON match_requests(created_at DESC);

-- Table 2: match_vendor_projection
-- Read-only projection of vendor data optimized for matching
CREATE TABLE IF NOT EXISTS match_vendor_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id TEXT UNIQUE NOT NULL,
  
  -- Core matching data
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  business_name TEXT NOT NULL,
  
  -- Pricing
  price_tier TEXT CHECK (price_tier IN ('budget', 'moderate', 'premium', 'luxury', 'undisclosed')),
  starting_price NUMERIC(10, 2),
  price_range_min NUMERIC(10, 2),
  price_range_max NUMERIC(10, 2),
  
  -- Availability & capacity
  typical_capacity_min INT,
  typical_capacity_max INT,
  books_months_advance INT DEFAULT 12,
  
  -- Style & features
  style_keywords TEXT[],
  features JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  
  -- Social proof
  review_avg NUMERIC(3, 2) CHECK (review_avg >= 0 AND review_avg <= 5),
  review_count INT DEFAULT 0 CHECK (review_count >= 0),
  verification_badges TEXT[] DEFAULT '{}',
  response_time_hours INT,
  
  -- Cultural/accessibility
  cultural_specialties TEXT[] DEFAULT '{}',
  accessibility_features TEXT[] DEFAULT '{}',
  languages_supported TEXT[] DEFAULT '{}',
  
  -- Contact info (for results display)
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  last_synced TIMESTAMPTZ DEFAULT now(),
  sync_source TEXT DEFAULT 'vendors_table',
  sync_version INT DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key reference (optional, for data integrity)
  CONSTRAINT fk_match_projection_vendor FOREIGN KEY (vendor_id) 
    REFERENCES vendors(id) ON DELETE CASCADE
);

-- Indexes for match_vendor_projection
CREATE INDEX IF NOT EXISTS idx_match_projection_category ON match_vendor_projection(category) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_match_projection_location ON match_vendor_projection(state, city) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_match_projection_price ON match_vendor_projection(price_tier, starting_price) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_match_projection_styles ON match_vendor_projection USING GIN(style_keywords);
CREATE INDEX IF NOT EXISTS idx_match_projection_active ON match_vendor_projection(active);
CREATE INDEX IF NOT EXISTS idx_match_projection_badges ON match_vendor_projection USING GIN(verification_badges);
CREATE INDEX IF NOT EXISTS idx_match_projection_cultural ON match_vendor_projection USING GIN(cultural_specialties);

-- Table 3: match_results
-- Stores scored vendor matches for each request
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  vendor_id TEXT NOT NULL,
  
  -- Match quality
  category TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  rank_in_category INT NOT NULL CHECK (rank_in_category > 0),
  
  -- Explanation
  rationale JSONB NOT NULL DEFAULT '[]'::jsonb,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Quick access fields (denormalized for performance)
  vendor_name TEXT NOT NULL,
  starting_price TEXT,
  badges TEXT[] DEFAULT '{}',
  review_avg NUMERIC(3, 2),
  review_count INT DEFAULT 0,
  response_time_sla TEXT,
  availability_signal TEXT CHECK (availability_signal IN ('likely_available', 'check_availability', 'limited_availability')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT fk_match_results_request FOREIGN KEY (request_id) 
    REFERENCES match_requests(id) ON DELETE CASCADE,
  CONSTRAINT unique_match_result UNIQUE (request_id, vendor_id, category)
);

-- Indexes for match_results
CREATE INDEX IF NOT EXISTS idx_match_results_request ON match_results(request_id, category, rank_in_category);
CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results(request_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_results_category ON match_results(category);
CREATE INDEX IF NOT EXISTS idx_match_results_vendor ON match_results(vendor_id);

-- Table 4: match_rate_limits
-- Enforces per-request inquiry throttling (max 5 vendors)
CREATE TABLE IF NOT EXISTS match_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL,
  inquiries_sent INT DEFAULT 0 CHECK (inquiries_sent >= 0),
  max_inquiries INT DEFAULT 5 CHECK (max_inquiries > 0),
  vendors_contacted TEXT[] DEFAULT '{}',
  last_inquiry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT fk_match_rate_limits_request FOREIGN KEY (request_id) 
    REFERENCES match_requests(id) ON DELETE CASCADE,
  CONSTRAINT check_inquiry_limit CHECK (inquiries_sent <= max_inquiries)
);

-- Index for match_rate_limits
CREATE INDEX IF NOT EXISTS idx_match_rate_limits_request ON match_rate_limits(request_id);

-- Table 5: match_analytics_events
-- Track matching-specific events for KPI monitoring
CREATE TABLE IF NOT EXISTS match_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  request_id UUID,
  vendor_id TEXT,
  session_id TEXT,
  user_id TEXT,
  
  -- Event data
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key (optional)
  CONSTRAINT fk_match_analytics_request FOREIGN KEY (request_id) 
    REFERENCES match_requests(id) ON DELETE SET NULL
);

-- Indexes for match_analytics_events
CREATE INDEX IF NOT EXISTS idx_match_analytics_event_type ON match_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_analytics_request ON match_analytics_events(request_id);
CREATE INDEX IF NOT EXISTS idx_match_analytics_vendor ON match_analytics_events(vendor_id);
CREATE INDEX IF NOT EXISTS idx_match_analytics_created ON match_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_analytics_session ON match_analytics_events(session_id);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_match_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_match_requests_updated_at ON match_requests;
CREATE TRIGGER update_match_requests_updated_at 
  BEFORE UPDATE ON match_requests 
  FOR EACH ROW EXECUTE FUNCTION update_match_updated_at_column();

DROP TRIGGER IF EXISTS update_match_vendor_projection_updated_at ON match_vendor_projection;
CREATE TRIGGER update_match_vendor_projection_updated_at 
  BEFORE UPDATE ON match_vendor_projection 
  FOR EACH ROW EXECUTE FUNCTION update_match_updated_at_column();

DROP TRIGGER IF EXISTS update_match_rate_limits_updated_at ON match_rate_limits;
CREATE TRIGGER update_match_rate_limits_updated_at 
  BEFORE UPDATE ON match_rate_limits 
  FOR EACH ROW EXECUTE FUNCTION update_match_updated_at_column();

-- Grant permissions (adjust as needed for your Supabase setup)
GRANT SELECT, INSERT, UPDATE ON match_requests TO anon, authenticated;
GRANT SELECT ON match_vendor_projection TO anon, authenticated;
GRANT SELECT ON match_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON match_rate_limits TO anon, authenticated;
GRANT SELECT, INSERT ON match_analytics_events TO anon, authenticated;

-- Row Level Security (RLS) policies
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_vendor_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all reads for match_vendor_projection (public directory data)
CREATE POLICY "Allow all users to read active vendor projections" ON match_vendor_projection
  FOR SELECT USING (active = true);

-- RLS Policies: Users can create their own requests
CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (true);

-- RLS Policies: Users can read their own requests or session-based requests
CREATE POLICY "Users can read their own match requests" ON match_requests
  FOR SELECT USING (
    user_id = auth.uid()::text OR 
    session_id IN (SELECT session_id FROM match_requests WHERE user_id = auth.uid()::text) OR
    auth.role() = 'anon'
  );

-- RLS Policies: Users can read results for their requests
CREATE POLICY "Users can read their match results" ON match_results
  FOR SELECT USING (
    request_id IN (SELECT id FROM match_requests WHERE user_id = auth.uid()::text OR auth.role() = 'anon')
  );

-- RLS Policies: Users can manage rate limits for their requests
CREATE POLICY "Users can read their rate limits" ON match_rate_limits
  FOR SELECT USING (
    request_id IN (SELECT id FROM match_requests WHERE user_id = auth.uid()::text OR auth.role() = 'anon')
  );

CREATE POLICY "Users can update their rate limits" ON match_rate_limits
  FOR UPDATE USING (
    request_id IN (SELECT id FROM match_requests WHERE user_id = auth.uid()::text OR auth.role() = 'anon')
  );

-- RLS Policies: Allow analytics event creation
CREATE POLICY "Allow analytics event creation" ON match_analytics_events
  FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE match_requests IS 'Stores quiz submissions from couples looking for vendor matches';
COMMENT ON TABLE match_vendor_projection IS 'Read-only projection of vendor data optimized for matching algorithm';
COMMENT ON TABLE match_results IS 'Scored vendor matches for each request, grouped by category';
COMMENT ON TABLE match_rate_limits IS 'Enforces per-request inquiry throttling (max 5 vendors per request)';
COMMENT ON TABLE match_analytics_events IS 'Tracking events for KPI monitoring (quiz completion, match views, etc.)';

COMMENT ON COLUMN match_requests.budget_mode IS 'How the couple wants to specify budget: overall wedding budget or per-category breakdown';
COMMENT ON COLUMN match_requests.category_filters IS 'Category-specific filters like venue capacity, photographer style, etc.';
COMMENT ON COLUMN match_vendor_projection.price_tier IS 'Derived price tier for quick filtering: budget, moderate, premium, luxury';
COMMENT ON COLUMN match_vendor_projection.style_keywords IS 'Extracted keywords from vendor description for style matching';
COMMENT ON COLUMN match_results.rationale IS 'Array of match reasons shown to the user (top 3)';
COMMENT ON COLUMN match_results.score_breakdown IS 'Detailed scoring breakdown for debugging and transparency';
COMMENT ON COLUMN match_rate_limits.max_inquiries IS 'Maximum allowed inquiries per request (default 5)';
