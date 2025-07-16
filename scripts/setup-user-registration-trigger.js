#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupUserRegistrationNotifications() {
  console.log('🔧 Setting up User Registration Notifications');
  console.log('=============================================\n');

  try {
    // First, let's check if we can access the auth.users table
    console.log('📝 Step 1: Checking access to auth.users table...');
    
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .limit(1);

    if (usersError) {
      console.log('❌ Cannot access auth.users table directly');
      console.log('🔄 Let\'s use an alternative approach...\n');
      
      // Alternative approach: Create a simpler trigger
      console.log('📝 Step 2: Creating user registration notification via SQL...');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log('https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/sql\n');
      
      console.log('```sql');
      console.log('-- Create a function to handle user registration notifications');
      console.log('CREATE OR REPLACE FUNCTION handle_new_user_registration()');
      console.log('RETURNS trigger AS $$');
      console.log('BEGIN');
      console.log('  -- Insert notification into queue');
      console.log('  INSERT INTO public.admin_notification_queue (');
      console.log('    notification_type,');
      console.log('    data,');
      console.log('    created_at');
      console.log('  ) VALUES (');
      console.log('    \'user_registration\',');
      console.log('    jsonb_build_object(');
      console.log('      \'email\', NEW.email,');
      console.log('      \'created_at\', NEW.created_at,');
      console.log('      \'email_confirmed_at\', NEW.email_confirmed_at,');
      console.log('      \'last_sign_in_at\', NEW.last_sign_in_at,');
      console.log('      \'app_metadata\', NEW.app_metadata');
      console.log('    ),');
      console.log('    NOW()');
      console.log('  );');
      console.log('  ');
      console.log('  RETURN NEW;');
      console.log('END;');
      console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
      console.log('');
      console.log('-- Create trigger on auth.users table');
      console.log('CREATE TRIGGER trigger_new_user_registration');
      console.log('  AFTER INSERT ON auth.users');
      console.log('  FOR EACH ROW');
      console.log('  EXECUTE FUNCTION handle_new_user_registration();');
      console.log('```\n');
      
      return;
    }

    console.log('✅ Successfully accessed auth.users table');
    console.log(`📊 Found ${users?.length || 0} users in the database\n`);

    // Check if notification queue table exists
    console.log('📝 Step 3: Checking notification queue table...');
    
    const { data: queueTest, error: queueError } = await supabase
      .from('admin_notification_queue')
      .select('id')
      .limit(1);

    if (queueError && queueError.code === '42P01') {
      console.log('❌ Notification queue table does not exist');
      console.log('🔄 Please run this SQL first to create the table:\n');
      
      console.log('```sql');
      console.log('-- Create notification queue table');
      console.log('CREATE TABLE IF NOT EXISTS public.admin_notification_queue (');
      console.log('  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,');
      console.log('  notification_type text NOT NULL,');
      console.log('  data jsonb NOT NULL,');
      console.log('  processed boolean DEFAULT false,');
      console.log('  created_at timestamp with time zone DEFAULT timezone(\'utc\'::text, now()) NOT NULL');
      console.log(');');
      console.log('');
      console.log('-- Enable RLS');
      console.log('ALTER TABLE public.admin_notification_queue ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Create policy for service role');
      console.log('CREATE POLICY "Service role can manage notifications"');
      console.log('  ON public.admin_notification_queue');
      console.log('  FOR ALL');
      console.log('  USING (auth.role() = \'service_role\');');
      console.log('');
      console.log('-- Grant permissions');
      console.log('GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO authenticated;');
      console.log('GRANT SELECT, INSERT, UPDATE ON public.admin_notification_queue TO service_role;');
      console.log('```\n');
      
      return;
    }

    console.log('✅ Notification queue table exists');

    // Test notification creation
    console.log('📝 Step 4: Testing notification creation...');
    
    const testNotification = {
      notification_type: 'user_registration',
      data: {
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        email_confirmed_at: null,
        last_sign_in_at: null,
        app_metadata: { provider: 'email', test: true }
      }
    };

    const { error: insertError } = await supabase
      .from('admin_notification_queue')
      .insert(testNotification);

    if (insertError) {
      console.error('❌ Error inserting test notification:', insertError);
      return;
    }

    console.log('✅ Test notification created successfully');

    // Test email sending
    console.log('📝 Step 5: Testing email notification...');
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
      body: {
        type: 'user_registration',
        data: testNotification.data
      }
    });

    if (emailError) {
      console.error('❌ Error sending test email:', emailError);
      return;
    }

    console.log('✅ Test email sent successfully:', emailResult);

    console.log('\n🎉 User registration notifications are ready!');
    console.log('📧 Check your email for the test notification');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupUserRegistrationNotifications();