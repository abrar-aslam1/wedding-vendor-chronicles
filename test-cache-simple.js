// Test the vendor_cache table with basic columns
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCacheSimple() {
  console.log('🧪 Testing vendor_cache table structure...');
  
  try {
    // First, let's see what's in the existing cache
    console.log('\n1️⃣ Checking existing cache entries...');
    const { data: existingData, error: selectError } = await supabase
      .from('vendor_cache')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Select error:', selectError);
      return;
    }
    
    if (existingData && existingData.length > 0) {
      console.log('✅ Found existing cache entry');
      console.log('📋 Available columns:', Object.keys(existingData[0]));
      console.log('📝 Sample entry:', existingData[0]);
    } else {
      console.log('📭 No existing cache entries found');
    }
    
    // Test with minimal required columns
    console.log('\n2️⃣ Testing insert with basic columns...');
    const basicRecord = {
      keyword: 'test_photographer',
      location: 'Test City, TX',
      subcategory: 'test_subcategory',
      results: [{ title: 'Test Vendor', vendor_source: 'test' }],
      expires_at: new Date(Date.now() + 60000).toISOString() // 1 minute from now
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('vendor_cache')
      .insert(basicRecord)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Basic insert failed:', insertError);
      
      // Try even more minimal
      console.log('\n3️⃣ Testing with minimal columns...');
      const minimalRecord = {
        keyword: 'test_photographer',
        location: 'Test City, TX',
        results: [{ title: 'Test Vendor' }]
      };
      
      const { data: minimalData, error: minimalError } = await supabase
        .from('vendor_cache')
        .insert(minimalRecord)
        .select()
        .single();
      
      if (minimalError) {
        console.error('❌ Minimal insert failed:', minimalError);
      } else {
        console.log('✅ Minimal insert successful');
        console.log('📝 Inserted record:', minimalData);
        
        // Clean up
        await supabase
          .from('vendor_cache')
          .delete()
          .eq('keyword', 'test_photographer');
        console.log('🧹 Cleaned up test record');
      }
    } else {
      console.log('✅ Basic insert successful');
      console.log('📝 Inserted record:', insertData);
      
      // Clean up
      await supabase
        .from('vendor_cache')
        .delete()
        .eq('keyword', 'test_photographer');
      console.log('🧹 Cleaned up test record');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCacheSimple();
