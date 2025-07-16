#!/usr/bin/env node

import https from 'https';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

async function testCorrectEndpoint(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([payload]);

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

async function findCorrectEndpoint() {
  console.log('🔍 Testing Correct DataForSEO Endpoints\n');
  
  // Test the Google Maps endpoint with proper payload
  console.log('🧪 Test 1: Google Maps with location search');
  try {
    const result1 = await testCorrectEndpoint('/v3/business_data/google/maps/live', {
      keyword: "coffee cart",
      location_name: "Los Angeles, CA, United States",
      language_code: "en",
      device: "desktop",
      os: "windows"
    });
    console.log(`Status: ${result1.status}`);
    console.log(`Response: ${JSON.stringify(result1.response, null, 2)}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test with search volume endpoint
  console.log('\n🧪 Test 2: Business listings search');
  try {
    const result2 = await testCorrectEndpoint('/v3/business_data/google/search/live', {
      keyword: "coffee cart wedding",
      location_code: 2840,
      language_code: "en",
      device: "desktop",
      os: "windows"
    });
    console.log(`Status: ${result2.status}`);
    console.log(`Response: ${JSON.stringify(result2.response, null, 2)}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test with simpler endpoint
  console.log('\n🧪 Test 3: Maps basic search');
  try {
    const result3 = await testCorrectEndpoint('/v3/business_data/google/maps/live', {
      keyword: "coffee",
      location_code: 2840,
      language_code: "en"
    });
    console.log(`Status: ${result3.status}`);
    console.log(`Response: ${JSON.stringify(result3.response, null, 2)}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the correct Google Maps endpoint
  console.log('\n🧪 Test 4: Google Maps (correct format)');
  try {
    const result4 = await testCorrectEndpoint('/v3/business_data/google/maps/live', {
      keyword: "mobile coffee cart",
      location_coordinate: "34.0522,-118.2437", // Los Angeles coordinates
      language_code: "en",
      device: "desktop",
      os: "windows"
    });
    console.log(`Status: ${result4.status}`);
    console.log(`Response: ${JSON.stringify(result4.response, null, 2)}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

findCorrectEndpoint();