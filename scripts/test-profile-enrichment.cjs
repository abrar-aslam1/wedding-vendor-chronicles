#!/usr/bin/env node

/**
 * Test Profile Enrichment Workflow
 * 
 * Tests the complete workflow:
 * 1. Discover Instagram usernames (simulated)
 * 2. Enrich profiles with Apify actor
 * 3. Transform data for database
 * 4. Validate quality scores
 */

require('dotenv').config();
const https = require('https');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

// Test usernames (real Instagram accounts for testing)
const TEST_PROFILES = [
  'instagram',      // Instagram official
  'natgeo',        // National Geographic (verified business)
  'nasa',          // NASA (verified, public)
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
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
      timeout: 90000, // 90 second timeout for multiple profiles
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

function calculateQualityScore(profile) {
  let score = 0;
  const maxScore = 100;

  // Follower count (40 points max)
  const followerCount = profile.followersCount || 0;
  if (followerCount >= 10000) score += 40;
  else if (followerCount >= 5000) score += 30;
  else if (followerCount >= 1000) score += 20;
  else if (followerCount >= 500) score += 10;
  else if (followerCount >= 100) score += 5;

  // Verified status (20 points)
  if (profile.isVerified) score += 20;

  // Business account (10 points)
  if (profile.isBusinessAccount) score += 10;

  // Profile completeness (30 points)
  if (profile.biography && profile.biography.length > 0) score += 10;
  if (profile.externalUrl && profile.externalUrl.length > 0) score += 10;
  if (profile.postsCount && profile.postsCount > 0) score += 10;

  return Math.min(score, maxScore);
}

function transformForDatabase(profile) {
  const qualityScore = calculateQualityScore(profile);
  
  return {
    instagram_handle: profile.username,
    display_name: profile.fullName || profile.username,
    follower_count: profile.followersCount || 0,
    following_count: profile.followingCount || 0,
    post_count: profile.postsCount || 0,
    biography: profile.biography || null,
    is_verified: profile.isVerified || false,
    is_business_account: profile.isBusinessAccount || false,
    is_private: profile.isPrivate || false,
    profile_pic_url: profile.profilePicUrl || null,
    external_url: profile.externalUrl || null,
    quality_score: qualityScore,
    enriched_at: new Date().toISOString(),
  };
}

async function runTests() {
  logSection('🧪 Testing Profile Enrichment Workflow');

  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    profiles: [],
  };

  // Test 1: Check prerequisites
  log('Test 1: Checking prerequisites...', 'cyan');
  
  if (!APIFY_API_TOKEN) {
    log('❌ APIFY_API_TOKEN not found in environment', 'red');
    process.exit(1);
  }
  log('✅ APIFY_API_TOKEN found', 'green');
  log(`✅ Testing with ${TEST_PROFILES.length} profiles`, 'green');

  // Test 2: Enrich profiles
  logSection('Test 2: Enriching Profiles');
  
  log(`Fetching data for ${TEST_PROFILES.length} profiles...`, 'yellow');
  log('This may take 30-60 seconds...\n', 'yellow');

  const actorInput = {
    usernames: TEST_PROFILES,
    resultsType: 'details',
    resultsLimit: TEST_PROFILES.length,
  };

  let enrichedProfiles;
  try {
    enrichedProfiles = await callApifyActor('apify/instagram-profile-scraper', actorInput);
    log(`✅ Received data for ${enrichedProfiles.length} profiles`, 'green');
    results.total = enrichedProfiles.length;
  } catch (error) {
    log(`❌ Enrichment failed: ${error.message}`, 'red');
    process.exit(1);
  }

  // Test 3: Process each profile
  logSection('Test 3: Processing Individual Profiles');

  for (const profile of enrichedProfiles) {
    log(`\nProcessing: @${profile.username}`, 'cyan');
    
    try {
      // Validate profile data (followingCount is optional)
      const requiredFields = ['username', 'fullName', 'followersCount', 'postsCount'];
      const missingFields = requiredFields.filter(f => !(f in profile) || profile[f] === null);
      
      if (missingFields.length > 0) {
        log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`, 'yellow');
        results.failed++;
        continue;
      }

      // Transform for database
      const transformed = transformForDatabase(profile);
      
      // Calculate metrics
      const metrics = {
        followers: transformed.follower_count.toLocaleString(),
        posts: transformed.post_count.toLocaleString(),
        verified: transformed.is_verified ? '✓' : '✗',
        business: transformed.is_business_account ? '✓' : '✗',
        quality: transformed.quality_score,
        hasBio: !!transformed.biography ? '✓' : '✗',
        hasUrl: !!transformed.external_url ? '✓' : '✗',
      };

      log(`   Username: @${transformed.instagram_handle}`, 'blue');
      log(`   Display: ${transformed.display_name}`, 'blue');
      log(`   Followers: ${metrics.followers}`, 'blue');
      log(`   Posts: ${metrics.posts}`, 'blue');
      log(`   Verified: ${metrics.verified}`, metrics.verified === '✓' ? 'green' : 'yellow');
      log(`   Business: ${metrics.business}`, metrics.business === '✓' ? 'green' : 'yellow');
      log(`   Bio: ${metrics.hasBio}`, 'blue');
      log(`   URL: ${metrics.hasUrl}`, 'blue');
      log(`   Quality Score: ${metrics.quality}/100`, 
        metrics.quality >= 80 ? 'green' : metrics.quality >= 50 ? 'yellow' : 'red');
      
      results.successful++;
      results.profiles.push(transformed);
      
      log('   ✅ Profile processed successfully', 'green');
    } catch (error) {
      log(`   ❌ Processing failed: ${error.message}`, 'red');
      results.failed++;
    }
  }

  // Test 4: Quality analysis
  logSection('Test 4: Quality Analysis');

  if (results.profiles.length > 0) {
    const avgQuality = results.profiles.reduce((sum, p) => sum + p.quality_score, 0) / results.profiles.length;
    const verifiedCount = results.profiles.filter(p => p.is_verified).length;
    const businessCount = results.profiles.filter(p => p.is_business_account).length;
    const highQuality = results.profiles.filter(p => p.quality_score >= 80).length;
    const mediumQuality = results.profiles.filter(p => p.quality_score >= 50 && p.quality_score < 80).length;
    const lowQuality = results.profiles.filter(p => p.quality_score < 50).length;

    log('Quality Distribution:', 'yellow');
    log(`   Average Quality Score: ${avgQuality.toFixed(1)}/100`, 'blue');
    log(`   High Quality (≥80): ${highQuality}`, highQuality > 0 ? 'green' : 'yellow');
    log(`   Medium Quality (50-79): ${mediumQuality}`, 'yellow');
    log(`   Low Quality (<50): ${lowQuality}`, lowQuality > 0 ? 'red' : 'green');
    log('', 'reset');
    log('Account Types:', 'yellow');
    log(`   Verified Accounts: ${verifiedCount}/${results.profiles.length}`, 'blue');
    log(`   Business Accounts: ${businessCount}/${results.profiles.length}`, 'blue');
  }

  // Test 5: Database format validation
  logSection('Test 5: Database Format Validation');

  if (results.profiles.length > 0) {
    const sampleProfile = results.profiles[0];
    const expectedFields = [
      'instagram_handle',
      'display_name',
      'follower_count',
      'following_count',
      'post_count',
      'biography',
      'is_verified',
      'is_business_account',
      'is_private',
      'profile_pic_url',
      'external_url',
      'quality_score',
      'enriched_at',
    ];

    log('Checking database schema compatibility...', 'cyan');
    
    const allFieldsPresent = expectedFields.every(field => field in sampleProfile);
    
    if (allFieldsPresent) {
      log('✅ All required database fields present', 'green');
      log(`   Total fields: ${expectedFields.length}`, 'blue');
    } else {
      const missing = expectedFields.filter(f => !(f in sampleProfile));
      log('❌ Missing database fields:', 'red');
      missing.forEach(f => log(`   - ${f}`, 'red'));
    }

    // Check data types
    log('\nValidating data types...', 'cyan');
    const typeChecks = [
      { field: 'instagram_handle', type: 'string', value: sampleProfile.instagram_handle },
      { field: 'follower_count', type: 'number', value: sampleProfile.follower_count },
      { field: 'is_verified', type: 'boolean', value: sampleProfile.is_verified },
      { field: 'quality_score', type: 'number', value: sampleProfile.quality_score },
    ];

    let typeErrors = 0;
    typeChecks.forEach(check => {
      const actualType = typeof check.value;
      if (actualType === check.type) {
        log(`   ✅ ${check.field}: ${check.type}`, 'green');
      } else {
        log(`   ❌ ${check.field}: expected ${check.type}, got ${actualType}`, 'red');
        typeErrors++;
      }
    });

    if (typeErrors === 0) {
      log('\n✅ All data types correct', 'green');
    }
  }

  // Final summary
  logSection('📊 Final Summary');
  
  log(`Total Profiles: ${results.total}`, 'blue');
  log(`Successful: ${results.successful}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`, 
    results.successful === results.total ? 'green' : 'yellow');

  if (results.successful > 0) {
    log('\n✅ Profile enrichment workflow is working!', 'green');
    log('\nNext steps:', 'cyan');
    log('   1. Proceed to Agent 3 (Database & Ingest API)', 'yellow');
    log('   2. Create Supabase ingest endpoint', 'yellow');
    log('   3. Start collecting real vendor data', 'yellow');
  } else {
    log('\n❌ Profile enrichment workflow has issues', 'red');
    log('   Please review errors above and troubleshoot', 'yellow');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
log('Starting profile enrichment tests...', 'bright');
log('This will test the complete workflow from discovery to database format.\n', 'cyan');

runTests().catch(error => {
  log('\n💥 Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});
