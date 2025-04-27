-- Create plan_board_columns table
CREATE TABLE IF NOT EXISTS plan_board_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plan_board_columns_user_id_fkey'
  ) THEN
    ALTER TABLE plan_board_columns
    ADD CONSTRAINT plan_board_columns_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Create plan_board_items table
CREATE TABLE IF NOT EXISTS plan_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  column_id UUID NOT NULL,
  vendor_id TEXT,
  vendor_data JSONB,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  notes TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plan_board_items_user_id_fkey'
  ) THEN
    ALTER TABLE plan_board_items
    ADD CONSTRAINT plan_board_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'plan_board_items_column_id_fkey'
  ) THEN
    ALTER TABLE plan_board_items
    ADD CONSTRAINT plan_board_items_column_id_fkey
    FOREIGN KEY (column_id) REFERENCES plan_board_columns(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Create timeline_events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'timeline_events_user_id_fkey'
  ) THEN
    ALTER TABLE timeline_events
    ADD CONSTRAINT timeline_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add RLS policies for plan_board_columns
ALTER TABLE plan_board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan board columns"
  ON plan_board_columns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan board columns"
  ON plan_board_columns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan board columns"
  ON plan_board_columns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan board columns"
  ON plan_board_columns FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for plan_board_items
ALTER TABLE plan_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan board items"
  ON plan_board_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan board items"
  ON plan_board_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan board items"
  ON plan_board_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan board items"
  ON plan_board_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for timeline_events
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeline events"
  ON timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeline events"
  ON timeline_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeline events"
  ON timeline_events FOR DELETE
  USING (auth.uid() = user_id);
