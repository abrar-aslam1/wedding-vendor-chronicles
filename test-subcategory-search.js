// Test subcategory search functionality
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSubcategorySearch() {
  console.log('🧪 Testing Subcategory Search Functionality...');
  
  try {
    // Test 1: Search without subcategory
    console.log('\n1️⃣ Testing search WITHOUT subcategory...');
    const { data: data1, error: error1 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX'
        // No subcategory
      }
    });
    
    if (error1) {
      console.error('❌ API Error (no subcategory):', error1);
    } else {
      console.log(`✅ Success (no subcategory): ${data1?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${data1?.results?.[0]?.title || 'N/A'}`);
    }
    
    // Test 2: Search with subcategory
    console.log('\n2️⃣ Testing search WITH subcategory...');
    const { data: data2, error: error2 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX',
        subcategory: 'engagement specialists'
      }
    });
    
    if (error2) {
      console.error('❌ API Error (with subcategory):', error2);
    } else {
      console.log(`✅ Success (with subcategory): ${data2?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${data2?.results?.[0]?.title || 'N/A'}`);
    }
    
    // Test 3: Compare results
    console.log('\n3️⃣ Comparing results...');
    if (data1?.results && data2?.results) {
      const result1Titles = data1.results.map(r => r.title).slice(0, 3);
      const result2Titles = data2.results.map(r => r.title).slice(0, 3);
      
      console.log('📋 Without subcategory (first 3):');
      result1Titles.forEach((title, i) => console.log(`   ${i+1}. ${title}`));
      
      console.log('📋 With "engagement specialists" (first 3):');
      result2Titles.forEach((title, i) => console.log(`   ${i+1}. ${title}`));
      
      // Check if results are different (indicating subcategory is working)
      const areDifferent = JSON.stringify(result1Titles) !== JSON.stringify(result2Titles);
      if (areDifferent) {
        console.log('✅ Results are different - subcategory search is working!');
      } else {
        console.log('⚠️ Results are the same - subcategory might not be affecting search');
      }
    }
    
    // Test 4: Test another subcategory
    console.log('\n4️⃣ Testing different subcategory...');
    const { data: data3, error: error3 } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Dallas, TX',
        subcategory: 'wedding'
      }
    });
    
    if (error3) {
      console.error('❌ API Error (wedding subcategory):', error3);
    } else {
      console.log(`✅ Success (wedding subcategory): ${data3?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${data3?.results?.[0]?.title || 'N/A'}`);
    }
    
    console.log('\n🎉 Subcategory search test completed!');
    console.log('\n📋 The search query should now include subcategories like:');
    console.log('   • "engagement specialists photographer Dallas TX"');
    console.log('   • "wedding photographer Dallas TX"');
    console.log('   • "traditional photographer Dallas TX"');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSubcategorySearch();
