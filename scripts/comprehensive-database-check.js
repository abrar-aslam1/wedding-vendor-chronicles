#!/usr/bin/env node

/**
 * Comprehensive Database Check
 * Check all vendor tables and recent activity
 */

import dotenv from 'dotenv';
dotenv.config();

async function checkDatabase() {
  console.log('🔍 COMPREHENSIVE DATABASE CHECK');
  console.log('='.repeat(50));
  console.log(`🕐 Check time: ${new Date().toISOString()}\n`);

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Available env vars:');
    console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`- VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`- SUPABASE_SERVICE_ROLE: ${process.env.SUPABASE_SERVICE_ROLE ? '✅' : '❌'}`);
    console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
    return;
  }

  console.log(`🌐 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`🔑 Service Key: ${serviceKey.substring(0, 20)}...\n`);

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check main vendors table
    console.log('📊 CHECKING MAIN VENDORS TABLE');
    console.log('-'.repeat(40));
    
    const vendorsResponse = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id,business_name,category,city,state,created_at&order=created_at.desc&limit=10`, {
      method: 'GET',
      headers
    });
    
    if (vendorsResponse.ok) {
      const vendors = await vendorsResponse.json();
      console.log(`✅ Main vendors table: ${vendors.length} recent entries`);
      
      if (vendors.length > 0) {
        console.log('   Recent vendors:');
        vendors.slice(0, 5).forEach((vendor, index) => {
          const date = new Date(vendor.created_at).toLocaleDateString();
          console.log(`   ${index + 1}. ${vendor.business_name} (${vendor.category}) - ${vendor.city}, ${vendor.state} - ${date}`);
        });
      }
    } else {
      console.log(`❌ Main vendors table error: ${vendorsResponse.status}`);
    }

    // 2. Check instagram_vendors table (this is what workflows should populate)
    console.log('\n📱 CHECKING INSTAGRAM VENDORS TABLE');
    console.log('-'.repeat(40));
    
    const igVendorsResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id,business_name,username,category,city,state,created_at&order=created_at.desc&limit=10`, {
      method: 'GET',
      headers
    });
    
    if (igVendorsResponse.ok) {
      const igVendors = await igVendorsResponse.json();
      console.log(`✅ Instagram vendors table: ${igVendors.length} recent entries`);
      
      if (igVendors.length > 0) {
        console.log('   Recent Instagram vendors:');
        igVendors.slice(0, 5).forEach((vendor, index) => {
          const date = new Date(vendor.created_at).toLocaleDateString();
          console.log(`   ${index + 1}. ${vendor.business_name} (@${vendor.username}) - ${vendor.category} - ${vendor.city}, ${vendor.state} - ${date}`);
        });
      }
    } else {
      console.log(`❌ Instagram vendors table error: ${igVendorsResponse.status}`);
    }

    // 3. Get total counts
    console.log('\n📈 TOTAL COUNTS');
    console.log('-'.repeat(40));
    
    // Count main vendors
    const vendorsCountResponse = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id&head=true`, {
      method: 'HEAD',
      headers
    });
    
    if (vendorsCountResponse.ok) {
      const totalVendors = vendorsCountResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`📊 Total main vendors: ${totalVendors}`);
    }

    // Count Instagram vendors
    const igCountResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id&head=true`, {
      method: 'HEAD',
      headers
    });
    
    if (igCountResponse.ok) {
      const totalIgVendors = igCountResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`📱 Total Instagram vendors: ${totalIgVendors}`);
    }

    // 4. Check recent activity (last 24 hours)
    console.log('\n⏰ RECENT ACTIVITY (Last 24 Hours)');
    console.log('-'.repeat(40));
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Recent main vendors
    const recentVendorsResponse = await fetch(`${supabaseUrl}/rest/v1/vendors?select=id,category,city,created_at&created_at=gte.${yesterday}&order=created_at.desc`, {
      method: 'GET',
      headers
    });
    
    if (recentVendorsResponse.ok) {
      const recentVendors = await recentVendorsResponse.json();
      console.log(`📊 Main vendors added (24h): ${recentVendors.length}`);
    }

    // Recent Instagram vendors
    const recentIgResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id,category,city,created_at&created_at=gte.${yesterday}&order=created_at.desc`, {
      method: 'GET',
      headers
    });
    
    if (recentIgResponse.ok) {
      const recentIgVendors = await recentIgResponse.json();
      console.log(`📱 Instagram vendors added (24h): ${recentIgVendors.length}`);
      
      if (recentIgVendors.length > 0) {
        // Group by category
        const byCategory = recentIgVendors.reduce((acc, vendor) => {
          acc[vendor.category] = (acc[vendor.category] || 0) + 1;
          return acc;
        }, {});
        
        console.log('   Breakdown by category:');
        Object.entries(byCategory).forEach(([category, count]) => {
          console.log(`   • ${category}: ${count}`);
        });
      }
    }

    // 5. Check for specific workflow categories
    console.log('\n🎯 WORKFLOW CATEGORIES CHECK');
    console.log('-'.repeat(40));
    
    const categories = [
      'wedding-photographers', 'wedding-planners', 'wedding-venues',
      'coffee-carts', 'matcha-carts', 'cocktail-carts', 
      'dessert-carts', 'flower-carts', 'champagne-carts'
    ];

    for (const category of categories) {
      const categoryResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id&category=eq.${category}`, {
        method: 'HEAD',
        headers
      });
      
      if (categoryResponse.ok) {
        const count = categoryResponse.headers.get('content-range')?.split('/')[1] || '0';
        const status = parseInt(count) > 0 ? '✅' : '❌';
        console.log(`${status} ${category}: ${count} vendors`);
      }
    }

    // 6. Check table schemas
    console.log('\n🔍 TABLE SCHEMAS');
    console.log('-'.repeat(40));
    
    // This might not work with REST API, but let's try
    try {
      const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/?select=*`, {
        method: 'OPTIONS',
        headers
      });
      console.log(`📋 Schema check status: ${schemaResponse.status}`);
    } catch (e) {
      console.log('📋 Schema check: Not available via REST API');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkDatabase().catch(console.error);
