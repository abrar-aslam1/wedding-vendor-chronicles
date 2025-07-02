#!/usr/bin/env node

// Test script to verify Google results are now working with DataForSEO credentials
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGoogleResults() {
  console.log('🧪 Testing Google results with DataForSEO credentials...');
  console.log('📍 Testing search: photographers in Dallas, TX');
  
  try {
    const startTime = Date.now();
    
    const { data: results, error } = await supabase.functions.invoke('search-vendors', {
      body: {
        keyword: 'photographers',
        location: 'Dallas, TX'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Request completed in ${duration}ms`);
    
    if (error) {
      console.error('❌ Error calling search-vendors function:', error);
      return;
    }
    
    if (!results || !Array.isArray(results)) {
      console.error('❌ Invalid response format:', results);
      return;
    }
    
    console.log(`📊 Total results: ${results.length}`);
    
    // Separate results by source
    const instagramResults = results.filter(r => r.vendor_source === 'instagram');
    const googleResults = results.filter(r => r.vendor_source === 'google');
    const databaseResults = results.filter(r => r.vendor_source === 'database');
    const unknownResults = results.filter(r => !r.vendor_source);
    
    console.log(`📸 Instagram results: ${instagramResults.length}`);
    console.log(`🗄️  Database results: ${databaseResults.length}`);
    console.log(`🌐 Google results: ${googleResults.length}`);
    console.log(`❓ Unknown source results: ${unknownResults.length}`);
    
    // Show sample results
    if (googleResults.length > 0) {
      console.log('\n✅ SUCCESS: Google results found!');
      console.log('📋 Sample Google results:');
      googleResults.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title}`);
        console.log(`     📍 ${result.address}`);
        console.log(`     ⭐ Rating: ${result.rating?.value?.value || 'N/A'}`);
        console.log(`     📞 Phone: ${result.phone || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No Google results found');
      console.log('🔍 This could mean:');
      console.log('   - DataForSEO API credentials are still not working');
      console.log('   - No vendors found for this search');
      console.log('   - API rate limits or other issues');
    }
    
    if (instagramResults.length > 0) {
      console.log('\n📸 Instagram results are working:');
      instagramResults.slice(0, 2).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title} (@${result.instagram_handle})`);
        console.log(`     👥 Followers: ${result.follower_count || 'N/A'}`);
      });
    }
    
    // Check if we have any results at all
    if (results.length === 0) {
      console.log('\n⚠️  No results found at all - this suggests an issue with the search function');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testGoogleResults();
