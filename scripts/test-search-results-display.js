#!/usr/bin/env node

/**
 * Test script to verify that both Google and Instagram results are being returned
 * and properly categorized by vendor_source
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearchResults() {
  console.log('🔍 Testing search results display...\n');
  
  // Test search parameters
  const testCases = [
    {
      keyword: 'photographer',
      location: 'Dallas, Texas',
      subcategory: null
    },
    {
      keyword: 'photographer',
      location: 'Los Angeles, California',
      subcategory: 'engagement specialists'
    },
    {
      keyword: 'wedding planner',
      location: 'New York, New York',
      subcategory: null
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.keyword} in ${testCase.location}${testCase.subcategory ? ` (${testCase.subcategory})` : ''}`);
    console.log('=' .repeat(80));
    
    try {
      // Call the search function
      const { data, error } = await supabase.functions.invoke('search-vendors', {
        body: {
          keyword: testCase.keyword,
          location: testCase.location,
          subcategory: testCase.subcategory
        }
      });

      if (error) {
        console.error('❌ Search function error:', error);
        continue;
      }

      if (!data || !Array.isArray(data)) {
        console.log('⚠️  No results returned or invalid format');
        continue;
      }

      // Analyze results by vendor_source
      const sourceBreakdown = data.reduce((acc, result) => {
        const source = result.vendor_source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      console.log(`📊 Total results: ${data.length}`);
      console.log('📈 Results by source:');
      Object.entries(sourceBreakdown).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} results`);
      });

      // Show sample results from each source
      const googleResults = data.filter(r => r.vendor_source === 'google' || r.vendor_source === 'database' || !r.vendor_source);
      const instagramResults = data.filter(r => r.vendor_source === 'instagram');

      if (googleResults.length > 0) {
        console.log('\n🌐 Sample Google/Database Results:');
        googleResults.slice(0, 3).forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.title} (${result.vendor_source || 'unknown'})`);
          if (result.address) console.log(`      📍 ${result.address}`);
          if (result.rating?.value) console.log(`      ⭐ ${result.rating.value}/5`);
        });
      }

      if (instagramResults.length > 0) {
        console.log('\n📸 Sample Instagram Results:');
        instagramResults.slice(0, 3).forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.title} (${result.vendor_source})`);
          if (result.instagram_handle) console.log(`      📱 @${result.instagram_handle}`);
          if (result.follower_count) console.log(`      👥 ${result.follower_count} followers`);
        });
      }

      // Check for potential issues
      const issues = [];
      
      if (data.length === 0) {
        issues.push('No results returned');
      }
      
      if (googleResults.length === 0 && instagramResults.length === 0) {
        issues.push('No results in either Google or Instagram categories');
      }
      
      const unknownSources = data.filter(r => !r.vendor_source);
      if (unknownSources.length > 0) {
        issues.push(`${unknownSources.length} results missing vendor_source field`);
      }

      if (issues.length > 0) {
        console.log('\n⚠️  Potential Issues:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      } else {
        console.log('\n✅ Results look good!');
      }

    } catch (error) {
      console.error('❌ Test error:', error.message);
    }
  }
}

// Run the test
testSearchResults().catch(console.error);
