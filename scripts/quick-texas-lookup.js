#!/usr/bin/env node

/**
 * Quick Texas City Location Code Lookup
 * 
 * A simplified tool to quickly find DataForSEO location codes for Texas cities.
 * This script focuses specifically on Texas and provides an easy way to look up
 * location codes for additional cities.
 * 
 * Usage:
 * node scripts/quick-texas-lookup.js
 * node scripts/quick-texas-lookup.js "Fort Worth"
 * node scripts/quick-texas-lookup.js "Plano" "Arlington" "Garland"
 */

const https = require('https');

// DataForSEO credentials
const DATAFORSEO_AUTH = Buffer.from('abrar@amarosystems.com:69084d8c8dcf81cd').toString('base64');

// Texas state location code
const TEXAS_LOCATION_CODE = 1003560; // This may need to be verified

/**
 * Make API request to DataForSEO
 */
async function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.dataforseo.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${DATAFORSEO_AUTH}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Fetch all US locations
 */
async function fetchUSLocations() {
  console.log('Fetching US location data from DataForSEO API...');
  
  try {
    const response = await apiRequest('/v3/serp/google/locations');
    
    if (response.status_code !== 20000) {
      throw new Error(`API Error: ${response.status_message}`);
    }

    const allLocations = response.tasks?.[0]?.result || [];
    
    // Filter to US locations only
    const usLocations = allLocations.filter(location => {
      return location.country_iso_code === 'US' || location.location_code === 2840;
    });
    
    console.log(`Found ${usLocations.length} US locations`);
    return usLocations;
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    throw error;
  }
}

/**
 * Find Texas state info
 */
function findTexas(locations) {
  return locations.find(loc => 
    loc.location_type === 'State' && 
    loc.location_name.toLowerCase().includes('texas')
  );
}

/**
 * Find Texas cities
 */
function findTexasCities(locations, texasLocationCode) {
  return locations.filter(loc => 
    (loc.location_type === 'City' || 
     loc.location_type === 'Neighborhood' ||
     loc.location_type === 'Borough' ||
     loc.location_type === 'District') &&
    loc.location_code_parent === texasLocationCode
  );
}

/**
 * Search for specific cities
 */
function searchCities(cities, searchTerms) {
  const results = [];
  
  searchTerms.forEach(term => {
    const matches = cities.filter(city =>
      city.location_name.toLowerCase().includes(term.toLowerCase())
    );
    
    if (matches.length === 0) {
      console.log(`⚠️  No matches found for "${term}"`);
    } else if (matches.length === 1) {
      results.push({ searchTerm: term, city: matches[0] });
    } else {
      console.log(`⚠️  Multiple matches found for "${term}":`);
      matches.forEach(match => {
        console.log(`   - ${match.location_name} (${match.location_code})`);
      });
      // Take the first exact match or closest match
      const exactMatch = matches.find(m => 
        m.location_name.toLowerCase() === term.toLowerCase()
      );
      results.push({ 
        searchTerm: term, 
        city: exactMatch || matches[0],
        multiple: true
      });
    }
  });
  
  return results;
}

/**
 * Display results in config format
 */
function displayConfigFormat(results) {
  console.log('\n=== Location Codes for Config File ===\n');
  
  console.log('"Texas": {');
  console.log('  code: 2840,');
  console.log('  cities: {');
  
  // Show existing cities first
  console.log('    // Existing cities');
  console.log('    "Dallas": 1003735,');
  console.log('    "Houston": 1003811,');
  console.log('    "Austin": 1003550,');
  console.log('    "San Antonio": 1004100,');
  
  // Add new cities
  if (results.length > 0) {
    console.log('    // New cities');
    results.forEach((result, index) => {
      const comma = index < results.length - 1 ? ',' : '';
      const warning = result.multiple ? ' // ⚠️  Multiple matches found' : '';
      console.log(`    "${result.city.location_name}": ${result.city.location_code}${comma}${warning}`);
    });
  }
  
  console.log('  }');
  console.log('},');
}

/**
 * Show popular Texas cities
 */
function showPopularTexasCities(cities) {
  const popularCityNames = [
    'fort worth', 'el paso', 'arlington', 'corpus christi', 'plano',
    'lubbock', 'garland', 'irving', 'laredo', 'amarillo', 'grand prairie',
    'brownsville', 'mckinney', 'frisco', 'denton', 'carrollton',
    'midland', 'waco', 'round rock', 'richardson', 'pearland',
    'lewisville', 'college station', 'tyler', 'sugar land'
  ];
  
  console.log('\n=== Popular Texas Cities ===\n');
  
  popularCityNames.forEach(cityName => {
    const matches = cities.filter(city =>
      city.location_name.toLowerCase().includes(cityName)
    );
    
    if (matches.length > 0) {
      const city = matches[0]; // Take first match
      console.log(`"${city.location_name}": ${city.location_code},`);
    }
  });
}

/**
 * Main function
 */
async function main() {
  const searchTerms = process.argv.slice(2);
  
  try {
    // Fetch location data
    const locations = await fetchUSLocations();
    
    // Find Texas
    const texas = findTexas(locations);
    if (!texas) {
      console.error('❌ Texas state not found in location data');
      return;
    }
    
    console.log(`✅ Found Texas: ${texas.location_name} (Code: ${texas.location_code})\n`);
    
    // Find Texas cities
    const texasCities = findTexasCities(locations, texas.location_code);
    console.log(`Found ${texasCities.length} Texas cities\n`);
    
    if (searchTerms.length === 0) {
      // No search terms provided, show popular cities
      console.log('Usage: node scripts/quick-texas-lookup.js "Fort Worth" "Plano" "Arlington"');
      showPopularTexasCities(texasCities);
    } else {
      // Search for specific cities
      console.log(`Searching for: ${searchTerms.join(', ')}\n`);
      
      const results = searchCities(texasCities, searchTerms);
      
      if (results.length > 0) {
        console.log('\n=== Search Results ===\n');
        results.forEach(result => {
          console.log(`✅ ${result.searchTerm} → ${result.city.location_name} (${result.city.location_code})`);
        });
        
        displayConfigFormat(results);
      } else {
        console.log('❌ No cities found matching your search terms.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchUSLocations, findTexas, findTexasCities, searchCities };