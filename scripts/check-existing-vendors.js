#!/usr/bin/env node

/**
 * Check existing vendors to see what owner_ids are used
 */

import dotenv from 'dotenv';
dotenv.config();

async function checkExistingVendors() {
  console.log('🔍 CHECKING EXISTING VENDORS');
  console.log('=' .repeat(40));
  
  try {
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/vendors?select=id,business_name,owner_id,category,city&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    if (response.ok) {
      const vendors = await response.json();
      
      console.log(`📊 Found ${vendors.length} existing vendors:`);
      vendors.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.business_name} (${vendor.category})`);
        console.log(`   Owner ID: ${vendor.owner_id}`);
        console.log(`   Location: ${vendor.city}`);
        console.log('');
      });
      
      return vendors.length > 0 ? vendors[0].owner_id : null;
    } else {
      const error = await response.text();
      console.error('❌ Error fetching vendors:', error);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error checking vendors:', error.message);
    return null;
  }
}

checkExistingVendors();
