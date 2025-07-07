// Test the Edge Function directly to see what's happening
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEdgeFunctionDirect() {
  console.log('🧪 Testing Edge Function Directly...');
  
  try {
    console.log('\n1️⃣ Making direct API call with commercial subcategory...');
    
    // Test with a new subcategory that definitely doesn't exist
    const { data: apiData, error: apiError } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Orlando, FL',
        subcategory: 'commercial'
      }
    });
    
    if (apiError) {
      console.error('❌ API Error:', apiError);
      return;
    }
    
    console.log(`✅ API Success: ${apiData?.results?.length || 0} results`);
    console.log(`📝 Sample result: ${apiData?.results?.[0]?.title || 'N/A'}`);
    console.log(`🔍 Source: ${apiData?.source || 'unknown'}`);
    
    // Wait longer for cache to be written
    console.log('\n⏳ Waiting 5 seconds for cache to be written...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n2️⃣ Checking database for commercial subcategory...');
    
    // Check all Orlando photographer entries
    const { data: allEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Orlando')
      .eq('state', 'FL')
      .order('created_at', { ascending: false });
    
    console.log(`📊 Found ${allEntries?.length || 0} Orlando photographer entries:`);
    
    if (allEntries && allEntries.length > 0) {
      allEntries.forEach((entry, i) => {
        console.log(`\n${i+1}. Entry Details:`);
        console.log(`   - Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   - Results: ${entry.search_results?.length || 0}`);
        console.log(`   - Created: ${entry.created_at}`);
        
        if (entry.subcategory === 'commercial') {
          console.log(`   ✅ COMMERCIAL ENTRY FOUND!`);
        }
      });
      
      // Check for commercial specifically
      const commercialEntry = allEntries.find(e => e.subcategory === 'commercial');
      if (commercialEntry) {
        console.log('\n🎉 SUCCESS: Commercial subcategory found in database!');
        console.log('   The Edge Function is now working correctly');
      } else {
        console.log('\n❌ FAILURE: Commercial subcategory not found in database');
        console.log('   The Edge Function is still not caching subcategories');
      }
    }
    
    // Test another subcategory
    console.log('\n3️⃣ Testing with fine art subcategory...');
    
    const { data: apiData2, error: apiError2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Orlando, FL',
        subcategory: 'fine art'
      }
    });
    
    if (apiError2) {
      console.error('❌ API Error (fine art):', apiError2);
    } else {
      console.log(`✅ API Success (fine art): ${apiData2?.results?.length || 0} results`);
      console.log(`🔍 Source: ${apiData2?.source || 'unknown'}`);
    }
    
    // Wait and check final state
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const { data: finalEntries } = await supabase
      .from('vendor_cache')
      .select('subcategory, created_at')
      .eq('category', 'photographer')
      .eq('city', 'Orlando')
      .eq('state', 'FL')
      .order('created_at', { ascending: false });
    
    console.log('\n📊 Final Orlando photographer subcategories:');
    if (finalEntries && finalEntries.length > 0) {
      const subcategories = finalEntries.map(e => e.subcategory || 'null');
      console.log(`   Found: ${subcategories.join(', ')}`);
      
      if (subcategories.includes('commercial') || subcategories.includes('fine art')) {
        console.log('✅ NEW SUBCATEGORIES DETECTED - SYSTEM IS WORKING!');
      } else {
        console.log('❌ No new subcategories found');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEdgeFunctionDirect();
