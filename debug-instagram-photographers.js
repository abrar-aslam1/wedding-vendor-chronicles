#!/usr/bin/env node

// Debug script to test Instagram photographer search
console.log('🔍 Instagram Photographer Search Debug Tool');
console.log('==========================================\n');

// Test parameters
const testSearchParams = {
  keyword: 'photographer',
  location: 'New York, NY',
  subcategory: null
};

console.log('📋 Test parameters:', testSearchParams);

// Enhanced helper function to simulate the category mapping
function getVendorCategory(keyword) {
  const keywordLower = keyword.toLowerCase();
  // Enhanced photographer matching
  if (keywordLower.includes('photographer') || keywordLower.includes('photography') || keywordLower.includes('photo')) return 'photographers';
  if (keywordLower.includes('wedding planner') || keywordLower.includes('planner')) return 'wedding-planners';
  if (keywordLower.includes('videographer') || keywordLower.includes('videography') || keywordLower.includes('video')) return 'videographers';
  if (keywordLower.includes('florist') || keywordLower.includes('floral')) return 'florists';
  if (keywordLower.includes('caterer') || keywordLower.includes('catering')) return 'caterers';
  if (keywordLower.includes('venue')) return 'venues';
  if (keywordLower.includes('dj') || keywordLower.includes('band') || keywordLower.includes('music')) return 'djs-and-bands';
  if (keywordLower.includes('cake')) return 'cake-designers';
  if (keywordLower.includes('bridal')) return 'bridal-shops';
  if (keywordLower.includes('makeup')) return 'makeup-artists';
  if (keywordLower.includes('hair')) return 'hair-stylists';
  return null;
}

const vendorCategory = getVendorCategory(testSearchParams.keyword);
console.log('✅ Mapped category:', vendorCategory);

console.log('\n🔧 FIXES IMPLEMENTED:');
console.log('1. ✅ Re-enabled category filtering for Instagram vendors');
console.log('2. ✅ Added fallback search using bio/business_name when exact category fails');
console.log('3. ✅ Enhanced keyword matching (photo, photography, photographer)');
console.log('4. ✅ Improved error logging and debugging');

console.log('\n🧪 TESTING SCENARIOS:');
console.log('After the fixes, the search will try:');
console.log('1. Exact category match: category = "photographers"');
console.log('2. Fallback keyword search: bio ILIKE "%photographer%" OR business_name ILIKE "%photographer%" OR category ILIKE "%photographer%"');
console.log('3. Location filtering: city ILIKE "%New York%" AND state ILIKE "%NY%"');

console.log('\n📊 DATABASE QUERIES TO VERIFY:');
console.log('Run these queries to check your Instagram vendors data:');
console.log('');
console.log('-- Check all available categories');
console.log('SELECT DISTINCT category, COUNT(*) as count FROM instagram_vendors GROUP BY category ORDER BY count DESC;');
console.log('');
console.log('-- Check photographer-related vendors');
console.log('SELECT COUNT(*) FROM instagram_vendors WHERE category = \'photographers\';');
console.log('SELECT COUNT(*) FROM instagram_vendors WHERE bio ILIKE \'%photo%\';');
console.log('SELECT COUNT(*) FROM instagram_vendors WHERE business_name ILIKE \'%photo%\';');
console.log('');
console.log('-- Check sample photographer data');
console.log('SELECT id, business_name, category, city, state, bio FROM instagram_vendors WHERE category = \'photographers\' OR bio ILIKE \'%photo%\' LIMIT 5;');
console.log('');
console.log('-- Check location data integrity');
console.log('SELECT DISTINCT city, state FROM instagram_vendors WHERE city IS NOT NULL AND state IS NOT NULL LIMIT 10;');

console.log('\n🚀 NEXT STEPS:');
console.log('1. Test the edge function with a photographer search');
console.log('2. Check browser console for detailed logs');
console.log('3. Verify Instagram vendors exist in your database');
console.log('4. Ensure location data is properly formatted');

console.log('\n📱 EDGE FUNCTION TESTING:');
console.log('You can test the edge function directly with:');
console.log('curl -X POST your-supabase-url/functions/v1/search-vendors \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer your-anon-key" \\');
console.log('  -d \'{"keyword":"photographer","location":"New York, NY"}\'');

console.log('\n✨ The fixes should now allow Instagram photographers to appear in search results!');