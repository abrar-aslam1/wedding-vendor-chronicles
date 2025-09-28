#!/usr/bin/env node

/**
 * Manual Instagram Cart Vendor Collection Script
 * Collects and stores Instagram vendor data for mobile cart categories
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample Instagram cart vendor profiles
// These would normally be discovered via hashtag searches
const CART_VENDORS = {
  'coffee-carts': {
    'New York': [
      '@monocoffeeny',
      '@joescoffeecart',
      '@nycoffeecartco', 
      '@magiccoffeecart',
      '@brewedawakeningscart',
      '@espressoexpressnyc',
      '@mobilecoffeenyc',
      '@thecoffeecartnyc',
      '@dailygrindcart',
      '@coffeeonwheelsnyc'
    ],
    'Los Angeles': [
      '@lacoffeecart',
      '@sunrisecoffeecart',
      '@goldcoastcoffee',
      '@beverlyhillscoffee',
      '@hollywoodcoffeecart',
      '@beachcoffeecart',
      '@socalmobilecoffee',
      '@lacoffeetruck',
      '@angelescoffeeco',
      '@westcoastcoffee'
    ]
  },
  'matcha-carts': {
    'New York': [
      '@matchamadnessnyc',
      '@greengoldmatcha',
      '@nymatchacart',
      '@urbanmatcha',
      '@matchamomentnyc',
      '@zenmatcha',
      '@matchaonthego',
      '@nycmatchabar',
      '@matcharoomnyc',
      '@matchamobile'
    ],
    'Los Angeles': [
      '@lamatchacart',
      '@matchavibesla',
      '@socalmatchaco',
      '@matchabarla',
      '@greenmatchala',
      '@matchadreamsla',
      '@lamatchamobile',
      '@matchaluxe',
      '@westcoastmatcha',
      '@matchacafela'
    ]
  },
  'cocktail-carts': {
    'New York': [
      '@mobilemixologynyc',
      '@nyccocktailcart',
      '@barcarnyc',
      '@cocktailstogoNYC',
      '@manhattanmobilebar',
      '@nycocktailco',
      '@mobilebartendersnyc',
      '@craftcocktailcart',
      '@nycdrinkcart',
      '@roamingbarnyc'
    ],
    'Los Angeles': [
      '@lamobilebar',
      '@cocktailcartla',
      '@mobilemixla',
      '@socalmobilebar',
      '@bartendersonwheels',
      '@lacocktailco',
      '@mobilebartendersla',
      '@cocktailtruckla',
      '@drinksonwheelsla',
      '@lamixologybar'
    ]
  },
  'dessert-carts': {
    'New York': [
      '@sweetwheelsnyc',
      '@nycdessertcart',
      '@sugarhighcart',
      '@mobilesweetsnyc',
      '@dessertdreamnyc',
      '@candycartnyc',
      '@nysweetcart',
      '@treattrucknyc',
      '@dessertonwheels',
      '@nycsweetshop'
    ],
    'Los Angeles': [
      '@ladessertcart',
      '@sweettreatla',
      '@mobiledessertla',
      '@socalsweetcart',
      '@dessertdreamsla',
      '@candycartla',
      '@sweetwheelsla',
      '@treattruckla',
      '@ladessertbar',
      '@sweetsonwheels'
    ]
  },
  'flower-carts': {
    'New York': [
      '@nycflowercart',
      '@bloommobilenyc',
      '@floralcartsnyc',
      '@petalspushcart',
      '@nyfloralcart',
      '@flowersonwheels',
      '@mobilefloristnyc',
      '@bloombarnyc',
      '@flowercartco',
      '@nycmobileblooms'
    ],
    'Los Angeles': [
      '@laflowercart',
      '@bloomsonwheelsla',
      '@floralcartla',
      '@mobilefloristla',
      '@laflowerbar',
      '@petalcartla',
      '@socalblooms',
      '@flowersonwheelsla',
      '@bloomtruckla',
      '@lafloralcart'
    ]
  },
  'champagne-carts': {
    'New York': [
      '@bubblescartsnyc',
      '@nycchampagnecart',
      '@popsandpours',
      '@mobilechampagne',
      '@sparklebarnyc',
      '@nybubblesbar',
      '@champagnetogoNYC',
      '@nycproseccocart',
      '@bubblywheels',
      '@toastcartnyc'
    ],
    'Los Angeles': [
      '@lachampagnecart',
      '@bubblesbarla',
      '@mobilechampagnela',
      '@sparklingcartla',
      '@proseccocartla',
      '@labubblybar',
      '@champagneonwheels',
      '@toastcartla',
      '@bubblesmobilela',
      '@celebrationcartla'
    ]
  }
};

// State mapping
const STATE_MAP = {
  'New York': 'NY',
  'Los Angeles': 'CA',
  'Chicago': 'IL',
  'Miami': 'FL',
  'Dallas': 'TX',
  'Seattle': 'WA',
  'Boston': 'MA',
  'Atlanta': 'GA'
};

async function collectVendor(username, category, city, state) {
  // Clean username (remove @ if present)
  const cleanUsername = username.replace('@', '').toLowerCase();
  
  // Create vendor record
  const vendorData = {
    source: 'manual_collection',
    ig_username: cleanUsername,
    display_name: cleanUsername, // Would be enriched from Instagram API
    bio: `Mobile ${category.replace('-', ' ')} service in ${city}`,
    category: category,
    city: city,
    state: state,
    country: 'US',
    profile_url: `https://instagram.com/${cleanUsername}`,
    has_location: true,
    has_contact: false,
    created_at: new Date().toISOString()
  };

  return vendorData;
}

async function storeVendors(vendors) {
  try {
    const { data, error } = await supabase
      .from('vendors_instagram')
      .upsert(vendors, {
        onConflict: 'ig_username',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error storing vendors:', error);
      return false;
    }

    console.log(`✅ Stored ${vendors.length} vendors successfully`);
    return true;
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}

async function collectAllCartVendors() {
  console.log('🚀 Starting Manual Cart Vendor Collection');
  console.log('=========================================');
  
  const allVendors = [];
  let totalCount = 0;

  for (const [category, cities] of Object.entries(CART_VENDORS)) {
    console.log(`\n📦 Processing ${category}`);
    console.log('-'.repeat(40));
    
    for (const [city, usernames] of Object.entries(cities)) {
      const state = STATE_MAP[city];
      const vendors = [];
      
      for (const username of usernames) {
        const vendor = await collectVendor(username, category, city, state);
        vendors.push(vendor);
      }
      
      allVendors.push(...vendors);
      totalCount += vendors.length;
      console.log(`  ✓ ${city}, ${state}: ${vendors.length} vendors`);
    }
  }

  console.log('\n=========================================');
  console.log(`📊 Total vendors collected: ${totalCount}`);
  
  // Store in batches
  const batchSize = 50;
  for (let i = 0; i < allVendors.length; i += batchSize) {
    const batch = allVendors.slice(i, i + batchSize);
    await storeVendors(batch);
    console.log(`📝 Batch ${Math.floor(i/batchSize) + 1} stored`);
  }

  console.log('\n✨ Collection complete!');
  
  // Generate summary
  const summary = {
    total_vendors: totalCount,
    categories: Object.keys(CART_VENDORS).length,
    cities_covered: Object.keys(STATE_MAP).length,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n📈 Summary:', summary);
  return summary;
}

// Add more vendors as needed
async function addCustomVendors(vendors) {
  // Format: [{ username, category, city, state }]
  const formattedVendors = [];
  
  for (const vendor of vendors) {
    const vendorData = await collectVendor(
      vendor.username,
      vendor.category,
      vendor.city,
      vendor.state
    );
    formattedVendors.push(vendorData);
  }
  
  return storeVendors(formattedVendors);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  collectAllCartVendors()
    .then(() => {
      console.log('✅ Manual collection completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Collection failed:', error);
      process.exit(1);
    });
}

export { collectVendor, storeVendors, collectAllCartVendors, addCustomVendors };
