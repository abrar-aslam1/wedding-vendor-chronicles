/**
 * Debug Search Requests
 * 
 * This script helps debug differences between frontend and curl requests
 * by testing various request formats and logging detailed information.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wpbdveyuuudhmwflrmqw.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test using Supabase client (simulates frontend)
 */
async function testSupabaseClient() {
  console.log('🔍 Testing with Supabase Client (Frontend simulation)');
  console.log('=' .repeat(60));
  
  const testPayload = {
    keyword: 'photographers',
    location: 'Dallas, TX',
    subcategory: null
  };
  
  console.log('Request payload:', JSON.stringify(testPayload, null, 2));
  
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke('search-vendors', {
      body: testPayload
    });
    const endTime = Date.now();
    
    console.log(`Request completed in ${endTime - startTime}ms`);
    
    if (error) {
      console.log('❌ Error:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Success!');
      console.log(`Results count: ${Array.isArray(data) ? data.length : 'Invalid format'}`);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First result:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    console.log('Stack:', err.stack);
  }
  
  console.log('\n');
}

/**
 * Test using direct fetch (simulates curl)
 */
async function testDirectFetch() {
  console.log('🌐 Testing with Direct Fetch (cURL simulation)');
  console.log('=' .repeat(60));
  
  const testPayload = {
    keyword: 'photographers',
    location: 'Dallas, TX',
    subcategory: null
  };
  
  const url = `${SUPABASE_URL}/functions/v1/search-vendors`;
  
  console.log('URL:', url);
  console.log('Request payload:', JSON.stringify(testPayload, null, 2));
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  };
  
  console.log('Headers:');
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'apikey') {
      console.log(`  ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  });
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testPayload)
    });
    const endTime = Date.now();
    
    console.log(`Request completed in ${endTime - startTime}ms`);
    console.log('Response status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const responseText = await response.text();
    console.log('Response body length:', responseText.length);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Success!');
        console.log(`Results count: ${Array.isArray(data) ? data.length : 'Invalid format'}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log('First result title:', data[0].title);
        }
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
        console.log('Raw response:', responseText.substring(0, 500));
      }
    } else {
      console.log('❌ HTTP Error:', response.status);
      console.log('Response body:', responseText);
    }
  } catch (err) {
    console.log('❌ Fetch exception:', err.message);
    console.log('Stack:', err.stack);
  }
  
  console.log('\n');
}

/**
 * Test with missing authentication
 */
async function testNoAuth() {
  console.log('🚫 Testing without Authentication');
  console.log('=' .repeat(60));
  
  const testPayload = {
    keyword: 'photographers',
    location: 'Dallas, TX',
    subcategory: null
  };
  
  const url = `${SUPABASE_URL}/functions/v1/search-vendors`;
  
  const headers = {
    'Content-Type': 'application/json'
    // No auth headers
  };
  
  console.log('Headers (no auth):', headers);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testPayload)
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText.substring(0, 200));
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
  
  console.log('\n');
}

/**
 * Test with malformed JSON
 */
async function testMalformedJSON() {
  console.log('💥 Testing with Malformed JSON');
  console.log('=' .repeat(60));
  
  const malformedPayload = '{"keyword": "photographers", "location": "Dallas, TX"'; // Missing closing brace
  
  const url = `${SUPABASE_URL}/functions/v1/search-vendors`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  };
  
  console.log('Malformed payload:', malformedPayload);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: malformedPayload
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
  
  console.log('\n');
}

/**
 * Test with different content types
 */
async function testDifferentContentTypes() {
  console.log('📝 Testing with Different Content Types');
  console.log('=' .repeat(60));
  
  const testPayload = {
    keyword: 'photographers',
    location: 'Dallas, TX',
    subcategory: null
  };
  
  const url = `${SUPABASE_URL}/functions/v1/search-vendors`;
  
  const contentTypes = [
    'application/json',
    'text/plain',
    'application/x-www-form-urlencoded',
    undefined // No content type
  ];
  
  for (const contentType of contentTypes) {
    console.log(`Testing with Content-Type: ${contentType || 'undefined'}`);
    
    const headers = {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY
    };
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testPayload)
      });
      
      console.log(`  Status: ${response.status}`);
      const responseText = await response.text();
      console.log(`  Response: ${responseText.substring(0, 100)}...`);
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`);
    }
    
    console.log('');
  }
}

/**
 * Generate curl command for manual testing
 */
function generateCurlCommand() {
  console.log('📋 Generated cURL Command');
  console.log('=' .repeat(60));
  
  const testPayload = {
    keyword: 'photographers',
    location: 'Dallas, TX',
    subcategory: null
  };
  
  const url = `${SUPABASE_URL}/functions/v1/search-vendors`;
  
  const curlCommand = `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\
  -H "apikey: ${SUPABASE_ANON_KEY}" \\
  -d '${JSON.stringify(testPayload)}'`;
  
  console.log(curlCommand);
  console.log('\n');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting Search Request Debugging');
  console.log('=' .repeat(80));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('=' .repeat(80));
  console.log('\n');
  
  // Test 1: Supabase client (frontend simulation)
  await testSupabaseClient();
  
  // Test 2: Direct fetch (curl simulation)
  await testDirectFetch();
  
  // Test 3: No authentication
  await testNoAuth();
  
  // Test 4: Malformed JSON
  await testMalformedJSON();
  
  // Test 5: Different content types
  await testDifferentContentTypes();
  
  // Generate curl command
  generateCurlCommand();
  
  console.log('🏁 All tests completed!');
}

// Run the tests
runAllTests().catch(console.error);
