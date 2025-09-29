#!/usr/bin/env node

/**
 * Test DataForSEO Collection System - Single City/Category Test
 */

import https from 'https';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeDataForSEORequest(keyword, locationCode) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([{
      keyword: keyword,
      location_code: locationCode,
      language_code: "en",
      device: "desktop",
      os: "windows"
    }]);

    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: '/v3/business_data/business_listings/search/live',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testDataForSEOCollection() {
  console.log('🧪 Testing DataForSEO Collection System');
  console.log('======================================');
  
  // Verify credentials
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('❌ Missing DataForSEO credentials');
    console.log('Please check your .env file has:');
    console.log('DATAFORSEO_LOGIN=your_login');
    console.log('DATAFORSEO_PASSWORD=your_password');
    return;
  }
  
  console.log(`✅ Credentials found for: ${DATAFORSEO_LOGIN}`);
  
  // Test search
  console.log('\n🔍 Testing search: "coffee cart" in Los Angeles');
  
  try {
    const response = await makeDataForSEORequest("coffee cart", 2840); // LA location code
    
    console.log('\n📊 API Response Analysis:');
    console.log('Status:', response.status_code);
    console.log('Status message:', response.status_message);
    
    if (response.tasks && response.tasks[0]) {
      const task = response.tasks[0];
      console.log('Task status:', task.status_message);
      
      if (task.result && task.result[0] && task.result[0].items) {
        const items = task.result[0].items;
        console.log(`✅ Found ${items.length} businesses`);
        
        // Show first few results
        console.log('\n📋 Sample Results:');
        items.slice(0, 3).forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.title || 'No title'}`);
          console.log(`   Address: ${item.address || 'No address'}`);
          console.log(`   Phone: ${item.phone || 'No phone'}`);
          console.log(`   Rating: ${item.rating || 'No rating'} (${item.reviews_count || 0} reviews)`);
          console.log(`   Category: ${item.category || 'No category'}`);
          console.log(`   Website: ${item.domain || 'No website'}`);
          console.log(`   Place ID: ${item.place_id || 'No place ID'}`);
        });
        
        // Test database insertion with first result
        if (items.length > 0) {
          console.log('\n💾 Testing database insertion...');
          
          const testVendor = {
            business_name: items[0].title || 'Test Business',
            place_id: items[0].place_id || `test_${Date.now()}`,
            phone: items[0].phone || null,
            website: items[0].domain || null,
            address: items[0].address || null,
            city: 'Los Angeles',
            state: 'CA',
            country: 'US',
            category: 'coffee-carts',
            rating: items[0].rating ? parseFloat(items[0].rating) : null,
            reviews_count: items[0].reviews_count || 0,
            search_keyword: 'coffee cart',
            location_searched: 'Los Angeles, CA'
          };
          
          try {
            const { data, error } = await supabase
              .from('vendors_google_business')
              .upsert([testVendor], {
                onConflict: 'place_id',
                ignoreDuplicates: false
              });
            
            if (error) {
              console.error('❌ Database insertion failed:', error);
            } else {
              console.log('✅ Database insertion successful!');
              
              // Verify insertion
              const { data: verifyData, error: verifyError } = await supabase
                .from('vendors_google_business')
                .select('*')
                .eq('place_id', testVendor.place_id)
                .single();
              
              if (verifyError) {
                console.error('❌ Verification failed:', verifyError);
              } else {
                console.log('✅ Data verified in database:', verifyData.business_name);
              }
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }
        }
        
        console.log('\n🎉 Test completed successfully!');
        console.log('The system is ready for full collection.');
        
      } else {
        console.log('❌ No business results found in API response');
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
    } else {
      console.log('❌ Unexpected API response structure');
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API request failed:', error);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your internet connection');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('💡 Check your DataForSEO credentials');
    } else {
      console.log('💡 Check your DataForSEO account status and API limits');
    }
  }
}

testDataForSEOCollection();
