import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findTexasCityLocationCodes() {
  const targetCities = [
    'Fort Worth',
    'El Paso',
    'Plano',
    'Corpus Christi', 
    'Arlington',
    'Garland',
    'Irving',
    'Lubbock',
    'Amarillo',
    'Grand Prairie',
    'Galveston'
  ];

  console.log('🔍 Looking up DataForSEO location codes for Texas cities...\n');

  try {
    // Query the cached location data
    const { data: locations, error } = await supabase
      .from('dataforseo_locations')
      .select('location_name, location_code, location_type')
      .ilike('location_name', '%texas%')
      .order('location_name');

    if (error) {
      console.error('Database error:', error);
      return;
    }

    console.log('📍 Found Texas locations in database:');
    console.log('═'.repeat(80));
    
    const foundCities = [];
    const texasState = locations.find(loc => 
      loc.location_name.toLowerCase() === 'texas' && 
      loc.location_type === 'State'
    );
    
    if (texasState) {
      console.log(`🏛️  TEXAS STATE: ${texasState.location_code}`);
      console.log('');
    }

    // Look for cities
    locations.forEach(location => {
      if (location.location_type === 'City') {
        const cityName = location.location_name.replace(', Texas', '').replace(',Texas', '');
        console.log(`🏙️  ${cityName}: ${location.location_code}`);
        
        if (targetCities.some(target => 
          cityName.toLowerCase().includes(target.toLowerCase()) ||
          target.toLowerCase().includes(cityName.toLowerCase())
        )) {
          foundCities.push({
            name: cityName,
            code: location.location_code,
            fullName: location.location_name
          });
        }
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log('🎯 PRIORITY CITIES FOR VENDOR EXPANSION:');
    console.log('═'.repeat(80));

    targetCities.forEach(city => {
      const found = foundCities.find(f => 
        f.name.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(f.name.toLowerCase())
      );
      
      if (found) {
        console.log(`✅ ${city}: ${found.code} (${found.fullName})`);
      } else {
        console.log(`❌ ${city}: NOT FOUND - needs manual lookup`);
      }
    });

    console.log('\n🛠️  CONFIGURATION UPDATE NEEDED:');
    console.log('═'.repeat(80));
    console.log('Add these to src/config/locations.ts under Texas cities:');
    console.log('');
    
    foundCities.forEach(city => {
      const cleanName = city.name.replace(/[^a-zA-Z\s]/g, '').trim();
      console.log(`      "${cleanName}": ${city.code},`);
    });

    return foundCities;

  } catch (error) {
    console.error('❌ Error looking up locations:', error);
  }
}

// Also check if we need to sync more location data
async function checkLocationDataCompleteness() {
  console.log('\n🔍 Checking location data completeness...');
  
  try {
    const { data: locCount, error } = await supabase
      .from('dataforseo_locations')
      .select('location_code', { count: 'exact' })
      .eq('country_iso_code', 'US');

    if (error) {
      console.error('Error checking location count:', error);
      return;
    }

    console.log(`📊 Found ${locCount.length} US locations in database`);
    
    if (locCount.length < 1000) {
      console.log('⚠️  This seems low - you may need to sync more location data');
      console.log('💡 Run: supabase functions invoke sync-dataforseo-locations');
    } else {
      console.log('✅ Location data appears complete');
    }

  } catch (error) {
    console.error('Error checking location completeness:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await findTexasCityLocationCodes();
  await checkLocationDataCompleteness();
}