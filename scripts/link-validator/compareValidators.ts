#!/usr/bin/env tsx

import { SimpleInstagramValidator } from './simpleValidator';
import { FixedInstagramValidator } from './fixedValidator';

async function compareValidators() {
  const simpleValidator = new SimpleInstagramValidator();
  const fixedValidator = new FixedInstagramValidator();
  
  const testCases = [
    'instagram',         // Known official account
    'nasa',             // Known verified account  
    'dallasarboretum',  // Dallas vendor example
    'fakeusernamethatshouldnotexist123456'  // Should not exist
  ];

  console.log('🔬 COMPARING VALIDATORS');
  console.log('═'.repeat(80));

  for (const handle of testCases) {
    console.log(`\n🔍 Testing: @${handle}`);
    console.log('─'.repeat(40));
    
    try {
      // Test Simple Validator
      console.log('Simple Validator:');
      const simpleResult = await simpleValidator.validateHandle(handle);
      console.log(`  Exists: ${simpleResult.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Method: ${simpleResult.method}`);
      console.log(`  Confidence: ${simpleResult.confidence}`);
      
      // Test Fixed Validator  
      console.log('\nFixed Validator:');
      const fixedResult = await fixedValidator.validateProfile(handle);
      console.log(`  Exists: ${fixedResult.profileExists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Status: ${fixedResult.accountStatus}`);
      console.log(`  Method: ${fixedResult.detectionMethod}`);
      console.log(`  Confidence: ${fixedResult.confidence}`);
      
      // Test Alternative method
      console.log('\nFixed Validator (Alternative):');
      const altResult = await fixedValidator.validateProfileAlternative(handle);
      console.log(`  Exists: ${altResult.profileExists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Status: ${altResult.accountStatus}`);
      console.log(`  Method: ${altResult.detectionMethod}`);
      console.log(`  Confidence: ${altResult.confidence}`);
      
    } catch (error) {
      console.log(`  ❌ Test failed: ${error}`);
    }
    
    // Delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

if (require.main === module) {
  compareValidators().catch(console.error);
}