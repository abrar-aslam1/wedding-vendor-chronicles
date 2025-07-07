// Final test with completely fresh city to ensure subcategories work
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFinalSubcategory() {
  console.log('🧪 Final Subcategory Test with Fresh City...');
  
  try {
    const testCity = 'FinalTestCity';
    const testState = 'TX';
    
    // Clear any existing entries for this test city
    await supabase
      .from('vendor_cache')
      .delete()
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log(`\n1️⃣ Testing API call with "elegant" subcategory for ${testCity}...`);
    
    const { data: apiData1, error: apiError1 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'wedding venue',
        location: `${testCity}, ${testState}`,
        subcategory: 'elegant'
      }
    });
    
    if (apiError1) {
      console.error('❌ API Error (elegant):', apiError1);
      return;
    }
    
    console.log(`✅ API Success (elegant): ${apiData1?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData1?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData1?.source || 'unknown'}`);
    
    // Wait for cache
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check database immediately after first call
    console.log(`\n📊 Checking database after first call...`);
    const { data: firstCheck } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
      .eq('city', testCity)
      .eq('state', testState);
    
    console.log(`Found ${firstCheck?.length || 0} entries after first call:`);
    if (firstCheck && firstCheck.length > 0) {
      firstCheck.forEach((entry, i) => {
        console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" (${entry.search_results?.length || 0} results)`);
      });
    }
    
    console.log(`\n2️⃣ Testing API call with "rustic" subcategory for ${testCity}...`);
    
    const { data: apiData2, error: apiError2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'wedding venue',
        location: `${testCity}, ${testState}`,
        subcategory: 'rustic'
      }
    });
    
    if (apiError2) {
      console.error('❌ API Error (rustic):', apiError2);
      return;
    }
    
    console.log(`✅ API Success (rustic): ${apiData2?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData2?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData2?.source || 'unknown'}`);
    
    // Wait for cache
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`\n3️⃣ Final database check for ${testCity} entries...`);
    
    const { data: cacheEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'wedding venue')
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
        
        if (entry.subcategory === 'elegant') {
          console.log(`   ✅ ELEGANT ENTRY FOUND!`);
        } else if (entry.subcategory === 'rustic') {
          console.log(`   ✅ RUSTIC ENTRY FOUND!`);
        }
      });
      
      const uniqueSubcategories = [...new Set(cacheEntries.map(e => e.subcategory || 'null'))];
      console.log(`\n🎯 Unique subcategories found: ${uniqueSubcategories.join(', ')}`);
      
      if (uniqueSubcategories.length >= 2 && uniqueSubcategories.includes('elegant') && uniqueSubcategories.includes('rustic')) {
        console.log('🎉 SUCCESS: Both subcategories are being cached separately!');
        console.log('   The Edge Function is now working correctly!');
        console.log('   The subcategory system is fully functional!');
      } else if (uniqueSubcategories.length >= 2) {
        console.log('✅ PARTIAL SUCCESS: Multiple subcategories found');
        console.log(`   Found: ${uniqueSubcategories.join(', ')}`);
      } else {
        console.log('❌ FAILURE: Only one subcategory type found');
        console.log('   There is still an issue with subcategory storage');
      }
    } else {
      console.log('❌ No cache entries found');
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

testFinalSubcategory();
