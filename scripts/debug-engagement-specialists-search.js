import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugEngagementSpecialistsSearch() {
  console.log('🔍 Debugging: Engagement Specialists Photographers In Austin, Texas');
  console.log('=' .repeat(70));
  
  const searchParams = {
    keyword: 'photographers',
    location: 'Austin, Texas',
    subcategory: 'engagement specialists'
  };
  
  console.log('Search Parameters:', searchParams);
  console.log('');
  
  try {
    // Call the search function
    console.log('📡 Calling search-vendors function...');
    const { data, error } = await supabase.functions.invoke('search-vendors', {
      body: searchParams
    });
    
    if (error) {
      console.error('❌ Search function error:', error);
      return;
    }
    
    console.log(`✅ Search completed. Total results: ${data?.length || 0}`);
    console.log('');
    
    if (!data || data.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    // Separate results by source
    const googleResults = data.filter(result => !result.vendor_source || result.vendor_source !== 'instagram');
    const instagramResults = data.filter(result => result.vendor_source === 'instagram');
    const databaseResults = data.filter(result => result.vendor_source === 'database');
    
    console.log('📊 Results Breakdown:');
    console.log(`  Instagram: ${instagramResults.length}`);
    console.log(`  Database: ${databaseResults.length}`);
    console.log(`  Google: ${googleResults.length - databaseResults.length}`);
    console.log(`  Total Google Column: ${googleResults.length}`);
    console.log('');
    
    // Show sample results from each source
    if (instagramResults.length > 0) {
      console.log('📸 Instagram Results Sample:');
      instagramResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     Source: ${result.vendor_source}`);
        console.log(`     Location: ${result.city}, ${result.state}`);
        console.log(`     Handle: @${result.instagram_handle || 'N/A'}`);
        console.log('');
      });
    }
    
    if (databaseResults.length > 0) {
      console.log('💾 Database Results Sample:');
      databaseResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     Source: ${result.vendor_source}`);
        console.log(`     Location: ${result.city}, ${result.state}`);
        console.log('');
      });
    }
    
    const pureGoogleResults = googleResults.filter(result => result.vendor_source === 'google');
    if (pureGoogleResults.length > 0) {
      console.log('🗺️  Google Maps Results Sample:');
      pureGoogleResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     Source: ${result.vendor_source}`);
        console.log(`     Location: ${result.address}`);
        console.log(`     Rating: ${result.rating?.value?.value || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No Google Maps results found');
      console.log('');
      
      // Check cache for this search
      console.log('🔍 Checking cache for this search...');
      const cacheKey = `${searchParams.keyword.toLowerCase().trim()}|${searchParams.location.toLowerCase().trim()}|${searchParams.subcategory.toLowerCase().trim()}`;
      console.log(`Cache key: ${cacheKey}`);
      
      const { data: cachedResult, error: cacheError } = await supabase
        .from('vendor_cache')
        .select('*')
        .eq('search_key', cacheKey)
        .single();
      
      if (cacheError) {
        console.log('❌ No cache entry found or cache error:', cacheError.message);
      } else {
        console.log('✅ Cache entry found:');
        console.log(`  Created: ${cachedResult.created_at}`);
        console.log(`  Expires: ${cachedResult.expires_at}`);
        console.log(`  Result count: ${cachedResult.result_count}`);
        console.log(`  API cost: $${cachedResult.api_cost}`);
        
        if (cachedResult.results && Array.isArray(cachedResult.results)) {
          console.log(`  Cached results: ${cachedResult.results.length}`);
          if (cachedResult.results.length > 0) {
            console.log('  Sample cached result:');
            console.log(`    Title: ${cachedResult.results[0].title}`);
            console.log(`    Address: ${cachedResult.results[0].address}`);
          }
        }
      }
    }
    
    // Test broader search without subcategory
    console.log('');
    console.log('🔍 Testing broader search without subcategory...');
    const broaderParams = {
      keyword: 'photographers',
      location: 'Austin, Texas'
      // No subcategory
    };
    
    const { data: broaderData, error: broaderError } = await supabase.functions.invoke('search-vendors', {
      body: broaderParams
    });
    
    if (broaderError) {
      console.error('❌ Broader search error:', broaderError);
    } else {
      const broaderGoogleResults = broaderData?.filter(result => !result.vendor_source || result.vendor_source !== 'instagram') || [];
      const broaderPureGoogle = broaderGoogleResults.filter(result => result.vendor_source === 'google');
      
      console.log(`✅ Broader search results: ${broaderData?.length || 0} total`);
      console.log(`   Google column: ${broaderGoogleResults.length}`);
      console.log(`   Pure Google Maps: ${broaderPureGoogle.length}`);
      
      if (broaderPureGoogle.length > 0) {
        console.log('   Sample broader Google result:');
        console.log(`     Title: ${broaderPureGoogle[0].title}`);
        console.log(`     Address: ${broaderPureGoogle[0].address}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug
debugEngagementSpecialistsSearch();
