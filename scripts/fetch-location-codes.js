#!/usr/bin/env node

/**
 * DataForSEO Location Code Lookup Tool
 * 
 * This script helps find DataForSEO location codes for cities by:
 * 1. Querying the DataForSEO API for location data
 * 2. Searching for specific cities or states
 * 3. Providing a searchable interface for location codes
 * 
 * Usage examples:
 * node scripts/fetch-location-codes.js --city "Fort Worth" --state "Texas"
 * node scripts/fetch-location-codes.js --search "Plano"
 * node scripts/fetch-location-codes.js --state "Texas" --list-cities
 */

const https = require('https');

// DataForSEO credentials
const DATAFORSEO_LOGIN = 'abrar@amarosystems.com';
const DATAFORSEO_PASSWORD = '69084d8c8dcf81cd';
const DATAFORSEO_AUTH = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

/**
 * Make API request to DataForSEO
 */
async function apiRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.dataforseo.com',
      path: endpoint,
      method: method,
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
 * Fetch all locations from DataForSEO API
 */
async function fetchAllLocations() {
  console.log('Fetching location data from DataForSEO API...');
  
  try {
    const response = await apiRequest('/v3/serp/google/locations');
    
    if (response.status_code !== 20000) {
      throw new Error(`API Error: ${response.status_message}`);
    }

    const locations = response.tasks?.[0]?.result || [];
    console.log(`Retrieved ${locations.length} locations from API`);
    
    return locations;
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    throw error;
  }
}

/**
 * Filter locations to US only
 */
function filterUSLocations(locations) {
  return locations.filter(location => {
    return location.country_iso_code === 'US' || 
           location.location_code === 2840; // United States
  });
}

/**
 * Group locations by type
 */
function groupLocationsByType(locations) {
  const grouped = {
    country: [],
    states: [],
    cities: []
  };

  locations.forEach(location => {
    switch (location.location_type) {
      case 'Country':
        grouped.country.push(location);
        break;
      case 'State':
        grouped.states.push(location);
        break;
      case 'City':
      case 'Neighborhood':
      case 'Borough':
      case 'District':
        grouped.cities.push(location);
        break;
    }
  });

  return grouped;
}

/**
 * Find state by name
 */
function findState(locations, stateName) {
  const states = locations.filter(loc => loc.location_type === 'State');
  return states.find(state => 
    state.location_name.toLowerCase().includes(stateName.toLowerCase())
  );
}

/**
 * Find cities for a state
 */
function findCitiesForState(locations, stateLocationCode) {
  return locations.filter(loc => 
    (loc.location_type === 'City' || 
     loc.location_type === 'Neighborhood' || 
     loc.location_type === 'Borough' || 
     loc.location_type === 'District') &&
    loc.location_code_parent === stateLocationCode
  );
}

/**
 * Search for a city by name
 */
function searchCity(locations, cityName, stateName = null) {
  let cities = locations.filter(loc => 
    (loc.location_type === 'City' || 
     loc.location_type === 'Neighborhood' || 
     loc.location_type === 'Borough' || 
     loc.location_type === 'District') &&
    loc.location_name.toLowerCase().includes(cityName.toLowerCase())
  );

  if (stateName) {
    const state = findState(locations, stateName);
    if (state) {
      cities = cities.filter(city => city.location_code_parent === state.location_code);
    }
  }

  return cities;
}

/**
 * Display location information
 */
function displayLocation(location) {
  console.log(`  Code: ${location.location_code}`);
  console.log(`  Name: ${location.location_name}`);
  console.log(`  Type: ${location.location_type}`);
  if (location.location_code_parent) {
    console.log(`  Parent Code: ${location.location_code_parent}`);
  }
  if (location.geo) {
    console.log(`  Coordinates: ${location.geo.lat}, ${location.geo.lon}`);
  }
  console.log('');
}

/**
 * Generate location codes for config file
 */
function generateLocationCodesForState(stateName, stateCode, cities) {
  console.log(`\n"${stateName}": {`);
  console.log(`  code: 2840,`);
  console.log(`  cities: {`);
  
  cities.forEach((city, index) => {
    const comma = index < cities.length - 1 ? ',' : '';
    console.log(`    "${city.location_name}": ${city.location_code}${comma}`);
  });
  
  console.log(`  }`);
  console.log(`},`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const flags = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    flags[flag] = value;
  }

  try {
    // Fetch all locations
    const allLocations = await fetchAllLocations();
    const usLocations = filterUSLocations(allLocations);
    
    console.log(`Found ${usLocations.length} US locations\n`);

    // Handle different commands
    if (flags['--city'] && flags['--state']) {
      // Search for specific city in state
      const cityName = flags['--city'];
      const stateName = flags['--state'];
      
      console.log(`Searching for "${cityName}" in "${stateName}"...\n`);
      
      const cities = searchCity(usLocations, cityName, stateName);
      
      if (cities.length === 0) {
        console.log('No cities found matching your criteria.');
      } else {
        console.log(`Found ${cities.length} matching cities:`);
        cities.forEach(city => {
          console.log(`\n${city.location_name}:`);
          displayLocation(city);
        });
      }
      
    } else if (flags['--search']) {
      // General search
      const searchTerm = flags['--search'];
      console.log(`Searching for locations matching "${searchTerm}"...\n`);
      
      const results = usLocations.filter(loc => 
        loc.location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (results.length === 0) {
        console.log('No locations found matching your search.');
      } else {
        console.log(`Found ${results.length} matching locations:`);
        results.forEach(result => {
          console.log(`\n${result.location_name} (${result.location_type}):`);
          displayLocation(result);
        });
      }
      
    } else if (flags['--state'] && flags['--list-cities']) {
      // List all cities for a state
      const stateName = flags['--state'];
      console.log(`Finding all cities for "${stateName}"...\n`);
      
      const state = findState(usLocations, stateName);
      
      if (!state) {
        console.log(`State "${stateName}" not found.`);
        return;
      }
      
      console.log(`State found:`);
      console.log(`${state.location_name} (Code: ${state.location_code})\n`);
      
      const cities = findCitiesForState(usLocations, state.location_code);
      
      if (cities.length === 0) {
        console.log('No cities found for this state.');
      } else {
        console.log(`Found ${cities.length} cities:`);
        
        // Sort cities by name
        cities.sort((a, b) => a.location_name.localeCompare(b.location_name));
        
        cities.forEach(city => {
          console.log(`\n${city.location_name}:`);
          displayLocation(city);
        });
        
        // Generate config format
        console.log('\n--- Config Format ---');
        generateLocationCodesForState(state.location_name, state.location_code, cities);
      }
      
    } else if (flags['--texas-cities']) {
      // Special command for Texas cities
      console.log('Finding all Texas cities...\n');
      
      const texas = findState(usLocations, 'Texas');
      
      if (!texas) {
        console.log('Texas state not found.');
        return;
      }
      
      const texasCities = findCitiesForState(usLocations, texas.location_code);
      
      // Filter for major cities
      const majorCities = texasCities.filter(city => {
        const name = city.location_name.toLowerCase();
        const majorCityNames = [
          'houston', 'dallas', 'austin', 'san antonio', 'fort worth', 
          'el paso', 'arlington', 'corpus christi', 'plano', 'lubbock',
          'garland', 'irving', 'laredo', 'amarillo', 'grand prairie',
          'brownsville', 'mckinney', 'frisco', 'denton', 'carrollton',
          'midland', 'waco', 'round rock', 'richardson', 'pearland'
        ];
        
        return majorCityNames.some(major => name.includes(major));
      });
      
      console.log(`Found ${majorCities.length} major Texas cities:`);
      
      majorCities.sort((a, b) => a.location_name.localeCompare(b.location_name));
      
      majorCities.forEach(city => {
        console.log(`"${city.location_name}": ${city.location_code},`);
      });
      
    } else {
      // Show usage
      console.log('DataForSEO Location Code Lookup Tool');
      console.log('=====================================\n');
      console.log('Usage examples:');
      console.log('  node scripts/fetch-location-codes.js --city "Fort Worth" --state "Texas"');
      console.log('  node scripts/fetch-location-codes.js --search "Plano"');
      console.log('  node scripts/fetch-location-codes.js --state "Texas" --list-cities');
      console.log('  node scripts/fetch-location-codes.js --texas-cities');
      console.log('\nFlags:');
      console.log('  --city <name>        Search for specific city');
      console.log('  --state <name>       Filter by state');
      console.log('  --search <term>      General search');
      console.log('  --list-cities        List all cities for a state');
      console.log('  --texas-cities       Show major Texas cities');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  fetchAllLocations,
  filterUSLocations,
  findState,
  findCitiesForState,
  searchCity
};