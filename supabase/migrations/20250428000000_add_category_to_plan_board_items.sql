-- Add category column to plan_board_items table
ALTER TABLE plan_board_items
ADD COLUMN IF NOT EXISTS category TEXT;

-- Update the existing RLS policies to include the new column
DROP POLICY IF EXISTS "Users can insert their own plan board items" ON plan_board_items;
CREATE POLICY "Users can insert their own plan board items"
  ON plan_board_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own plan board items" ON plan_board_items;
CREATE POLICY "Users can update their own plan board items"
  ON plan_board_items FOR UPDATE
  USING (auth.uid() = user_id);
