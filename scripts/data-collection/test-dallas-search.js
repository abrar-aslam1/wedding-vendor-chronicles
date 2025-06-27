const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDallasSearch() {
  console.log('🔍 Testing Dallas Instagram vendor search...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test the exact query that the search function would use
  const city = 'Dallas';
  const state = 'Texas';
  const category = 'photographers';
  
  console.log(`\n🔍 Searching for ${category} in ${city}, ${state}...`);
  
  // State abbreviation mapping
  const stateAbbreviations = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  
  const stateAbbr = stateAbbreviations[state] || state;
  const stateFullName = Object.keys(stateAbbreviations).find(key => stateAbbreviations[key] === state) || state;
  
  console.log(`State variations: ${state}, ${stateAbbr}, ${stateFullName}`);
  
  // Build the same query as the search function
  let query = supabase
    .from('instagram_vendors')
    .select('*')
    .eq('category', category);
  
  const locationConditions = [
    `city.ilike.%${city}%`,
    `state.ilike.%${state}%`,
    `state.ilike.%${stateAbbr}%`,
    `state.ilike.%${stateFullName}%`
  ];
  
  query = query.or(locationConditions.join(','));
  
  console.log('Query conditions:', locationConditions);
  
  const { data: instagramVendors, error } = await query.limit(10);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`\n✅ Found ${instagramVendors.length} Instagram vendors`);
  
  if (instagramVendors.length > 0) {
    console.log('\n📋 Results:');
    instagramVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.business_name || vendor.instagram_handle}`);
      console.log(`   Category: ${vendor.category}`);
      console.log(`   Location: ${vendor.city}, ${vendor.state}`);
      console.log(`   Instagram: @${vendor.instagram_handle}`);
      if (vendor.follower_count) {
        console.log(`   Followers: ${vendor.follower_count.toLocaleString()}`);
      }
      console.log('');
    });
    
    console.log('🎉 SUCCESS: Instagram vendors are available for Dallas searches!');
    console.log('\n📝 Next steps:');
    console.log('1. Ensure these environment variables are set in Netlify:');
    console.log(`   SUPABASE_URL=${supabaseUrl}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY=${supabaseKey}`);
    console.log('2. Deploy the updated search function');
    console.log('3. Test the production URL');
  } else {
    console.log('⚠️ No Instagram vendors found for this search');
    
    // Debug: Check what's actually in the database
    console.log('\n🔍 Debugging: Checking database contents...');
    
    const { data: allVendors } = await supabase
      .from('instagram_vendors')
      .select('category, city, state')
      .eq('category', category)
      .limit(5);
    
    if (allVendors && allVendors.length > 0) {
      console.log('Sample vendors in database:');
      allVendors.forEach(v => {
        console.log(`  - ${v.category} in ${v.city}, ${v.state}`);
      });
    }
  }
}

testDallasSearch().catch(console.error);
