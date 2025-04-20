-- Create tables for various vendor subcategory types

-- Wedding Planner Types
CREATE TABLE IF NOT EXISTS public.planner_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add planner types
INSERT INTO planner_types (name, description, category)
VALUES 
  ('Full-Service Planning', 'Comprehensive planning services from engagement to wedding day', 'wedding-planners'),
  ('Day-of Coordination', 'Professional coordination services for just the wedding day', 'wedding-planners'),
  ('Partial Planning', 'Planning assistance for specific aspects of your wedding', 'wedding-planners'),
  ('Destination Wedding Planning', 'Specialized planning for weddings away from your home location', 'wedding-planners'),
  ('Cultural Wedding Specialists', 'Planners with expertise in specific cultural wedding traditions', 'wedding-planners')
ON CONFLICT (id) DO NOTHING;

-- Photographer Types
CREATE TABLE IF NOT EXISTS public.photographer_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add photographer types
INSERT INTO photographer_types (name, description, category)
VALUES 
  ('Traditional Photography', 'Classic posed wedding photography with formal portraits', 'photographers'),
  ('Photojournalistic', 'Candid, storytelling approach to wedding photography', 'photographers'),
  ('Fine Art', 'Artistic, editorial-style wedding photography', 'photographers'),
  ('Aerial Photography', 'Drone and elevated photography for unique perspectives', 'photographers'),
  ('Engagement Specialists', 'Photographers specializing in engagement and pre-wedding sessions', 'photographers')
ON CONFLICT (id) DO NOTHING;

-- Florist Types
CREATE TABLE IF NOT EXISTS public.florist_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add florist types
INSERT INTO florist_types (name, description, category)
VALUES 
  ('Modern Arrangements', 'Contemporary floral designs with clean lines and unique elements', 'florists'),
  ('Classic/Traditional', 'Timeless floral arrangements with traditional wedding flowers', 'florists'),
  ('Rustic/Bohemian', 'Natural, wildflower-inspired arrangements with organic elements', 'florists'),
  ('Minimalist', 'Simple, elegant floral designs with a focus on negative space', 'florists'),
  ('Luxury/Extravagant', 'Opulent floral installations and high-end arrangements', 'florists')
ON CONFLICT (id) DO NOTHING;

-- Venue Types
CREATE TABLE IF NOT EXISTS public.venue_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add venue types
INSERT INTO venue_types (name, description, category)
VALUES 
  ('Ballrooms', 'Elegant indoor spaces for traditional wedding receptions', 'venues'),
  ('Barns & Farms', 'Rustic venues with country charm and open spaces', 'venues'),
  ('Beach/Waterfront', 'Scenic venues along beaches, lakes, or rivers', 'venues'),
  ('Gardens & Parks', 'Natural outdoor settings with beautiful landscaping', 'venues'),
  ('Historic Buildings', 'Venues with historical significance and architectural character', 'venues'),
  ('Hotels & Resorts', 'All-inclusive venues with accommodation and amenities', 'venues'),
  ('Wineries & Vineyards', 'Romantic settings among grapevines with wine-focused experiences', 'venues'),
  ('Industrial Spaces', 'Modern, urban venues with raw architectural elements', 'venues')
ON CONFLICT (id) DO NOTHING;

-- Entertainment Types
CREATE TABLE IF NOT EXISTS public.entertainment_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add entertainment types
INSERT INTO entertainment_types (name, description, category)
VALUES 
  ('DJs', 'Professional DJs specializing in wedding entertainment', 'djs-and-bands'),
  ('Live Bands', 'Full bands performing live music for your wedding', 'djs-and-bands'),
  ('Solo Musicians', 'Individual performers for ceremonies and cocktail hours', 'djs-and-bands'),
  ('Orchestras', 'Classical ensembles for an elegant wedding atmosphere', 'djs-and-bands'),
  ('Cultural Music Specialists', 'Musicians specializing in specific cultural music traditions', 'djs-and-bands')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.planner_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.florist_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_types ENABLE ROW LEVEL SECURITY;

-- Create policies for all new tables
CREATE POLICY "Allow public read access for planner types"
  ON public.planner_types
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access for photographer types"
  ON public.photographer_types
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access for florist types"
  ON public.florist_types
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access for venue types"
  ON public.venue_types
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access for entertainment types"
  ON public.entertainment_types
  FOR SELECT
  USING (true);
