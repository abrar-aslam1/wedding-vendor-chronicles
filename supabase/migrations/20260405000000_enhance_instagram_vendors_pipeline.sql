-- Enhance instagram_vendors table for the full discovery pipeline
-- Adds: slug, engagement_score, images, claimed, source, country, vendor_tier, website

-- Add new columns (IF NOT EXISTS pattern via DO blocks)
DO $$
BEGIN
  -- SEO slug
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'slug') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN slug text;
  END IF;

  -- Engagement score (0-100)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'engagement_score') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN engagement_score numeric(5,2) DEFAULT 0;
  END IF;

  -- Sample images (top 3 post URLs)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'images') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN images text[] DEFAULT '{}';
  END IF;

  -- Whether vendor has claimed their listing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'claimed') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN claimed boolean DEFAULT false;
  END IF;

  -- Data source identifier
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'source') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN source text DEFAULT 'instagram';
  END IF;

  -- Country
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'country') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN country text DEFAULT 'US';
  END IF;

  -- Vendor tier: top_vendor, rising_vendor, standard
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'vendor_tier') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN vendor_tier text DEFAULT 'standard';
  END IF;

  -- Hashtags used by vendor
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'hashtags') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN hashtags text[] DEFAULT '{}';
  END IF;

  -- Whether profile appears to be a business
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'is_business') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN is_business boolean DEFAULT false;
  END IF;

  -- Vendor quality score (composite: followers + engagement + completeness)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'quality_score') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN quality_score numeric(5,2) DEFAULT 0;
  END IF;

  -- Pipeline run that discovered this vendor
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instagram_vendors' AND column_name = 'discovery_run_id') THEN
    ALTER TABLE public.instagram_vendors ADD COLUMN discovery_run_id text;
  END IF;
END $$;

-- Add unique index on slug for SEO pages
CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_vendors_slug
  ON public.instagram_vendors (slug) WHERE slug IS NOT NULL;

-- Index for vendor tier queries
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_tier
  ON public.instagram_vendors (vendor_tier);

-- Index for quality score ranking
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_quality
  ON public.instagram_vendors (quality_score DESC);

-- Index for city + category lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_city_category
  ON public.instagram_vendors (city, category);

-- Index for unclaimed vendor outreach queries
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_unclaimed
  ON public.instagram_vendors (claimed) WHERE claimed = false;

-- Index for engagement ranking
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_engagement
  ON public.instagram_vendors (engagement_score DESC);

-- Create pipeline_runs table to track each automation run
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  id text PRIMARY KEY,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'running', -- running, completed, failed
  trigger_type text DEFAULT 'manual', -- manual, cron, api
  config jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{}',
  errors jsonb DEFAULT '[]',
  log text
);

-- RLS for pipeline_runs (admin only via service role)
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pipeline_runs' AND policyname = 'Allow public read of pipeline_runs'
  ) THEN
    CREATE POLICY "Allow public read of pipeline_runs" ON public.pipeline_runs FOR SELECT USING (true);
  END IF;
END $$;
