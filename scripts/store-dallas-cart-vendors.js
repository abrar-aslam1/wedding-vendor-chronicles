#!/usr/bin/env node

/**
 * Store Dallas Cart Vendors in Supabase
 * Transforms scraped Instagram data and stores it in the vendors table
 */

import dotenv from 'dotenv';
dotenv.config();

// Raw Instagram data from Apify scraping
const RAW_INSTAGRAM_DATA = [
  {
    "fullName": "Dallas Dessert Cart !",
    "postsCount": 17,
    "followersCount": 237,
    "followsCount": 65,
    "biography": "• available for cart rental in DFW & surrounding areas! \n• weddings, birthdays, showers, & more!\n• email us at dessertcartdfw@gmail.com for bookings!",
    "profilePicUrl": "https://scontent-hou1-1.cdninstagram.com/v/t51.2885-19/365991957_1044409210255993_1771798763890999750_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDEwLmMyIn0&_nc_ht=scontent-hou1-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGg9VmMmRKLRwe41FKWID3nrAnlaZpeMFNDthvmK2L1wLL2yjsmx4vZfDxMeu-q69AjR9QtCHXDDU9pUxo-7WcO&_nc_ohc=-Bni4BM7PAcQ7kNvwE_Nrv4&_nc_gid=vcZ1Q9Ssw183-H1yZqeIRQ&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfalP3yknGI3NPPN7AD8vNJrdihoWPE1j9l68pDHS0MT9g&oe=68DE34DE&_nc_sid=8b3546",
    "username": "dallasdessertcart",
    "private": false,
    "verified": false,
    "isBusinessAccount": true
  },
  {
    "fullName": "Bella Acento Luxury Event Rentals",
    "postsCount": 1474,
    "followersCount": 12948,
    "followsCount": 5261,
    "biography": "Luxury Event Design + Event Rentals servicing the DFW area & beyond for the last 10 years✨\na division of @bellafloraofdallas",
    "profilePicUrl": "https://scontent-bos5-1.cdninstagram.com/v/t51.2885-19/341344515_225191880112437_7160545447431138054_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4zMjAuYzIifQ&_nc_ht=scontent-bos5-1.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QFYNIo48QT-tK34FkW-LCizFJKSkKG3uF-p5ZSeeJhbNh0nJ4ixSHgaUBaaH8ho3ak&_nc_ohc=k13A8Xek7k0Q7kNvwHY-oaq&_nc_gid=8InhVmwVV5vO4KnRNstEhA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfaGzJQgTNf9a_MgmTAUrepXIncN5Qmi_LkEGTLA2coM9g&oe=68DE5218&_nc_sid=8b3546",
    "username": "bellaacento",
    "private": false,
    "verified": false,
    "isBusinessAccount": true
  },
  {
    "fullName": "Allora Mae Mobile Bar | Event Bartending",
    "postsCount": 90,
    "followersCount": 1878,
    "followsCount": 294,
    "biography": "Italian Mobile Bar Experience 🍋\nServing DFW and surrounding areas \nInquire today 👇🏼",
    "profilePicUrl": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/420836658_394619579732816_7676182972869349088_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby43MjMuYzIifQ&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QFY7zXVt_Zs6qGolkrhcvtmfenhyupyd_pd7ntKriiCM8PGo-HlDz2AQYXNWnZwDrQ&_nc_ohc=9VwAQ7ktXXMQ7kNvwGHkNSZ&_nc_gid=8FYejrMCsmOiTVoy58fonQ&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfbiWNuTXaCiiHo0U6VtEStI0TvXEwODqI_CuQKJoOOG5g&oe=68DE6352&_nc_sid=8b3546",
    "username": "alloramaetx",
    "private": false,
    "verified": false,
    "isBusinessAccount": true
  },
  {
    "fullName": "Mobile Snack Bar Catering",
    "postsCount": 20,
    "followersCount": 4647,
    "followsCount": 71,
    "biography": "Book us for your next event 💖💚\nDeliciously delivered to your location.\nWe are open for 2023 bookings! \nDallas Tx 🙏",
    "profilePicUrl": "https://instagram.fsac1-1.fna.fbcdn.net/v/t51.2885-19/349333652_1255020422070191_3249979227274401929_n.jpg?stp=dst-jpg_e0_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDQ0LmMyIn0&_nc_ht=instagram.fsac1-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2QHeSkHjfIpfqdY3BWGrCza1GW27p_n34p996SIWqfr0PaUsmr1w85BRdPPuV2Y7S1I&_nc_ohc=9krjdV4p3kwQ7kNvwEJiX5m&_nc_gid=xHFiNTkOBSKxkpiBx3xxwA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfaXoe7CuPhjwCqnTUPW9qBiDE5gX3HotRe3-dkSkWKYCg&oe=68DE5EBD&_nc_sid=8b3546",
    "username": "sweetlicious_11",
    "private": false,
    "verified": false,
    "isBusinessAccount": true
  }
];

/**
 * Determine cart subcategory based on business info
 */
function determineCartSubcategory(businessName, biography) {
  const text = `${businessName} ${biography}`.toLowerCase();
  
  if (text.includes('dessert') || text.includes('sweet') || text.includes('cake')) return 'dessert-carts';
  if (text.includes('champagne') || text.includes('prosecco') || text.includes('sparkling')) return 'champagne-carts';
  if (text.includes('mobile bar') || text.includes('bartend') || text.includes('cocktail')) return 'mobile-bars';
  if (text.includes('bar') && text.includes('rental')) return 'bar-carts';
  if (text.includes('snack') || text.includes('food') || text.includes('catering')) return 'food-carts';
  if (text.includes('coffee') || text.includes('espresso') || text.includes('latte')) return 'coffee-carts';
  if (text.includes('ice cream') || text.includes('gelato') || text.includes('frozen')) return 'ice-cream-carts';
  if (text.includes('flower') || text.includes('floral') || text.includes('bouquet')) return 'flower-carts';
  if (text.includes('candy') || text.includes('sweets') || text.includes('confection')) return 'candy-carts';
  if (text.includes('beverage') || text.includes('drink') || text.includes('refreshment')) return 'beverage-carts';
  
  return 'mobile-bars'; // Default fallback
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
 * Calculate priority ranking based on social metrics
 */
function calculatePriorityRanking(followers, posts) {
  let score = 0;
  
  // Follower score (0-50)
  if (followers > 10000) score += 50;
  else if (followers > 5000) score += 40;
  else if (followers > 1000) score += 30;
  else if (followers > 500) score += 20;
  else if (followers > 100) score += 10;
  
  // Post count score (0-25)
  if (posts > 1000) score += 25;
  else if (posts > 500) score += 20;
  else if (posts > 100) score += 15;
  else if (posts > 50) score += 10;
  else if (posts > 10) score += 5;
  
  // Business account bonus (0-25)
  score += 25; // All our scraped accounts are business accounts
  
  return score;
}

/**
 * Extract email from biography
 */
function extractEmail(biography) {
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const matches = biography.match(emailRegex);
  return matches ? matches[0] : '';
}

/**
 * Transform Instagram data to vendor format
 */
function transformInstagramToVendor(instagramData) {
  const vendors = [];
  
  for (const profile of instagramData) {
    const subcategory = determineCartSubcategory(profile.fullName, profile.biography);
    const email = extractEmail(profile.biography);
    
    const vendor = {
      business_name: profile.fullName,
      category: 'caterers', // Use existing category instead of 'carts'
      city: 'Dallas',
      state: 'TX',
      description: profile.biography,
      owner_id: '08166856-cf62-452d-a9e7-168f02f15012', // Use existing valid owner_id
      images: [profile.profilePicUrl], // Profile pic as first image
      contact_info: {
        // ✅ Store Instagram data in contact_info JSON field
        instagram_url: `https://www.instagram.com/${profile.username}/`,
        instagram_handle: profile.username,
        followers_count: profile.followersCount,
        following_count: profile.followsCount,
        posts_count: profile.postsCount,
        verified: profile.verified,
        source: 'apify_instagram_scraper',
        cart_type: subcategory, // Store cart type as separate field
        subcategory: subcategory,
        rating: calculateRating(profile.followersCount, profile.postsCount),
        email: email || null
      },
      created_at: new Date().toISOString(),
      priority_ranking: calculatePriorityRanking(profile.followersCount, profile.postsCount),
      is_featured: profile.followersCount > 10000 // Feature accounts with high followers
    };
    
    vendors.push(vendor);
  }
  
  return vendors;
}

/**
 * Store vendor data in Supabase
 */
async function storeInSupabase(vendors) {
  console.log(`💾 Storing ${vendors.length} Dallas cart vendors in Supabase...`);
  
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
      console.log('✅ Successfully stored Dallas cart vendors in Supabase');
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
 * Main function to process and store vendors
 */
async function processDallasCartVendors() {
  console.log('🚀 DALLAS CART VENDOR PROCESSING');
  console.log('=' .repeat(50));
  
  // Transform Instagram data to vendor format
  const vendors = transformInstagramToVendor(RAW_INSTAGRAM_DATA);
  
  console.log(`\n📊 PROCESSED ${vendors.length} DALLAS CART VENDORS:`);
  console.log('=' .repeat(50));
  
  vendors.forEach((vendor, index) => {
    console.log(`\n🏪 VENDOR ${index + 1}: ${vendor.business_name}`);
    console.log(`   Category: ${vendor.category}`);
    console.log(`   Subcategory: ${vendor.contact_info.subcategory}`);
    console.log(`   Location: ${vendor.city}, ${vendor.state}`);
    console.log(`   Description: ${vendor.description.substring(0, 100)}${vendor.description.length > 100 ? '...' : ''}`);
    console.log(`   📸 Instagram URL: ${vendor.contact_info.instagram_url}`);
    console.log(`   📱 Instagram Handle: @${vendor.contact_info.instagram_handle}`);
    console.log(`   Followers: ${vendor.contact_info.followers_count.toLocaleString()}`);
    console.log(`   Posts: ${vendor.contact_info.posts_count}`);
    console.log(`   Rating: ${vendor.contact_info.rating}/5.0`);
    console.log(`   Priority: ${vendor.priority_ranking}/100`);
    console.log(`   Featured: ${vendor.is_featured ? 'Yes' : 'No'}`);
    console.log(`   Source: ${vendor.contact_info.source}`);
  });
  
  // Show subcategory breakdown
  const subcategoryCount = {};
  vendors.forEach(vendor => {
    subcategoryCount[vendor.contact_info.subcategory] = (subcategoryCount[vendor.contact_info.subcategory] || 0) + 1;
  });
  
  console.log(`\n📋 SUBCATEGORY BREAKDOWN:`);
  Object.entries(subcategoryCount).forEach(([subcategory, count]) => {
    console.log(`   • ${subcategory}: ${count} vendors`);
  });
  
  // Store in Supabase
  console.log(`\n💾 STORING IN SUPABASE...`);
  const stored = await storeInSupabase(vendors);
  
  if (stored) {
    console.log('\n🎉 SUCCESS! Dallas cart vendors stored in Supabase');
    console.log(`📈 Summary: ${vendors.length} vendors with complete Instagram data`);
  } else {
    console.log('\n❌ FAILED to store vendors in Supabase');
  }
  
  return vendors;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processDallasCartVendors();
}

export { processDallasCartVendors, transformInstagramToVendor };
