#!/usr/bin/env node

/**
 * Direct DataForSEO Cart Vendors Collection Script
 * 
 * This script directly calls DataForSEO API to get cart vendors from Google Maps
 * and stores them in the vendors_google table, bypassing the broken edge function.
 */

import { createClient } from '@supabase/supabase-js';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// DataForSEO credentials from .env file
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

console.log('📋 DataForSEO credentials loaded:', {
  login: DATAFORSEO_LOGIN ? '✅ Found' : '❌ Missing',
  password: DATAFORSEO_PASSWORD ? '✅ Found' : '❌ Missing'
});

// Cart search terms
const CART_SEARCHES = [
  "coffee cart wedding",
  "matcha cart wedding", 
  "cocktail cart wedding",
  "mobile bar cart wedding",
  "dessert cart wedding",
  "ice cream cart wedding",
  "tea cart wedding",
  "champagne cart wedding",
  "beverage cart wedding",
  "mobile coffee wedding"
];

// Major cities to search
const CITIES = [
  { city: "Los Angeles", state: "CA", location_code: 2840 },
  { city: "New York", state: "NY", location_code: 1023191 },
  { city: "Chicago", state: "IL", location_code: 1014221 },
  { city: "Houston", state: "TX", location_code: 1026081 },
  { city: "Phoenix", state: "AZ", location_code: 1013962 },
  { city: "Philadelphia", state: "PA", location_code: 1026082 },
  { city: "San Antonio", state: "TX", location_code: 1026201 },
  { city: "San Diego", state: "CA", location_code: 1025197 },
  { city: "Dallas", state: "TX", location_code: 1019390 },
  { city: "San Jose", state: "CA", location_code: 1025202 }
];

class DirectCartVendorCollector {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      vendorsFound: 0,
      vendorsSaved: 0,
      startTime: Date.now()
    };
  }

  async makeDataForSEORequest(keyword, locationCode) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify([{
        keyword: keyword,
        location_code: locationCode,
        language_code: "en",
        device: "desktop",
        os: "windows",
        depth: 5,
        search_places: true
      }]);

      const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

      const options = {
        hostname: 'api.dataforseo.com',
        port: 443,
        path: '/v3/serp/google/maps/live/advanced',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async searchCartVendors(keyword, city) {
    console.log(`🔍 Searching for "${keyword}" in ${city.city}, ${city.state}...`);
    
    try {
      this.stats.totalRequests++;
      const response = await this.makeDataForSEORequest(keyword, city.location_code);
      
      if (!response || !response.tasks || response.tasks.length === 0) {
        console.log(`⚠️ No tasks from DataForSEO for ${keyword} in ${city.city}`);
        this.stats.failedRequests++;
        return [];
      }

      const task = response.tasks[0];
      if (!task.result || task.result.length === 0) {
        console.log(`⚠️ No results found for ${keyword} in ${city.city}`);
        this.stats.failedRequests++;
        return [];
      }

      this.stats.successfulRequests++;
      const vendors = task.result.map(item => this.transformToVendor(item, city));
      this.stats.vendorsFound += vendors.length;

      console.log(`✅ Found ${vendors.length} vendors for ${keyword} in ${city.city}`);
      return vendors;

    } catch (error) {
      console.error(`❌ Error searching ${keyword} in ${city.city}:`, error.message);
      this.stats.failedRequests++;
      return [];
    }
  }

  transformToVendor(item, city) {
    return {
      place_id: item.place_id || `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      business_name: item.title || 'Unknown Cart Vendor',
      category: 'carts',
      city: city.city,
      state: this.getFullStateName(city.state),
      state_code: city.state,
      address: item.address || `${city.city}, ${city.state}`,
      phone: item.phone || null,
      website_url: item.url || null,
      email: null,
      rating: item.rating ? { value: { value: item.rating.value }, reviews: item.rating.reviews_count } : null,
      description: item.description || item.snippet || `Mobile cart service in ${city.city}`,
      images: item.photos && item.photos.length > 0 ? item.photos.map(p => p.url) : [],
      business_hours: item.work_hours ? this.parseBusinessHours(item.work_hours) : null,
      price_range: item.price_range || null,
      latitude: item.latitude || null,
      longitude: item.longitude || null,
      reviews_count: item.rating ? item.rating.reviews_count : 0,
      data_source: 'google_maps'
    };
  }

  getFullStateName(code) {
    const stateMap = {
      'CA': 'California', 'NY': 'New York', 'IL': 'Illinois', 'TX': 'Texas',
      'AZ': 'Arizona', 'PA': 'Pennsylvania'
    };
    return stateMap[code] || code;
  }

  parseBusinessHours(hours) {
    if (!hours || !Array.isArray(hours)) return null;
    
    const businessHours = {};
    hours.forEach(hour => {
      if (hour.day && hour.time) {
        businessHours[hour.day.toLowerCase()] = hour.time;
      }
    });
    
    return Object.keys(businessHours).length > 0 ? businessHours : null;
  }

  async saveVendors(vendors) {
    if (vendors.length === 0) return;

    console.log(`💾 Saving ${vendors.length} vendors to database...`);
    
    try {
      const { error } = await supabase
        .from('vendors_google')
        .upsert(vendors, { 
          onConflict: 'place_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Error saving vendors:', error);
        return;
      }

      this.stats.vendorsSaved += vendors.length;
      console.log(`✅ Saved ${vendors.length} vendors to database`);

    } catch (error) {
      console.error('❌ Database error:', error);
    }
  }

  async collectAllCartVendors() {
    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      console.error('❌ DataForSEO credentials not found in environment variables');
      console.log('Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables');
      return;
    }

    console.log('🛒 Direct Cart Vendor Collection from DataForSEO');
    console.log('================================================\n');
    
    for (const city of CITIES) {
      console.log(`\n📍 Processing ${city.city}, ${city.state}...`);
      
      for (const keyword of CART_SEARCHES) {
        const vendors = await this.searchCartVendors(keyword, city);
        
        if (vendors.length > 0) {
          await this.saveVendors(vendors);
        }
        
        // Rate limiting - DataForSEO allows 2000 requests per hour
        await this.delay(2000); // 2 second delay between requests
      }
    }

    this.printStats();
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
    console.log(`🛒 Total vendors found: ${this.stats.vendorsFound}`);
    console.log(`💾 Vendors saved to database: ${this.stats.vendorsSaved}`);
    console.log(`📈 Success rate: ${((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1)}%`);
  }
}

// Main execution
async function main() {
  const collector = new DirectCartVendorCollector();
  await collector.collectAllCartVendors();
}

main().catch(console.error);