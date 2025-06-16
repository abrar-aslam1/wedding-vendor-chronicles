-- Add missing columns to instagram_vendors table for CSV import compatibility
-- This migration adds columns to match the CSV headers:
-- "Instagram Page URL", "Business Name", "Phone", "Business Email", "Website", "Address", "City", "State", "Zip"

-- Add missing columns
ALTER TABLE public.instagram_vendors 
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Update the table comment to document the CSV import compatibility
COMMENT ON TABLE public.instagram_vendors IS 'Instagram vendors table with CSV import compatibility for photographer data';

-- Add comments for the new columns
COMMENT ON COLUMN public.instagram_vendors.instagram_url IS 'Full Instagram page URL from CSV import';
COMMENT ON COLUMN public.instagram_vendors.address IS 'Street address from CSV import';
COMMENT ON COLUMN public.instagram_vendors.zip_code IS 'ZIP code from CSV import';

-- Create an index on instagram_url for better performance
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_instagram_url ON public.instagram_vendors(instagram_url);

-- Create an index on zip_code for location-based searches
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_zip_code ON public.instagram_vendors(zip_code);

-- Create a composite index for city, state, zip for location searches
CREATE INDEX IF NOT EXISTS idx_instagram_vendors_location ON public.instagram_vendors(city, state, zip_code);

-- Add RLS policy for CSV import (allows inserts with service role key)
CREATE POLICY "Allow service role to insert vendors" ON public.instagram_vendors
  FOR INSERT
  WITH CHECK (true);

-- Add RLS policy for CSV import (allows updates with service role key)  
CREATE POLICY "Allow service role to update vendors" ON public.instagram_vendors
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
