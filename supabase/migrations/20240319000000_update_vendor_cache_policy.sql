-- Update the vendor_cache table policy to allow public read access
ALTER TABLE vendor_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON vendor_cache FOR SELECT
TO public
USING (true);

-- Keep the insert/update policies for authenticated users
CREATE POLICY "Enable insert for authenticated users only"
ON vendor_cache FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON vendor_cache FOR UPDATE
TO authenticated
USING (true);