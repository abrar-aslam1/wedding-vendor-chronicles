#!/usr/bin/env node

/**
 * Dallas Cart Vendor Collection Script
 * Collects Instagram vendors for various cart-based services in Dallas, TX
 * Stores data in Supabase with proper categorization
 */

// MCP tools are available within Cline runtime, not as Node.js imports
// This script is designed to be run through Cline which provides MCP access

import dotenv from 'dotenv';
dotenv.config();

// Cart subcategories for Dallas collection
const CART_SUBCATEGORIES = [
  'dessert-carts',
  'bar-carts', 
  'mobile-bars',
  'food-carts',
  'coffee-carts',
  'ice-cream-carts',
  'flower-carts',
  'candy-carts',
  'donut-carts',
  'beverage-carts',
  'champagne-carts',
  'cocktail-carts'
];

// Instagram search queries for cart vendors in Dallas
const DALLAS_CART_SEARCH_QUERIES = [
  '#dallasdessertcart',
  '#dallasmobilebar', 
  '#dallasbarCart',
  '#dallasfoodcart',
  '#dallascoffeecart',
  '#dallasicecreamcart',
  '#dallasflowercart',
  '#dallascandycart',
  '#dallasdonutcart',
  '#dallasbeverage cart',
  '#dallaschampagnecart',
  '#dallascocktailcart',
  '#dallasweddingcart',
  '#dallaseventcart',
  'dallas dessert cart wedding',
  'dallas mobile bar rental',
  'dallas wedding bar cart',
  'dallas coffee cart catering',
  'dallas ice cream cart rental',
  'dallas floral cart wedding',
  'dallas candy cart rental',
  'dallas donut cart wedding',
  'dallas beverage cart service',
  'dallas champagne cart rental',
  'dallas cocktail cart wedding'
];

/**
 * Search for cart vendor Instagram profiles
 */
async function searchCartVendors() {
  console.log('🔍 Searching for Dallas cart vendors on Instagram...');
  
  const foundProfiles = [];
  
  for (const query of DALLAS_CART_SEARCH_QUERIES) {
    try {
      console.log(`Searching: ${query}`);
      
      const response = await use_mcp_tool({
        server_name: 'github.com/luminati-io/brightdata-mcp',
        tool_name: 'search_engine',
        arguments: {
          query: `site:instagram.com "${query}"`,
          engine: 'google'
        }
      });
      
      if (response && response.results) {
        for (const result of response.results) {
          if (result.url && result.url.includes('instagram.com/') && 
              !result.url.includes('/p/') && // Exclude posts
              !result.url.includes('/reel/') && // Exclude reels  
              !foundProfiles.includes(result.url)) {
            foundProfiles.push(result.url);
            console.log(`Found profile: ${result.url}`);
          }
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Error searching ${query}:`, error.message);
    }
  }
  
  return foundProfiles;
}

/**
 * Scrape Instagram profile data for cart vendors
 */
async function scrapeCartVendorProfiles(profileUrls) {
  console.log(`📊 Scraping ${profileUrls.length} cart vendor profiles...`);
  
  const vendorData = [];
  
  for (const url of profileUrls) {
    try {
      console.log(`Scraping: ${url}`);
      
      const response = await use_mcp_tool({
        server_name: 'github.com/luminati-io/brightdata-mcp', 
        tool_name: 'scrape_as_markdown',
        arguments: { url }
      });
      
      if (response && response.content) {
        const profile = parseInstagramProfile(response.content, url);
        if (profile && isValidCartVendor(profile)) {
          vendorData.push(profile);
          console.log(`✅ Parsed vendor: ${profile.business_name}`);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
    }
  }
  
  return vendorData;
}

/**
 * Parse Instagram profile markdown content
 */
function parseInstagramProfile(markdown, url) {
  try {
    const lines = markdown.split('\n').filter(line => line.trim());
    
    // Extract username from URL
    const usernameMatch = url.match(/instagram\.com\/([^\/\?]+)/);
    const username = usernameMatch ? usernameMatch[1] : '';
    
    // Find bio and business info
    let business_name = '';
    let description = '';
    let website = '';
    let followers = 0;
    let following = 0;
    let posts = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Business name (usually first non-username line)
      if (!business_name && !line.includes('followers') && !line.includes('following') && 
          !line.includes('posts') && lines[i].length > 2 && lines[i].length < 50) {
        business_name = lines[i].trim();
      }
      
      // Follower count
      if (line.includes('followers')) {
        const followerMatch = lines[i].match(/([\d,]+)\s*followers/i);
        if (followerMatch) {
          followers = parseInt(followerMatch[1].replace(/,/g, ''));
        }
      }
      
      // Following count
      if (line.includes('following')) {
        const followingMatch = lines[i].match(/([\d,]+)\s*following/i);
        if (followingMatch) {
          following = parseInt(followingMatch[1].replace(/,/g, ''));
        }
      }
      
      // Posts count
      if (line.includes('posts')) {
        const postsMatch = lines[i].match(/([\d,]+)\s*posts/i);
        if (postsMatch) {
          posts = parseInt(postsMatch[1].replace(/,/g, ''));
        }
      }
      
      // Website/link
      if (line.includes('http') || line.includes('www.')) {
        website = lines[i].trim();
      }
      
      // Description (bio)
      if (lines[i].length > 20 && lines[i].length < 200 && 
          !line.includes('followers') && !line.includes('following') && 
          !line.includes('posts') && !description) {
        description = lines[i].trim();
      }
    }
    
    // Determine subcategory based on description and business name
    const subcategory = determineCartSubcategory(business_name, description);
    
    return {
      business_name: business_name || username,
      category: 'carts',
      subcategory,
      city: 'Dallas',
      state: 'TX', 
      description: description || '',
      website: website || '',
      instagram_url: url,           // ✅ Full Instagram profile URL
      instagram_handle: username,   // ✅ Instagram username (@handle)
      followers_count: followers,
      following_count: following,
      posts_count: posts,
      rating: calculateRating(followers, posts),
      verified: false,
      created_at: new Date().toISOString(),
      source: 'instagram_mcp_collection'
    };
    
  } catch (error) {
    console.error('Error parsing profile:', error.message);
    return null;
  }
}

/**
 * Determine cart subcategory based on business info
 */
function determineCartSubcategory(businessName, description) {
  const text = `${businessName} ${description}`.toLowerCase();
  
  if (text.includes('dessert') || text.includes('sweet') || text.includes('cake')) return 'dessert-carts';
  if (text.includes('bar') || text.includes('cocktail') || text.includes('mixology')) return 'bar-carts';  
  if (text.includes('mobile bar') || text.includes('bartend')) return 'mobile-bars';
  if (text.includes('food') || text.includes('catering') || text.includes('cuisine')) return 'food-carts';
  if (text.includes('coffee') || text.includes('espresso') || text.includes('latte')) return 'coffee-carts';
  if (text.includes('ice cream') || text.includes('gelato') || text.includes('frozen')) return 'ice-cream-carts';
  if (text.includes('flower') || text.includes('floral') || text.includes('bouquet')) return 'flower-carts';
  if (text.includes('candy') || text.includes('sweets') || text.includes('confection')) return 'candy-carts';
  if (text.includes('donut') || text.includes('doughnut') || text.includes('pastry')) return 'donut-carts';
  if (text.includes('beverage') || text.includes('drink') || text.includes('refreshment')) return 'beverage-carts';
  if (text.includes('champagne') || text.includes('prosecco') || text.includes('sparkling')) return 'champagne-carts';
  
  return 'mobile-bars'; // Default fallback
}

/**
 * Validate that this is a legitimate cart vendor
 */
function isValidCartVendor(profile) {
  if (!profile.business_name || profile.business_name.length < 2) return false;
  if (profile.followers_count < 50) return false; // Minimum follower threshold
  if (profile.posts_count < 5) return false; // Minimum post threshold
  
  const businessText = `${profile.business_name} ${profile.description}`.toLowerCase();
  
  // Must contain cart-related keywords
  const cartKeywords = ['cart', 'mobile', 'rental', 'service', 'catering', 'bar', 'dessert', 'food', 'coffee'];
  const hasCartKeyword = cartKeywords.some(keyword => businessText.includes(keyword));
  
  // Must contain Dallas-related keywords
  const locationKeywords = ['dallas', 'dfw', 'texas', 'tx'];
  const hasLocationKeyword = locationKeywords.some(keyword => businessText.includes(keyword));
  
  return hasCartKeyword && hasLocationKeyword;
}

/**
 * Calculate basic rating based on social metrics
 */
function calculateRating(followers, posts) {
  if (followers < 100) return 3.0;
  if (followers < 500) return 3.5;
  if (followers < 1000) return 4.0;
  if (followers < 5000) return 4.2;
  if (followers < 10000) return 4.5;
  return 4.8;
}

/**
 * Store vendor data in Supabase
 */
async function storeInSupabase(vendors) {
  console.log(`💾 Storing ${vendors.length} cart vendors in Supabase...`);
  
  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(vendors)
    });
    
    if (response.ok) {
      console.log('✅ Successfully stored cart vendors in Supabase');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Error storing in Supabase:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error storing in Supabase:', error.message);
    return false;
  }
}

/**
 * Main collection function
 */
async function collectDallasCartVendors() {
  console.log('🚀 Starting Dallas Cart Vendor Collection');
  console.log(`📋 Target subcategories: ${CART_SUBCATEGORIES.join(', ')}`);
  
  try {
    // Step 1: Search for cart vendor profiles
    const profileUrls = await searchCartVendors();
    console.log(`🎯 Found ${profileUrls.length} potential cart vendor profiles`);
    
    if (profileUrls.length === 0) {
      console.log('❌ No cart vendor profiles found. Try adjusting search queries.');
      return;
    }
    
    // Step 2: Scrape profile data  
    const vendors = await scrapeCartVendorProfiles(profileUrls);
    console.log(`✅ Successfully parsed ${vendors.length} valid cart vendors`);
    
    if (vendors.length === 0) {
      console.log('❌ No valid cart vendors found after parsing.');
      return;
    }
    
    // Step 3: Store in Supabase
    const stored = await storeInSupabase(vendors);
    
    if (stored) {
      console.log('🎉 Dallas Cart Vendor Collection Complete!');
      console.log(`📊 Summary:`);
      console.log(`   - Profiles Found: ${profileUrls.length}`);
      console.log(`   - Valid Vendors: ${vendors.length}`);
      console.log(`   - Stored in DB: ${vendors.length}`);
      
      // Show subcategory breakdown
      const subcategoryCount = {};
      vendors.forEach(vendor => {
        subcategoryCount[vendor.subcategory] = (subcategoryCount[vendor.subcategory] || 0) + 1;
      });
      
      console.log(`   - Subcategory Breakdown:`);
      Object.entries(subcategoryCount).forEach(([subcategory, count]) => {
        console.log(`     * ${subcategory}: ${count} vendors`);
      });
      
    } else {
      console.log('❌ Failed to store vendors in Supabase');
    }
    
  } catch (error) {
    console.error('❌ Collection failed:', error.message);
    console.error(error.stack);
  }
}

// Run collection if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  collectDallasCartVendors();
}

export { collectDallasCartVendors, CART_SUBCATEGORIES };
