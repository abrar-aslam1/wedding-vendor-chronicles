/**
 * Instagram Vendor Collection Script
 * 
 * This script collects information about wedding vendors in Dallas, TX from Instagram
 * and stores the data in the Supabase database.
 */

// Import Supabase client
// Use dynamic import to handle both ESM and CommonJS environments
let supabase;
async function initSupabase() {
  try {
    const { supabase: supabaseClient } = await import('../../src/integrations/supabase/client.js');
    supabase = supabaseClient;
  } catch (error) {
    console.error('Error importing Supabase client:', error);
    process.exit(1);
  }
}

// Define the categories of wedding vendors to search for
const VENDOR_CATEGORIES = [
  { name: "Wedding Planners", slug: "wedding-planners", keywords: ["planner", "planning", "coordination", "event"] },
  { name: "Photographers", slug: "photographers", keywords: ["photo", "photography", "capture", "moments"] },
  { name: "Videographers", slug: "videographers", keywords: ["video", "film", "cinema"] },
  { name: "Florists", slug: "florists", keywords: ["floral", "flowers", "botanicals", "arrangements"] },
  { name: "Caterers", slug: "caterers", keywords: ["catering", "food", "meals", "chef"] },
  { name: "Venues", slug: "venues", keywords: ["venue", "location", "space", "hall"] },
  { name: "DJs & Bands", slug: "djs-and-bands", keywords: ["dj", "music", "entertainment"] },
  { name: "Cake Designers", slug: "cake-designers", keywords: ["cake", "bakery", "dessert"] },
  { name: "Bridal Shops", slug: "bridal-shops", keywords: ["dress", "gown", "bridal", "attire"] },
  { name: "Makeup Artists", slug: "makeup-artists", keywords: ["makeup", "mua", "beauty"] },
  { name: "Hair Stylists", slug: "hair-stylists", keywords: ["hair", "stylist"] }
];

// Define subcategories for each vendor category
const VENDOR_SUBCATEGORIES = {
  'wedding-planners': [
    "Full-Service Planning", "Day-of Coordination", "Partial Planning", 
    "Destination Wedding Planning", "Cultural Wedding Specialists"
  ],
  'photographers': [
    "Traditional Photography", "Photojournalistic", "Fine Art", 
    "Aerial Photography", "Engagement Specialists"
  ],
  'videographers': [
    "Cinematic", "Documentary", "Aerial", "Same-Day Edit"
  ],
  'florists': [
    "Modern Arrangements", "Classic/Traditional", "Rustic/Bohemian", 
    "Minimalist", "Luxury/Extravagant"
  ],
  'caterers': [
    "American", "Italian", "Mexican", "Indian", "Chinese", 
    "Mediterranean", "Japanese", "Thai", "French", "Spanish", "Middle Eastern"
  ],
  'venues': [
    "Ballrooms", "Barns & Farms", "Beach/Waterfront", "Gardens & Parks", 
    "Historic Buildings", "Hotels & Resorts", "Wineries & Vineyards", "Industrial Spaces"
  ],
  'djs-and-bands': [
    "DJs", "Live Bands", "Solo Musicians", "Orchestras", "Cultural Music Specialists"
  ],
  'cake-designers': [
    "Traditional", "Modern", "Custom Design", "Specialty Flavors", "Gluten-Free/Vegan"
  ],
  'bridal-shops': [
    "Designer Gowns", "Custom Design", "Plus Size", "Budget-Friendly", "Accessories"
  ],
  'makeup-artists': [
    "Traditional", "Airbrush", "Natural", "Glamour", "Cultural Specialties"
  ],
  'hair-stylists': [
    "Updos", "Extensions", "Natural Styling", "Vintage/Retro", "Cultural Specialties"
  ]
};

// Wedding-related keywords to filter vendors
const WEDDING_KEYWORDS = [
  "wedding", "bride", "groom", "bridal", "marriage", "nuptials", 
  "ceremony", "reception", "engagement", "dallas", "tx", "texas"
];

/**
 * Main function to run the collection process
 */
async function main() {
  console.log("Starting Instagram vendor collection for Dallas wedding vendors...");
  
  try {
    // Initialize Supabase client
    await initSupabase();
    // Process each vendor category
    for (const category of VENDOR_CATEGORIES) {
      console.log(`\nProcessing category: ${category.name}`);
      
      // Step 1: Search for Instagram profiles
      const instagramUrls = await searchForVendors(category);
      console.log(`Found ${instagramUrls.length} Instagram URLs for ${category.name}`);
      
      // Step 2: Extract profile data
      const vendorProfiles = await extractProfileData(instagramUrls, category);
      console.log(`Extracted ${vendorProfiles.length} vendor profiles for ${category.name}`);
      
      // Step 3: Analyze network to find more vendors (for top profiles)
      const topProfiles = vendorProfiles.slice(0, 5); // Limit to top 5 to avoid rate limiting
      const additionalProfiles = await analyzeNetwork(topProfiles, category);
      console.log(`Found ${additionalProfiles.length} additional vendors through network analysis`);
      
      // Combine all profiles
      const allProfiles = [...vendorProfiles, ...additionalProfiles];
      
      // Step 4: Structure data for database
      const structuredData = structureData(allProfiles, category);
      console.log(`Structured ${structuredData.length} vendor records for database insertion`);
      
      // Step 5: Insert into database
      await insertIntoDatabase(structuredData);
      
      // Add delay between categories to avoid rate limiting
      console.log(`Completed processing for ${category.name}`);
      if (category !== VENDOR_CATEGORIES[VENDOR_CATEGORIES.length - 1]) {
        console.log("Waiting 5 seconds before processing next category...");
        await delay(5000);
      }
    }
    
    console.log("\nInstagram vendor collection completed successfully!");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

/**
 * Search for Instagram profiles of wedding vendors in a specific category
 * @param {Object} category - The vendor category to search for
 * @returns {Promise<string[]>} - Array of Instagram URLs
 */
async function searchForVendors(category) {
  console.log(`Searching for ${category.name} in Dallas...`);
  const instagramUrls = [];
  
  try {
    // Search query format: "dallas wedding [category] instagram"
    const searchQuery = `dallas wedding ${category.slug.replace(/-/g, " ")} instagram`;
    console.log(`Search query: "${searchQuery}"`);
    
    // Use Bright Data search_engine tool
    const searchResults = await callBrightDataTool('search_engine', {
      query: searchQuery,
      engine: 'google'
    });
    
    // Extract Instagram URLs from search results
    if (searchResults && Array.isArray(searchResults)) {
      for (const result of searchResults) {
        const url = result.url || '';
        if (isInstagramUrl(url)) {
          instagramUrls.push(url);
        }
      }
    }
    
    console.log(`Found ${instagramUrls.length} Instagram URLs`);
    return instagramUrls;
  } catch (error) {
    console.error(`Error searching for ${category.name}:`, error);
    return [];
  }
}

/**
 * Extract profile data from Instagram URLs
 * @param {string[]} urls - Array of Instagram profile URLs
 * @param {Object} category - The vendor category
 * @returns {Promise<Object[]>} - Array of vendor profile data
 */
async function extractProfileData(urls, category) {
  console.log(`Extracting profile data from ${urls.length} URLs...`);
  const vendorProfiles = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`Processing URL ${i+1}/${urls.length}: ${url}`);
      
      // Use Bright Data web_data_instagram_profiles tool
      const profileData = await callBrightDataTool('web_data_instagram_profiles', {
        url: url
      });
      
      // Check if this is a wedding vendor
      if (profileData && isWeddingVendor(profileData, category)) {
        vendorProfiles.push(profileData);
        console.log(`Added vendor: ${profileData.username}`);
      } else {
        console.log(`Skipped: ${url} (not a wedding vendor)`);
      }
      
      // Add delay to avoid rate limiting
      if (i < urls.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      console.error(`Error extracting profile data for ${url}:`, error);
    }
  }
  
  return vendorProfiles;
}

/**
 * Analyze vendor networks to find more vendors
 * @param {Object[]} profiles - Array of vendor profiles to analyze
 * @param {Object} category - The vendor category
 * @returns {Promise<Object[]>} - Array of additional vendor profiles
 */
async function analyzeNetwork(profiles, category) {
  console.log(`Analyzing network for ${profiles.length} top profiles...`);
  const additionalProfiles = [];
  const mentionedAccounts = new Set();
  
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    try {
      console.log(`Analyzing posts for ${profile.username}...`);
      
      // Use Bright Data web_data_instagram_posts tool
      const posts = await callBrightDataTool('web_data_instagram_posts', {
        url: profile.profile_url || `https://www.instagram.com/${profile.username}/`
      });
      
      // Extract mentions from posts
      if (posts && Array.isArray(posts)) {
        for (const post of posts) {
          const mentions = extractMentions(post.caption || '');
          mentions.forEach(mention => mentionedAccounts.add(mention));
        }
      }
      
      // Add delay to avoid rate limiting
      if (i < profiles.length - 1) {
        await delay(3000);
      }
    } catch (error) {
      console.error(`Error analyzing posts for ${profile.username}:`, error);
    }
  }
  
  console.log(`Found ${mentionedAccounts.size} mentioned accounts`);
  
  // Check if mentioned accounts are wedding vendors
  const mentionsArray = Array.from(mentionedAccounts);
  for (let i = 0; i < mentionsArray.length; i++) {
    const mention = mentionsArray[i];
    try {
      // Skip if already in profiles
      if (profiles.some(p => p.username === mention)) {
        continue;
      }
      
      console.log(`Checking mentioned account: ${mention}`);
      
      // Use Bright Data web_data_instagram_profiles tool
      const profileData = await callBrightDataTool('web_data_instagram_profiles', {
        url: `https://www.instagram.com/${mention}/`
      });
      
      // Check if this is a wedding vendor
      if (profileData && isWeddingVendor(profileData, category)) {
        additionalProfiles.push(profileData);
        console.log(`Added vendor from network: ${profileData.username}`);
      }
      
      // Add delay to avoid rate limiting
      if (i < mentionsArray.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      console.error(`Error checking mentioned account ${mention}:`, error);
    }
    
    // Limit the number of additional profiles to check (to avoid excessive API calls)
    if (additionalProfiles.length >= 5) {
      console.log("Reached limit of additional profiles to check");
      break;
    }
  }
  
  return additionalProfiles;
}

/**
 * Structure vendor data for database insertion
 * @param {Object[]} profiles - Array of vendor profiles
 * @param {Object} category - The vendor category
 * @returns {Object[]} - Array of structured vendor records
 */
function structureData(profiles, category) {
  console.log(`Structuring data for ${profiles.length} profiles...`);
  const structuredVendors = [];
  
  for (const profile of profiles) {
    // Determine subcategory based on bio and profile data
    const subcategory = determineSubcategory(profile, category);
    
    structuredVendors.push({
      instagram_handle: profile.username,
      business_name: profile.full_name || profile.username,
      category: category.slug,
      subcategory: subcategory,
      website_url: profile.website_url || null,
      email: profile.email || null,
      phone: profile.phone || null,
      follower_count: profile.follower_count || 0,
      post_count: profile.post_count || 0,
      bio: profile.bio || '',
      profile_image_url: profile.profile_image_url || null,
      is_verified: profile.is_verified || false,
      is_business_account: profile.is_business_account || false,
      city: 'Dallas',
      state: 'TX'
    });
  }
  
  return structuredVendors;
}

/**
 * Insert vendor data into the Supabase database
 * @param {Object[]} vendors - Array of structured vendor records
 * @returns {Promise<void>}
 */
async function insertIntoDatabase(vendors) {
  if (vendors.length === 0) {
    console.log("No vendors to insert");
    return;
  }
  
  console.log(`Inserting ${vendors.length} vendors into database...`);
  
  // Process in batches to prevent timeouts
  const batchSize = 20;
  for (let i = 0; i < vendors.length; i += batchSize) {
    const batch = vendors.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(vendors.length/batchSize)}`);
    
    try {
      const { error } = await supabase
        .from('instagram_vendors')
        .upsert(batch, { 
          onConflict: 'instagram_handle,category',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} successfully`);
      }
    } catch (error) {
      console.error('Error in database operation:', error);
    }
    
    // Add delay between batches
    if (i + batchSize < vendors.length) {
      await delay(1000);
    }
  }
}

/**
 * Check if a URL is an Instagram profile URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's an Instagram profile URL
 */
function isInstagramUrl(url) {
  return url && (
    url.includes('instagram.com/') || 
    url.includes('www.instagram.com/')
  ) && !url.includes('/p/'); // Exclude post URLs
}

/**
 * Check if a profile is a wedding vendor based on bio and other data
 * @param {Object} profile - The Instagram profile data
 * @param {Object} category - The vendor category
 * @returns {boolean} - True if it's a wedding vendor
 */
function isWeddingVendor(profile, category) {
  if (!profile || !profile.bio) {
    return false;
  }
  
  const bio = profile.bio.toLowerCase();
  
  // Check for wedding-related keywords
  const hasWeddingKeyword = WEDDING_KEYWORDS.some(keyword => 
    bio.includes(keyword.toLowerCase())
  );
  
  // Check for category-specific keywords
  const hasCategoryKeyword = category.keywords.some(keyword => 
    bio.includes(keyword.toLowerCase())
  );
  
  // Check for Dallas location
  const hasDallasLocation = bio.includes('dallas') || 
                           bio.includes('dfw') || 
                           bio.includes('north texas');
  
  // Consider it a wedding vendor if it has wedding keywords and category keywords
  return hasWeddingKeyword && (hasCategoryKeyword || hasDallasLocation);
}

/**
 * Determine the subcategory of a vendor based on bio and profile data
 * @param {Object} profile - The Instagram profile data
 * @param {Object} category - The vendor category
 * @returns {string|null} - The determined subcategory or null
 */
function determineSubcategory(profile, category) {
  if (!profile || !profile.bio || !category || !category.slug) {
    return null;
  }
  
  const bio = profile.bio.toLowerCase();
  const subcategories = VENDOR_SUBCATEGORIES[category.slug] || [];
  
  // Check each subcategory for keyword matches
  for (const subcategory of subcategories) {
    const keywords = getSubcategoryKeywords(subcategory);
    
    // Check if any keywords match in the bio
    if (keywords.some(keyword => bio.includes(keyword.toLowerCase()))) {
      return subcategory;
    }
  }
  
  return null;
}

/**
 * Get keywords for a specific subcategory
 * @param {string} subcategory - The subcategory name
 * @returns {string[]} - Array of keywords
 */
function getSubcategoryKeywords(subcategory) {
  const subcategoryKeywords = {
    // Wedding Planners
    "Full-Service Planning": ["full service", "comprehensive", "complete", "full planning"],
    "Day-of Coordination": ["day of", "day-of", "coordinator", "on the day"],
    "Partial Planning": ["partial", "some aspects", "specific services"],
    "Destination Wedding Planning": ["destination", "travel", "abroad"],
    "Cultural Wedding Specialists": ["cultural", "traditional", "specific culture"],
    
    // Photographers
    "Traditional Photography": ["traditional", "formal", "portraits", "posed"],
    "Photojournalistic": ["photojournalistic", "candid", "documentary", "storytelling"],
    "Fine Art": ["fine art", "artistic", "editorial", "creative"],
    "Aerial Photography": ["aerial", "drone", "birds eye"],
    "Engagement Specialists": ["engagement", "pre-wedding"],
    
    // Videographers
    "Cinematic": ["cinematic", "film", "movie", "cinema"],
    "Documentary": ["documentary", "journalistic", "story"],
    "Aerial": ["aerial", "drone", "birds eye"],
    "Same-Day Edit": ["same day", "same-day", "quick edit", "preview"],
    
    // Florists
    "Modern Arrangements": ["modern", "contemporary", "unique"],
    "Classic/Traditional": ["classic", "traditional", "timeless"],
    "Rustic/Bohemian": ["rustic", "boho", "bohemian", "wildflower", "natural"],
    "Minimalist": ["minimalist", "simple", "clean"],
    "Luxury/Extravagant": ["luxury", "extravagant", "high-end", "opulent"],
    
    // Caterers
    "American": ["american", "burgers", "steaks", "comfort food"],
    "Italian": ["italian", "pasta", "pizza", "risotto"],
    "Mexican": ["mexican", "tacos", "enchiladas", "burritos"],
    "Indian": ["indian", "curry", "tandoori"],
    "Chinese": ["chinese", "dim sum", "stir fry"],
    "Mediterranean": ["mediterranean", "greek", "turkish"],
    "Japanese": ["japanese", "sushi", "ramen"],
    "Thai": ["thai", "curry", "pad thai"],
    "French": ["french", "pastries", "cuisine"],
    "Spanish": ["spanish", "paella", "tapas"],
    "Middle Eastern": ["middle eastern", "falafel", "hummus"],
    
    // Venues
    "Ballrooms": ["ballroom", "banquet hall", "indoor"],
    "Barns & Farms": ["barn", "farm", "rustic", "countryside"],
    "Beach/Waterfront": ["beach", "waterfront", "ocean", "lake", "river"],
    "Gardens & Parks": ["garden", "park", "outdoor", "nature"],
    "Historic Buildings": ["historic", "heritage", "old", "landmark"],
    "Hotels & Resorts": ["hotel", "resort", "accommodation"],
    "Wineries & Vineyards": ["winery", "vineyard", "wine"],
    "Industrial Spaces": ["industrial", "warehouse", "loft", "urban"],
    
    // DJs & Bands
    "DJs": ["dj", "disc jockey", "music"],
    "Live Bands": ["band", "live music", "musicians"],
    "Solo Musicians": ["solo", "single", "acoustic"],
    "Orchestras": ["orchestra", "classical", "ensemble"],
    "Cultural Music Specialists": ["cultural music", "traditional music"],
    
    // Cake Designers
    "Traditional": ["traditional", "classic", "tiered"],
    "Modern": ["modern", "contemporary", "unique"],
    "Custom Design": ["custom", "bespoke", "personalized"],
    "Specialty Flavors": ["specialty", "flavors", "unique taste"],
    "Gluten-Free/Vegan": ["gluten-free", "vegan", "allergen-free"],
    
    // Bridal Shops
    "Designer Gowns": ["designer", "couture", "high-end"],
    "Custom Design": ["custom", "bespoke", "made-to-measure"],
    "Plus Size": ["plus size", "inclusive", "all sizes"],
    "Budget-Friendly": ["budget", "affordable", "reasonable"],
    "Accessories": ["accessories", "veils", "jewelry"],
    
    // Makeup Artists
    "Traditional": ["traditional", "classic", "timeless"],
    "Airbrush": ["airbrush", "hd", "long-lasting"],
    "Natural": ["natural", "no-makeup", "subtle"],
    "Glamour": ["glamour", "dramatic", "bold"],
    "Cultural Specialties": ["cultural", "ethnic", "specialized"],
    
    // Hair Stylists
    "Updos": ["updo", "up-style", "formal"],
    "Extensions": ["extensions", "added length", "volume"],
    "Natural Styling": ["natural", "organic", "effortless"],
    "Vintage/Retro": ["vintage", "retro", "classic"],
    "Cultural Specialties": ["cultural", "ethnic", "specialized"]
  };
  
  return subcategoryKeywords[subcategory] || [];
}

/**
 * Extract mentioned accounts from post captions
 * @param {string} text - The post caption text
 * @returns {string[]} - Array of mentioned account usernames
 */
function extractMentions(text) {
  if (!text) return [];
  
  const mentions = [];
  const mentionRegex = /@([a-zA-Z0-9._]+)/g;
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
}

/**
 * Call a Bright Data MCP tool
 * @param {string} toolName - The name of the tool to call
 * @param {Object} params - The parameters for the tool
 * @returns {Promise<any>} - The tool result
 */
async function callBrightDataTool(toolName, params) {
  try {
    console.log(`Calling Bright Data tool: ${toolName} with params:`, params);
    
    // Use the MCP tool with the Bright Data server
    // This function is only available in the Cline environment
    if (typeof use_mcp_tool !== 'function') {
      throw new Error('This script must be run in the Cline environment where use_mcp_tool is available');
    }
    
    return await use_mcp_tool(
      'github.com/luminati-io/brightdata-mcp',
      toolName,
      params
    );
  } catch (error) {
    console.error(`Error calling Bright Data tool ${toolName}:`, error);
    throw error;
  }
}

/**
 * Delay execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the main function
main().catch(console.error);
