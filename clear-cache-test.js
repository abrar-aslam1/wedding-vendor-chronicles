// Clear cache for Dallas photographers to test subcategory functionality
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearCacheAndTest() {
  console.log('🧹 Clearing cache for Dallas photographers...');
  
  try {
    // Clear cache for Dallas photographers
    const { data: deletedData, error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .eq('category', 'photographer')
      .eq('city', 'Dallas')
      .eq('state', 'TX');
    
    if (deleteError) {
      console.error('❌ Error clearing cache:', deleteError);
      return;
    }
    
    console.log('✅ Cache cleared successfully');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now test with different subcategories to see fresh API results
    console.log('\n🧪 Testing fresh API calls with different subcategories...');
    
    // Test 1: Search for "wedding photographer"
    console.log('\n1️⃣ Testing "wedding photographer"...');
    const { data: data1, error: error1 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX',
        subcategory: 'wedding'
      }
    });
    
    if (error1) {
      console.error('❌ API Error (wedding):', error1);
    } else {
      console.log(`✅ Success (wedding): ${data1?.results?.length || 0} results`);
      console.log(`📝 Sample results:`);
      data1?.results?.slice(0, 3).forEach((result, i) => {
        console.log(`   ${i+1}. ${result.title}`);
      });
    }
    
    // Wait before next call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Search for "portrait photographer" 
    console.log('\n2️⃣ Testing "portrait photographer"...');
    const { data: data2, error: error2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX',
        subcategory: 'portrait'
      }
    });
    
    if (error2) {
      console.error('❌ API Error (portrait):', error2);
    } else {
      console.log(`✅ Success (portrait): ${data2?.results?.length || 0} results`);
      console.log(`📝 Sample results:`);
      data2?.results?.slice(0, 3).forEach((result, i) => {
        console.log(`   ${i+1}. ${result.title}`);
      });
    }
    
    // Wait before next call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 3: Search for "commercial photographer"
    console.log('\n3️⃣ Testing "commercial photographer"...');
    const { data: data3, error: error3 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX',
        subcategory: 'commercial'
      }
    });
    
    if (error3) {
      console.error('❌ API Error (commercial):', error3);
    } else {
      console.log(`✅ Success (commercial): ${data3?.results?.length || 0} results`);
      console.log(`📝 Sample results:`);
      data3?.results?.slice(0, 3).forEach((result, i) => {
        console.log(`   ${i+1}. ${result.title}`);
      });
    }
    
    // Compare results
    console.log('\n📊 Comparison Summary:');
    if (data1?.results && data2?.results && data3?.results) {
      const wedding = data1.results.slice(0, 3).map(r => r.title);
      const portrait = data2.results.slice(0, 3).map(r => r.title);
      const commercial = data3.results.slice(0, 3).map(r => r.title);
      
      console.log('Wedding vs Portrait:', JSON.stringify(wedding) !== JSON.stringify(portrait) ? '✅ Different' : '⚠️ Same');
      console.log('Wedding vs Commercial:', JSON.stringify(wedding) !== JSON.stringify(commercial) ? '✅ Different' : '⚠️ Same');
      console.log('Portrait vs Commercial:', JSON.stringify(portrait) !== JSON.stringify(commercial) ? '✅ Different' : '⚠️ Same');
    }
    
    console.log('\n🎉 Test completed! If results are different, subcategory search is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

clearCacheAndTest();
