#!/usr/bin/env node

/**
 * Run Dallas Cart Vendor Automation
 * Complete automation to collect, process, and store Dallas cart vendors
 */

import { execSync } from 'child_process';

console.log('🚀 STARTING DALLAS CART VENDOR AUTOMATION');
console.log('=' .repeat(60));
console.log('This will run the complete cart vendor collection for Dallas');
console.log('');

try {
  // Step 1: Run the Dallas cart collection and storage
  console.log('📋 Step 1: Collecting and storing Dallas cart vendors...');
  execSync('node scripts/store-dallas-cart-vendors.js', { stdio: 'inherit' });
  
  console.log('\n✅ AUTOMATION COMPLETED SUCCESSFULLY!');
  console.log('📊 Dallas cart vendors have been collected and stored in Supabase');
  console.log('');
  console.log('🔍 To verify the results, you can run:');
  console.log('   node scripts/check-existing-vendors.js');
  console.log('');
  console.log('📈 The following cart types were added:');
  console.log('   • Dessert Carts');
  console.log('   • Mobile Bars'); 
  console.log('   • Food Carts');
  console.log('');
  
} catch (error) {
  console.error('❌ AUTOMATION FAILED:', error.message);
  process.exit(1);
}
