// Debug script to test location service
console.log('Testing location service...');

// Check if we can access the location service
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-project-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLocationData() {
  try {
    console.log('Testing states query...');
    const { data: states, error: statesError } = await supabase
      .from('dataforseo_locations')
      .select('*')
      .eq('location_type', 'state')
      .eq('country_code', 'US')
      .limit(5);
    
    if (statesError) {
      console.error('States error:', statesError);
    } else {
      console.log(`Found ${states?.length || 0} states`);
      console.log('Sample states:', states?.slice(0, 3));
    }

    if (states && states.length > 0) {
      console.log('\nTesting cities query for first state...');
      const firstState = states[0];
      const { data: cities, error: citiesError } = await supabase
        .from('dataforseo_locations')
        .select('*')
        .eq('location_type', 'city')
        .eq('parent_location_code', firstState.location_code)
        .limit(5);
      
      if (citiesError) {
        console.error('Cities error:', citiesError);
      } else {
        console.log(`Found ${cities?.length || 0} cities for ${firstState.location_name}`);
        console.log('Sample cities:', cities?.slice(0, 3));
      }
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

testLocationData();