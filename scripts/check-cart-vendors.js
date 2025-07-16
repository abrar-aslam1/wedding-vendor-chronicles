#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkCartVendors() {
  console.log('🔍 Checking for cart vendors in database...\n');
  
  try {
    // Check if we can query the vendors_google table
    const { data, error, count } = await supabase
      .from('vendors_google')
      .select('*', { count: 'exact', head: false })
      .eq('category', 'carts')
      .limit(10);

    if (error) {
      console.error('❌ Error querying vendors_google:', error);
      
      // Try a simpler query
      console.log('\n🔍 Trying a simpler query...');
      const { data: testData, error: testError } = await supabase
        .from('vendors_google')
        .select('id, business_name, category, city, state')
        .limit(5);
        
      if (testError) {
        console.error('❌ Test query also failed:', testError);
      } else {
        console.log('✅ Test query succeeded. Found', testData?.length || 0, 'vendors');
        if (testData && testData.length > 0) {
          console.log('Categories found:', [...new Set(testData.map(v => v.category))]);
        }
      }
      return;
    }

    console.log(`📊 Found ${count || 0} cart vendors in the database\n`);
    
    if (data && data.length > 0) {
      console.log('📋 Cart vendors:');
      data.forEach(vendor => {
        console.log(`   - ${vendor.business_name} (${vendor.city}, ${vendor.state})`);
      });
    } else {
      console.log('No cart vendors found. The database may be empty or the search function needs to be fixed.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the check
checkCartVendors();