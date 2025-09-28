#!/usr/bin/env node

/**
 * Setup Cart Category and Subcategories in Supabase
 * Adds the 'carts' category and its subcategories to the vendor_subcategories table
 */

import dotenv from 'dotenv';
dotenv.config();

// Cart subcategories to add
const CART_SUBCATEGORIES = [
  { name: 'dessert-carts', description: 'Mobile dessert carts for weddings and events' },
  { name: 'bar-carts', description: 'Portable bar carts and cocktail service equipment' },
  { name: 'mobile-bars', description: 'Professional mobile bar services with bartenders' },
  { name: 'food-carts', description: 'Mobile food service and catering carts' },
  { name: 'coffee-carts', description: 'Specialty coffee and beverage carts' },
  { name: 'ice-cream-carts', description: 'Ice cream and frozen treat mobile service' },
  { name: 'flower-carts', description: 'Mobile floral arrangement and bouquet carts' },
  { name: 'candy-carts', description: 'Sweet treat and confectionery display carts' },
  { name: 'donut-carts', description: 'Fresh donut and pastry service carts' },
  { name: 'beverage-carts', description: 'Non-alcoholic beverage service carts' },
  { name: 'champagne-carts', description: 'Champagne and sparkling wine service carts' },
  { name: 'cocktail-carts', description: 'Specialty cocktail mixing and service carts' }
];

/**
 * Add cart subcategories to Supabase
 */
async function setupCartSubcategories() {
  console.log('🛠️  SETTING UP CART CATEGORY AND SUBCATEGORIES');
  console.log('=' .repeat(60));
  
  try {
    const subcategoriesToInsert = CART_SUBCATEGORIES.map(sub => ({
      category: 'carts',
      name: sub.name,
      description: sub.description
    }));
    
    console.log(`📋 Adding ${subcategoriesToInsert.length} cart subcategories:`);
    subcategoriesToInsert.forEach(sub => {
      console.log(`   • ${sub.name}: ${sub.description}`);
    });
    
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/vendor_subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(subcategoriesToInsert)
    });
    
    if (response.ok) {
      console.log('\n✅ Successfully added cart subcategories to Supabase');
      console.log('🎉 Cart category is now ready for vendor storage!');
      return true;
    } else {
      const error = await response.text();
      console.error('\n❌ Error adding subcategories:', error);
      
      // Check if it's a duplicate error (category already exists)
      if (error.includes('duplicate key') || error.includes('already exists')) {
        console.log('ℹ️  Cart subcategories already exist - this is fine!');
        return true;
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error setting up cart subcategories:', error.message);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCartSubcategories();
}

export { setupCartSubcategories, CART_SUBCATEGORIES };
