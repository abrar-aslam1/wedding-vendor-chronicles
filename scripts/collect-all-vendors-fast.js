#!/usr/bin/env node

/**
 * FAST Comprehensive Vendor Collection Script
 * 
 * This script skips the cache checking phase and goes straight to processing
 * for maximum speed. The API calls will naturally handle cache checking.
 * 
 * FAST Features:
 * - No pre-cache checking (API handles this naturally)
 * - Proper DataForSEO rate limiting (1800 req/min)
 * - Concurrent requests (up to 25 simultaneous)
 * - Wedding Decorators category included
 * - Progress tracking and resume capability
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// FAST Rate limiting configuration
const REQUESTS_PER_MINUTE = 1800;
const MAX_CONCURRENT_REQUESTS = 25;
const DELAY_BETWEEN_BATCHES = 100;

// Progress tracking
const PROGRESS_FILE = './vendor-collection-progress-fast.json';

// Major US cities by state (top 3-5 cities per state)
const MAJOR_CITIES = {
  "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
  "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
  "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
  "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville"],
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
  "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
  "Connecticut": ["Hartford", "Bridgeport", "New Haven", "Stamford"],
  "Delaware": ["Wilmington", "Dover", "Newark"],
  "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
  "Georgia": ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah"],
  "Hawaii": ["Honolulu", "Pearl City", "Hilo", "Kailua"],
  "Idaho": ["Boise", "Meridian", "Nampa", "Idaho Falls"],
  "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville"],
  "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"],
  "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City"],
  "Kansas": ["Wichita", "Overland Park", "Kansas City", "Topeka"],
  "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro"],
  "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette"],
  "Maine": ["Portland", "Lewiston", "Bangor", "South Portland"],
  "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie"],
  "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge"],
  "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing"],
  "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth"],
  "Mississippi": ["Jackson", "Gulfport", "Southaven", "Hattiesburg"],
  "Missouri": ["Kansas City", "Saint Louis", "Springfield", "Independence"],
  "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman"],
  "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island"],
  "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison"],
  "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe"],
  "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Asheville"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
  "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow"],
  "Oregon": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"],
  "Rhode Island": ["Providence", "Cranston", "Warwick", "Pawtucket"],
  "South Carolina": ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings"],
  "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
  "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
  "Utah": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"],
  "Vermont": ["Burlington", "Essex", "South Burlington", "Colchester"],
  "Virginia": ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria"],
  "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent"],
  "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Morgantown"],
  "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette"]
};

// Wedding vendor categories (INCLUDING Wedding Decorators)
const VENDOR_CATEGORIES = [
  {
    keyword: "photographer",
    subcategories: ["engagement specialists", "traditional", "modern", "destination", "fine art", "photojournalistic"]
  },
  {
    keyword: "wedding venue",
    subcategories: ["outdoor", "indoor", "rustic", "elegant", "beach", "garden", "historic", "modern"]
  },
  {
    keyword: "caterer",
    subcategories: ["traditional", "italian", "mexican", "asian", "vegan", "kosher", "southern", "mediterranean"]
  },
  {
    keyword: "florist",
    subcategories: ["bridal", "ceremony", "reception", "rustic", "elegant", "modern", "traditional"]
  },
  {
    keyword: "wedding planner",
    subcategories: ["full service", "day of coordination", "destination", "luxury", "budget friendly"]
  },
  {
    keyword: "videographer",
    subcategories: ["cinematic", "traditional", "documentary", "highlight reels", "drone"]
  },
  {
    keyword: "dj",
    subcategories: ["wedding reception", "ceremony", "cocktail hour", "dance party"]
  },
  {
    keyword: "band",
    subcategories: ["wedding reception", "jazz", "acoustic", "cover band", "classical"]
  },
  {
    keyword: "cake designer",
    subcategories: ["traditional", "modern", "rustic", "elegant", "custom", "cupcakes"]
  },
  {
    keyword: "makeup artist",
    subcategories: ["bridal", "airbrush", "traditional", "natural", "glamorous"]
  },
  {
    keyword: "hair stylist",
    subcategories: ["bridal", "updo", "natural", "vintage", "modern"]
  },
  {
    keyword: "bridal shop",
    subcategories: ["designer", "budget friendly", "plus size", "vintage", "modern"]
  },
  {
    keyword: "wedding decorator",
    subcategories: ["floral arrangements", "lighting design", "table settings", "ceremony backdrops", "reception decor", "vintage/rustic decor"]
  }
];

class FastVendorCollector {
  constructor() {
    this.progress = this.loadProgress();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      skippedRequests: 0,
      totalCost: 0,
      startTime: new Date(),
      requestsThisMinute: 0,
      minuteStartTime: new Date()
    };
  }

  loadProgress() {
    try {
      if (fs.existsSync(PROGRESS_FILE)) {
        const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading progress file:', error);
    }
    
    return {
      completedSearches: new Set(),
      completedCount: 0
    };
  }

  saveProgress() {
    try {
      const progressData = {
        ...this.progress,
        completedSearches: Array.from(this.progress.completedSearches),
        stats: this.stats
      };
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  generateSearchKey(state, city, category, subcategory) {
    return `${state}|${city}|${category}|${subcategory || 'none'}`;
  }

  getStateAbbreviation(stateName) {
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
    return stateAbbreviations[stateName] || stateName;
  }

  async callVendorAPI(city, state, category, subcategory) {
    return new Promise(async (resolve) => {
      try {
        const stateAbbr = this.getStateAbbreviation(state);
        const location = `${city}, ${stateAbbr}`;
        
        console.log(`🔍 ${category} in ${location} (${subcategory || 'none'})`);
        
        const { data, error } = await supabase.functions.invoke('search-google-vendors', {
          body: {
            keyword: category,
            location: location,
            subcategory: subcategory
          }
        });

        if (error) {
          console.error(`❌ ${location} - ${category}:`, error.message);
          this.stats.failedRequests++;
          resolve(false);
          return;
        }

        const resultCount = data?.results?.length || 0;
        const cost = data?.cost || 0;
        
        if (resultCount > 0) {
          console.log(`✅ ${resultCount} results for ${category} in ${location} ($${cost})`);
        } else {
          console.log(`💾 Cached: ${category} in ${location}`);
          this.stats.skippedRequests++;
        }
        
        this.stats.successfulRequests++;
        this.stats.totalCost += cost;
        
        resolve(true);
      } catch (error) {
        console.error(`❌ Network error: ${city}, ${state} - ${category}:`, error.message);
        this.stats.failedRequests++;
        resolve(false);
      }
    });
  }

  async manageRateLimit() {
    const now = new Date();
    const timeSinceMinuteStart = now - this.minuteStartTime;
    
    if (timeSinceMinuteStart >= 60000) {
      this.stats.requestsThisMinute = 0;
      this.minuteStartTime = now;
    }
    
    if (this.stats.requestsThisMinute >= REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - timeSinceMinuteStart;
      console.log(`⏸️ Rate limit reached. Waiting ${Math.ceil(waitTime/1000)}s...`);
      await this.delay(waitTime);
      this.stats.requestsThisMinute = 0;
      this.minuteStartTime = new Date();
    }
  }

  async processRequestsConcurrently(requests) {
    const results = [];
    
    for (let i = 0; i < requests.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = requests.slice(i, i + MAX_CONCURRENT_REQUESTS);
      
      await this.manageRateLimit();
      
      console.log(`🚀 Batch ${Math.floor(i/MAX_CONCURRENT_REQUESTS) + 1}/${Math.ceil(requests.length/MAX_CONCURRENT_REQUESTS)}: ${batch.length} requests`);
      
      const batchPromises = batch.map(async (request) => {
        this.stats.requestsThisMinute++;
        this.stats.totalRequests++;
        
        const result = await this.callVendorAPI(
          request.city, 
          request.state, 
          request.category, 
          request.subcategory
        );
        
        if (result) {
          this.progress.completedSearches.add(request.searchKey);
          this.progress.completedCount++;
        }
        
        return { ...request, success: result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Print progress every batch
      this.printStats();
      
      // Save progress every 10 batches
      if ((i / MAX_CONCURRENT_REQUESTS) % 10 === 0) {
        this.saveProgress();
      }
      
      if (i + MAX_CONCURRENT_REQUESTS < requests.length) {
        await this.delay(DELAY_BETWEEN_BATCHES);
      }
    }
    
    return results;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calculateTotalSearches() {
    let total = 0;
    for (const [state, cities] of Object.entries(MAJOR_CITIES)) {
      for (const city of cities) {
        for (const categoryObj of VENDOR_CATEGORIES) {
          total++; // One search without subcategory
          total += categoryObj.subcategories.length; // One for each subcategory
        }
      }
    }
    return total;
  }

  printStats() {
    const elapsed = (new Date() - this.stats.startTime) / 1000 / 60; // minutes
    const rate = this.stats.totalRequests / elapsed;
    const estimatedTotal = this.calculateTotalSearches();
    const remaining = estimatedTotal - this.progress.completedCount;
    const estimatedTimeRemaining = remaining / rate;

    console.log('\n📊 FAST COLLECTION STATISTICS');
    console.log('=============================');
    console.log(`Progress: ${this.progress.completedCount}/${estimatedTotal} (${((this.progress.completedCount/estimatedTotal)*100).toFixed(1)}%)`);
    console.log(`Successful: ${this.stats.successfulRequests} | Failed: ${this.stats.failedRequests} | Cached: ${this.stats.skippedRequests}`);
    console.log(`Cost: $${this.stats.totalCost.toFixed(2)} | Rate: ${rate.toFixed(1)} req/min`);
    console.log(`ETA: ${estimatedTimeRemaining.toFixed(1)} minutes`);
    console.log('=============================\n');
  }

  async run() {
    console.log('🚀 Starting FAST Comprehensive Vendor Collection');
    console.log(`📍 ${Object.keys(MAJOR_CITIES).length} states | 🏪 ${VENDOR_CATEGORIES.length} categories (including Wedding Decorators!)`);
    console.log(`📊 Total searches: ${this.calculateTotalSearches()}`);
    console.log(`⚡ Rate: ${REQUESTS_PER_MINUTE} req/min | 🔄 Concurrent: ${MAX_CONCURRENT_REQUESTS}`);
    console.log(`💰 No cache pre-checking - going straight to collection!\n`);

    // Convert completedSearches array back to Set if needed
    if (Array.isArray(this.progress.completedSearches)) {
      this.progress.completedSearches = new Set(this.progress.completedSearches);
    }

    // Build all requests
    const allRequests = [];
    
    for (const [state, cities] of Object.entries(MAJOR_CITIES)) {
      for (const city of cities) {
        for (const categoryObj of VENDOR_CATEGORIES) {
          const { keyword: category, subcategories } = categoryObj;
          
          // Add request without subcategory
          const searchKeyNoSub = this.generateSearchKey(state, city, category, null);
          if (!this.progress.completedSearches.has(searchKeyNoSub)) {
            allRequests.push({
              state, city, category, subcategory: null, searchKey: searchKeyNoSub
            });
          }
          
          // Add requests with subcategories
          for (const subcategory of subcategories) {
            const searchKey = this.generateSearchKey(state, city, category, subcategory);
            if (!this.progress.completedSearches.has(searchKey)) {
              allRequests.push({
                state, city, category, subcategory, searchKey
              });
            }
          }
        }
      }
    }

    console.log(`📋 Processing ${allRequests.length} requests\n`);

    if (allRequests.length === 0) {
      console.log('🎉 All searches already completed!');
      this.printStats();
      return;
    }

    // Process all requests concurrently
    await this.processRequestsConcurrently(allRequests);

    // Save final progress
    this.saveProgress();

    console.log('\n🎉 FAST Collection Complete!');
    this.printStats();
  }
}

// Main execution
async function main() {
  const collector = new FastVendorCollector();
  
  try {
    await collector.run();
  } catch (error) {
    console.error('❌ Collection failed:', error);
    collector.saveProgress();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏸️ Collection paused. Progress saved.');
  console.log('Run the script again to resume from where you left off.');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FastVendorCollector };
