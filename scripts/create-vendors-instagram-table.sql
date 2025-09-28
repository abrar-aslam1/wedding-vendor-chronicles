-- Create Instagram vendors table
CREATE TABLE IF NOT EXISTS vendors_instagram (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT,
    ig_username TEXT UNIQUE NOT NULL,
    ig_user_id TEXT,
    display_name TEXT,
    bio TEXT,
    website_url TEXT,
    email TEXT,
    phone TEXT,
    category TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    followers INTEGER,
    posts_count INTEGER,
    profile_pic_url TEXT,
    profile_url TEXT,
    external_urls TEXT[],
    tags TEXT[],
    has_contact BOOLEAN DEFAULT false,
    has_location BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_instagram_category ON vendors_instagram(category);
CREATE INDEX IF NOT EXISTS idx_vendors_instagram_location ON vendors_instagram(city, state);
CREATE INDEX IF NOT EXISTS idx_vendors_instagram_username ON vendors_instagram(ig_username);

-- Grant permissions
GRANT ALL ON vendors_instagram TO authenticated;
GRANT ALL ON vendors_instagram TO service_role;

-- Enable RLS
ALTER TABLE vendors_instagram ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access" ON vendors_instagram
    FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON vendors_instagram
    FOR ALL USING (auth.role() = 'service_role');
