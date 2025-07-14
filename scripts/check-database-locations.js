#!/usr/bin/env node

/**
 * Database Location Code Checker
 * 
 * This script checks what location codes are already available in your 
 * Supabase database and can help you find Texas cities that are available
 * but not yet included in your config files.
 * 
 * Usage:
 * node scripts/check-database-locations.js
 * node scripts/check-database-locations.js --texas
 * node scripts/check-database-locations.js --search "Fort Worth"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all states from database
 */
async function getStates() {
  const { data, error } = await supabase
    .from('dataforseo_locations')
    .select('*')
    .eq('location_type', 'state')
    .eq('country_code', 'US')
    .order('location_name');
    
  if (error) throw error;
  return data || [];
}

/**
 * Get Texas state info
 */
async function getTexasState() {
  const { data, error } = await supabase
    .from('dataforseo_locations')
    .select('*')
    .eq('location_type', 'state')
    .eq('country_code', 'US')
    .ilike('location_name', '%texas%')
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Get cities for a state
 */
async function getCitiesForState(stateLocationCode) {
  const { data, error } = await supabase
    .from('dataforseo_locations')
    .select('*')
    .eq('location_type', 'city')
    .eq('parent_location_code', stateLocationCode)
    .order('location_name');
    
  if (error) throw error;
  return data || [];
}

/**
 * Search for cities by name
 */
async function searchCities(searchTerm, stateCode = null) {
  let query = supabase
    .from('dataforseo_locations')
    .select('*')
    .eq('location_type', 'city')
    .ilike('location_name', `%${searchTerm}%`);
    
  if (stateCode) {
    query = query.eq('parent_location_code', stateCode);
  }
  
  const { data, error } = await query.order('location_name');
  
  if (error) throw error;
  return data || [];
}

/**
 * Get current config cities for Texas
 */
function getCurrentTexasCities() {
  return {
    "Dallas": 1003735,
    "Houston": 1003811,
    "Austin": 1003550,
    "San Antonio": 1004100
  };
}

/**
 * Display state information
 */
function displayState(state) {
  console.log(`📍 ${state.location_name}`);
  console.log(`   Code: ${state.location_code}`);
  if (state.state_code) console.log(`   State Code: ${state.state_code}`);
  console.log('');
}

/**
 * Display city information
 */
function displayCity(city) {
  console.log(`🏙️  ${city.location_name}: ${city.location_code}`);
}

/**
 * Display cities in config format
 */
function displayCitiesConfig(cities, stateName = 'Texas') {
  console.log(`\n"${stateName}": {`);
  console.log('  code: 2840,');
  console.log('  cities: {');
  
  cities.forEach((city, index) => {
    const comma = index < cities.length - 1 ? ',' : '';
    console.log(`    "${city.location_name}": ${city.location_code}${comma}`);
  });
  
  console.log('  }');
  console.log('},');
}

/**
 * Find popular Texas cities not in config
 */
function findMissingPopularCities(allCities, currentConfig) {
  const popularCityNames = [
    'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano',
    'Lubbock', 'Garland', 'Irving', 'Laredo', 'Amarillo', 'Grand Prairie',
    'Brownsville', 'McKinney', 'Frisco', 'Denton', 'Carrollton',
    'Midland', 'Waco', 'Round Rock', 'Richardson', 'Pearland',
    'Lewisville', 'College Station', 'Tyler', 'Sugar Land'
  ];
  
  const currentCityNames = Object.keys(currentConfig).map(name => name.toLowerCase());
  
  const missing = [];
  
  popularCityNames.forEach(cityName => {
    if (!currentCityNames.includes(cityName.toLowerCase())) {
      const matches = allCities.filter(city =>
        city.location_name.toLowerCase().includes(cityName.toLowerCase())
      );
      
      if (matches.length > 0) {
        missing.push({
          searchName: cityName,
          found: matches[0] // Take first match
        });
      }
    }
  });
  
  return missing;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  
  // Parse flags
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const nextIndex = args.indexOf(arg) + 1;
      flags[arg] = nextIndex < args.length && !args[nextIndex].startsWith('--') 
        ? args[nextIndex] 
        : true;
    }
  });
  
  try {
    console.log('🔍 Checking database location data...\n');
    
    if (flags['--texas']) {
      // Show Texas cities
      console.log('📍 Texas Cities in Database\n');
      
      const texas = await getTexasState();
      console.log('Texas state info:');
      displayState(texas);
      
      const cities = await getCitiesForState(texas.location_code);
      console.log(`Found ${cities.length} Texas cities in database:\n`);
      
      // Show current config
      const currentConfig = getCurrentTexasCities();
      console.log('🏛️  Currently in config:');
      Object.entries(currentConfig).forEach(([name, code]) => {
        console.log(`   ${name}: ${code}`);
      });
      
      // Find missing popular cities
      const missing = findMissingPopularCities(cities, currentConfig);
      
      if (missing.length > 0) {
        console.log('\n🆕 Popular cities available but not in config:');
        missing.forEach(({ searchName, found }) => {
          console.log(`   ${found.location_name}: ${found.location_code}`);
        });
        
        console.log('\n📝 Config format for missing cities:');
        displayCitiesConfig([...Object.entries(currentConfig).map(([name, code]) => ({
          location_name: name,
          location_code: code
        })), ...missing.map(m => m.found)], 'Texas');
      } else {
        console.log('\n✅ All popular Texas cities are already in config');
      }
      
    } else if (flags['--search']) {
      // Search for specific cities
      const searchTerm = flags['--search'];
      console.log(`🔍 Searching for cities matching "${searchTerm}"\n`);
      
      const results = await searchCities(searchTerm);
      
      if (results.length === 0) {
        console.log('❌ No cities found matching your search');
      } else {
        console.log(`Found ${results.length} matching cities:\n`);
        results.forEach(city => {
          console.log(`🏙️  ${city.location_name} (${city.state_name || 'Unknown State'}): ${city.location_code}`);
        });
      }
      
    } else {
      // Show general database stats
      console.log('📊 Database Location Statistics\n');
      
      const states = await getStates();
      console.log(`Total US States: ${states.length}\n`);
      
      // Show a few sample states
      console.log('Sample states:');
      states.slice(0, 5).forEach(displayState);
      
      // Texas specific info
      try {
        const texas = await getTexasState();
        const texasCities = await getCitiesForState(texas.location_code);
        
        console.log(`\n🏴󠁵󠁳󠁴󠁸󠁿 Texas: ${texasCities.length} cities available`);
        console.log('Run with --texas flag to see Texas cities');
      } catch (error) {
        console.log('\n⚠️  Texas state data not found in database');
      }
      
      console.log('\nUsage:');
      console.log('  node scripts/check-database-locations.js --texas');
      console.log('  node scripts/check-database-locations.js --search "Fort Worth"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('relation "dataforseo_locations" does not exist')) {
      console.error('\n💡 It looks like the dataforseo_locations table doesn\'t exist.');
      console.error('You may need to run the location sync function first:');
      console.error('   - Call the sync-dataforseo-locations Supabase function');
      console.error('   - Or run the migration files');
    }
    
    process.exit(1);
  }
}

// Run the script
main();