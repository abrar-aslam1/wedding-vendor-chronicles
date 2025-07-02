import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateLocationMetadata() {
  try {
    console.log('Starting location metadata population...');

    // First, get all vendor data
    console.log('Fetching vendor data...');
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('state, city, id')
      .not('state', 'is', null)
      .not('city', 'is', null);

    if (vendorError) {
      throw new Error(`Error fetching vendors: ${vendorError.message}`);
    }

    if (!vendors || vendors.length === 0) {
      console.log('No vendor data found. Skipping location metadata population.');
      return;
    }

    console.log(`Found ${vendors.length} vendors to process`);

    // Group vendors by state
    const stateData = {};
    
    vendors.forEach(vendor => {
      const state = vendor.state.trim();
      const city = vendor.city.trim();
      
      if (!stateData[state]) {
        stateData[state] = {
          vendor_count: 0,
          cities: new Set()
        };
      }
      
      stateData[state].vendor_count++;
      stateData[state].cities.add(city);
    });

    console.log(`Processing ${Object.keys(stateData).length} states...`);

    // Clear existing location metadata
    console.log('Clearing existing location metadata...');
    const { error: deleteError } = await supabase
      .from('location_metadata')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    }

    // Insert state-level records
    const stateRecords = [];
    
    for (const [state, data] of Object.entries(stateData)) {
      // Get top 5 cities by vendor count for this state
      const stateCities = vendors
        .filter(v => v.state.trim() === state)
        .reduce((acc, vendor) => {
          const city = vendor.city.trim();
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});

      const popularCities = Object.entries(stateCities)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([city]) => city);

      const seoDescription = `Find the best wedding vendors in ${state}. Browse ${data.vendor_count} verified wedding professionals including photographers, venues, caterers, and more in ${popularCities.slice(0, 3).join(', ')} and other cities.`;

      stateRecords.push({
        state: state,
        city: null, // State-level record
        vendor_count: data.vendor_count,
        popular_cities: popularCities,
        average_rating: 4.5, // Default rating - can be calculated later
        seo_description: seoDescription
      });
    }

    console.log(`Inserting ${stateRecords.length} state records...`);
    
    // Insert in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < stateRecords.length; i += batchSize) {
      const batch = stateRecords.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('location_metadata')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError.message);
        throw insertError;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(stateRecords.length / batchSize)}`);
    }

    console.log('✅ Location metadata population completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - States processed: ${Object.keys(stateData).length}`);
    console.log(`   - Total vendors: ${vendors.length}`);
    console.log(`   - Records created: ${stateRecords.length}`);

  } catch (error) {
    console.error('❌ Error populating location metadata:', error.message);
    process.exit(1);
  }
}

// Run the population script
populateLocationMetadata();
