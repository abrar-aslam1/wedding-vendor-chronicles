// Test to debug subcategory storage issue
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSubcategoryIssue() {
  console.log('🔍 Testing subcategory storage issue...');
  
  try {
    const testCity = 'DebugTestCity';
    const testState = 'TX';
    
    // Clear any existing entries
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log('\n1️⃣ Testing direct database insert with subcategories...');
    
    // Insert first entry with "elegant" subcategory
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
      console.error('❌ Error inserting elegant entry:', error1);
      return;
    }
    
    console.log('✅ Inserted elegant entry:', insert1);
    
    // Insert second entry with "rustic" subcategory
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
      console.error('❌ Error inserting rustic entry:', error2);
      console.error('Error details:', {
        code: error2.code,
        message: error2.message,
        details: error2.details,
        hint: error2.hint
      });
    } else {
      console.log('✅ Inserted rustic entry:', insert2);
    }
    
    // Check what's in the database
    console.log('\n2️⃣ Checking database entries...');
    const { data: allEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log(`Found ${allEntries?.length || 0} entries:`);
    allEntries?.forEach((entry, i) => {
      console.log(`   ${i+1}. ID: ${entry.id}, Subcategory: "${entry.subcategory || 'null'}"`);
    });
    
    // Test cache lookup for each subcategory
    console.log('\n3️⃣ Testing cache lookup for "elegant"...');
    const { data: elegantCache } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState)
      .eq('subcategory', 'elegant')
      .maybeSingle();
    
    console.log('Elegant cache result:', elegantCache ? `Found ID ${elegantCache.id}` : 'Not found');
    
    console.log('\n4️⃣ Testing cache lookup for "rustic"...');
    const { data: rusticCache } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState)
      .eq('subcategory', 'rustic')
      .maybeSingle();
    
    console.log('Rustic cache result:', rusticCache ? `Found ID ${rusticCache.id}` : 'Not found');
    
    // Test the problematic query from the edge function
    console.log('\n5️⃣ Testing edge function cache query logic...');
    
    // Query without subcategory filter (this might be the issue)
    const { data: noSubcategoryFilter } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState)
      .gt('expires_at', new Date().toISOString());
    
    console.log(`Query without subcategory filter found ${noSubcategoryFilter?.length || 0} entries`);
    
    // Clean up
    console.log('\n🧹 Cleaning up...');
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log('✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSubcategoryIssue();
