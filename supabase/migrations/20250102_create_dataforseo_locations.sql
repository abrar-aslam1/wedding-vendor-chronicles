-- Create dataforseo_locations table for storing location data from DataForSEO API
CREATE TABLE IF NOT EXISTS public.dataforseo_locations (
    location_code INTEGER PRIMARY KEY,
    location_name TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK (location_type IN ('country', 'state', 'city')),
    parent_location_code INTEGER REFERENCES public.dataforseo_locations(location_code),
    state_code TEXT,
    state_name TEXT,
    country_code TEXT NOT NULL DEFAULT 'US',
    coordinates GEOGRAPHY(POINT),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    metadata JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient lookups
CREATE INDEX idx_dataforseo_locations_type ON public.dataforseo_locations(location_type);
CREATE INDEX idx_dataforseo_locations_state ON public.dataforseo_locations(state_code);
CREATE INDEX idx_dataforseo_locations_parent ON public.dataforseo_locations(parent_location_code);
CREATE INDEX idx_dataforseo_locations_name ON public.dataforseo_locations(location_name);

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_dataforseo_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated
CREATE TRIGGER update_dataforseo_locations_timestamp
    BEFORE UPDATE ON public.dataforseo_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_dataforseo_locations_updated_at();

-- Enable Row Level Security
ALTER TABLE public.dataforseo_locations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users" ON public.dataforseo_locations
    FOR SELECT USING (true);

-- Create policy for authenticated users to update
CREATE POLICY "Enable update for authenticated users only" ON public.dataforseo_locations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy for service role to insert/delete
CREATE POLICY "Enable full access for service role" ON public.dataforseo_locations
    FOR ALL USING (auth.role() = 'service_role');

-- Insert United States as the root location
INSERT INTO public.dataforseo_locations (
    location_code,
    location_name,
    location_type,
    country_code,
    metadata
) VALUES (
    2840,
    'United States',
    'country',
    'US',
    '{"iso_code": "US", "currency": "USD"}'
) ON CONFLICT (location_code) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.dataforseo_locations IS 'Stores location data from DataForSEO API for efficient local lookups';
COMMENT ON COLUMN public.dataforseo_locations.location_code IS 'DataForSEO location code identifier';
COMMENT ON COLUMN public.dataforseo_locations.location_type IS 'Type of location: country, state, or city';
COMMENT ON COLUMN public.dataforseo_locations.parent_location_code IS 'Reference to parent location (e.g., state for a city)';
COMMENT ON COLUMN public.dataforseo_locations.metadata IS 'Additional location metadata in JSON format';