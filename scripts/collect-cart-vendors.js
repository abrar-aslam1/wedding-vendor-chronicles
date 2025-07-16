#!/usr/bin/env node

/**
 * Cart Vendors Collection Script
 * 
 * This script collects mobile cart vendors (coffee carts, matcha carts, cocktail carts, etc.)
 * from Google Places API via DataForSEO and stores them in our cache.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cart types to search for
const CART_TYPES = [
  "coffee cart",
  "matcha cart",
  "tea cart",
  "cocktail cart",
  "mobile bar cart",
  "dessert cart",
  "ice cream cart",
  "champagne cart",
  "hot chocolate cart",
  "lemonade cart",
  "beverage cart",
  "mobile coffee",
  "mobile cocktails",
  "wedding coffee cart",
  "wedding beverage cart"
];

// Major cities to search in (focusing on popular wedding destinations)
const MAJOR_CITIES = {
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
  "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"],
  "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
  "Illinois": ["Chicago", "Aurora", "Rockford"],
  "Georgia": ["Atlanta", "Augusta", "Savannah"],
  "Arizona": ["Phoenix", "Tucson", "Scottsdale"],
  "Washington": ["Seattle", "Spokane", "Tacoma"],
  "Colorado": ["Denver", "Colorado Springs", "Boulder"],
  "Massachusetts": ["Boston", "Worcester", "Cambridge"]
};

// Rate limiting
const REQUESTS_PER_MINUTE = 60;
const DELAY_BETWEEN_REQUESTS = 60000 / REQUESTS_PER_MINUTE;

class CartVendorCollector {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      vendorsFound: 0,
      startTime: Date.now()
    };
  }

  async searchVendors(cartType, city, state) {
    const location = `${city}, ${state}`;
    const keyword = `${cartType} wedding`;
    
    console.log(`🔍 Searching for "${keyword}" in ${location}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-vendors', {
        body: {
          keyword: keyword,
          location: location,
          category: 'carts'
        }
      });

      this.stats.totalRequests++;

      if (error) {
        console.error(`❌ Error searching for ${keyword} in ${location}:`, error);
        this.stats.failedRequests++;
        return [];
      }

      if (!data || !Array.isArray(data)) {
        console.log(`⚠️ No valid data returned for ${keyword} in ${location}`);
        this.stats.failedRequests++;
        return [];
      }

      this.stats.successfulRequests++;
      const googleVendors = data.filter(v => v.vendor_source === 'google');
      this.stats.vendorsFound += googleVendors.length;

      console.log(`✅ Found ${googleVendors.length} cart vendors in ${location}`);
      
      return googleVendors;
    } catch (error) {
      console.error(`❌ Exception while searching ${keyword} in ${location}:`, error);
      this.stats.failedRequests++;
      return [];
    }
  }

  async collectAllCartVendors() {
    console.log('🚀 Starting cart vendor collection...');
    console.log(`📍 Searching in ${Object.keys(MAJOR_CITIES).length} states`);
    console.log(`🛒 Cart types: ${CART_TYPES.length}`);
    
    const allVendors = [];
    let requestCount = 0;

    for (const [state, cities] of Object.entries(MAJOR_CITIES)) {
      console.log(`\n📍 Processing ${state}...`);
      
      for (const city of cities) {
        for (const cartType of CART_TYPES) {
          // Rate limiting
          if (requestCount > 0 && requestCount % REQUESTS_PER_MINUTE === 0) {
            console.log('⏳ Rate limit pause...');
            await this.delay(60000);
          }

          const vendors = await this.searchVendors(cartType, city, state);
          allVendors.push(...vendors);
          requestCount++;

          // Small delay between requests
          await this.delay(DELAY_BETWEEN_REQUESTS);
        }
      }
    }

    return allVendors;
  }

  async saveVendorsToDatabase(vendors) {
    console.log(`\n💾 Saving ${vendors.length} vendors to database...`);
    
    // Remove duplicates based on place_id
    const uniqueVendors = [];
    const seenPlaceIds = new Set();
    
    for (const vendor of vendors) {
      if (vendor.place_id && !seenPlaceIds.has(vendor.place_id)) {
        seenPlaceIds.add(vendor.place_id);
        uniqueVendors.push(vendor);
      }
    }

    console.log(`📊 Unique vendors after deduplication: ${uniqueVendors.length}`);

    // Save to vendors_google table
    const vendorsToInsert = uniqueVendors.map(vendor => ({
      place_id: vendor.place_id,
      business_name: vendor.title || vendor.business_name,
      category: 'carts',
      city: vendor.city || this.extractCity(vendor.address),
      state: vendor.state || this.extractState(vendor.address),
      state_code: vendor.state_code || this.getStateCode(vendor.state),
      address: vendor.address,
      phone: vendor.phone,
      website_url: vendor.website_url || vendor.url,
      email: vendor.email,
      rating: vendor.rating,
      description: vendor.description || vendor.snippet,
      images: vendor.images || [],
      business_hours: vendor.business_hours,
      price_range: vendor.price_range,
      latitude: vendor.latitude,
      longitude: vendor.longitude,
      reviews_count: vendor.reviews_count,
      data_source: 'google_maps'
    }));

    try {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vendorsToInsert.length; i += batchSize) {
        const batch = vendorsToInsert.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('vendors_google')
          .upsert(batch, { 
            onConflict: 'place_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        } else {
          console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} vendors)`);
        }
      }
    } catch (error) {
      console.error('❌ Database error:', error);
    }
  }

  extractCity(address) {
    if (!address) return '';
    const parts = address.split(',');
    return parts.length >= 2 ? parts[parts.length - 2].trim() : '';
  }

  extractState(address) {
    if (!address) return '';
    const parts = address.split(',');
    const stateZip = parts[parts.length - 1].trim();
    const statePart = stateZip.split(' ')[0];
    return this.getFullStateName(statePart) || statePart;
  }

  getStateCode(stateName) {
    const stateMap = {
      'California': 'CA', 'Texas': 'TX', 'Florida': 'FL', 'New York': 'NY',
      'Illinois': 'IL', 'Georgia': 'GA', 'Arizona': 'AZ', 'Washington': 'WA',
      'Colorado': 'CO', 'Massachusetts': 'MA'
    };
    return stateMap[stateName] || '';
  }

  getFullStateName(code) {
    const codeMap = {
      'CA': 'California', 'TX': 'Texas', 'FL': 'Florida', 'NY': 'New York',
      'IL': 'Illinois', 'GA': 'Georgia', 'AZ': 'Arizona', 'WA': 'Washington',
      'CO': 'Colorado', 'MA': 'Massachusetts'
    };
    return codeMap[code] || '';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printStats() {
    const duration = Date.now() - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);

    console.log('\n📊 Collection Statistics:');
    console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
    console.log(`📍 Total requests: ${this.stats.totalRequests}`);
    console.log(`✅ Successful requests: ${this.stats.successfulRequests}`);
    console.log(`❌ Failed requests: ${this.stats.failedRequests}`);
    console.log(`🛒 Total cart vendors found: ${this.stats.vendorsFound}`);
    console.log(`📈 Success rate: ${((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1)}%`);
  }
}

// Main execution
async function main() {
  const collector = new CartVendorCollector();
  
  try {
    console.log('🛒 Cart Vendor Collection Script');
    console.log('================================\n');
    
    const vendors = await collector.collectAllCartVendors();
    
    if (vendors.length > 0) {
      await collector.saveVendorsToDatabase(vendors);
    }
    
    collector.printStats();
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();