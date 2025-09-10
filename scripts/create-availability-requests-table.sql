-- Create availability_requests table
CREATE TABLE IF NOT EXISTS availability_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Vendor information
  vendor_place_id TEXT,
  vendor_title TEXT NOT NULL,
  vendor_phone TEXT,
  vendor_email TEXT,
  
  -- Client information
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Event information
  event_date DATE NOT NULL,
  event_type TEXT DEFAULT 'wedding',
  guest_count INTEGER,
  message TEXT,
  
  -- Request status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'booked', 'declined', 'expired'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_requests_user_id ON availability_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_requests_vendor_place_id ON availability_requests(vendor_place_id);
CREATE INDEX IF NOT EXISTS idx_availability_requests_status ON availability_requests(status);
CREATE INDEX IF NOT EXISTS idx_availability_requests_created_at ON availability_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE availability_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own requests
CREATE POLICY "Users can view own availability requests" ON availability_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own requests
CREATE POLICY "Users can create availability requests" ON availability_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests
CREATE POLICY "Users can update own availability requests" ON availability_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_availability_requests_updated_at
  BEFORE UPDATE ON availability_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
