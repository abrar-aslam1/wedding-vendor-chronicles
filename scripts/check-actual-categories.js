#!/usr/bin/env node

/**
 * Check what categories are actually in the instagram_vendors table
 */

import dotenv from 'dotenv';
dotenv.config();

async function checkActualCategories() {
  console.log('🎯 CHECKING ACTUAL CATEGORIES IN DATABASE');
  console.log('='.repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // Get all unique categories with counts
    console.log('📊 Fetching all categories with counts...');
    const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_category_counts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });

    if (!categoriesResponse.ok) {
      // If the RPC doesn't exist, try a different approach
      console.log('📊 Using alternative method to get categories...');
      
      // Get recent records and extract categories manually
      const allRecordsResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=category,city,state,created_at&order=created_at.desc&limit=1000`, {
        method: 'GET',
        headers
      });
      
      if (allRecordsResponse.ok) {
        const records = await allRecordsResponse.json();
        console.log(`✅ Analyzing ${records.length} recent records...`);
        
        // Count categories
        const categoryCounts = records.reduce((acc, record) => {
          const category = record.category;
          if (category) {
            acc[category] = (acc[category] || 0) + 1;
          }
          return acc;
        }, {});
        
        console.log('\n📈 Categories found:');
        Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([category, count]) => {
            console.log(`• ${category}: ${count} vendors`);
          });
        
        // Show recent activity by category (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const recentRecords = records.filter(r => r.created_at >= yesterday);
        
        if (recentRecords.length > 0) {
          console.log(`\n⏰ Recent activity (last 24h): ${recentRecords.length} vendors`);
          
          const recentCategoryCounts = recentRecords.reduce((acc, record) => {
            const category = record.category;
            if (category) {
              acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
          }, {});
          
          console.log('Recent breakdown:');
          Object.entries(recentCategoryCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([category, count]) => {
              console.log(`   • ${category}: ${count} new vendors`);
            });
        }

        // Show sample records from each category
        console.log('\n🔍 Sample records by category:');
        const uniqueCategories = [...new Set(records.map(r => r.category).filter(Boolean))];
        
        for (const category of uniqueCategories.slice(0, 10)) { // Limit to first 10 categories
          const sample = records.find(r => r.category === category);
          if (sample) {
            const date = new Date(sample.created_at).toLocaleDateString();
            console.log(`   • ${category}: ${sample.city}, ${sample.state} - ${date}`);
          }
        }
        
        // Check for workflow category matches
        console.log('\n🎯 WORKFLOW CATEGORY ANALYSIS:');
        console.log('-'.repeat(40));
        
        const workflowCategories = [
          'wedding-photographers', 'wedding-planners', 'wedding-venues',
          'coffee-carts', 'matcha-carts', 'cocktail-carts', 
          'dessert-carts', 'flower-carts', 'champagne-carts'
        ];
        
        const actualCategories = Object.keys(categoryCounts);
        
        console.log('Expected workflow categories:');
        workflowCategories.forEach(category => {
          const match = actualCategories.find(actual => 
            actual.toLowerCase().includes(category.replace('-', '').replace('wedding', '')) ||
            category.toLowerCase().includes(actual.replace('-', '').replace('wedding', ''))
          );
          const status = match ? '✅' : '❌';
          console.log(`${status} ${category} ${match ? `(found as: ${match})` : '(not found)'}`);
        });
        
        console.log('\nActual categories in database:');
        actualCategories.forEach(category => {
          console.log(`📋 ${category}: ${categoryCounts[category]} vendors`);
        });
        
      } else {
        console.log(`❌ Failed to fetch records: ${allRecordsResponse.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
  }
}

checkActualCategories().catch(console.error);
