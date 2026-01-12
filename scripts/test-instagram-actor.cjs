#!/usr/bin/env node

/**
 * Test Instagram Profile Scraper Actor
 * 
 * Tests the apify/instagram-profile-scraper actor
 * to ensure it can fetch and return profile data correctly.
 */

require('dotenv').config();
const https = require('https');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const TEST_USERNAME = 'instagram'; // Instagram's official account

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'bright');
  console.log('='.repeat(50) + '\n');
}

async function callApifyActor(actorId, input) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(input);
    
    // URL encode the actor ID
    const encodedActorId = encodeURIComponent(actorId);
    
    const options = {
      hostname: 'api.apify.com',
      path: `/v2/acts/${encodedActorId}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
      timeout: 60000, // 60 second timeout
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const result = JSON.parse(body);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(data);
    req.end();
  });
}

function validateProfileData(profile) {
  const requiredFields = [
    'username',
    'fullName',
    'followersCount',
    'postsCount',
  ];

  const optionalFields = [
    'followingCount', // Sometimes hidden by Instagram
    'biography',
    'isVerified',
    'isBusinessAccount',
    'isPrivate',
    'profilePicUrl',
    'externalUrl',
  ];

  const issues = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in profile)) {
      issues.push(`Missing required field: ${field}`);
    } else if (profile[field] === null || profile[field] === undefined) {
      issues.push(`Required field is null/undefined: ${field}`);
    }
  }

  // Check field types
  if (profile.username && typeof profile.username !== 'string') {
    issues.push(`username should be string, got ${typeof profile.username}`);
  }
  if (profile.followersCount && typeof profile.followersCount !== 'number') {
    issues.push(`followersCount should be number, got ${typeof profile.followersCount}`);
  }
  if (profile.followingCount && typeof profile.followingCount !== 'number') {
    issues.push(`followingCount should be number, got ${typeof profile.followingCount}`);
  }
  if (profile.postsCount && typeof profile.postsCount !== 'number') {
    issues.push(`postsCount should be number, got ${typeof profile.postsCount}`);
  }

  return {
    valid: issues.length === 0,
    issues,
    optionalFieldsPresent: optionalFields.filter(f => f in profile && profile[f] !== null),
  };
}

async function runTests() {
  logSection('🧪 Testing Instagram Profile Scraper Actor');

  // Test 1: Check prerequisites
  log('Test 1: Checking prerequisites...', 'cyan');
  
  if (!APIFY_API_TOKEN) {
    log('❌ APIFY_API_TOKEN not found in environment', 'red');
    process.exit(1);
  }
  log('✅ APIFY_API_TOKEN found', 'green');

  // Test 2: Call actor with test profile
  log('\nTest 2: Calling Instagram Profile Scraper actor...', 'cyan');
  log(`   Target: @${TEST_USERNAME}`, 'yellow');
  
  const actorInput = {
    usernames: [TEST_USERNAME],
    resultsType: 'details',
    resultsLimit: 1,
  };

  let profileData;
  try {
    log('   Sending request to Apify...', 'yellow');
    const result = await callApifyActor('apify/instagram-profile-scraper', actorInput);
    
    if (!result || result.length === 0) {
      log('❌ No data returned from actor', 'red');
      process.exit(1);
    }

    profileData = result[0];
    log('✅ Actor returned data', 'green');
    log(`   Records received: ${result.length}`, 'yellow');
  } catch (error) {
    log(`❌ Actor call failed: ${error.message}`, 'red');
    process.exit(1);
  }

  // Test 3: Validate data structure
  log('\nTest 3: Validating data structure...', 'cyan');
  
  const validation = validateProfileData(profileData);
  
  if (!validation.valid) {
    log('❌ Data validation failed:', 'red');
    validation.issues.forEach(issue => {
      log(`   - ${issue}`, 'red');
    });
    process.exit(1);
  }
  
  log('✅ All required fields present and valid', 'green');
  log(`   Optional fields present: ${validation.optionalFieldsPresent.length}`, 'yellow');

  // Test 4: Display sample data
  log('\nTest 4: Sample profile data...', 'cyan');
  
  const displayData = {
    username: profileData.username,
    fullName: profileData.fullName,
    followersCount: profileData.followersCount?.toLocaleString() || 0,
    followingCount: profileData.followingCount?.toLocaleString() || 0,
    postsCount: profileData.postsCount?.toLocaleString() || 0,
    isVerified: profileData.isVerified || false,
    isBusinessAccount: profileData.isBusinessAccount || false,
    isPrivate: profileData.isPrivate || false,
    hasBio: !!profileData.biography,
    hasExternalUrl: !!profileData.externalUrl,
  };

  log('   Profile summary:', 'yellow');
  Object.entries(displayData).forEach(([key, value]) => {
    log(`   ${key}: ${value}`, 'blue');
  });

  // Test 5: Check data quality
  log('\nTest 5: Data quality checks...', 'cyan');
  
  const qualityChecks = [
    {
      name: 'Has followers',
      pass: profileData.followersCount > 0,
    },
    {
      name: 'Username matches',
      pass: profileData.username === TEST_USERNAME,
    },
    {
      name: 'Has display name',
      pass: profileData.fullName && profileData.fullName.length > 0,
    },
    {
      name: 'Has posts',
      pass: profileData.postsCount > 0,
    },
  ];

  let allPassed = true;
  qualityChecks.forEach(check => {
    if (check.pass) {
      log(`   ✅ ${check.name}`, 'green');
    } else {
      log(`   ⚠️  ${check.name}`, 'yellow');
      allPassed = false;
    }
  });

  // Final summary
  logSection('📊 Test Summary');
  
  if (allPassed) {
    log('✅ All tests PASSED', 'green');
    log('\nThe Instagram Profile Scraper actor is working correctly!', 'bright');
    log('You can now proceed with profile enrichment.', 'cyan');
    process.exit(0);
  } else {
    log('⚠️  Tests passed with warnings', 'yellow');
    log('\nThe actor works but some quality checks failed.', 'bright');
    log('This may be normal for certain profiles.', 'cyan');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  log('\n💥 Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});
