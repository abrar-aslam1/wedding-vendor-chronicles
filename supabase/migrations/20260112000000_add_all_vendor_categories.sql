-- Add all vendor categories to vendor_subcategories table
-- This ensures all categories from the form can be used

-- First, ensure the vendor_subcategories table exists (it should from earlier migrations)
-- Then insert all categories that might be missing

INSERT INTO vendor_subcategories (category, name, description)
VALUES 
  ('wedding-planners', 'Wedding Planners', 'Professional planners to orchestrate your perfect day'),
  ('photographers', 'Photographers', 'Capture every magical moment'),
  ('videographers', 'Videographers', 'Create lasting memories in motion'),
  ('florists', 'Florists', 'Beautiful floral arrangements for your special day'),
  ('caterers', 'Caterers', 'Delicious cuisine for your reception'),
  ('venues', 'Venues', 'Perfect locations for your ceremony and reception'),
  ('djs-and-bands', 'DJs & Bands', 'Entertainment to keep the party going'),
  ('cake-designers', 'Cake Designers', 'Beautiful and delicious wedding cakes'),
  ('bridal-shops', 'Bridal Shops', 'Find your perfect wedding dress'),
  ('makeup-artists', 'Makeup Artists', 'Professional makeup services for your special day'),
  ('hair-stylists', 'Hair Stylists', 'Expert hair styling for the wedding party'),
  ('wedding-decorators', 'Wedding Decorators', 'Transform your venue with stunning decorations'),
  ('carts', 'Carts', 'Mobile carts for coffee, matcha, cocktails & more')
ON CONFLICT (category, name) DO NOTHING;

-- Also add entries without hyphens in case they're needed
INSERT INTO vendor_subcategories (category, name, description)
VALUES 
  ('wedding planners', 'Wedding Planners', 'Professional planners to orchestrate your perfect day'),
  ('djs and bands', 'DJs & Bands', 'Entertainment to keep the party going'),
  ('cake designers', 'Cake Designers', 'Beautiful and delicious wedding cakes'),
  ('bridal shops', 'Bridal Shops', 'Find your perfect wedding dress'),
  ('makeup artists', 'Makeup Artists', 'Professional makeup services for your special day'),
  ('hair stylists', 'Hair Stylists', 'Expert hair styling for the wedding party'),
  ('wedding decorators', 'Wedding Decorators', 'Transform your venue with stunning decorations')
ON CONFLICT (category, name) DO NOTHING;
