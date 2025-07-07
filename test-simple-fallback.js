// Test if we can force fallback results and see if they cache properly
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSimpleFallback() {
  console.log('🧪 Testing Simple Fallback...');
  
  try {
    // Test with a city that definitely won't have DataForSEO credentials
    console.log('\n1️⃣ Making API call to test fallback behavior...');
    
    const { data: apiData, error: apiError } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'TestFallbackCity, TX',
        subcategory: 'test_fallback'
      }
    });
    
    if (apiError) {
      console.error('❌ API Error:', apiError);
      return;
    }
    
    console.log(`✅ API Success: ${apiData?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData?.source || 'unknown'}`);
    
    // Check if this is fallback
    if (apiData?.source === 'google_fallback') {
      console.log('✅ Using fallback results as expected');
    } else if (apiData?.source === 'google_api') {
      console.log('⚠️ Using real API - DataForSEO credentials are working');
    }
    
    // Wait for cache
    console.log('\n⏳ Waiting 3 seconds for cache...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check database
    console.log('\n2️⃣ Checking database for test_fallback subcategory...');
    
    const { data: cacheEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'TestFallbackCity')
      .eq('state', 'TX');
    
    console.log(`📊 Found ${cacheEntries?.length || 0} cache entries for TestFallbackCity`);
    
    if (cacheEntries && cacheEntries.length > 0) {
      cacheEntries.forEach((entry, i) => {
        console.log(`\n${i+1}. Entry Details:`);
        console.log(`   - Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   - Results: ${entry.search_results?.length || 0}`);
        console.log(`   - Created: ${entry.created_at}`);
        
        if (entry.subcategory === 'test_fallback') {
          console.log(`   ✅ TEST_FALLBACK ENTRY FOUND!`);
        }
      });
      
      const testEntry = cacheEntries.find(e => e.subcategory === 'test_fallback');
      if (testEntry) {
        console.log('\n🎉 SUCCESS: Fallback subcategory cached properly!');
        console.log('   This means the caching logic works for fallback results');
      } else {
        console.log('\n❌ FAILURE: Fallback subcategory not cached');
        console.log('   This means there\'s an issue with fallback caching too');
      }
    } else {
      console.log('\n❌ No cache entries found for TestFallbackCity');
    }
    
    // Clean up
    if (cacheEntries && cacheEntries.length > 0) {
      await supabase
        .from('vendor_cache')
        .delete()
        .eq('city', 'TestFallbackCity')
        .eq('state', 'TX');
      console.log('\n🧹 Cleaned up test data');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleFallback();
