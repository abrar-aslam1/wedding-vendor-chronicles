#!/usr/bin/env node

/**
 * Test Website Instagram Integration
 * Check why Instagram vendors aren't showing up on the website
 */

import dotenv from 'dotenv';
dotenv.config();

async function testWebsiteIntegration() {
  console.log('🔍 TESTING WEBSITE INSTAGRAM INTEGRATION');
  console.log('='.repeat(60));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check what categories are actually in Instagram vendors table
    console.log('📊 STEP 1: Checking Instagram vendor categories');
    console.log('-'.repeat(40));
    
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=category,business_name,city,state,instagram_handle&limit=20`, {
      method: 'GET',
      headers
    });
    
    if (categoriesResponse.ok) {
      const vendors = await categoriesResponse.json();
      console.log(`✅ Found ${vendors.length} Instagram vendors in database`);
      
      if (vendors.length > 0) {
        // Group by category
        const byCategory = vendors.reduce((acc, vendor) => {
          if (!acc[vendor.category]) acc[vendor.category] = [];
          acc[vendor.category].push(vendor);
          return acc;
        }, {});
        
        console.log('\n📋 Instagram vendors by category:');
        Object.entries(byCategory).forEach(([category, vendorList]) => {
          console.log(`   • ${category}: ${vendorList.length} vendors`);
          // Show sample vendor
          if (vendorList.length > 0) {
            const sample = vendorList[0];
            console.log(`     Sample: ${sample.business_name} (@${sample.instagram_handle}) - ${sample.city}, ${sample.state}`);
          }
        });
      } else {
        console.log('❌ No Instagram vendors found in database!');
        return;
      }
    } else {
      console.log(`❌ Failed to fetch Instagram vendors: ${categoriesResponse.status}`);
      return;
    }

    // 2. Test the search function with different keywords
    console.log('\n🔍 STEP 2: Testing search function');
    console.log('-'.repeat(40));
    
    const testSearches = [
      { keyword: 'coffee cart', location: 'New York, NY' },
      { keyword: 'photographers', location: 'Boston, MA' },
      { keyword: 'dessert cart', location: 'Atlanta, GA' },
      { keyword: 'matcha cart', location: 'Seattle, WA' }
    ];

    for (const search of testSearches) {
      console.log(`\n🔍 Testing search: "${search.keyword}" in ${search.location}`);
      
      try {
        // Simulate the search-vendors function call
        const searchBody = {
          keyword: search.keyword,
          location: search.location
        };

        const searchResponse = await fetch(`${supabaseUrl}/functions/v1/search-vendors`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchBody)
        });

        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          console.log(`   ✅ Search function returned ${searchResult.totalResults || searchResult.results?.length || 0} total results`);
          
          if (searchResult.results) {
            // Count by source
            const bySource = searchResult.results.reduce((acc, result) => {
              const source = result.vendor_source || 'unknown';
              acc[source] = (acc[source] || 0) + 1;
              return acc;
            }, {});
            
            console.log('   📊 Results by source:');
            Object.entries(bySource).forEach(([source, count]) => {
              console.log(`      • ${source}: ${count} results`);
            });

            // Show Instagram results specifically
            const instagramResults = searchResult.results.filter(r => r.vendor_source === 'instagram');
            if (instagramResults.length > 0) {
              console.log(`   📱 Instagram results found: ${instagramResults.length}`);
              instagramResults.slice(0, 3).forEach((result, index) => {
                console.log(`      ${index + 1}. ${result.title} (@${result.instagram_handle}) - ${result.address}`);
              });
            } else {
              console.log('   ❌ No Instagram results found in search');
            }
          }
        } else {
          const errorText = await searchResponse.text();
          console.log(`   ❌ Search function failed: ${searchResponse.status}`);
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Search test failed: ${error.message}`);
      }
    }

    // 3. Test direct database query with search logic
    console.log('\n🔍 STEP 3: Direct database query test');
    console.log('-'.repeat(40));
    
    // Test the exact query the search function uses
    console.log('Testing coffee cart search in New York...');
    
    try {
      // This mimics the exact query from the search function
      const directResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=*&category=eq.coffee-carts&city=ilike.*New York*&state=ilike.*NY*&limit=10`, {
        method: 'GET',
        headers
      });
      
      if (directResponse.ok) {
        const directResults = await directResponse.json();
        console.log(`   ✅ Direct query found ${directResults.length} coffee cart vendors in NY`);
        
        if (directResults.length > 0) {
          directResults.forEach((vendor, index) => {
            console.log(`      ${index + 1}. ${vendor.business_name} (@${vendor.instagram_handle}) - ${vendor.city}, ${vendor.state}`);
          });
        }
      } else {
        console.log(`   ❌ Direct query failed: ${directResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Direct query error: ${error.message}`);
    }

    // 4. Check if the issue is with the category mapping
    console.log('\n🔍 STEP 4: Category mapping analysis');
    console.log('-'.repeat(40));
    
    const categoryMappings = {
      'coffee cart': 'coffee-carts',
      'photographers': 'photographers', 
      'dessert cart': 'dessert-carts',
      'matcha cart': 'matcha-carts',
      'cocktail cart': 'cocktail-carts',
      'flower cart': 'flower-carts',
      'champagne cart': 'champagne-carts'
    };

    console.log('Expected category mappings:');
    Object.entries(categoryMappings).forEach(([keyword, expectedCategory]) => {
      console.log(`   "${keyword}" → "${expectedCategory}"`);
    });

    // Check if these categories exist in the database
    for (const [keyword, expectedCategory] of Object.entries(categoryMappings)) {
      try {
        const categoryCheckResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id,business_name&category=eq.${expectedCategory}&limit=5`, {
          method: 'GET',
          headers
        });
        
        if (categoryCheckResponse.ok) {
          const categoryResults = await categoryCheckResponse.json();
          const status = categoryResults.length > 0 ? '✅' : '❌';
          console.log(`   ${status} "${expectedCategory}": ${categoryResults.length} vendors`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking "${expectedCategory}": ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\n💡 POSSIBLE ISSUES:');
    console.log('1. Category mapping mismatch between workflows and search');
    console.log('2. Location filtering too restrictive (ilike patterns)');
    console.log('3. Search function edge function not deployed properly');
    console.log('4. Frontend not calling the search function correctly');
    console.log('5. Instagram vendors exist but search logic has bugs');
    
    console.log('\n🛠️ IMMEDIATE ACTIONS NEEDED:');
    console.log('1. Check if search-vendors edge function is deployed');
    console.log('2. Verify frontend is making correct API calls');
    console.log('3. Fix category mapping if needed');
    console.log('4. Test search on your actual website');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWebsiteIntegration().catch(console.error);
