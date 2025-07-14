#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Texas cities to collect (with DataForSEO location codes)
const TEXAS_CITIES = {
  'Fort Worth': 1026411,
  'Plano': 1026695,
  'Arlington': 1026194,
  'El Paso': 1026376,
  'Corpus Christi': 1026319,
  'Galveston': 1026415,
  'Garland': 1026419,
  'Irving': 1026497,
  'Lubbock': 1026578,
  'Amarillo': 1026182
};

// Wedding vendor categories with subcategories
const VENDOR_CATEGORIES = {
  'wedding photographers': ['traditional', 'photojournalistic', 'fine art', 'destination'],
  'wedding planners': ['full service', 'day of coordination', 'partial planning'],
  'wedding venues': ['ballroom', 'outdoor', 'barn', 'historic', 'hotel'],
  'wedding florists': ['classic', 'modern', 'rustic', 'luxury'],
  'wedding makeup artists': ['bridal', 'airbrush', 'natural'],
  'wedding hair stylists': ['updos', 'natural', 'extensions'],
  'wedding videographers': ['cinematic', 'documentary', 'traditional'],
  'wedding caterers': ['American', 'Italian', 'Mexican', 'BBQ'],
  'wedding cake designers': ['traditional', 'modern', 'rustic'],
  'wedding DJs': ['reception', 'ceremony', 'corporate']
};

class TexasVendorCollector {
  constructor() {
    this.totalCollected = 0;
    this.totalCost = 0;
    this.results = [];
    this.progressFile = './texas-vendor-collection-progress.json';
    this.loadProgress();
  }

  loadProgress() {
    try {
      if (fs.existsSync(this.progressFile)) {
        const data = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
        this.completedSearches = data.completedSearches || [];
        this.totalCollected = data.totalCollected || 0;
        this.totalCost = data.totalCost || 0;
        console.log(`📂 Loaded progress: ${this.completedSearches.length} completed searches`);
      } else {
        this.completedSearches = [];
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      this.completedSearches = [];
    }
  }

  saveProgress() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        completedSearches: this.completedSearches,
        totalCollected: this.totalCollected,
        totalCost: this.totalCost,
        results: this.results
      };
      fs.writeFileSync(this.progressFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async collectVendors(city, category, subcategory = null) {
    const locationCode = TEXAS_CITIES[city];
    const searchKey = `${city}-${category}-${subcategory || 'main'}`;
    
    // Skip if already completed
    if (this.completedSearches.includes(searchKey)) {
      console.log(`   ⏭️  Skipping ${searchKey} (already completed)`);
      return 0;
    }

    const location = `${city}, Texas, United States`;
    const keyword = subcategory ? `${category} ${subcategory}` : category;

    try {
      console.log(`   🔍 Searching: ${keyword} in ${city}`);
      
      const { data, error } = await supabase.functions.invoke('search-google-vendors', {
        body: {
          keyword: keyword,
          location: location,
          subcategory: subcategory
        }
      });

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return 0;
      }

      const vendorCount = data?.vendors?.length || 0;
      console.log(`   ✅ Found ${vendorCount} vendors`);
      
      // Track progress
      this.completedSearches.push(searchKey);
      this.totalCollected += vendorCount;
      this.totalCost += 0.002; // Estimate $0.002 per search
      
      this.results.push({
        city,
        category,
        subcategory,
        vendorCount,
        timestamp: new Date().toISOString()
      });

      // Save progress after each successful search
      this.saveProgress();
      
      return vendorCount;
      
    } catch (error) {
      console.error(`   ❌ Collection failed for ${searchKey}:`, error.message);
      return 0;
    }
  }

  async run() {
    console.log('🏟️  TEXAS WEDDING VENDOR COLLECTION');
    console.log('═'.repeat(80));
    console.log(`📍 Target cities: ${Object.keys(TEXAS_CITIES).length}`);
    console.log(`📋 Categories: ${Object.keys(VENDOR_CATEGORIES).length}`);
    console.log(`⏳ Rate limit: 6 seconds between requests`);
    console.log('');

    const startTime = Date.now();
    let searchCount = 0;

    // Priority order: DFW metro cities first
    const dfwCities = ['Fort Worth', 'Plano', 'Arlington', 'Garland', 'Irving'];
    const otherCities = Object.keys(TEXAS_CITIES).filter(city => !dfwCities.includes(city));
    const orderedCities = [...dfwCities, ...otherCities];

    for (const city of orderedCities) {
      console.log(`\n🏙️  Collecting vendors for ${city}, TX`);
      console.log('─'.repeat(50));
      
      let cityTotal = 0;
      
      for (const [category, subcategories] of Object.entries(VENDOR_CATEGORIES)) {
        // Main category search
        const mainCount = await this.collectVendors(city, category);
        cityTotal += mainCount;
        searchCount++;
        
        // Add delay between requests (6 seconds)
        await new Promise(resolve => setTimeout(resolve, 6000));
        
        // Subcategory searches (optional - comment out to reduce API calls)
        /*
        for (const subcategory of subcategories) {
          const subCount = await this.collectVendors(city, category, subcategory);
          cityTotal += subCount;
          searchCount++;
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
        */
      }
      
      console.log(`🎯 ${city} total: ${cityTotal} vendors`);
      
      // Longer break between cities
      if (city !== orderedCities[orderedCities.length - 1]) {
        console.log('⏳ Cooling down between cities...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000 / 60; // minutes

    console.log('\n🎉 TEXAS COLLECTION COMPLETE!');
    console.log('═'.repeat(80));
    console.log(`⏱️  Duration: ${duration.toFixed(1)} minutes`);
    console.log(`🔍 Total searches: ${searchCount}`);
    console.log(`📊 Total vendors: ${this.totalCollected}`);
    console.log(`💰 Estimated cost: $${this.totalCost.toFixed(2)}`);
    
    // Generate final report
    const reportPath = `./reports/texas-vendor-collection-${new Date().toISOString().split('T')[0]}.json`;
    const report = {
      summary: {
        totalCities: Object.keys(TEXAS_CITIES).length,
        totalSearches: searchCount,
        totalVendors: this.totalCollected,
        estimatedCost: this.totalCost,
        duration: duration,
        timestamp: new Date().toISOString()
      },
      cities: orderedCities.map(city => ({
        name: city,
        locationCode: TEXAS_CITIES[city],
        vendors: this.results.filter(r => r.city === city).reduce((sum, r) => sum + r.vendorCount, 0)
      })),
      results: this.results
    };
    
    try {
      // Ensure reports directory exists
      const reportsDir = './reports';
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📋 Final report saved: ${reportPath}`);
    } catch (error) {
      console.error('⚠️  Could not save final report:', error.message);
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Review vendor data in Supabase database');
    console.log('2. Run validation scripts to check quality');
    console.log('3. Update website with new Texas cities');
    console.log('4. Monitor DataForSEO usage and costs');
  }
}

// Run collection
async function main() {
  const collector = new TexasVendorCollector();
  
  try {
    await collector.run();
    console.log('\n✨ Collection completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TexasVendorCollector };