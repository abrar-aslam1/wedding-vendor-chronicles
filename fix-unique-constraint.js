// Fix the unique constraint to allow subcategories
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
// TODO: Replace with actual service key - the previous key was corrupted
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixUniqueConstraint() {
  try {
    console.log('Starting unique constraint fix...');
    
    // Drop the existing unique constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE vendor_cache DROP CONSTRAINT IF EXISTS vendor_cache_category_city_state_location_code_key;'
    });
    
    if (dropError) {
      console.error('Error dropping constraint:', dropError);
      throw dropError;
    }
    
    console.log('Dropped existing unique constraint');
    
    // Add new unique constraint that includes subcategory
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE vendor_cache 
            ADD CONSTRAINT vendor_cache_category_city_state_location_code_subcategory_key 
            UNIQUE (category, city, state, location_code, subcategory);`
    });
    
    if (addError) {
      console.error('Error adding new constraint:', addError);
      throw addError;
    }
    
    console.log('Added new unique constraint with subcategory');
    console.log('Unique constraint fix completed successfully!');
    
  } catch (error) {
    console.error('Failed to fix unique constraint:', error);
    process.exit(1);
  }
}

// Run the fix
fixUniqueConstraint();
