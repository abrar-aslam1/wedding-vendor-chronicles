// Script to manually add subcategory column to vendor_cache table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addSubcategoryColumn() {
  console.log('🔧 Adding subcategory column to vendor_cache table...');
  
  try {
    // Try to add the subcategory column using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add subcategory column if it doesn't exist
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vendor_cache' AND column_name = 'subcategory'
          ) THEN
            ALTER TABLE vendor_cache ADD COLUMN subcategory TEXT;
            COMMENT ON COLUMN vendor_cache.subcategory IS 'Subcategory for more specific vendor searches';
          END IF;
        END $$;
      `
    });
    
    if (error) {
      console.error('❌ Error adding subcategory column:', error);
      
      // Alternative approach: Try to insert a test record to see if column exists
      console.log('🧪 Testing if subcategory column exists...');
      const { error: testError } = await supabase
        .from('vendor_cache')
        .insert({
          category: 'test',
          city: 'test',
          state: 'test',
          location_code: 1,
          search_results: [],
          subcategory: 'test',
          expires_at: new Date().toISOString()
        });
      
      if (testError) {
        if (testError.message.includes('subcategory')) {
          console.log('❌ Subcategory column does not exist and cannot be added via RPC');
          console.log('📋 Please manually add the column in Supabase Dashboard:');
          console.log('   1. Go to https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/editor');
          console.log('   2. Select vendor_cache table');
          console.log('   3. Click "Add Column"');
          console.log('   4. Name: subcategory, Type: text, Nullable: true');
          console.log('   5. Save the column');
        } else {
          console.log('✅ Subcategory column might already exist');
        }
      } else {
        console.log('✅ Subcategory column exists and working!');
        // Clean up test record
        await supabase
          .from('vendor_cache')
          .delete()
          .eq('category', 'test')
          .eq('city', 'test')
          .eq('state', 'test');
      }
    } else {
      console.log('✅ Successfully added subcategory column');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

addSubcategoryColumn();
