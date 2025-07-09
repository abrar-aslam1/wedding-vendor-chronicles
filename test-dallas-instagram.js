import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDallasSearch() {
  console.log('Testing Dallas Instagram vendor search...');
  
  // Test 1: Direct database query
  const { data, error } = await supabase
    .from('instagram_vendors')
    .select('*')
    .eq('city', 'Dallas')
    .eq('state', 'TX')
    .limit(5);
  
  if (error) {
    console.error('Database error:', error);
    return;
  }
  
  console.log('Found Dallas vendors:', data?.length || 0);
  
  if (data && data.length > 0) {
    console.log('\nSample vendor:');
    const vendor = data[0];
    console.log('- Handle:', vendor.instagram_handle);
    console.log('- Business:', vendor.business_name);
    console.log('- Category:', vendor.category);
    console.log('- Instagram URL:', vendor.instagram_url);
    console.log('- Profile Image:', vendor.profile_image_url);
    console.log('- Follower Count:', vendor.follower_count);
    console.log('- Is Business Account:', vendor.is_business_account);
  }
  
  // Test 2: Search by category
  console.log('\nTesting photographer search...');
  const { data: photographers, error: photoError } = await supabase
    .from('instagram_vendors')
    .select('*')
    .eq('city', 'Dallas')
    .eq('category', 'photographers')
    .limit(3);
  
  if (photoError) {
    console.error('Photographer search error:', photoError);
    return;
  }
  
  console.log('Found photographers:', photographers?.length || 0);
  photographers?.forEach((p, i) => {
    console.log(`${i + 1}. @${p.instagram_handle} - ${p.business_name}`);
  });
  
  // Test 3: Test edge function
  console.log('\nTesting search-instagram-vendors edge function...');
  
  const { data: edgeData, error: edgeError } = await supabase.functions.invoke('search-instagram-vendors', {
    body: {
      keyword: 'wedding photographer',
      location: 'Dallas, TX',
      subcategory: null
    }
  });
  
  if (edgeError) {
    console.error('Edge function error:', edgeError);
    return;
  }
  
  console.log('Edge function response:', {
    totalResults: edgeData?.totalResults || 0,
    source: edgeData?.source,
    resultCount: edgeData?.results?.length || 0
  });
  
  if (edgeData?.results?.length > 0) {
    console.log('\nSample edge function result:');
    const result = edgeData.results[0];
    console.log('- Title:', result.title);
    console.log('- Instagram Handle:', result.instagram_handle);
    console.log('- Instagram URL:', result.instagram_url);
    console.log('- Profile Image:', result.profile_image_url);
    console.log('- Follower Count:', result.follower_count);
    console.log('- Vendor Source:', result.vendor_source);
  }
}

testDallasSearch().catch(console.error);