-- Add approval status to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

-- Update existing vendors to approved status
UPDATE public.vendors SET status = 'approved' WHERE status IS NULL;

-- Create admin table for moderation
CREATE TABLE IF NOT EXISTS public.vendor_admin_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'flag')),
  reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.vendor_admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can view all actions"
  ON public.vendor_admin_actions
  FOR SELECT
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert actions"
  ON public.vendor_admin_actions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Grant permissions
GRANT SELECT, INSERT ON public.vendor_admin_actions TO authenticated;
GRANT SELECT, UPDATE ON public.vendors TO authenticated;