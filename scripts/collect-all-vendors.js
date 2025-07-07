#!/usr/bin/env node

/**
 * Comprehensive Vendor Collection Script
 * 
 * This script systematically collects wedding vendors from all major US cities
 * using the DataForSEO API through our existing search-google-vendors Edge Function.
 * 
 * Features:
 * - Rate limiting to manage API costs
 * - Progress tracking and resume capability
 * - Error handling and retry logic
 * - Cost monitoring
 * - Comprehensive coverage of all major US markets
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Rate limiting configuration
const REQUESTS_PER_MINUTE = 10; // Conservative rate limiting
const DELAY_BETWEEN_REQUESTS = 60000 / REQUESTS_PER_MINUTE; // 6 seconds between requests
const MAX_DAILY_REQUESTS = 200; // Daily limit to control costs

// Progress tracking
const PROGRESS_FILE = './vendor-collection-progress.json';

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

// Wedding vendor categories and subcategories
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
  }
];

class VendorCollector {
  constructor() {
    this.progress = this.loadProgress();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      skippedRequests: 0,
      totalCost: 0,
      startTime: new Date(),
      dailyRequests: 0,
      lastRequestDate: null
    };
    
    // Reset daily counter if it's a new day
    const today = new Date().toDateString();
    if (this.progress.lastRequestDate !== today) {
      this.stats.dailyRequests = 0;
      this.progress.dailyRequests = 0;
      this.progress.lastRequestDate = today;
    } else {
      this.stats.dailyRequests = this.progress.dailyRequests || 0;
    }
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
      currentState: null,
      currentCity: null,
      currentCategory: null,
      currentSubcategory: null,
      totalSearches: 0,
      completedCount: 0,
      dailyRequests: 0,
      lastRequestDate: null
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

  async checkIfCached(city, state, category, subcategory) {
    try {
      // Check cache with subcategory support
      let query = supabase
        .from('vendor_cache')
        .select('created_at, expires_at, search_results, subcategory')
        .eq('category', category)
        .eq('city', city)
        .eq('state', state)
        .gt('expires_at', new Date().toISOString());

      // Add subcategory filter if provided
      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      } else {
        query = query.is('subcategory', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.log(`Cache check error for ${city}, ${state}: ${error.message}`);
        return false;
      }

      if (data) {
        console.log(`✅ Cache hit for ${city}, ${state} - ${category} (subcategory: ${subcategory || 'none'})`);
        return true;
      }

      console.log(`💾 No cache found for ${city}, ${state} - ${category} (subcategory: ${subcategory || 'none'})`);
      return false;
    } catch (error) {
      console.error(`Error checking cache for ${city}, ${state}:`, error);
      return false;
    }
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
    try {
      const stateAbbr = this.getStateAbbreviation(state);
      const location = `${city}, ${stateAbbr}`;
      
      console.log(`🔍 Calling API: ${category} in ${location} (${subcategory || 'no subcategory'})`);
      
      const { data, error } = await supabase.functions.invoke('search-google-vendors', {
        body: {
          keyword: category,
          location: location,
          subcategory: subcategory
        }
      });

      if (error) {
        console.error(`❌ API Error for ${location} - ${category}:`, error);
        this.stats.failedRequests++;
        return false;
      }

      const resultCount = data?.results?.length || 0;
      const cost = data?.cost || 0;
      
      console.log(`✅ API Success: ${resultCount} results for ${category} in ${location} (Cost: $${cost})`);
      
      this.stats.successfulRequests++;
      this.stats.totalCost += cost;
      
      return true;
    } catch (error) {
      console.error(`❌ Network error for ${city}, ${state} - ${category}:`, error);
      this.stats.failedRequests++;
      return false;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  calculateTotalSearches() {
    let total = 0;
    for (const [state, cities] of Object.entries(MAJOR_CITIES)) {
      for (const city of cities) {
        for (const categoryObj of VENDOR_CATEGORIES) {
          // One search without subcategory
          total++;
          // One search for each subcategory
          total += categoryObj.subcategories.length;
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

    console.log('\n📊 COLLECTION STATISTICS');
    console.log('========================');
    console.log(`Total Searches: ${this.progress.completedCount}/${estimatedTotal} (${((this.progress.completedCount/estimatedTotal)*100).toFixed(1)}%)`);
    console.log(`Successful: ${this.stats.successfulRequests}`);
    console.log(`Failed: ${this.stats.failedRequests}`);
    console.log(`Skipped (cached): ${this.stats.skippedRequests}`);
    console.log(`Total Cost: $${this.stats.totalCost.toFixed(2)}`);
    console.log(`Daily Requests: ${this.stats.dailyRequests}/${MAX_DAILY_REQUESTS}`);
    console.log(`Rate: ${rate.toFixed(1)} requests/minute`);
    console.log(`Estimated Time Remaining: ${estimatedTimeRemaining.toFixed(0)} minutes`);
    console.log('========================\n');
  }

  async run() {
    console.log('🚀 Starting Comprehensive Vendor Collection');
    console.log(`📍 Collecting from ${Object.keys(MAJOR_CITIES).length} states`);
    console.log(`🏪 ${VENDOR_CATEGORIES.length} vendor categories`);
    console.log(`📊 Estimated total searches: ${this.calculateTotalSearches()}`);
    console.log(`⏱️  Rate limit: ${REQUESTS_PER_MINUTE} requests/minute`);
    console.log(`💰 Daily limit: ${MAX_DAILY_REQUESTS} requests/day\n`);

    // Convert completedSearches array back to Set if needed
    if (Array.isArray(this.progress.completedSearches)) {
      this.progress.completedSearches = new Set(this.progress.completedSearches);
    }

    for (const [state, cities] of Object.entries(MAJOR_CITIES)) {
      console.log(`\n🏛️  Processing ${state}...`);
      
      for (const city of cities) {
        console.log(`\n🏙️  Processing ${city}, ${state}...`);
        
        for (const categoryObj of VENDOR_CATEGORIES) {
          const { keyword: category, subcategories } = categoryObj;
          
          // Search without subcategory first
          await this.processSearch(state, city, category, null);
          
          // Then search with each subcategory
          for (const subcategory of subcategories) {
            await this.processSearch(state, city, category, subcategory);
          }
        }
      }
    }

    console.log('\n🎉 Collection Complete!');
    this.printStats();
  }

  async processSearch(state, city, category, subcategory) {
    // Check daily limit
    if (this.stats.dailyRequests >= MAX_DAILY_REQUESTS) {
      console.log(`⏸️  Daily limit reached (${MAX_DAILY_REQUESTS}). Stopping for today.`);
      console.log('Resume tomorrow by running the script again.');
      return false;
    }

    const searchKey = this.generateSearchKey(state, city, category, subcategory);
    
    // Skip if already completed
    if (this.progress.completedSearches.has(searchKey)) {
      console.log(`⏭️  Skipping completed: ${city}, ${state} - ${category} (${subcategory || 'no subcategory'})`);
      return true;
    }

    // Check if already cached
    const isCached = await this.checkIfCached(city, state, category, subcategory);
    if (isCached) {
      console.log(`💾 Skipping cached: ${city}, ${state} - ${category} (${subcategory || 'no subcategory'})`);
      this.stats.skippedRequests++;
      this.progress.completedSearches.add(searchKey);
      this.progress.completedCount++;
      this.saveProgress();
      return true;
    }

    // Make API call
    const success = await this.callVendorAPI(city, state, category, subcategory);
    
    this.stats.totalRequests++;
    this.stats.dailyRequests++;
    
    if (success) {
      this.progress.completedSearches.add(searchKey);
      this.progress.completedCount++;
    }

    // Update progress
    this.progress.currentState = state;
    this.progress.currentCity = city;
    this.progress.currentCategory = category;
    this.progress.currentSubcategory = subcategory;
    this.progress.dailyRequests = this.stats.dailyRequests;
    
    this.saveProgress();

    // Print stats every 10 requests
    if (this.stats.totalRequests % 10 === 0) {
      this.printStats();
    }

    // Rate limiting delay
    await this.delay(DELAY_BETWEEN_REQUESTS);
    
    return success;
  }
}

// Main execution
async function main() {
  const collector = new VendorCollector();
  
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
  console.log('\n⏸️  Collection paused. Progress saved.');
  console.log('Run the script again to resume from where you left off.');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { VendorCollector };
