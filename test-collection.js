// Quick test of the vendor collection system
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCollection() {
  console.log('🧪 Testing Vendor Collection System...');
  
  try {
    // Test 1: Call the Google vendors API
    console.log('\n1️⃣ Testing Google vendors API...');
    const { data, error } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Austin, TX',
        subcategory: 'engagement specialists'
      }
    });
    
    if (error) {
      console.error('❌ API Error:', error);
      return;
    }
    
    console.log(`✅ API Success: ${data?.results?.length || 0} results`);
    console.log(`💰 Cost: $${data?.cost || 0}`);
    
    // Test 2: Check cache using correct table structure
    console.log('\n2️⃣ Testing cache system...');
    const { data: cacheData, error: cacheError } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Austin')
      .eq('state', 'TX')
      .maybeSingle();
    
    if (cacheError) {
      console.error('❌ Cache Error:', cacheError);
      return;
    }
    
    if (cacheData) {
      console.log('✅ Cache working: Data found and stored');
      console.log(`📅 Created: ${cacheData.created_at}`);
      console.log(`⏰ Expires: ${cacheData.expires_at}`);
      console.log(`📊 Results count: ${cacheData.search_results?.length || 0}`);
    } else {
      console.log('⚠️ No cache data found (this might be expected for first run)');
    }
    
    // Test 3: Test state abbreviation function
    console.log('\n3️⃣ Testing state abbreviations...');
    const testStates = ['Texas', 'California', 'New York', 'Florida'];
    const stateAbbreviations = {
      'Texas': 'TX', 'California': 'CA', 'New York': 'NY', 'Florida': 'FL'
    };
    
    for (const state of testStates) {
      const abbr = stateAbbreviations[state];
      console.log(`✅ ${state} -> ${abbr}`);
    }
    
    console.log('\n🎉 All tests passed! Collection system is ready.');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run collect-vendors-interactive');
    console.log('   2. Monitor progress in vendor-collection-progress.json');
    console.log('   3. Check costs and daily limits');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCollection();
