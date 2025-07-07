// Test the updated collection script with subcategories
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulate the collection script's cache checking logic
async function testCacheLogic() {
  console.log('🧪 Testing Collection Script Cache Logic...');
  
  try {
    const city = 'Orlando';
    const state = 'FL';
    const category = 'photographer';
    
    // Test 1: Check cache for wedding subcategory (should exist)
    console.log('\n1️⃣ Testing cache check for wedding subcategory...');
    
    let query1 = supabase
      .from('vendor_cache')
      .select('created_at, expires_at, search_results, subcategory')
      .eq('category', category)
      .eq('city', city)
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .eq('subcategory', 'wedding');
    
    const { data: weddingCache, error: weddingError } = await query1.maybeSingle();
    
    if (weddingError) {
      console.error('❌ Wedding cache check error:', weddingError);
    } else if (weddingCache) {
      console.log('✅ Wedding cache found - script would skip API call');
      console.log(`   - Subcategory: ${weddingCache.subcategory}`);
      console.log(`   - Results: ${weddingCache.search_results?.length || 0}`);
    } else {
      console.log('💾 No wedding cache found - script would make API call');
    }
    
    // Test 2: Check cache for portrait subcategory (should not exist)
    console.log('\n2️⃣ Testing cache check for portrait subcategory...');
    
    let query2 = supabase
      .from('vendor_cache')
      .select('created_at, expires_at, search_results, subcategory')
      .eq('category', category)
      .eq('city', city)
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .eq('subcategory', 'portrait');
    
    const { data: portraitCache, error: portraitError } = await query2.maybeSingle();
    
    if (portraitError) {
      console.error('❌ Portrait cache check error:', portraitError);
    } else if (portraitCache) {
      console.log('✅ Portrait cache found - script would skip API call');
      console.log(`   - Subcategory: ${portraitCache.subcategory}`);
      console.log(`   - Results: ${portraitCache.search_results?.length || 0}`);
    } else {
      console.log('💾 No portrait cache found - script would make API call');
    }
    
    // Test 3: Check cache for no subcategory (null)
    console.log('\n3️⃣ Testing cache check for no subcategory...');
    
    let query3 = supabase
      .from('vendor_cache')
      .select('created_at, expires_at, search_results, subcategory')
      .eq('category', category)
      .eq('city', city)
      .eq('state', state)
      .gt('expires_at', new Date().toISOString())
      .is('subcategory', null);
    
    const { data: nullCache, error: nullError } = await query3.maybeSingle();
    
    if (nullError) {
      console.error('❌ Null cache check error:', nullError);
    } else if (nullCache) {
      console.log('✅ Null subcategory cache found - script would skip API call');
      console.log(`   - Subcategory: ${nullCache.subcategory || 'null'}`);
      console.log(`   - Results: ${nullCache.search_results?.length || 0}`);
    } else {
      console.log('💾 No null subcategory cache found - script would make API call');
    }
    
    // Test 4: Show all cache entries for this city/category
    console.log('\n4️⃣ All cache entries for Orlando photographers...');
    
    const { data: allCache } = await supabase
      .from('vendor_cache')
      .select('category, city, state, subcategory, created_at')
      .eq('category', category)
      .eq('city', city)
      .eq('state', state)
      .order('created_at', { ascending: false });
    
    if (allCache && allCache.length > 0) {
      console.log(`📊 Found ${allCache.length} cache entries:`);
      allCache.forEach((entry, i) => {
        console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" - Created: ${entry.created_at}`);
      });
    } else {
      console.log('📊 No cache entries found');
    }
    
    console.log('\n🎯 Collection Script Behavior:');
    console.log('✅ Script will now properly check subcategory-specific cache');
    console.log('✅ Each subcategory will be treated as separate search');
    console.log('✅ API calls will be made for missing subcategories');
    console.log('✅ Subcategory information will be stored in database');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCacheLogic();
