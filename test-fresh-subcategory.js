// Test fresh subcategory functionality
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFreshSubcategory() {
  console.log('🧪 Testing fresh subcategory functionality...');
  
  try {
    console.log('\n1️⃣ Testing API call with "wedding" subcategory...');
    
    // Test API call with subcategory
    const { data: apiData, error: apiError } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Miami, FL',
        subcategory: 'wedding'
      }
    });
    
    if (apiError) {
      console.error('❌ API Error:', apiError);
      return;
    }
    
    console.log(`✅ API Success: ${apiData?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData?.results?.[0]?.title || 'N/A'}`);
    
    // Wait for cache to be written
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n2️⃣ Checking database for subcategory storage...');
    
    // Check if subcategory was stored
    const { data: cacheData, error: cacheError } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Miami')
      .eq('state', 'FL')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (cacheError) {
      console.error('❌ Cache query error:', cacheError);
      return;
    }
    
    console.log(`📊 Found ${cacheData?.length || 0} cache entries for Miami photographers`);
    
    if (cacheData && cacheData.length > 0) {
      cacheData.forEach((entry, i) => {
        console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" - Created: ${entry.created_at}`);
        console.log(`      Results: ${entry.search_results?.length || 0} vendors`);
        console.log(`      Expires: ${entry.expires_at}`);
      });
      
      // Check if any entry has the wedding subcategory
      const weddingEntry = cacheData.find(entry => entry.subcategory === 'wedding');
      if (weddingEntry) {
        console.log('✅ SUCCESS: Wedding subcategory found in database!');
        console.log(`📊 Wedding entry details:`);
        console.log(`   - Category: ${weddingEntry.category}`);
        console.log(`   - City: ${weddingEntry.city}`);
        console.log(`   - State: ${weddingEntry.state}`);
        console.log(`   - Subcategory: ${weddingEntry.subcategory}`);
        console.log(`   - Results: ${weddingEntry.search_results?.length || 0}`);
      } else {
        console.log('⚠️ Wedding subcategory not found in database');
      }
    } else {
      console.log('❌ No cache entries found');
    }
    
    console.log('\n3️⃣ Testing different subcategory...');
    
    // Test with different subcategory
    const { data: apiData2, error: apiError2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Miami, FL',
        subcategory: 'portrait'
      }
    });
    
    if (apiError2) {
      console.error('❌ API Error (portrait):', apiError2);
    } else {
      console.log(`✅ API Success (portrait): ${apiData2?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${apiData2?.results?.[0]?.title || 'N/A'}`);
    }
    
    // Wait and check again
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: finalCache } = await supabase
      .from('vendor_cache')
      .select('category, city, state, subcategory, created_at')
      .eq('category', 'photographer')
      .eq('city', 'Miami')
      .eq('state', 'FL')
      .order('created_at', { ascending: false });
    
    console.log('\n📊 Final cache state for Miami photographers:');
    if (finalCache && finalCache.length > 0) {
      finalCache.forEach((entry, i) => {
        console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" - Created: ${entry.created_at}`);
      });
      
      const uniqueSubcategories = [...new Set(finalCache.map(e => e.subcategory || 'null'))];
      console.log(`\n🎯 Unique subcategories found: ${uniqueSubcategories.join(', ')}`);
      
      if (uniqueSubcategories.length > 1) {
        console.log('✅ SUCCESS: Multiple subcategories are being stored separately!');
      } else {
        console.log('⚠️ Only one subcategory type found');
      }
    }
    
    console.log('\n🎉 Fresh subcategory test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFreshSubcategory();
