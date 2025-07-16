#!/usr/bin/env node

import https from 'https';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

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
      path: '/v3/business_data/google/my_business_listings/live',
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

async function debugDataForSEO() {
  console.log('🔍 Debug DataForSEO API Response\n');
  
  console.log('Credentials:', {
    login: DATAFORSEO_LOGIN ? '✅ Found' : '❌ Missing',
    password: DATAFORSEO_PASSWORD ? '✅ Found' : '❌ Missing'
  });

  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('❌ Missing credentials');
    return;
  }

  try {
    // Test with a broader search first
    console.log('\n🧪 Test 1: Searching for "coffee" in Los Angeles (location_code: 2840)');
    const response1 = await makeDataForSEORequest("coffee", 2840);
    console.log('Raw response:', JSON.stringify(response1, null, 2));

    if (response1.results && response1.results.length > 0) {
      console.log(`✅ Found ${response1.results[0].items?.length || 0} results`);
    } else {
      console.log('❌ No results found');
    }

    // Test with specific cart search
    console.log('\n🧪 Test 2: Searching for "coffee cart" in Los Angeles');
    const response2 = await makeDataForSEORequest("coffee cart", 2840);
    console.log('Raw response:', JSON.stringify(response2, null, 2));

    if (response2.results && response2.results.length > 0) {
      console.log(`✅ Found ${response2.results[0].items?.length || 0} results`);
    } else {
      console.log('❌ No results found');
    }

    // Test with different location
    console.log('\n🧪 Test 3: Searching for "mobile bar" in New York (location_code: 1023191)');
    const response3 = await makeDataForSEORequest("mobile bar", 1023191);
    console.log('Raw response:', JSON.stringify(response3, null, 2));

    if (response3.results && response3.results.length > 0) {
      console.log(`✅ Found ${response3.results[0].items?.length || 0} results`);
    } else {
      console.log('❌ No results found');
    }

  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

debugDataForSEO();