// Apply the unique constraint fix
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyConstraintFix() {
  console.log('🔧 Applying unique constraint fix...');
  
  try {
    // First, let's check what constraints currently exist
    console.log('\n1️⃣ Checking current constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .rpc('sql', {
        query: `
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'vendor_cache' 
          AND indexname LIKE '%unique%';
        `
      });
    
    if (constraintError) {
      console.error('❌ Error checking constraints:', constraintError);
      console.log('This is expected if RPC is not available. Continuing...');
    } else {
      console.log('Current unique constraints:', constraints);
    }
    
    // Test the current constraint by trying to insert duplicate entries
    console.log('\n2️⃣ Testing current constraint behavior...');
    
    const testCity = 'ConstraintTestCity';
    const testState = 'TX';
    
    // Clean up any existing test data
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    // Try to insert first entry
    const { data: insert1, error: error1 } = await supabase
      .from('vendor_cache')
      .insert({
        category: 'wedding venue',
        city: testCity,
        state: testState,
        subcategory: 'elegant',
        location_code: 2840,
        search_results: [{ title: 'Test Elegant Venue' }],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select('id, subcategory');
    
    if (error1) {
      console.error('❌ Error inserting first entry:', error1);
      return;
    }
    
    console.log('✅ First entry inserted:', insert1);
    
    // Try to insert second entry with different subcategory
    const { data: insert2, error: error2 } = await supabase
      .from('vendor_cache')
      .insert({
        category: 'wedding venue',
        city: testCity,
        state: testState,
        subcategory: 'rustic',
        location_code: 2840,
        search_results: [{ title: 'Test Rustic Venue' }],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select('id, subcategory');
    
    if (error2) {
      console.error('❌ Error inserting second entry:', error2);
      console.log('This indicates the constraint is still blocking subcategories');
      
      // The constraint is blocking us, so we need to manually fix it
      console.log('\n3️⃣ Constraint is blocking subcategories. Manual fix needed.');
      console.log('Please run this SQL manually in your Supabase SQL editor:');
      console.log(`
-- Drop the old constraint
DROP INDEX IF EXISTS unique_vendor_cache_entry;

-- Ensure the new constraint exists
CREATE UNIQUE INDEX IF NOT EXISTS vendor_cache_unique_subcategory_idx 
ON vendor_cache (category, city, state, COALESCE(subcategory, ''));
      `);
      
    } else {
      console.log('✅ Second entry inserted successfully:', insert2);
      console.log('🎉 Constraint is working correctly!');
    }
    
    // Check final state
    console.log('\n4️⃣ Checking final database state...');
    const { data: finalEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log(`Found ${finalEntries?.length || 0} entries:`);
    finalEntries?.forEach((entry, i) => {
      console.log(`   ${i+1}. ID: ${entry.id}, Subcategory: "${entry.subcategory || 'null'}"`);
    });
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log('✅ Constraint fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

applyConstraintFix();
