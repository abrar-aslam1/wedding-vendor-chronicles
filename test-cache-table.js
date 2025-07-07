// Test the vendor_cache table structure
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCacheTable() {
  console.log('🧪 Testing vendor_cache table...');
  
  try {
    // Test 1: Try to select from the table to see if it exists
    console.log('\n1️⃣ Testing table existence...');
    const { data, error } = await supabase
      .from('vendor_cache')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table access error:', error);
      console.log('\n🔧 The vendor_cache table might not exist or have the right structure.');
      console.log('   This is normal for a new setup. The collection script will handle this.');
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log(`📊 Found ${data?.length || 0} existing cache entries`);
    
    // Test 2: Check table structure by trying to insert a test record
    console.log('\n2️⃣ Testing table structure...');
    const testRecord = {
      keyword: 'test_photographer',
      location: 'Test City, TX',
      subcategory: 'test_subcategory',
      results: [{ title: 'Test Vendor', vendor_source: 'test' }],
      api_cost: 0.01,
      expires_at: new Date(Date.now() + 60000).toISOString() // 1 minute from now
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('vendor_cache')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return;
    }
    
    console.log('✅ Table structure is correct');
    console.log('📝 Test record inserted successfully');
    
    // Test 3: Clean up test record
    console.log('\n3️⃣ Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .eq('keyword', 'test_photographer');
    
    if (deleteError) {
      console.error('⚠️ Cleanup warning:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
    console.log('\n🎉 vendor_cache table is ready for collection!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCacheTable();
