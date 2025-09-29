-- Cultural Matching System & Enhanced Vendor Dashboard Schema
-- This creates tables for cultural expertise, bride preferences, and enhanced vendor features

-- ==========================================
-- VENDOR CULTURAL EXPERTISE
-- ==========================================

CREATE TABLE IF NOT EXISTS vendor_cultural_expertise (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Cultural Types (array allows multiple)
  cultural_types TEXT[] DEFAULT '{}',
  -- Options: south_asian_indian, south_asian_pakistani, south_asian_bangladeshi,
  --          muslim, jewish_orthodox, jewish_reform, jewish_conservative,
  --          chinese, korean, japanese, vietnamese, latino, african, caribbean
  
  -- Religious Traditions
  religious_traditions TEXT[] DEFAULT '{}',
  -- Options: hindu, muslim, sikh, jewish, christian, buddhist, jain
  
  -- Ceremony Types with Experience Count
  ceremony_experience JSONB DEFAULT '{}',
  -- Format: {"mehndi": 25, "sangeet": 30, "nikah": 15, "baraat": 20, "haldi": 18}
  
  -- Language Proficiency
  languages TEXT[] DEFAULT '{}',
  -- Options: hindi, urdu, punjabi, gujarati, bengali, tamil, arabic, hebrew, 
  --          mandarin, cantonese, korean, spanish, french
  
  -- Dietary Expertise
  dietary_expertise TEXT[] DEFAULT '{}',
  -- Options: halal, kosher, jain, vegetarian, vegan, gluten_free
  
  -- Special Services
  modesty_services BOOLEAN DEFAULT false,
  gender_segregation_experience BOOLEAN DEFAULT false,
  traditional_dress_knowledge TEXT[] DEFAULT '{}',
  cultural_decor_expertise TEXT[] DEFAULT '{}',
  
  -- Certifications & Credentials
  certifications TEXT,
  years_cultural_experience INTEGER DEFAULT 0,
  total_cultural_events INTEGER DEFAULT 0,
  
  -- Portfolio
  cultural_portfolio_images JSONB DEFAULT '[]',
  -- Format: [{"url": "...", "ceremony_type": "mehndi", "cultural_type": "south_asian"}]
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT vendor_cultural_expertise_vendor_id_unique UNIQUE(vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_cultural_types ON vendor_cultural_expertise USING GIN (cultural_types);
CREATE INDEX IF NOT EXISTS idx_vendor_languages ON vendor_cultural_expertise USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_vendor_ceremony_experience ON vendor_cultural_expertise USING GIN (ceremony_experience);

-- ==========================================
-- BRIDE/COUPLE PREFERENCES
-- ==========================================

CREATE TABLE IF NOT EXISTS bride_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cultural Identity
  cultural_background TEXT[] DEFAULT '{}',
  religious_tradition TEXT[] DEFAULT '{}',
  ceremony_types TEXT[] DEFAULT '{}',
  -- Options: mehndi, sangeet, haldi, baraat, nikah, walima, baraat, 
  --          ketubah, chuppah, tea_ceremony, pyebaek
  
  -- Language Preferences
  preferred_languages TEXT[] DEFAULT '{}',
  requires_bilingual BOOLEAN DEFAULT false,
  
  -- Style & Aesthetic
  wedding_style TEXT[] DEFAULT '{}',
  -- Options: traditional, modern_fusion, contemporary, elegant, rustic, 
  --          bohemian, minimalist, luxury, cultural_traditional
  color_preferences TEXT[] DEFAULT '{}',
  aesthetic_preferences JSONB DEFAULT '{}',
  
  -- Dietary & Cultural Requirements
  dietary_restrictions TEXT[] DEFAULT '{}',
  cultural_requirements JSONB DEFAULT '{}',
  -- Format: {"needs_mandap": true, "needs_chuppah": true, "needs_halal_catering": true}
  modesty_preferences TEXT,
  -- Options: modest_photography, gender_separated, traditional_attire_only
  
  -- Budget & Logistics
  budget_range TEXT,
  -- Options: under_2k, 2k_5k, 5k_10k, 10k_20k, 20k_plus
  wedding_date DATE,
  guest_count INTEGER,
  location TEXT,
  venue_name TEXT,
  
  -- Match Preference Weights (1-5 scale)
  importance_cultural_knowledge INTEGER DEFAULT 5 CHECK (importance_cultural_knowledge BETWEEN 1 AND 5),
  importance_language INTEGER DEFAULT 4 CHECK (importance_language BETWEEN 1 AND 5),
  importance_style_match INTEGER DEFAULT 4 CHECK (importance_style_match BETWEEN 1 AND 5),
  importance_price INTEGER DEFAULT 5 CHECK (importance_price BETWEEN 1 AND 5),
  must_have_cultural_experience BOOLEAN DEFAULT true,
  
  -- Quiz Completion
  quiz_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT bride_preferences_user_id_unique UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_bride_cultural_background ON bride_preferences USING GIN (cultural_background);
CREATE INDEX IF NOT EXISTS idx_bride_ceremony_types ON bride_preferences USING GIN (ceremony_types);
CREATE INDEX IF NOT EXISTS idx_bride_wedding_date ON bride_preferences (wedding_date);
CREATE INDEX IF NOT EXISTS idx_bride_location ON bride_preferences (location);

-- ==========================================
-- VENDOR PRICING PACKAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS vendor_pricing_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Package Info
  package_name TEXT NOT NULL,
  package_type TEXT,
  -- Options: basic, standard, premium, deluxe, cultural_ceremony, full_service
  
  -- Pricing
  price_min INTEGER, -- in cents
  price_max INTEGER, -- in cents
  is_starting_price BOOLEAN DEFAULT false,
  
  -- Cultural Specialization
  cultural_type TEXT,
  -- Options: south_asian, muslim, jewish, chinese, general
  ceremony_types TEXT[] DEFAULT '{}',
  -- Which ceremonies this package covers
  
  -- Package Details
  description TEXT,
  inclusions JSONB DEFAULT '[]',
  -- Format: ["item 1", "item 2", "item 3"]
  exclusions JSONB DEFAULT '[]',
  
  -- Service Details
  ceremony_duration TEXT,
  guest_capacity_min INTEGER,
  guest_capacity_max INTEGER,
  
  -- Availability
  available_months TEXT[] DEFAULT '{}',
  -- Options: january, february, march, etc.
  is_active BOOLEAN DEFAULT true,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_pricing_vendor_id ON vendor_pricing_packages (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pricing_cultural_type ON vendor_pricing_packages (cultural_type);
CREATE INDEX IF NOT EXISTS idx_vendor_pricing_ceremony_types ON vendor_pricing_packages USING GIN (ceremony_types);

-- ==========================================
-- VENDOR AVAILABILITY CALENDAR
-- ==========================================

CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Date Info
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  -- Options: available, booked, blocked, tentative
  
  -- Booking Info (if booked)
  event_type TEXT,
  ceremony_types TEXT[] DEFAULT '{}',
  client_name TEXT, -- encrypted or hashed for privacy
  booking_reference TEXT,
  
  -- Multi-day Events
  is_multi_day_event BOOLEAN DEFAULT false,
  multi_day_event_id UUID,
  day_number INTEGER,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT, -- not visible to public
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT vendor_availability_vendor_date_unique UNIQUE(vendor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_date ON vendor_availability (vendor_id, date);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_status ON vendor_availability (status);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date_range ON vendor_availability (date);

-- ==========================================
-- VENDOR MATCH SCORES (Cached)
-- ==========================================

CREATE TABLE IF NOT EXISTS vendor_match_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_preference_id UUID REFERENCES bride_preferences(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Overall Score
  total_score INTEGER DEFAULT 0, -- 0-100
  
  -- Score Breakdown
  cultural_expertise_score INTEGER DEFAULT 0, -- max 30
  language_match_score INTEGER DEFAULT 0, -- max 15
  ceremony_experience_score INTEGER DEFAULT 0, -- max 25
  style_alignment_score INTEGER DEFAULT 0, -- max 15
  price_match_score INTEGER DEFAULT 0, -- max 10
  availability_score INTEGER DEFAULT 0, -- max 5
  
  -- Match Reasons
  match_reasons JSONB DEFAULT '[]',
  cultural_highlights JSONB DEFAULT '[]',
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,
  
  CONSTRAINT vendor_match_unique UNIQUE(bride_preference_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_bride ON vendor_match_scores (bride_preference_id, total_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_scores_vendor ON vendor_match_scores (vendor_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_cultural_expertise_updated_at BEFORE UPDATE ON vendor_cultural_expertise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bride_preferences_updated_at BEFORE UPDATE ON bride_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_pricing_packages_updated_at BEFORE UPDATE ON vendor_pricing_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_availability_updated_at BEFORE UPDATE ON vendor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE vendor_cultural_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE bride_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_match_scores ENABLE ROW LEVEL SECURITY;

-- Vendor Cultural Expertise Policies
CREATE POLICY "Vendors can view their own cultural expertise"
  ON vendor_cultural_expertise FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id));

CREATE POLICY "Vendors can update their own cultural expertise"
  ON vendor_cultural_expertise FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id));

CREATE POLICY "Vendors can insert their own cultural expertise"
  ON vendor_cultural_expertise FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id));

CREATE POLICY "Public can view cultural expertise"
  ON vendor_cultural_expertise FOR SELECT
  USING (true);

-- Bride Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON bride_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON bride_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON bride_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vendor Pricing Policies
CREATE POLICY "Vendors can manage their pricing"
  ON vendor_pricing_packages FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id));

CREATE POLICY "Public can view active pricing"
  ON vendor_pricing_packages FOR SELECT
  USING (is_active = true);

-- Vendor Availability Policies
CREATE POLICY "Vendors can manage their availability"
  ON vendor_availability FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id));

CREATE POLICY "Public can view available dates"
  ON vendor_availability FOR SELECT
  USING (status = 'available' OR status = 'booked');

-- Match Scores Policies
CREATE POLICY "Users can view their match scores"
  ON vendor_match_scores FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM bride_preferences WHERE id = bride_preference_id));

CREATE POLICY "System can insert match scores"
  ON vendor_match_scores FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE vendor_cultural_expertise IS 'Stores vendor expertise in cultural and religious wedding ceremonies';
COMMENT ON TABLE bride_preferences IS 'Stores couple preferences for cultural wedding vendor matching';
COMMENT ON TABLE vendor_pricing_packages IS 'Stores vendor pricing packages including cultural ceremony packages';
COMMENT ON TABLE vendor_availability IS 'Stores vendor availability calendar for booking management';
COMMENT ON TABLE vendor_match_scores IS 'Cached vendor match scores for bride preferences';
