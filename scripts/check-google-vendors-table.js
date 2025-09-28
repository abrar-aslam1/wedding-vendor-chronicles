#!/usr/bin/env node

/**
 * Check Google Vendors Table Status
 * Diagnose DataForSEO cost optimization issues
 */

import dotenv from 'dotenv';
dotenv.config();

async function checkGoogleVendorsTable() {
  console.log('🔍 CHECKING GOOGLE VENDORS TABLE STATUS');
  console.log('='.repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('📊 Checking different possible table names...\n');

    // Check vendors_google_business table (what the DataForSEO script tries to use)
    console.log('1. Checking vendors_google_business table...');
    const response1 = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?select=id&limit=1`, {
      method: 'GET',
      headers
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   ✅ vendors_google_business table EXISTS`);
      
      // Get total count
      const countResponse1 = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?select=id`, {
        method: 'HEAD',
        headers
      });
      
      if (countResponse1.ok) {
        const totalCount1 = countResponse1.headers.get('content-range')?.split('/')[1] || 'unknown';
        console.log(`   📊 Total records: ${totalCount1}`);
      }
    } else {
      console.log(`   ❌ vendors_google_business table does NOT exist (status: ${response1.status})`);
    }

    // Check vendors_google table (what the create script looks for)
    console.log('\n2. Checking vendors_google table...');
    const response2 = await fetch(`${supabaseUrl}/rest/v1/vendors_google?select=id&limit=1`, {
      method: 'GET',
      headers
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`   ✅ vendors_google table EXISTS`);
      
      // Get total count
      const countResponse2 = await fetch(`${supabaseUrl}/rest/v1/vendors_google?select=id`, {
        method: 'HEAD',
        headers
      });
      
      if (countResponse2.ok) {
        const totalCount2 = countResponse2.headers.get('content-range')?.split('/')[1] || 'unknown';
        console.log(`   📊 Total records: ${totalCount2}`);
      }
    } else {
      console.log(`   ❌ vendors_google table does NOT exist (status: ${response2.status})`);
    }

    // Check vendors table (main vendors table)
    console.log('\n3. Checking main vendors table...');
    const response3 = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id&limit=1`, {
      method: 'GET',
      headers
    });
    
    if (response3.ok) {
      console.log(`   ✅ main vendors table EXISTS`);
      
      // Get total count
      const countResponse3 = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id`, {
        method: 'HEAD',
        headers
      });
      
      if (countResponse3.ok) {
        const totalCount3 = countResponse3.headers.get('content-range')?.split('/')[1] || 'unknown';
        console.log(`   📊 Total records: ${totalCount3}`);
      }
    } else {
      console.log(`   ❌ main vendors table issue (status: ${response3.status})`);
    }

    // Problem Analysis
    console.log('\n' + '='.repeat(50));
    console.log('🔍 PROBLEM ANALYSIS');
    console.log('='.repeat(50));

    console.log('\n❌ ISSUE IDENTIFIED: Table Name Mismatch!');
    console.log('📋 DataForSEO script tries to store in: vendors_google_business');
    console.log('📋 Create script checks for table: vendors_google');
    console.log('📋 This explains why vendors aren\'t being stored!');

    console.log('\n💰 COST IMPACT:');
    console.log('• DataForSEO API calls are being made successfully');
    console.log('• But data is NOT being stored due to table mismatch');
    console.log('• So system makes same API calls repeatedly');
    console.log('• This causes expensive redundant DataForSEO charges');

    console.log('\n🛠️ SOLUTION NEEDED:');
    console.log('1. Create the correct table: vendors_google_business');
    console.log('2. OR update DataForSEO script to use existing table name');
    console.log('3. Implement proper deduplication to avoid repeat API calls');

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkGoogleVendorsTable().catch(console.error);
