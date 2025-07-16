// Apply the notification queue migration to the database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyNotificationMigration() {
  console.log('🔄 Applying notification queue migration...');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250716000001_create_email_notifications.sql', 'utf8');
    
    console.log('📋 Migration SQL content:');
    console.log('=====================================');
    console.log(migrationSQL);
    console.log('=====================================');
    console.log('');
    
    // Check if table already exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'admin_notification_queue')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('⚠️  Cannot check table existence (this is expected with anon key)');
      console.log('Error:', tableError.message);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table admin_notification_queue already exists');
      return;
    }
    
    console.log('❌ The admin_notification_queue table does not exist in the database.');
    console.log('🔧 This migration needs to be applied using a service role key or via Supabase dashboard.');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the migration SQL shown above');
    console.log('3. Or use the service role key to apply this migration');
    console.log('');
    console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/sql');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error);
  }
}

applyNotificationMigration();