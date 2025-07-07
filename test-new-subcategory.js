// Test with a completely new city and subcategory to see if the updated Edge Function works
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testNewSubcategory() {
  console.log('🧪 Testing New Subcategory with Updated Edge Function...');
  
  try {
    const testCity = 'NewTestCity';
    const testState = 'TX';
    
    // Clear any existing entries for this test city
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log(`\n1️⃣ Testing API call with "modern" subcategory for ${testCity}...`);
    
    const { data: apiData1, error: apiError1 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: `${testCity}, ${testState}`,
        subcategory: 'modern'
      }
    });
    
    if (apiError1) {
      console.error('❌ API Error (modern):', apiError1);
      return;
    }
    
    console.log(`✅ API Success (modern): ${apiData1?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData1?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData1?.source || 'unknown'}`);
    
    // Wait for cache
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`\n2️⃣ Testing API call with "vintage" subcategory for ${testCity}...`);
    
    const { data: apiData2, error: apiError2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: `${testCity}, ${testState}`,
        subcategory: 'vintage'
      }
    });
    
    if (apiError2) {
      console.error('❌ API Error (vintage):', apiError2);
      return;
    }
    
    console.log(`✅ API Success (vintage): ${apiData2?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData2?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData2?.source || 'unknown'}`);
    
    // Wait for cache
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`\n3️⃣ Checking database for ${testCity} entries...`);
    
    const { data: cacheEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', testCity)
      .eq('state', testState)
      .order('created_at', { ascending: false });
    
    console.log(`📊 Found ${cacheEntries?.length || 0} cache entries for ${testCity}:`);
    
    if (cacheEntries && cacheEntries.length > 0) {
      cacheEntries.forEach((entry, i) => {
        console.log(`\n${i+1}. Entry Details:`);
        console.log(`   - Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   - Results: ${entry.search_results?.length || 0}`);
        console.log(`   - Created: ${entry.created_at}`);
        console.log(`   - Sample result: ${entry.search_results?.[0]?.title || 'N/A'}`);
        
        if (entry.subcategory === 'modern') {
          console.log(`   ✅ MODERN ENTRY FOUND!`);
        } else if (entry.subcategory === 'vintage') {
          console.log(`   ✅ VINTAGE ENTRY FOUND!`);
        }
      });
      
      const uniqueSubcategories = [...new Set(cacheEntries.map(e => e.subcategory || 'null'))];
      console.log(`\n🎯 Unique subcategories found: ${uniqueSubcategories.join(', ')}`);
      
      if (uniqueSubcategories.length >= 2 && uniqueSubcategories.includes('modern') && uniqueSubcategories.includes('vintage')) {
        console.log('🎉 SUCCESS: Both subcategories are being cached separately!');
        console.log('   The Edge Function is now working correctly!');
      } else if (uniqueSubcategories.length >= 2) {
        console.log('✅ PARTIAL SUCCESS: Multiple subcategories found, but not the expected ones');
      } else {
        console.log('❌ FAILURE: Only one subcategory type found');
        console.log('   The Edge Function is still not storing subcategories properly');
      }
    } else {
      console.log('❌ No cache entries found');
    }
    
    // Test cache retrieval
    console.log(`\n4️⃣ Testing cache retrieval for modern subcategory...`);
    
    const { data: apiData3, error: apiError3 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: `${testCity}, ${testState}`,
        subcategory: 'modern'
      }
    });
    
    if (apiError3) {
      console.error('❌ API Error (modern cache test):', apiError3);
    } else {
      console.log(`✅ Cache test success: ${apiData3?.results?.length || 0} results`);
      console.log(`🔍 Source: ${apiData3?.source || 'unknown'}`);
      
      if (apiData3?.source === 'google_cached') {
        console.log('✅ Cache retrieval working perfectly!');
      } else {
        console.log('⚠️ Not using cache - might be an issue');
      }
    }
    
    // Clean up
    console.log(`\n🧹 Cleaning up test data...`);
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

testNewSubcategory();
