-- Add all vendor categories to vendor_subcategories table
-- This ensures all categories from the form can be used

-- Simple INSERT - run this in Supabase SQL Editor
INSERT INTO vendor_subcategories (category, name, description) VALUES 
  ('wedding-planners', 'Wedding Planners', 'Professional planners'),
  ('photographers', 'Photographers', 'Capture every magical moment'),
  ('videographers', 'Videographers', 'Create lasting memories'),
  ('florists', 'Florists', 'Floral arrangements'),
  ('caterers', 'Caterers', 'Delicious cuisine'),
  ('venues', 'Venues', 'Perfect locations'),
  ('djs-and-bands', 'DJs & Bands', 'Entertainment'),
  ('cake-designers', 'Cake Designers', 'Wedding cakes'),
  ('bridal-shops', 'Bridal Shops', 'Wedding dresses'),
  ('makeup-artists', 'Makeup Artists', 'Makeup services'),
  ('hair-stylists', 'Hair Stylists', 'Hair styling'),
  ('wedding-decorators', 'Wedding Decorators', 'Venue decorations');
