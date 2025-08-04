/**
 * Instagram Vendor Collection Runner
 * 
 * This script demonstrates how to run the Instagram collection system
 * with real Bright Data MCP calls for your wedding vendor categories.
 */

import { InstagramCollector, WEDDING_CATEGORIES, TARGET_CITIES } from './instagram-vendor-collection-system.js';

/**
 * Production MCP Integration Class
 * This replaces the mock functions with real MCP calls
 */
class ProductionInstagramCollector extends InstagramCollector {
  constructor(mcpClient) {
    super();
    this.mcpClient = mcpClient; // MCP client would be passed in
  }

  /**
   * Real MCP search implementation
   */
  async searchInstagramVendors(city, state, searchTerm) {
    console.log(`🔍 Searching: ${searchTerm} in ${city}, ${state}`);
    
    try {
      this.stats.totalSearches++;
      
      // Real MCP call using the connected Bright Data server
      const response = await this.mcpClient.useTool({
        server_name: "github.com/luminati-io/brightdata-mcp",
        tool_name: "search_engine",
        arguments: {
          query: `site:instagram.com "${searchTerm}" "${city}" "${state}"`,
          engine: "google"
        }
      });
      
      // Parse the response to extract Instagram URLs
      const results = this.parseSearchResponse(response);
      console.log(`📊 Found ${results.length} Instagram profiles`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Search failed for ${searchTerm} in ${city}:`, error);
      this.stats.failedExtractions++;
      return [];
    }
  }

  /**
   * Real MCP profile extraction
   */
  async extractInstagramProfile(profileUrl) {
    console.log(`📱 Extracting profile: ${profileUrl}`);
    
    try {
      this.stats.totalProfiles++;
      
      // Real MCP call for Instagram profile data
      const response = await this.mcpClient.useTool({
        server_name: "github.com/luminati-io/brightdata-mcp",
        tool_name: "web_data_instagram_profiles",
        arguments: {
          url: profileUrl
        }
      });
      
      // Parse the profile data
      const profileData = this.parseProfileResponse(response);
      
      this.stats.successfulExtractions++;
      return profileData;
      
    } catch (error) {
      console.error(`❌ Profile extraction failed for ${profileUrl}:`, error);
      this.stats.failedExtractions++;
      return null;
    }
  }

  /**
   * Real MCP posts analysis
   */
  async analyzeInstagramPosts(profileUrl) {
    console.log(`📊 Analyzing posts: ${profileUrl}`);
    
    try {
      // Real MCP call for Instagram posts
      const response = await this.mcpClient.useTool({
        server_name: "github.com/luminati-io/brightdata-mcp",
        tool_name: "web_data_instagram_posts",
        arguments: {
          url: profileUrl
        }
      });
      
      // Parse and analyze the posts data
      const postsData = this.parsePostsResponse(response);
      
      return postsData;
      
    } catch (error) {
      console.error(`❌ Posts analysis failed for ${profileUrl}:`, error);
      return null;
    }
  }

  /**
   * Parse search response to extract Instagram URLs
   */
  parseSearchResponse(response) {
    const results = [];
    
    // The response would be HTML content from Google search
    // Extract Instagram URLs from the search results
    const instagramUrlRegex = /https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?/g;
    const matches = response.match(instagramUrlRegex) || [];
    
    // Remove duplicates and format results
    const uniqueUrls = [...new Set(matches)];
    
    for (const url of uniqueUrls) {
      results.push({
        url: url,
        title: `Instagram Profile - ${url.split('/').pop()}`,
        description: `Instagram profile found in search results`
      });
    }
    
    return results;
  }

  /**
   * Parse profile response from MCP
   */
  parseProfileResponse(response) {
    // The response would be JSON data from Bright Data
    // Similar to what we got in our test: Ruby Olivia Photography data
    
    if (Array.isArray(response) && response.length > 0) {
      const profileData = response[0];
      
      return {
        username: profileData.account,
        display_name: profileData.profile_name || profileData.full_name,
        bio: profileData.biography,
        followers_count: profileData.followers,
        following_count: profileData.following,
        posts_count: profileData.posts_count,
        is_business_account: profileData.is_business_account,
        is_verified: profileData.is_verified,
        contact_info: {
          email: profileData.email_address,
          phone: null, // Usually not available in public data
          website: profileData.external_url?.[0]
        },
        location: this.extractLocationFromBio(profileData.biography)
      };
    }
    
    return null;
  }

  /**
   * Parse posts response and calculate metrics
   */
  parsePostsResponse(response) {
    if (Array.isArray(response) && response.length > 0) {
      const profileData = response[0];
      const posts = profileData.posts || [];
      
      if (posts.length === 0) {
        return {
          total_posts: 0,
          avg_likes: 0,
          avg_comments: 0,
          engagement_rate: 0,
          recent_activity: false,
          content_quality_score: 0,
          wedding_content_percentage: 0,
          posting_consistency: 0,
          common_hashtags: []
        };
      }
      
      // Calculate engagement metrics
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
      const avgLikes = totalLikes / posts.length;
      const avgComments = totalComments / posts.length;
      
      // Calculate engagement rate
      const totalEngagement = totalLikes + totalComments;
      const engagementRate = profileData.followers > 0 
        ? (totalEngagement / (posts.length * profileData.followers)) * 100
        : 0;
      
      // Analyze content for wedding relevance
      const weddingKeywords = ['wedding', 'bride', 'bridal', 'engagement', 'married', 'ceremony', 'reception'];
      let weddingPosts = 0;
      const allHashtags = [];
      
      posts.forEach(post => {
        const caption = (post.caption || '').toLowerCase();
        const hashtags = post.post_hashtags || [];
        
        // Check for wedding content
        if (weddingKeywords.some(keyword => caption.includes(keyword)) ||
            hashtags.some(tag => weddingKeywords.some(keyword => tag.toLowerCase().includes(keyword)))) {
          weddingPosts++;
        }
        
        // Collect hashtags
        allHashtags.push(...hashtags);
      });
      
      const weddingContentPercentage = (weddingPosts / posts.length) * 100;
      
      // Check recent activity (posts in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentPosts = posts.filter(post => {
        const postDate = new Date(post.datetime);
        return postDate > thirtyDaysAgo;
      });
      
      const recentActivity = recentPosts.length > 0;
      
      // Calculate content quality score based on engagement and consistency
      let contentQualityScore = 50; // Base score
      
      if (engagementRate > 2) contentQualityScore += 20;
      else if (engagementRate > 1) contentQualityScore += 10;
      
      if (weddingContentPercentage > 80) contentQualityScore += 20;
      else if (weddingContentPercentage > 60) contentQualityScore += 10;
      
      if (recentActivity) contentQualityScore += 10;
      
      // Get most common hashtags
      const hashtagCounts = {};
      allHashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
      
      const commonHashtags = Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
      
      return {
        total_posts: posts.length,
        avg_likes: Math.round(avgLikes),
        avg_comments: Math.round(avgComments),
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        recent_activity: recentActivity,
        content_quality_score: Math.min(contentQualityScore, 100),
        wedding_content_percentage: Math.round(weddingContentPercentage),
        posting_consistency: recentPosts.length / 30, // Posts per day in last 30 days
        common_hashtags: commonHashtags
      };
    }
    
    return null;
  }

  /**
   * Extract location information from bio
   */
  extractLocationFromBio(bio) {
    if (!bio) return null;
    
    // Simple location extraction - look for city, state patterns
    const locationPatterns = [
      /([A-Z][a-z]+),\s*([A-Z]{2})/g, // City, ST
      /([A-Z][a-z\s]+),\s*([A-Z][a-z\s]+)/g, // City Name, State Name
      /(NYC|LA|SF|Chicago|Miami|Boston|Seattle|Atlanta|Denver)/gi // Major cities
    ];
    
    for (const pattern of locationPatterns) {
      const match = bio.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
}

/**
 * Collection execution functions
 */

/**
 * Run a test collection for specific categories and cities
 */
async function runTestCollection() {
  console.log('🧪 Running Test Collection (Mock Data)');
  
  const collector = new InstagramCollector();
  
  const options = {
    maxCities: 2,
    maxCategories: 2,
    priorityLevel: 1,
    testMode: true
  };
  
  await collector.runCollection(options);
}

/**
 * Run production collection with real MCP calls
 */
async function runProductionCollection(mcpClient) {
  console.log('🚀 Running Production Collection (Real MCP Data)');
  
  const collector = new ProductionInstagramCollector(mcpClient);
  
  const options = {
    maxCities: 3,
    maxCategories: 4,
    priorityLevel: 1,
    testMode: false
  };
  
  await collector.runCollection(options);
}

/**
 * Run collection for specific category
 */
async function runCategoryCollection(category, cities = 3) {
  console.log(`🎯 Running Collection for: ${category}`);
  
  if (!WEDDING_CATEGORIES[category]) {
    console.error(`❌ Unknown category: ${category}`);
    console.log('Available categories:', Object.keys(WEDDING_CATEGORIES));
    return;
  }
  
  const collector = new InstagramCollector();
  
  // Override the runCollection method to focus on one category
  const targetCities = TARGET_CITIES.slice(0, cities);
  
  for (const city of targetCities) {
    console.log(`\n🌟 Processing ${city.name}, ${city.state} for ${category}`);
    
    const result = await collector.collectVendorsForCityCategory(
      city.name, 
      city.state, 
      category
    );
    
    console.log(`📊 Results: ${result.successful}/${result.processed} successful`);
    
    // Delay between cities
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  collector.printFinalStats();
}

/**
 * Display collection statistics and configuration
 */
function displayCollectionInfo() {
  console.log('📋 Instagram Vendor Collection System');
  console.log('=====================================\n');
  
  console.log('🎯 Available Categories:');
  Object.entries(WEDDING_CATEGORIES).forEach(([category, config]) => {
    console.log(`  • ${category}`);
    console.log(`    - Search terms: ${config.searchTerms.join(', ')}`);
    console.log(`    - Subcategories: ${config.subcategories.join(', ')}`);
    console.log(`    - Min followers: ${config.minFollowers}`);
    console.log(`    - Quality weight: ${config.qualityWeight}\n`);
  });
  
  console.log('🏙️ Target Cities by Priority:');
  [1, 2, 3].forEach(priority => {
    const cities = TARGET_CITIES.filter(city => city.priority === priority);
    console.log(`  Priority ${priority}: ${cities.map(c => `${c.name}, ${c.state}`).join(' | ')}`);
  });
  
  console.log('\n🚀 Usage Examples:');
  console.log('  node scripts/run-instagram-collection.js --test');
  console.log('  node scripts/run-instagram-collection.js --category="Wedding Photographer"');
  console.log('  node scripts/run-instagram-collection.js --production --cities=5 --categories=3');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    displayCollectionInfo();
    return;
  }
  
  if (args.includes('--info')) {
    displayCollectionInfo();
    return;
  }
  
  if (args.includes('--test')) {
    await runTestCollection();
    return;
  }
  
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  if (categoryArg) {
    const category = categoryArg.split('=')[1].replace(/"/g, '');
    const cities = parseInt(args.find(arg => arg.startsWith('--cities='))?.split('=')[1]) || 3;
    await runCategoryCollection(category, cities);
    return;
  }
  
  if (args.includes('--production')) {
    console.log('🚨 Production mode requires MCP client integration');
    console.log('This would connect to the actual Bright Data MCP server');
    console.log('For now, running test mode...\n');
    await runTestCollection();
    return;
  }
  
  // Default: show info
  displayCollectionInfo();
}

// Export functions for use in other scripts
export {
  ProductionInstagramCollector,
  runTestCollection,
  runProductionCollection,
  runCategoryCollection,
  displayCollectionInfo
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
