#!/usr/bin/env node

/**
 * Apify MCP Connection Test
 * Tests connectivity to Apify MCP server and validates authentication
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('🔌 Testing Apify MCP Connection');
console.log('================================\n');

let testsPassed = 0;
let testsFailed = 0;

/**
 * Simulated MCP connection test
 * In production, this would use actual MCP server calls
 */
async function testMCPConnection() {
  console.log('Test 1: MCP Server Accessibility');
  
  try {
    // Check if we have the token
    const token = process.env.APIFY_API_TOKEN;
    
    if (!token || token.includes('your_') || token.trim() === '') {
      console.log('   ❌ APIFY_API_TOKEN not configured');
      console.log('      Please set APIFY_API_TOKEN in your .env file\n');
      testsFailed++;
      return false;
    }
    
    console.log('   ✅ APIFY_API_TOKEN found');
    testsPassed++;
    
    // In production, this would actually call the MCP server
    // For now, we simulate the connection
    console.log('   ℹ️  Note: This is a simulated test');
    console.log('      Actual MCP calls require MCP server running\n');
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    testsFailed++;
    return false;
  }
}

/**
 * Test Apify API authentication directly
 */
async function testApifyAuthentication() {
  console.log('Test 2: Apify API Authentication');
  
  try {
    const token = process.env.APIFY_API_TOKEN;
    
    if (!token) {
      console.log('   ⏭️  Skipped (no token)\n');
      return false;
    }
    
    // Direct API test to Apify
    const response = await fetch('https://api.apify.com/v2/acts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Authentication successful');
      const data = await response.json();
      console.log(`   ℹ️  Can access Apify API (${data.data?.count || 0} actors available)\n`);
      testsPassed++;
      return true;
    } else {
      console.log(`   ❌ Authentication failed: ${response.status} ${response.statusText}`);
      console.log('      Please check your APIFY_API_TOKEN\n');
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    testsFailed++;
    return false;
  }
}

/**
 * Check if Instagram scraper actor is available
 */
async function testInstagramActorAvailability() {
  console.log('Test 3: Instagram Scraper Actor Availability');
  
  try {
    const token = process.env.APIFY_API_TOKEN;
    
    if (!token) {
      console.log('   ⏭️  Skipped (no token)\n');
      return false;
    }
    
    // Check if the instagram-profile-scraper actor exists
    const response = await fetch('https://api.apify.com/v2/store/actors/apify~instagram-profile-scraper', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Instagram Profile Scraper actor found');
      const actor = await response.json();
      console.log(`   ℹ️  Actor: ${actor.data.name}`);
      console.log(`   ℹ️  Version: ${actor.data.currentVersion}\n`);
      testsPassed++;
      return true;
    } else {
      console.log(`   ⚠️  Could not verify actor (${response.status})`);
      console.log('      This may be a permission issue\n');
      testsFailed++;
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check actor: ${error.message}\n`);
    testsFailed++;
    return false;
  }
}

/**
 * Test rate limiting configuration
 */
function testRateLimiting() {
  console.log('Test 4: Rate Limiting Configuration');
  
  const rps = process.env.MCP_APIFY_RPS;
  const burst = process.env.MCP_APIFY_BURST;
  
  if (!rps || !burst) {
    console.log('   ⚠️  Rate limiting not configured');
    console.log('      Set MCP_APIFY_RPS and MCP_APIFY_BURST in .env\n');
    testsFailed++;
    return false;
  }
  
  console.log(`   ✅ Rate limiting configured`);
  console.log(`   ℹ️  RPS: ${rps}, Burst: ${burst}\n`);
  testsPassed++;
  return true;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Running connection tests...\n');
  
  await testMCPConnection();
  await testApifyAuthentication();
  await testInstagramActorAvailability();
  testRateLimiting();
  
  // Summary
  console.log('================================');
  console.log('Test Summary');
  console.log('================================');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}\n`);
  
  if (testsFailed === 0) {
    console.log('🎉 All tests passed!');
    console.log('\nYou\'re ready to proceed with:');
    console.log('  - node scripts/test-instagram-actor.js');
    console.log('  - node scripts/test-profile-enrichment.js\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review errors above.\n');
    console.log('Common fixes:');
    console.log('  1. Ensure .env file exists with APIFY_API_TOKEN');
    console.log('  2. Verify token is valid in Apify Console');
    console.log('  3. Check network connectivity\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
