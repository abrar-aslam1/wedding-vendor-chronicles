-- Create a function to send admin notifications
CREATE OR REPLACE FUNCTION send_admin_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification request into a queue table
  INSERT INTO public.admin_notification_queue (
    notification_type,
    data,
    created_at
  ) VALUES (
    'business_submission',
    jsonb_build_object(
      'business_name', NEW.business_name,
      'category', NEW.category,
      'city', NEW.city,
      'state', NEW.state,
      'description', NEW.description,
      'contact_info', NEW.contact_info,
      'created_at', NEW.created_at
    ),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification queue table
CREATE TABLE IF NOT EXISTS public.admin_notification_queue (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_type text NOT NULL,
  data jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage notifications"
  ON public.admin_notification_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger for new business submissions
CREATE TRIGGER trigger_new_business_notification
  AFTER INSERT ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION send_admin_notification();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON public.admin_notification_queue(processed);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.admin_notification_queue(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO service_role;