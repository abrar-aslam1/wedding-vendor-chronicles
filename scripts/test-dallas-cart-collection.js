#!/usr/bin/env node

/**
 * Test Dallas Cart Vendor Collection
 * Shows what data structure gets created and stored in Supabase
 */

import dotenv from 'dotenv';
dotenv.config();

// Sample cart vendor data that would be collected
const SAMPLE_CART_VENDORS = [
  {
    business_name: "Sweet Treats Dallas Cart",
    category: "carts",
    subcategory: "dessert-carts",
    city: "Dallas", 
    state: "TX",
    description: "Mobile dessert cart serving weddings and events across DFW. Custom desserts, cupcakes, and sweet treats.",
    website: "https://sweetteatsdallas.com",
    instagram_url: "https://www.instagram.com/sweettreats_dallas/",    // ✅ Full Instagram profile URL
    instagram_handle: "sweettreats_dallas",                           // ✅ Instagram username (@handle)
    followers_count: 2150,
    following_count: 890,
    posts_count: 245,
    rating: 4.5,
    verified: false,
    created_at: new Date().toISOString(),
    source: "instagram_mcp_collection"
  },
  {
    business_name: "Dallas Mobile Bar Co",
    category: "carts",
    subcategory: "mobile-bars", 
    city: "Dallas",
    state: "TX",
    description: "Professional mobile bar service for weddings and corporate events. Custom cocktails and bartending services.",
    website: "https://dallasmobilebar.com",
    instagram_url: "https://www.instagram.com/dallas_mobile_bar/",     // ✅ Full Instagram profile URL  
    instagram_handle: "dallas_mobile_bar",                            // ✅ Instagram username (@handle)
    followers_count: 3420,
    following_count: 1200,
    posts_count: 156,
    rating: 4.8,
    verified: false,
    created_at: new Date().toISOString(),
    source: "instagram_mcp_collection"
  },
  {
    business_name: "Coffee Cart Dallas",
    category: "carts",
    subcategory: "coffee-carts",
    city: "Dallas",
    state: "TX", 
    description: "Specialty coffee cart for weddings, corporate events, and private parties. Barista service and custom drinks.",
    website: "https://coffeecartdallas.com",
    instagram_url: "https://www.instagram.com/coffeecart_dallas/",     // ✅ Full Instagram profile URL
    instagram_handle: "coffeecart_dallas",                            // ✅ Instagram username (@handle) 
    followers_count: 1890,
    following_count: 456,
    posts_count: 189,
    rating: 4.3,
    verified: false,
    created_at: new Date().toISOString(),
    source: "instagram_mcp_collection"
  },
  {
    business_name: "DFW Flower Cart",
    category: "carts", 
    subcategory: "flower-carts",
    city: "Dallas",
    state: "TX",
    description: "Beautiful mobile flower cart for weddings and events. Fresh florals and custom arrangements.",
    website: "",
    instagram_url: "https://www.instagram.com/dfw_flower_cart/",      // ✅ Full Instagram profile URL
    instagram_handle: "dfw_flower_cart",                              // ✅ Instagram username (@handle)
    followers_count: 985,
    following_count: 234,
    posts_count: 78,
    rating: 4.2,
    verified: false,
    created_at: new Date().toISOString(),
    source: "instagram_mcp_collection"
  }
];

/**
 * Simulate storing data in Supabase and show what gets saved
 */
async function testSupabaseStorage() {
  console.log('📊 DALLAS CART VENDOR COLLECTION - DATA STRUCTURE');
  console.log('=' .repeat(60));
  
  console.log(`\n🎯 Found ${SAMPLE_CART_VENDORS.length} cart vendors for Dallas`);
  console.log('\n📋 Subcategories collected:');
  
  const subcategories = [...new Set(SAMPLE_CART_VENDORS.map(v => v.subcategory))];
  subcategories.forEach(sub => {
    const count = SAMPLE_CART_VENDORS.filter(v => v.subcategory === sub).length;
    console.log(`   • ${sub}: ${count} vendors`);
  });
  
  console.log('\n📂 SAMPLE DATA STRUCTURE (what gets stored in Supabase):');
  console.log('=' .repeat(60));
  
  SAMPLE_CART_VENDORS.forEach((vendor, index) => {
    console.log(`\n🏪 VENDOR ${index + 1}: ${vendor.business_name}`);
    console.log(`   Category: ${vendor.category}`);
    console.log(`   Subcategory: ${vendor.subcategory}`); 
    console.log(`   Location: ${vendor.city}, ${vendor.state}`);
    console.log(`   Description: ${vendor.description}`);
    console.log(`   Website: ${vendor.website || 'Not provided'}`);
    console.log(`   📸 Instagram URL: ${vendor.instagram_url}`);          // ✅ Instagram link included!
    console.log(`   📱 Instagram Handle: @${vendor.instagram_handle}`);   // ✅ Instagram handle included!
    console.log(`   Followers: ${vendor.followers_count.toLocaleString()}`);
    console.log(`   Posts: ${vendor.posts_count}`);
    console.log(`   Rating: ${vendor.rating}/5.0`);
    console.log(`   Source: ${vendor.source}`);
  });
  
  console.log('\n✅ WHAT THE REAL SCRIPT WOULD DO:');
  console.log('1. 🔍 Search Instagram for Dallas cart vendors');
  console.log('2. 📊 Scrape each profile to get business info');
  console.log('3. 🏷️  Categorize into subcategories (dessert-carts, mobile-bars, etc.)');
  console.log('4. 📸 CAPTURE FULL INSTAGRAM URLs and handles');
  console.log('5. 💾 Store everything in Supabase vendors table');
  
  console.log('\n🎉 INSTAGRAM LINKS ARE FULLY CAPTURED!');
  console.log('   • instagram_url: Full Instagram profile URL');
  console.log('   • instagram_handle: Username without @ symbol');
  console.log('   • Both fields stored in Supabase for easy linking');
  
  return SAMPLE_CART_VENDORS;
}

// Test the data structure
testSupabaseStorage().then(vendors => {
  console.log(`\n📈 Ready to collect real data for ${vendors.length} example vendors!`);
});
