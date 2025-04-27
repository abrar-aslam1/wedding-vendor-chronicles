-- Add fields for timeline wizard functionality
ALTER TABLE timeline_events
ADD COLUMN IF NOT EXISTS is_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS vendor_category TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_is_generated ON timeline_events(is_generated);
CREATE INDEX IF NOT EXISTS idx_timeline_events_vendor_category ON timeline_events(vendor_category);
