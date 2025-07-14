#!/usr/bin/env tsx

import { LinkValidator } from './linkValidator';

async function testUpdatedValidator() {
  const validator = new LinkValidator();
  
  const testCases = [
    'instagram',
    'nasa', 
    'dallasarboretum',
    'fakeusernamethatshouldnotexist123456'
  ];

  console.log('🧪 TESTING UPDATED LINK VALIDATOR');
  console.log('═'.repeat(50));

  for (const handle of testCases) {
    console.log(`\n🔍 Testing: @${handle}`);
    try {
      const result = await validator.validateInstagramProfile(handle);
      console.log(`  Profile Exists: ${result.profileExists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Status Code: ${result.statusCode}`);
      if (result.profileExists) {
        console.log(`  Private: ${result.isPrivate ? 'Yes' : 'No'}`);
        console.log(`  Followers: ${result.followerCount?.toLocaleString()}`);
        if (result.bio) {
          console.log(`  Bio: ${result.bio.substring(0, 50)}${result.bio.length > 50 ? '...' : ''}`);
        }
      }
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`  ❌ Test failed: ${error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

if (require.main === module) {
  testUpdatedValidator().catch(console.error);
}