-- Create a new table for cuisine types
CREATE TABLE IF NOT EXISTS public.cuisine_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL REFERENCES vendor_subcategories(category)
);

-- Add cuisine types for caterers
INSERT INTO cuisine_types (name, description, category)
VALUES 
  ('American', 'American cuisine with burgers, steaks, and comfort food', 'caterers'),
  ('Italian', 'Italian cuisine featuring pasta, pizza, and more', 'caterers'),
  ('Mexican', 'Mexican cuisine with tacos, enchiladas, and traditional dishes', 'caterers'),
  ('Indian', 'Indian cuisine with curry, tandoori, and diverse regional dishes', 'caterers'),
  ('Chinese', 'Chinese cuisine with stir-fry, dim sum, and regional specialties', 'caterers'),
  ('Mediterranean', 'Mediterranean cuisine featuring healthy dishes from Greece, Turkey, and more', 'caterers'),
  ('Japanese', 'Japanese cuisine with sushi, ramen, and traditional dishes', 'caterers'),
  ('Thai', 'Thai cuisine with flavorful curries, noodles, and aromatic dishes', 'caterers'),
  ('French', 'French cuisine with elegant dishes, pastries, and culinary traditions', 'caterers'),
  ('Spanish', 'Spanish cuisine featuring paella, tapas, and regional specialties', 'caterers'),
  ('Middle Eastern', 'Middle Eastern cuisine with falafel, hummus, and traditional dishes', 'caterers')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the new table
ALTER TABLE public.cuisine_types ENABLE ROW LEVEL SECURITY;

-- Create policies for the new table
CREATE POLICY "Allow public read access"
  ON public.cuisine_types
  FOR SELECT
  USING (true);
