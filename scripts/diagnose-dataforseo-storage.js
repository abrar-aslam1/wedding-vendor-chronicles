#!/usr/bin/env node

/**
 * Diagnose DataForSEO Storage Issues
 * Check if data is being stored and why costs are high
 */

import dotenv from 'dotenv';
dotenv.config();

async function diagnoseDataForSEOStorage() {
  console.log('🔍 DIAGNOSING DATAFORSEO STORAGE ISSUES');
  console.log('='.repeat(60));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check vendors_google_business table content
    console.log('📊 CHECKING vendors_google_business TABLE');
    console.log('-'.repeat(40));
    
    const response1 = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?select=*&limit=5`, {
      method: 'GET',
      headers
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Table accessible, found ${data1.length} records`);
      
      if (data1.length > 0) {
        console.log('\n📋 Sample record:');
        console.log(JSON.stringify(data1[0], null, 2));
        
        // Get total count with alternative method
        const allResponse = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?select=id`, {
          method: 'GET',
          headers
        });
        
        if (allResponse.ok) {
          const allData = await allResponse.json();
          console.log(`📊 Total records in vendors_google_business: ${allData.length}`);
        }
      } else {
        console.log('❌ Table is EMPTY - This explains the cost issue!');
      }
    } else {
      console.log(`❌ Error accessing table: ${response1.status}`);
      const errorText = await response1.text();
      console.log(`Error details: ${errorText}`);
    }

    // 2. Check vendors_google table content  
    console.log('\n📊 CHECKING vendors_google TABLE');
    console.log('-'.repeat(40));
    
    const response2 = await fetch(`${supabaseUrl}/rest/v1/vendors_google?select=*&limit=5`, {
      method: 'GET',
      headers
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ Table accessible, found ${data2.length} records`);
      
      if (data2.length > 0) {
        console.log('\n📋 Sample record:');
        console.log(JSON.stringify(data2[0], null, 2));
        
        // Get total count
        const allResponse2 = await fetch(`${supabaseUrl}/rest/v1/vendors_google?select=id`, {
          method: 'GET',
          headers
        });
        
        if (allResponse2.ok) {
          const allData2 = await allResponse2.json();
          console.log(`📊 Total records in vendors_google: ${allData2.length}`);
        }
      } else {
        console.log('❌ Table is EMPTY');
      }
    } else {
      console.log(`❌ Error accessing table: ${response2.status}`);
    }

    // 3. Check environment variables
    console.log('\n🔍 CHECKING DATAFORSEO CREDENTIALS');
    console.log('-'.repeat(40));
    
    const dataforSEOLogin = process.env.DATAFORSEO_LOGIN;
    const dataforSEOPassword = process.env.DATAFORSEO_PASSWORD;
    
    if (dataforSEOLogin && dataforSEOPassword) {
      console.log(`✅ DataForSEO credentials found`);
      console.log(`   Login: ${dataforSEOLogin}`);
      console.log(`   Password: ${dataforSEOPassword.substring(0, 4)}***`);
    } else {
      console.log('❌ Missing DataForSEO credentials!');
      console.log(`   DATAFORSEO_LOGIN: ${dataforSEOLogin ? 'Present' : 'Missing'}`);
      console.log(`   DATAFORSEO_PASSWORD: ${dataforSEOPassword ? 'Present' : 'Missing'}`);
    }

    // 4. Test simple insert to check permissions
    console.log('\n🧪 TESTING DATABASE PERMISSIONS');
    console.log('-'.repeat(40));
    
    const testRecord = {
      business_name: 'TEST_RECORD_DELETE_ME',
      place_id: `test_${Date.now()}`,
      category: 'test',
      city: 'Test City',
      state: 'TX',
      search_keyword: 'test'
    };

    try {
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/vendors_google_business`, {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testRecord)
      });

      if (insertResponse.ok) {
        const insertedData = await insertResponse.json();
        console.log('✅ Database insert permissions work');
        console.log(`   Inserted test record with ID: ${insertedData[0]?.id}`);
        
        // Clean up test record
        if (insertedData[0]?.id) {
          await fetch(`${supabaseUrl}/rest/v1/vendors_google_business?id=eq.${insertedData[0].id}`, {
            method: 'DELETE',
            headers
          });
          console.log('🧹 Test record cleaned up');
        }
      } else {
        console.log(`❌ Database insert failed: ${insertResponse.status}`);
        const errorText = await insertResponse.text();
        console.log(`Error: ${errorText}`);
      }
    } catch (insertError) {
      console.log(`❌ Database insert error: ${insertError.message}`);
    }

    // 5. Problem diagnosis
    console.log('\n' + '='.repeat(60));
    console.log('🔍 COST ISSUE DIAGNOSIS');
    console.log('='.repeat(60));

    console.log('\n💰 WHY YOUR DATAFORSEO COSTS ARE HIGH:');
    console.log('1. DataForSEO API calls are being made (you have credentials)');
    console.log('2. But Google Business listings are NOT being stored in database');
    console.log('3. So the system makes the SAME expensive API calls repeatedly');
    console.log('4. No caching = redundant charges for same data');

    console.log('\n🛠️ LIKELY CAUSES:');
    console.log('• DataForSEO script has bugs/errors that prevent storage');
    console.log('• Database schema mismatch between script and table');
    console.log('• Silent failures in the upsert operations');
    console.log('• Script is not being run or integrated properly');

    console.log('\n💡 IMMEDIATE SOLUTIONS:');
    console.log('1. Fix the DataForSEO script to actually store data');
    console.log('2. Add proper error logging to see what\'s failing');
    console.log('3. Implement deduplication checks before API calls');
    console.log('4. Add caching layer to avoid redundant API requests');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseDataForSEOStorage().catch(console.error);
