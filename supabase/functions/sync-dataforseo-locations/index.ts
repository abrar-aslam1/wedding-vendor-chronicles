import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DataForSEO credentials - same as in search-vendors function
const DATAFORSEO_AUTH = 'YWJyYXJAYW1hcm9zeXN0ZW1zLmNvbTo2OTA4NGQ4YzhkY2Y4MWNk';

interface LocationData {
  location_code: number;
  location_name: string;
  location_type: string;
  country_iso_code?: string;
  location_code_parent?: number;
  geo?: {
    lat: number;
    lon: number;
  };
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Sync DataForSEO Locations - Request received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { locationType = 'all', forceRefresh = false } = await req.json().catch(() => ({}));
    
    console.log(`[${requestId}] Parameters: locationType=${locationType}, forceRefresh=${forceRefresh}`);

    // Check if we need to refresh (last update > 30 days ago or forceRefresh)
    if (!forceRefresh) {
      const { data: existingLocations, error } = await supabase
        .from('dataforseo_locations')
        .select('location_code, last_updated')
        .order('last_updated', { ascending: true })
        .limit(1);

      if (!error && existingLocations && existingLocations.length > 0) {
        const lastUpdate = new Date(existingLocations[0].last_updated);
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceUpdate < 30) {
          console.log(`[${requestId}] Locations updated ${daysSinceUpdate.toFixed(1)} days ago, skipping refresh`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Locations are up to date (last updated ${daysSinceUpdate.toFixed(1)} days ago)`,
              locationsCount: await getLocationCount(supabase)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Fetch locations from DataForSEO API
    console.log(`[${requestId}] Fetching locations from DataForSEO API...`);
    
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/locations', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${DATAFORSEO_AUTH}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO API error: ${data.status_message || 'Unknown error'}`);
    }

    const locations: LocationData[] = data.tasks?.[0]?.result || [];
    console.log(`[${requestId}] Received ${locations.length} locations from API`);

    // Filter locations based on type if specified
    let filteredLocations = locations;
    if (locationType !== 'all') {
      filteredLocations = locations.filter(loc => {
        if (locationType === 'us_only') {
          // Only US locations (country code 2840 and its children)
          return loc.country_iso_code === 'US' || loc.location_code === 2840;
        }
        return loc.location_type === locationType;
      });
    }

    console.log(`[${requestId}] Processing ${filteredLocations.length} locations after filtering`);

    // Process locations in batches to avoid overwhelming the database
    const batchSize = 100;
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < filteredLocations.length; i += batchSize) {
      const batch = filteredLocations.slice(i, i + batchSize);
      
      // Prepare batch data
      const batchData = batch.map(location => ({
        location_code: location.location_code,
        location_name: location.location_name,
        location_type: mapLocationType(location.location_type),
        parent_location_code: location.location_code_parent || null,
        country_code: location.country_iso_code || 'US',
        latitude: location.geo?.lat || null,
        longitude: location.geo?.lon || null,
        coordinates: location.geo ? 
          `POINT(${location.geo.lon} ${location.geo.lat})` : null,
        metadata: {
          original_type: location.location_type,
          has_coordinates: !!location.geo
        },
        last_updated: new Date().toISOString()
      }));

      // Upsert batch
      const { error } = await supabase
        .from('dataforseo_locations')
        .upsert(batchData, { 
          onConflict: 'location_code',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`[${requestId}] Batch error:`, error);
        errorCount += batch.length;
      } else {
        processedCount += batch.length;
      }

      // Log progress
      if ((i + batchSize) % 500 === 0) {
        console.log(`[${requestId}] Progress: ${i + batchSize}/${filteredLocations.length} locations processed`);
      }
    }

    // Update state names for US cities
    if (locationType === 'all' || locationType === 'us_only') {
      await updateStateNames(supabase, requestId);
    }

    // Get final count
    const finalCount = await getLocationCount(supabase);

    const result = {
      success: true,
      message: `Successfully synced ${processedCount} locations`,
      details: {
        totalReceived: locations.length,
        filtered: filteredLocations.length,
        processed: processedCount,
        errors: errorCount,
        totalInDatabase: finalCount
      }
    };

    console.log(`[${requestId}] Sync complete:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to map DataForSEO location types to our schema
function mapLocationType(type: string): string {
  const typeMap: Record<string, string> = {
    'Country': 'country',
    'State': 'state',
    'City': 'city',
    'Neighborhood': 'city', // Treat neighborhoods as cities for simplicity
    'Borough': 'city',
    'District': 'city'
  };
  
  return typeMap[type] || 'city';
}

// Helper function to get location count
async function getLocationCount(supabase: any): Promise<number> {
  const { count, error } = await supabase
    .from('dataforseo_locations')
    .select('*', { count: 'exact', head: true });
  
  return error ? 0 : (count || 0);
}

// Helper function to update state names for US locations
async function updateStateNames(supabase: any, requestId: string): Promise<void> {
  console.log(`[${requestId}] Updating state names for US locations...`);
  
  // Get all US states
  const { data: states, error } = await supabase
    .from('dataforseo_locations')
    .select('location_code, location_name')
    .eq('location_type', 'state')
    .eq('country_code', 'US');

  if (error || !states) {
    console.error(`[${requestId}] Error fetching states:`, error);
    return;
  }

  // Create state code mapping
  const stateMap = new Map<number, { name: string, code: string }>();
  states.forEach(state => {
    // Extract state code from name (e.g., "California" -> "CA")
    const stateCode = getStateCode(state.location_name);
    if (stateCode) {
      stateMap.set(state.location_code, { 
        name: state.location_name, 
        code: stateCode 
      });
    }
  });

  // Update cities with state information
  for (const [stateLocationCode, stateInfo] of stateMap) {
    const { error: updateError } = await supabase
      .from('dataforseo_locations')
      .update({ 
        state_code: stateInfo.code,
        state_name: stateInfo.name
      })
      .eq('parent_location_code', stateLocationCode)
      .eq('location_type', 'city');

    if (updateError) {
      console.error(`[${requestId}] Error updating cities for state ${stateInfo.name}:`, updateError);
    }
  }

  console.log(`[${requestId}] State names update complete`);
}

// Helper function to get state code from state name
function getStateCode(stateName: string): string | null {
  const stateCodeMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  
  return stateCodeMap[stateName] || null;
}