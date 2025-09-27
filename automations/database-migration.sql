-- Create automation approvals table
CREATE TABLE IF NOT EXISTS automation_approvals (
  id SERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  approval_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  request_details TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure only one approval record per job per day
  UNIQUE(job_name, approval_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_automation_approvals_status 
  ON automation_approvals(status, approval_date);
CREATE INDEX IF NOT EXISTS idx_automation_approvals_job_date 
  ON automation_approvals(job_name, approval_date);

-- Enable RLS (Row Level Security)
ALTER TABLE automation_approvals ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage automation_approvals" 
  ON automation_approvals
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Create policy for authenticated users to view approvals
CREATE POLICY "Authenticated users can view automation_approvals" 
  ON automation_approvals
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Insert some sample approval requests for demonstration
INSERT INTO automation_approvals (job_name, approval_date, status, request_details) 
VALUES 
  ('backfill-tier1', CURRENT_DATE, 'pending', 'Collect Instagram vendors from Tier 1 cities (major metros)'),
  ('backfill-dallas', CURRENT_DATE + 1, 'pending', 'Collect wedding photographers from Dallas, TX')
ON CONFLICT (job_name, approval_date) DO NOTHING;
