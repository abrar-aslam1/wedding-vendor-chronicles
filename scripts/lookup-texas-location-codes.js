// Look up DataForSEO location codes for Texas cities
const dataForSeoLogin = 'abrar@amarosystems.com';
const dataForSeoPassword = '69084d8c8dcf81cd';

async function lookupTexasLocationCodes() {
  const targetCities = [
    'Fort Worth, TX',
    'El Paso, TX', 
    'Plano, TX',
    'Corpus Christi, TX',
    'Arlington, TX',
    'Garland, TX',
    'Irving, TX',
    'Lubbock, TX',
    'Amarillo, TX',
    'Galveston, TX'
  ];

  try {
    console.log('🔍 Looking up DataForSEO location codes for Texas cities...\n');
    
    const auth = Buffer.from(`${dataForSeoLogin}:${dataForSeoPassword}`).toString('base64');
    
    // Get all US locations
    console.log('📡 Fetching US location data from DataForSEO...');
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/locations', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.tasks || !data.tasks[0] || !data.tasks[0].result) {
      throw new Error('Invalid response from DataForSEO API');
    }
    
    const locations = data.tasks[0].result;
    console.log(`📊 Retrieved ${locations.length} total locations from DataForSEO\n`);
    
    // Filter for Texas cities
    const texasLocations = locations.filter(loc => 
      loc.country_iso_code === 'US' && 
      (loc.location_name.includes('Texas') || loc.location_name.includes(', TX'))
    );
    
    console.log(`🏛️  Found ${texasLocations.length} Texas locations:`);
    console.log('═'.repeat(80));
    
    // Current cities (for reference)
    const currentCities = {
      'Dallas': 1003735,
      'Houston': 1003811,
      'Austin': 1003550,
      'San Antonio': 1004100
    };
    
    console.log('✅ CURRENT CITIES:');
    Object.entries(currentCities).forEach(([city, code]) => {
      console.log(`   ${city}: ${code}`);
    });
    
    console.log('\n🎯 TARGET CITIES:');
    const foundCities = [];
    
    targetCities.forEach(targetCity => {
      const cityName = targetCity.replace(', TX', '');
      const found = texasLocations.find(loc => {
        const locName = loc.location_name.toLowerCase();
        const targetLower = cityName.toLowerCase();
        return locName.includes(targetLower) && 
               (locName.includes('texas') || locName.includes(', tx')) &&
               loc.location_type === 'City';
      });
      
      if (found) {
        console.log(`✅ ${cityName}: ${found.location_code} (${found.location_name})`);
        foundCities.push({
          name: cityName,
          code: found.location_code,
          fullName: found.location_name
        });
      } else {
        console.log(`❌ ${cityName}: NOT FOUND`);
      }
    });
    
    console.log('\n🛠️  CONFIGURATION UPDATE:');
    console.log('═'.repeat(80));
    console.log('Add these to src/config/locations.ts under Texas cities:');
    console.log('');
    
    foundCities.forEach(city => {
      const cleanName = city.name.replace(/[^a-zA-Z\s]/g, '').trim();
      console.log(`      "${cleanName}": ${city.code},`);
    });
    
    console.log('\n📝 COMPLETE UPDATED TEXAS CONFIGURATION:');
    console.log('─'.repeat(50));
    console.log('  "Texas": {');
    console.log('    code: 2840,');
    console.log('    cities: {');
    console.log('      "Dallas": 1003735,');
    console.log('      "Houston": 1003811,');
    console.log('      "Austin": 1003550,');
    console.log('      "San Antonio": 1004100,');
    
    foundCities.forEach(city => {
      const cleanName = city.name.replace(/[^a-zA-Z\s]/g, '').trim();
      console.log(`      "${cleanName}": ${city.code},`);
    });
    
    console.log('    }');
    console.log('  },');
    
    console.log('\n🎉 SUCCESS: Found location codes for Texas expansion!');
    console.log(`📈 Ready to expand from 4 to ${4 + foundCities.length} Texas cities`);
    
    return foundCities;
    
  } catch (error) {
    console.error('❌ Error looking up location codes:', error);
    return [];
  }
}

// Run the lookup
if (import.meta.url === `file://${process.argv[1]}`) {
  lookupTexasLocationCodes()
    .then(results => {
      console.log('\n✨ Lookup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Lookup failed:', error);
      process.exit(1);
    });
}