#!/usr/bin/env node

/**
 * Autonomous System Health Checker
 * Monitors all workflows and provides system status
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSystemHealth() {
  console.log('🏥 Checking autonomous system health...');
  
  try {
    // Check recent vendor additions (last 24 hours)
    const { data: recentVendors, error: vendorError } = await supabase
      .from('instagram_vendors')
      .select('id, category, city, state, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (vendorError) {
      console.error('❌ Database connection failed:', vendorError.message);
      return false;
    }

    console.log(`📊 Last 24 hours: ${recentVendors.length} new vendors discovered`);
    
    // Analyze by category
    const categoryBreakdown = recentVendors.reduce((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📋 Category breakdown:');
    Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} vendors`);
      });

    // Check city coverage
    const cityBreakdown = recentVendors.reduce((acc, vendor) => {
      const key = `${vendor.city}, ${vendor.state}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    const activeCities = Object.keys(cityBreakdown).length;
    console.log(`🌍 Active cities: ${activeCities} (last 24h)`);
    
    // System health assessment
    if (recentVendors.length >= 4000) {
      console.log('🎉 EXCELLENT: System exceeding expectations');
    } else if (recentVendors.length >= 2000) {
      console.log('✅ GOOD: System operating normally');  
    } else if (recentVendors.length >= 500) {
      console.log('⚠️ FAIR: System running below expected capacity');
    } else {
      console.log('❌ POOR: System may need attention');
    }

    // Check total system growth
    const { data: totalVendors } = await supabase
      .from('instagram_vendors')
      .select('id', { count: 'exact' });
    
    console.log(`💾 Total vendors in database: ${totalVendors.length || 0}`);
    
    return true;

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Export for use in other scripts
module.exports = { checkSystemHealth };

// Run if called directly
if (require.main === module) {
  checkSystemHealth()
    .then(healthy => {
      process.exit(healthy ? 0 : 1);
    })
    .catch(error => {
      console.error('💀 Health checker crashed:', error.message);
      process.exit(1);
    });
}
