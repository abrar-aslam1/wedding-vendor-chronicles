// Test database insert directly to find the issue
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseInsert() {
  console.log('🧪 Testing Database Insert Directly...');
  
  try {
    // Test 1: Try to insert a simple cache entry with subcategory
    console.log('\n1️⃣ Testing direct database insert with subcategory...');
    
    const testData = {
      category: 'photographer',
      city: 'TestCity',
      state: 'TX',
      subcategory: 'test_subcategory',
      location_code: 2840,
      search_results: [
        {
          title: 'Test Photographer',
          description: 'Test description',
          vendor_source: 'google'
        }
      ],
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('vendor_cache')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert Error:', insertError);
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
    } else {
      console.log('✅ Insert Success!');
      console.log('   Inserted ID:', insertData[0]?.id);
      console.log('   Subcategory:', insertData[0]?.subcategory);
    }
    
    // Test 2: Check table structure
    console.log('\n2️⃣ Checking table structure...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('vendor_cache')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table query error:', tableError);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table accessible');
      console.log('   Columns found:', Object.keys(tableInfo[0]));
      
      if ('subcategory' in tableInfo[0]) {
        console.log('✅ Subcategory column exists');
      } else {
        console.log('❌ Subcategory column missing!');
      }
    }
    
    // Test 3: Try insert without subcategory
    console.log('\n3️⃣ Testing insert without subcategory...');
    
    const testDataNoSub = {
      category: 'photographer',
      city: 'TestCity2',
      state: 'TX',
      location_code: 2840,
      search_results: [
        {
          title: 'Test Photographer 2',
          description: 'Test description 2',
          vendor_source: 'google'
        }
      ],
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('vendor_cache')
      .insert(testDataNoSub)
      .select();
    
    if (insertError2) {
      console.error('❌ Insert Error (no subcategory):', insertError2);
    } else {
      console.log('✅ Insert Success (no subcategory)!');
      console.log('   Inserted ID:', insertData2[0]?.id);
    }
    
    // Test 4: Check permissions
    console.log('\n4️⃣ Testing permissions...');
    
    // Try to read what we just inserted
    const { data: readData, error: readError } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('city', 'TestCity')
      .eq('state', 'TX');
    
    if (readError) {
      console.error('❌ Read Error:', readError);
    } else {
      console.log(`✅ Read Success: Found ${readData?.length || 0} test entries`);
      if (readData && readData.length > 0) {
        readData.forEach((entry, i) => {
          console.log(`   ${i+1}. City: ${entry.city}, Subcategory: ${entry.subcategory || 'null'}`);
        });
      }
    }
    
    // Clean up test data
    console.log('\n5️⃣ Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .in('city', ['TestCity', 'TestCity2'])
      .eq('state', 'TX');
    
    if (deleteError) {
      console.error('❌ Delete Error:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabaseInsert();
