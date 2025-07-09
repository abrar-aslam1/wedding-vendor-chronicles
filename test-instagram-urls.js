import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInstagramUrls() {
  console.log('Testing Instagram URL functionality...');
  
  // Get a sample of Dallas Instagram vendors
  const { data: vendors, error } = await supabase
    .from('instagram_vendors')
    .select('*')
    .eq('city', 'Dallas')
    .eq('state', 'TX')
    .limit(3);
  
  if (error) {
    console.error('Error fetching vendors:', error);
    return;
  }
  
  if (!vendors || vendors.length === 0) {
    console.log('No Dallas Instagram vendors found');
    return;
  }
  
  console.log(`\nTesting ${vendors.length} Dallas Instagram vendors:\n`);
  
  for (const vendor of vendors) {
    console.log(`📸 Testing vendor: ${vendor.business_name}`);
    console.log(`   Instagram Handle: @${vendor.instagram_handle}`);
    console.log(`   Instagram URL: ${vendor.instagram_url}`);
    console.log(`   Profile Image URL: ${vendor.profile_image_url}`);
    console.log(`   Follower Count: ${vendor.follower_count}`);
    console.log(`   Category: ${vendor.category}`);
    console.log(`   Business Account: ${vendor.is_business_account}`);
    console.log(`   Verified: ${vendor.is_verified}`);
    console.log(`   Bio: ${vendor.bio}`);
    console.log(`   Website: ${vendor.website_url}`);
    console.log(`   Location: ${vendor.city}, ${vendor.state}`);
    console.log('   ---');
  }
  
  // Test if the Instagram URLs are correctly formatted
  const urlTests = vendors.map(vendor => {
    const expectedUrl = `https://www.instagram.com/${vendor.instagram_handle}`;
    const expectedProfileImage = `https://www.instagram.com/${vendor.instagram_handle}/picture/`;
    
    return {
      handle: vendor.instagram_handle,
      urlMatch: vendor.instagram_url === expectedUrl,
      profileImageMatch: vendor.profile_image_url === expectedProfileImage,
      actualUrl: vendor.instagram_url,
      actualProfileImage: vendor.profile_image_url,
      expectedUrl,
      expectedProfileImage
    };
  });
  
  console.log('\n🔍 URL Format Validation:');
  urlTests.forEach((test, index) => {
    console.log(`${index + 1}. @${test.handle}`);
    console.log(`   Instagram URL: ${test.urlMatch ? '✅' : '❌'} ${test.actualUrl}`);
    console.log(`   Profile Image: ${test.profileImageMatch ? '✅' : '❌'} ${test.actualProfileImage}`);
    if (!test.urlMatch) {
      console.log(`   Expected URL: ${test.expectedUrl}`);
    }
    if (!test.profileImageMatch) {
      console.log(`   Expected Profile Image: ${test.expectedProfileImage}`);
    }
    console.log('');
  });
  
  // Test the InstagramVendorCard component data requirements
  console.log('\n🧪 InstagramVendorCard Data Requirements Test:');
  const componentDataTest = vendors.map(vendor => {
    const missingFields = [];
    
    if (!vendor.business_name) missingFields.push('business_name');
    if (!vendor.instagram_handle) missingFields.push('instagram_handle');
    if (!vendor.instagram_url) missingFields.push('instagram_url');
    if (!vendor.profile_image_url) missingFields.push('profile_image_url');
    if (!vendor.category) missingFields.push('category');
    if (!vendor.city) missingFields.push('city');
    if (!vendor.state) missingFields.push('state');
    
    return {
      handle: vendor.instagram_handle,
      businessName: vendor.business_name,
      hasRequiredFields: missingFields.length === 0,
      missingFields
    };
  });
  
  componentDataTest.forEach((test, index) => {
    console.log(`${index + 1}. @${test.handle} (${test.businessName})`);
    console.log(`   Component Ready: ${test.hasRequiredFields ? '✅' : '❌'}`);
    if (!test.hasRequiredFields) {
      console.log(`   Missing Fields: ${test.missingFields.join(', ')}`);
    }
    console.log('');
  });
}

testInstagramUrls().catch(console.error);