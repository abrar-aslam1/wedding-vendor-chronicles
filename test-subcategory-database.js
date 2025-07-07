// Test that subcategory column is working in the database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSubcategoryDatabase() {
  console.log('🧪 Testing subcategory column in database...');
  
  try {
    // Clear any existing test data
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('category', 'test_photographer')
      .eq('city', 'Test City')
      .eq('state', 'TX');
    
    console.log('\n1️⃣ Testing API call with subcategory storage...');
    
    // Test API call with subcategory - this should now store subcategory in database
    const { data: apiData, error: apiError } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Austin, TX',
        subcategory: 'wedding'
      }
    });
    
    if (apiError) {
      console.error('❌ API Error:', apiError);
      return;
    }
    
    console.log(`✅ API Success: ${apiData?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData?.results?.[0]?.title || 'N/A'}`);
    
    // Wait a moment for cache to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n2️⃣ Checking if subcategory was stored in database...');
    
    // Check if the subcategory was stored in the cache
    const { data: cacheData, error: cacheError } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Austin')
      .eq('state', 'TX')
      .eq('subcategory', 'wedding');
    
    if (cacheError) {
      console.error('❌ Cache query error:', cacheError);
      return;
    }
    
    if (cacheData && cacheData.length > 0) {
      console.log('✅ Subcategory stored successfully in database!');
      console.log(`📊 Cache entry details:`);
      console.log(`   - Category: ${cacheData[0].category}`);
      console.log(`   - City: ${cacheData[0].city}`);
      console.log(`   - State: ${cacheData[0].state}`);
      console.log(`   - Subcategory: ${cacheData[0].subcategory}`);
      console.log(`   - Results count: ${cacheData[0].search_results?.length || 0}`);
      console.log(`   - Created: ${cacheData[0].created_at}`);
    } else {
      console.log('⚠️ No cache entry found with subcategory');
      
      // Check if there's a cache entry without subcategory
      const { data: generalCache } = await supabase
        .from('vendor_cache')
        .select('*')
        .eq('category', 'photographer')
        .eq('city', 'Austin')
        .eq('state', 'TX');
      
      if (generalCache && generalCache.length > 0) {
        console.log('📋 Found cache entries:');
        generalCache.forEach((entry, i) => {
          console.log(`   ${i+1}. Subcategory: ${entry.subcategory || 'null'}`);
        });
      }
    }
    
    console.log('\n3️⃣ Testing different subcategory...');
    
    // Test with a different subcategory
    const { data: apiData2, error: apiError2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Austin, TX',
        subcategory: 'portrait'
      }
    });
    
    if (apiError2) {
      console.error('❌ API Error (portrait):', apiError2);
    } else {
      console.log(`✅ API Success (portrait): ${apiData2?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${apiData2?.results?.[0]?.title || 'N/A'}`);
    }
    
    // Wait and check cache again
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: allCache } = await supabase
      .from('vendor_cache')
      .select('category, city, state, subcategory, created_at')
      .eq('category', 'photographer')
      .eq('city', 'Austin')
      .eq('state', 'TX')
      .order('created_at', { ascending: false });
    
    console.log('\n📊 All cache entries for Austin photographers:');
    if (allCache && allCache.length > 0) {
      allCache.forEach((entry, i) => {
        console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" - Created: ${entry.created_at}`);
      });
      
      if (allCache.length >= 2) {
        console.log('✅ Multiple subcategory entries found - subcategory caching is working!');
      } else {
        console.log('⚠️ Only one cache entry found - subcategories might not be caching separately');
      }
    } else {
      console.log('❌ No cache entries found');
    }
    
    console.log('\n🎉 Subcategory database test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSubcategoryDatabase();
