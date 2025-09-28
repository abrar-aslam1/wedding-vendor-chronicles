#!/usr/bin/env node

/**
 * Check Available Categories in Supabase
 * Lists all categories and subcategories currently in the vendor_subcategories table
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Check existing categories and subcategories
 */
async function checkAvailableCategories() {
  console.log('🔍 CHECKING AVAILABLE CATEGORIES AND SUBCATEGORIES');
  console.log('=' .repeat(60));
  
  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/vendor_subcategories?select=*`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    if (response.ok) {
      const subcategories = await response.json();
      
      console.log(`📊 Found ${subcategories.length} subcategories:`);
      
      // Group by category
      const categoryGroups = {};
      subcategories.forEach(sub => {
        if (!categoryGroups[sub.category]) {
          categoryGroups[sub.category] = [];
        }
        categoryGroups[sub.category].push(sub);
      });
      
      Object.entries(categoryGroups).forEach(([category, subs]) => {
        console.log(`\n📂 ${category.toUpperCase()} (${subs.length} subcategories):`);
        subs.forEach(sub => {
          console.log(`   • ${sub.name}: ${sub.description || 'No description'}`);
        });
      });
      
      return categoryGroups;
    } else {
      const error = await response.text();
      console.error('❌ Error fetching categories:', error);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error checking categories:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAvailableCategories();
}

export { checkAvailableCategories };
