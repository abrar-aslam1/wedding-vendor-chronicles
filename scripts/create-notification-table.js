#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createNotificationTable() {
  console.log('🔧 Creating notification table and triggers...');
  
  try {
    // Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('admin_notification_queue')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('❌ Table does not exist. Please create it manually in Supabase SQL editor.');
      console.log('\n📝 Run this SQL in Supabase SQL editor:');
      console.log('https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/sql');
      console.log('\n```sql');
      console.log(`-- Create notification queue table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON public.admin_notification_queue(processed);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.admin_notification_queue(created_at);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO service_role;

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

-- Create trigger for new business submissions
CREATE TRIGGER trigger_new_business_notification
  AFTER INSERT ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION send_admin_notification();
\`\`\``);

    } else if (tableError) {
      console.error('❌ Error checking table:', tableError);
    } else {
      console.log('✅ Table already exists! Ready to test.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createNotificationTable();