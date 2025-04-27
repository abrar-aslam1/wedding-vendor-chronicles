-- Create a table to track vendor completion status
CREATE TABLE IF NOT EXISTS vendor_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_slug TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, vendor_slug)
);

-- Add RLS policies
ALTER TABLE vendor_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendor completions"
  ON vendor_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendor completions"
  ON vendor_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor completions"
  ON vendor_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor completions"
  ON vendor_completions FOR DELETE
  USING (auth.uid() = user_id);
