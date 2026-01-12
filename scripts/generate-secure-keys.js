#!/usr/bin/env node

/**
 * Secure Key Generation Script
 * Generates cryptographically secure keys for Instagram vendor collection system
 */

import crypto from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔐 Secure Key Generator for Apify Instagram Collection');
console.log('======================================================\n');

// Generate secure random keys
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Main key generation
const keys = {
  INGEST_SHARED_KEY: generateSecureKey(32),
  // Optional: Generate additional keys if needed
  WEBHOOK_SECRET: generateSecureKey(24),
  API_SECRET_KEY: generateSecureKey(32),
};

console.log('✅ Generated secure keys:\n');
console.log('Copy these to your .env file:\n');
console.log('─────────────────────────────────────────────────────');
console.log(`INGEST_SHARED_KEY="${keys.INGEST_SHARED_KEY}"`);
console.log('─────────────────────────────────────────────────────');
console.log('\n📋 Optional keys (if needed):\n');
console.log(`WEBHOOK_SECRET="${keys.WEBHOOK_SECRET}"`);
console.log(`API_SECRET_KEY="${keys.API_SECRET_KEY}"`);
console.log('\n');

// Check if .env exists
const envPath = join(process.cwd(), '.env');
const envExists = existsSync(envPath);

if (envExists) {
  console.log('📄 .env file exists');
  
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Check if keys already exist
  if (envContent.includes('INGEST_SHARED_KEY=') && 
      envContent.includes('"') && 
      envContent.match(/INGEST_SHARED_KEY="[a-f0-9]{64}"/) !== null) {
    console.log('⚠️  WARNING: INGEST_SHARED_KEY already exists in .env');
    console.log('   Only replace it if you want to regenerate (will break existing integrations)');
  } else {
    console.log('ℹ️  You can add the INGEST_SHARED_KEY above to your .env file');
  }
} else {
  console.log('ℹ️  No .env file found. You can:');
  console.log('   1. Copy .env.apify.template to .env');
  console.log('   2. Add the generated keys to your new .env file');
  console.log('\n   Run: cp .env.apify.template .env');
}

console.log('\n🔒 Security Notes:');
console.log('   • Never commit these keys to git');
console.log('   • Store backup in password manager');
console.log('   • Rotate keys every 90 days');
console.log('   • Use different keys for dev/staging/production');

console.log('\n✨ Done! Keys generated successfully.\n');

// Optionally save to a secure file (not committed)
const secureKeyPath = join(process.cwd(), '.keys-backup.txt');
const backupContent = `
# Secure Keys Backup - Generated ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE TO GIT
# Store this in your password manager and delete this file

INGEST_SHARED_KEY="${keys.INGEST_SHARED_KEY}"
WEBHOOK_SECRET="${keys.WEBHOOK_SECRET}"
API_SECRET_KEY="${keys.API_SECRET_KEY}"

# Next Rotation Due: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
`;

try {
  writeFileSync(secureKeyPath, backupContent, { mode: 0o600 });
  console.log(`💾 Backup saved to: ${secureKeyPath}`);
  console.log('   ⚠️  Store this in your password manager and delete the file!\n');
} catch (error) {
  console.log('ℹ️  Could not create backup file (this is okay)\n');
}

export { generateSecureKey, keys };
