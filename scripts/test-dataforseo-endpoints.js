#!/usr/bin/env node

import https from 'https';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

async function testDataForSEOEndpoint(endpoint, keyword, locationCode) {
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
      path: endpoint,
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
          resolve({ status: res.statusCode, response });
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

async function testEndpoints() {
  console.log('🧪 Testing DataForSEO Endpoints\n');
  
  const endpoints = [
    '/v3/business_data/google/my_business_listings/live',
    '/v3/business_data/google/my_business_info/live',
    '/v3/business_data/google/search/live',
    '/v3/business_data/google/places/live',
    '/v3/business_data/google/maps/live'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint}`);
    try {
      const result = await testDataForSEOEndpoint(endpoint, "coffee", 2840);
      console.log(`Status: ${result.status}`);
      console.log(`Response: ${JSON.stringify(result.response, null, 2)}`);
      
      if (result.status === 200 && result.response.results) {
        console.log(`✅ SUCCESS: Found ${result.response.results[0]?.items?.length || 0} results`);
      } else if (result.status === 404) {
        console.log(`❌ ENDPOINT NOT FOUND`);
      } else {
        console.log(`⚠️  Status: ${result.status}`);
      }
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testEndpoints();