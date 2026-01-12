#!/usr/bin/env node

/**
 * Apify Configuration Validator
 * Validates all environment variables and connections needed for Instagram collection
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

console.log('🔍 Apify Configuration Validator');
console.log('=====================================\n');

let hasErrors = false;
let hasWarnings = false;

// Validation results
const results = {
  required: [],
  optional: [],
  connections: [],
  warnings: []
};

/**
 * Check if a required environment variable exists
 */
function checkRequired(varName, description) {
  const value = process.env[varName];
  const exists = value && value.trim() !== '' && !value.includes('your_');
  
  results.required.push({
    name: varName,
    exists,
    description,
    value: exists ? '***' + value.slice(-4) : 'NOT SET'
  });
  
  if (!exists) {
    hasErrors = true;
  }
  
  return exists;
}

/**
 * Check optional environment variable
 */
function checkOptional(varName, description) {
  const value = process.env[varName];
  const exists = value && value.trim() !== '';
  
  results.optional.push({
    name: varName,
    exists,
    description
  });
  
  return exists;
}

/**
 * Validate rate limiting values
 */
function validateRateLimits() {
  const rps = parseInt(process.env.MCP_APIFY_RPS || '0');
  const burst = parseInt(process.env.MCP_APIFY_BURST || '0');
  
  if (rps > 5) {
    results.warnings.push('⚠️  MCP_APIFY_RPS > 5 may cause rate limiting. Start with 1-2.');
    hasWarnings = true;
  }
  
  if (burst > 10) {
    results.warnings.push('⚠️  MCP_APIFY_BURST > 10 may cause rate limiting. Start with 3-5.');
    hasWarnings = true;
  }
  
  if (rps === 0 || burst === 0) {
    results.warnings.push('⚠️  Rate limits not set. Using defaults may cause issues.');
    hasWarnings = true;
  }
  
  return { rps, burst };
}

/**
 * Validate collection parameters
 */
function validateCollectionParams() {
  const tier = parseInt(process.env.TIER || '0');
  const limitPerRow = parseInt(process.env.LIMIT_PER_ROW || '0');
  const maxEnrich = parseInt(process.env.MAX_ENRICH || '0');
  
  if (maxEnrich > 1000) {
    results.warnings.push('⚠️  MAX_ENRICH > 1000 may be expensive. Start with 100-400.');
    hasWarnings = true;
  }
  
  if (limitPerRow > 100) {
    results.warnings.push('⚠️  LIMIT_PER_ROW > 100 may cause memory issues. Start with 20-40.');
    hasWarnings = true;
  }
  
  return { tier, limitPerRow, maxEnrich };
}

/**
 * Test Supabase connection
 */
async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    results.connections.push({
      service: 'Supabase',
      status: 'FAILED',
      message: 'Missing credentials'
    });
    hasErrors = true;
    return false;
  }
  
  try {
    const supabase = createClient(url, key);
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('vendors')
      .select('count')
      .limit(1);
    
    if (error) {
      results.connections.push({
        service: 'Supabase',
        status: 'FAILED',
        message: error.message
      });
      hasErrors = true;
      return false;
    }
    
    results.connections.push({
      service: 'Supabase',
      status: 'SUCCESS',
      message: 'Connected successfully'
    });
    return true;
    
  } catch (error) {
    results.connections.push({
      service: 'Supabase',
      status: 'FAILED',
      message: error.message
    });
    hasErrors = true;
    return false;
  }
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  const files = [
    { path: '.env', required: true },
    { path: 'data/ig_mcp_apify_seed.csv', required: true },
    { path: 'automations/ig/backfill-tier.yml', required: true },
    { path: 'automations/ig/backfill-city.yml', required: true }
  ];
  
  console.log('\n📁 Checking required files...');
  
  files.forEach(file => {
    const fullPath = join(process.cwd(), file.path);
    const exists = existsSync(fullPath);
    
    if (file.required && !exists) {
      console.log(`   ❌ Missing: ${file.path}`);
      hasErrors = true;
    } else if (exists) {
      console.log(`   ✅ Found: ${file.path}`);
    }
  });
}

/**
 * Main validation function
 */
async function validateConfiguration() {
  console.log('📋 Checking required environment variables...\n');
  
  // Required variables
  checkRequired('APIFY_API_TOKEN', 'Apify API authentication token');
  checkRequired('APP_URL', 'Application base URL');
  checkRequired('INGEST_SHARED_KEY', 'Ingest API authentication key');
  checkRequired('MCP_APIFY_RPS', 'Rate limit: requests per second');
  checkRequired('MCP_APIFY_BURST', 'Rate limit: burst capacity');
  
  const hasSupabaseUrl = checkRequired(
    'NEXT_PUBLIC_SUPABASE_URL', 
    'Supabase project URL'
  ) || checkRequired('VITE_SUPABASE_URL', 'Supabase project URL (alt)');
  
  checkRequired('SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role key');
  
  // Collection parameters
  checkRequired('TIER', 'City tier to process');
  checkRequired('LIMIT_PER_ROW', 'Results per search term');
  checkRequired('MAX_ENRICH', 'Max profiles to enrich');
  
  // Optional variables
  console.log('\n📋 Checking optional variables...\n');
  checkOptional('SLACK_WEBHOOK_URL', 'Slack notifications');
  checkOptional('ERROR_NOTIFICATION_EMAIL', 'Error email alerts');
  
  // Validate rate limits
  console.log('\n⚡ Validating rate limits...\n');
  const { rps, burst } = validateRateLimits();
  console.log(`   RPS: ${rps}, Burst: ${burst}`);
  
  // Validate collection params
  console.log('\n📊 Validating collection parameters...\n');
  const { tier, limitPerRow, maxEnrich } = validateCollectionParams();
  console.log(`   Tier: ${tier}, Limit/Row: ${limitPerRow}, Max Enrich: ${maxEnrich}`);
  
  // Check required files
  checkRequiredFiles();
  
  // Test connections
  console.log('\n🔌 Testing connections...\n');
  await testSupabaseConnection();
  
  // Print results summary
  console.log('\n=====================================');
  console.log('📊 VALIDATION SUMMARY');
  console.log('=====================================\n');
  
  // Required variables
  console.log('Required Variables:');
  results.required.forEach(item => {
    const icon = item.exists ? '✅' : '❌';
    console.log(`   ${icon} ${item.name}: ${item.exists ? 'SET' : 'MISSING'}`);
  });
  
  // Optional variables
  if (results.optional.length > 0) {
    console.log('\nOptional Variables:');
    results.optional.forEach(item => {
      const icon = item.exists ? '✅' : 'ℹ️ ';
      console.log(`   ${icon} ${item.name}: ${item.exists ? 'SET' : 'NOT SET'}`);
    });
  }
  
  // Connections
  if (results.connections.length > 0) {
    console.log('\nConnections:');
    results.connections.forEach(item => {
      const icon = item.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`   ${icon} ${item.service}: ${item.status}`);
      if (item.message) {
        console.log(`      ${item.message}`);
      }
    });
  }
  
  // Warnings
  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(warning => {
      console.log(`   ${warning}`);
    });
  }
  
  // Final status
  console.log('\n=====================================');
  if (hasErrors) {
    console.log('❌ VALIDATION FAILED');
    console.log('=====================================\n');
    console.log('Please fix the errors above before proceeding.');
    console.log('\nQuick fixes:');
    console.log('  1. Copy template: cp .env.apify.template .env');
    console.log('  2. Generate keys: node scripts/generate-secure-keys.js');
    console.log('  3. Add your Apify token to .env');
    console.log('  4. Verify Supabase credentials\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('=====================================\n');
    console.log('Configuration is valid but please review warnings above.');
    console.log('You can proceed, but consider adjusting the flagged values.\n');
    process.exit(0);
  } else {
    console.log('✅ VALIDATION PASSED');
    console.log('=====================================\n');
    console.log('All checks passed! You\'re ready to start collection.');
    console.log('\nNext steps:');
    console.log('  1. Review Agent 1 completion checklist');
    console.log('  2. Proceed to Agent 2: MCP Server Integration');
    console.log('  3. Or start with a test run:\n');
    console.log('     TIER=1 LIMIT_PER_ROW=5 MAX_ENRICH=10 pnpm play:backfill:tier\n');
    process.exit(0);
  }
}

// Run validation
validateConfiguration().catch(error => {
  console.error('\n❌ Validation error:', error);
  process.exit(1);
});
