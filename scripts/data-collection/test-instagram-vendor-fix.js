const { createClient } = require('@supabase/supabase-js');

// Test script to verify Instagram vendor functionality
async function testInstagramVendorFix() {
  console.log('🔍 Testing Instagram Vendor Fix...\n');

  // Check environment variables
  console.log('1. Checking Environment Variables:');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    console.log('❌ SUPABASE_URL not found');
  } else {
    console.log('✅ SUPABASE_URL found:', supabaseUrl);
  }
  
  if (!supabaseKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY found (length:', supabaseKey.length, 'chars)');
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ Missing required environment variables. Please set them in your .env file:');
    console.log('SUPABASE_URL=https://wpbdveyuuudhmwflrmqw.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]');
    return;
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('\n2. Testing Database Connection:');
  try {
    const { data, error } = await supabase
      .from('instagram_vendors')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return;
  }

  console.log('\n3. Checking Instagram Vendor Data:');
  
  // Test categories that should have Instagram vendors
  const testCategories = [
    'photographers',
    'wedding-planners',
    'videographers',
    'florists',
    'caterers',
    'venues',
    'djs-and-bands',
    'cake-designers',
    'bridal-shops',
    'makeup-artists',
    'hair-stylists'
  ];

  const categoryResults = {};
  
  for (const category of testCategories) {
    try {
      const { data, error } = await supabase
        .from('instagram_vendors')
        .select('id, business_name, category, city, state, location')
        .eq('category', category)
        .limit(5);
      
      if (error) {
        console.log(`❌ ${category}: Error -`, error.message);
        categoryResults[category] = { count: 0, error: error.message };
      } else {
        const count = data ? data.length : 0;
        console.log(`${count > 0 ? '✅' : '⚠️'} ${category}: ${count} vendors found`);
        categoryResults[category] = { count, vendors: data };
        
        if (count > 0 && data) {
          // Show sample vendor
          const sample = data[0];
          console.log(`   Sample: ${sample.business_name} (${sample.city}, ${sample.state})`);
        }
      }
    } catch (error) {
      console.log(`❌ ${category}: Exception -`, error.message);
      categoryResults[category] = { count: 0, error: error.message };
    }
  }

  console.log('\n4. Testing Location Filtering:');
  
  // Test Dallas, Texas specifically (the problematic URL)
  const testLocations = [
    { city: 'Dallas', state: 'Texas' },
    { city: 'Dallas', state: 'TX' },
    { city: 'Los Angeles', state: 'California' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'New York', state: 'New York' },
    { city: 'New York', state: 'NY' }
  ];

  for (const location of testLocations) {
    try {
      // Test the improved location filtering logic
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
      
      const stateAbbr = stateAbbreviations[location.state] || location.state;
      const stateFullName = Object.keys(stateAbbreviations).find(key => stateAbbreviations[key] === location.state) || location.state;
      
      const locationConditions = [
        `city.ilike.%${location.city}%`,
        `state.ilike.%${location.state}%`,
        `state.ilike.%${stateAbbr}%`,
        `state.ilike.%${stateFullName}%`,
        `location.ilike.%${location.city}%`,
        `location.ilike.%${location.state}%`,
        `location.ilike.%${stateAbbr}%`
      ];
      
      const { data, error } = await supabase
        .from('instagram_vendors')
        .select('id, business_name, city, state, location')
        .eq('category', 'photographers') // Test with photographers
        .or(locationConditions.join(','))
        .limit(3);
      
      if (error) {
        console.log(`❌ ${location.city}, ${location.state}: Error -`, error.message);
      } else {
        const count = data ? data.length : 0;
        console.log(`${count > 0 ? '✅' : '⚠️'} ${location.city}, ${location.state}: ${count} photographers found`);
        
        if (count > 0 && data) {
          data.forEach(vendor => {
            console.log(`   - ${vendor.business_name} (${vendor.city}, ${vendor.state}) [${vendor.location}]`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ ${location.city}, ${location.state}: Exception -`, error.message);
    }
  }

  console.log('\n5. Summary:');
  const totalCategories = testCategories.length;
  const categoriesWithData = Object.values(categoryResults).filter(result => result.count > 0).length;
  const totalVendors = Object.values(categoryResults).reduce((sum, result) => sum + result.count, 0);
  
  console.log(`📊 Categories tested: ${totalCategories}`);
  console.log(`📊 Categories with data: ${categoriesWithData}`);
  console.log(`📊 Total Instagram vendors: ${totalVendors}`);
  
  if (categoriesWithData === 0) {
    console.log('\n❌ No Instagram vendors found in any category!');
    console.log('   This suggests the instagram_vendors table is empty or the migration wasn\'t applied.');
    console.log('   Run the data collection scripts to populate the table.');
  } else if (categoriesWithData < totalCategories) {
    console.log('\n⚠️ Some categories are missing Instagram vendors.');
    console.log('   Consider running data collection for missing categories.');
  } else {
    console.log('\n✅ All categories have Instagram vendor data!');
  }

  console.log('\n6. Next Steps:');
  console.log('1. If this test passes locally, deploy the updated search function to production');
  console.log('2. Set the environment variables in Netlify (see README-instagram-vendor-fix.md)');
  console.log('3. Test the production URL: https://findmyweddingvendor.com/top-20/photographers/Traditional%20Photography/Dallas/Texas');
  console.log('4. Check Netlify function logs for any errors');
}

// Run the test
testInstagramVendorFix().catch(console.error);
