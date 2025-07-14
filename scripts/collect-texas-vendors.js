#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Texas cities to collect vendors for (prioritized order)
const texasCities = [
  // Priority 1: DFW Metro (high wedding volume)
  { name: 'Fort Worth', state: 'TX', priority: 1, market: 'DFW Metro' },
  { name: 'Plano', state: 'TX', priority: 1, market: 'DFW Metro' },
  { name: 'Arlington', state: 'TX', priority: 1, market: 'DFW Metro' },
  
  // Priority 2: Regional centers
  { name: 'El Paso', state: 'TX', priority: 2, market: 'West Texas' },
  { name: 'Corpus Christi', state: 'TX', priority: 2, market: 'Gulf Coast' },
  { name: 'Galveston', state: 'TX', priority: 2, market: 'Gulf Coast Beach' },
  { name: 'Garland', state: 'TX', priority: 2, market: 'DFW Metro' },
  { name: 'Irving', state: 'TX', priority: 2, market: 'DFW Metro' },
  
  // Priority 3: Smaller markets
  { name: 'Lubbock', state: 'TX', priority: 3, market: 'Panhandle' },
  { name: 'Amarillo', state: 'TX', priority: 3, market: 'Panhandle' }
];

// Wedding vendor categories to collect
const categories = [
  'wedding photographers',
  'wedding planners', 
  'wedding venues',
  'wedding florists',
  'wedding makeup artists',
  'wedding hair stylists',
  'wedding videographers',
  'wedding caterers',
  'wedding cake designers',
  'wedding DJs'
];

async function collectVendorsForTexas() {
  console.log('🏟️  TEXAS WEDDING VENDOR COLLECTION');
  console.log('═'.repeat(80));
  console.log(`📍 Collecting vendors for ${texasCities.length} Texas cities`);
  console.log(`📋 Categories: ${categories.length} wedding vendor types`);
  console.log(`💰 Estimated cost: $${texasCities.length * categories.length * 0.002} - $${texasCities.length * categories.length * 0.005}`);
  console.log('');

  // Check if collection script exists
  const collectionScript = path.resolve('./scripts/data-collection/collect-all-vendors.js');
  if (!fs.existsSync(collectionScript)) {
    console.error('❌ Collection script not found:', collectionScript);
    console.log('💡 Please run from the project root directory');
    return;
  }

  let totalCollected = 0;
  let totalCost = 0;

  // Collect by priority
  for (let priority = 1; priority <= 3; priority++) {
    const priorityCities = texasCities.filter(c => c.priority === priority);
    
    if (priorityCities.length === 0) continue;
    
    console.log(`\n🎯 PRIORITY ${priority} CITIES (${priorityCities.map(c => c.market).join(', ')})`);
    console.log('─'.repeat(60));
    
    for (const city of priorityCities) {
      console.log(`\n🏙️  Collecting vendors for ${city.name}, ${city.state}`);
      console.log(`   Market: ${city.market}`);
      
      try {
        // Run collection script for this city
        const command = `node ${collectionScript} --city="${city.name}" --state="${city.state}" --categories="${categories.join(',')}"`;
        
        console.log('   Running collection...');
        const startTime = Date.now();
        
        const output = execSync(command, { 
          encoding: 'utf8',
          timeout: 300000, // 5 minute timeout
          stdio: 'pipe'
        });
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        // Parse output for results
        const lines = output.split('\n');
        const resultLine = lines.find(line => line.includes('vendors collected') || line.includes('total vendors'));
        const vendorCount = resultLine ? parseInt(resultLine.match(/(\d+)/)?.[1] || '0') : 0;
        
        totalCollected += vendorCount;
        totalCost += vendorCount * 0.002; // Estimate $0.002 per vendor
        
        console.log(`   ✅ Collected ${vendorCount} vendors in ${duration}s`);
        console.log(`   💰 Estimated cost: $${(vendorCount * 0.002).toFixed(3)}`);
        
        // Brief pause between cities to avoid rate limiting
        if (priority <= 2) {
          console.log('   ⏳ Cooling down...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to collect vendors for ${city.name}:`, error.message);
        
        // If it's a timeout or rate limit, wait longer
        if (error.message.includes('timeout') || error.message.includes('rate')) {
          console.log('   ⏳ Extended cooldown due to error...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }
    
    // Longer pause between priority groups
    if (priority < 3) {
      console.log(`\n⏳ Completed Priority ${priority}. Waiting before next group...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('\n🎉 TEXAS VENDOR COLLECTION COMPLETE!');
  console.log('═'.repeat(80));
  console.log(`📊 Total vendors collected: ${totalCollected}`);
  console.log(`💰 Total estimated cost: $${totalCost.toFixed(2)}`);
  console.log(`🏛️  Cities expanded: ${texasCities.length} new Texas markets`);
  
  // Generate summary report
  const reportPath = `./reports/texas-expansion-${new Date().toISOString().split('T')[0]}.json`;
  const report = {
    timestamp: new Date().toISOString(),
    totalCities: texasCities.length,
    totalVendors: totalCollected,
    estimatedCost: totalCost,
    cities: texasCities.map(city => ({
      name: city.name,
      state: city.state,
      priority: city.priority,
      market: city.market
    })),
    categories: categories
  };
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Report saved: ${reportPath}`);
  } catch (error) {
    console.error('⚠️  Could not save report:', error.message);
  }
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Review collected vendor data in database');
  console.log('2. Run validation scripts to check data quality');
  console.log('3. Update website with new Texas cities');
  console.log('4. Monitor API costs and usage');
}

// Run collection if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  collectVendorsForTexas()
    .then(() => {
      console.log('\n✨ Collection complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Collection failed:', error);
      process.exit(1);
    });
}

export { texasCities, categories };