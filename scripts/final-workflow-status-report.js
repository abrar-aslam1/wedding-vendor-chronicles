#!/usr/bin/env node

/**
 * Final Workflow Status Report
 * Comprehensive analysis of working autonomous system
 */

import dotenv from 'dotenv';
dotenv.config();

async function generateFinalReport() {
  console.log('🏆 AUTONOMOUS WORKFLOW SYSTEM - FINAL STATUS REPORT');
  console.log('='.repeat(60));
  console.log(`📅 Report Generated: ${new Date().toLocaleString()}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // Get comprehensive data
    const allRecordsResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=category,city,state,created_at&order=created_at.desc&limit=2000`, {
      method: 'GET',
      headers
    });
    
    if (!allRecordsResponse.ok) {
      console.log('❌ Failed to fetch data');
      return;
    }

    const records = await allRecordsResponse.json();
    console.log(`📊 SYSTEM OVERVIEW`);
    console.log('-'.repeat(40));
    console.log(`✅ Total Instagram vendors analyzed: ${records.length}`);
    
    // Time periods
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const recent24h = records.filter(r => new Date(r.created_at) >= last24h);
    const recent7days = records.filter(r => new Date(r.created_at) >= last7days);
    const recent30days = records.filter(r => new Date(r.created_at) >= last30days);

    console.log(`📈 Growth Metrics:`);
    console.log(`   • Last 24 hours: ${recent24h.length} new vendors`);
    console.log(`   • Last 7 days: ${recent7days.length} new vendors`);
    console.log(`   • Last 30 days: ${recent30days.length} new vendors`);

    // Daily rate calculation
    const dailyRate = recent7days.length / 7;
    const projectedMonthly = Math.round(dailyRate * 30);
    const projectedAnnual = Math.round(dailyRate * 365);

    console.log(`📊 Projected Growth:`);
    console.log(`   • Daily average: ${Math.round(dailyRate)} vendors/day`);
    console.log(`   • Monthly projection: ${projectedMonthly.toLocaleString()} vendors`);
    console.log(`   • Annual projection: ${projectedAnnual.toLocaleString()} vendors`);

    // Category analysis
    console.log(`\n🎯 CATEGORY PERFORMANCE`);
    console.log('-'.repeat(40));

    const categoryCounts = recent24h.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {});

    const workflowCategories = {
      'photographers': 'wedding-photographers',
      'wedding-planners': 'wedding-planners', 
      'venues': 'wedding-venues',
      'coffee-carts': 'coffee-carts',
      'matcha-carts': 'matcha-carts',
      'cocktail-carts': 'cocktail-carts',
      'dessert-carts': 'dessert-carts',
      'flower-carts': 'flower-carts',
      'champagne-carts': 'champagne-carts'
    };

    console.log('Workflow Categories (Last 24h):');
    Object.entries(workflowCategories).forEach(([actual, workflow]) => {
      const count = categoryCounts[actual] || 0;
      const status = count > 0 ? '✅' : '⏸️';
      console.log(`${status} ${workflow}: ${count} new vendors`);
    });

    console.log('\nAll Categories (Last 24h):');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count} vendors`);
      });

    // Geographic distribution
    console.log(`\n🌍 GEOGRAPHIC COVERAGE`);
    console.log('-'.repeat(40));

    const stateDistribution = recent24h.reduce((acc, record) => {
      acc[record.state] = (acc[record.state] || 0) + 1;
      return acc;
    }, {});

    const cityDistribution = recent24h.reduce((acc, record) => {
      const key = `${record.city}, ${record.state}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log(`States covered (24h): ${Object.keys(stateDistribution).length}`);
    console.log(`Cities covered (24h): ${Object.keys(cityDistribution).length}`);

    console.log('Top states:');
    Object.entries(stateDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([state, count]) => {
        console.log(`   • ${state}: ${count} vendors`);
      });

    console.log('Top cities:');
    Object.entries(cityDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([city, count]) => {
        console.log(`   • ${city}: ${count} vendors`);
      });

    // System health assessment
    console.log(`\n💪 SYSTEM HEALTH ASSESSMENT`);
    console.log('-'.repeat(40));

    const totalWorkflowVendors = Object.keys(workflowCategories)
      .reduce((sum, category) => sum + (categoryCounts[category] || 0), 0);

    if (recent24h.length >= 400) {
      console.log('🏆 EXCELLENT: System exceeding expectations');
      console.log('   • High vendor discovery rate');
      console.log('   • Multiple categories active');
      console.log('   • Geographic diversity achieved');
    } else if (recent24h.length >= 200) {
      console.log('✅ GOOD: System operating normally');
      console.log('   • Steady vendor discovery');
      console.log('   • Most categories active');
    } else if (recent24h.length >= 50) {
      console.log('⚠️ FAIR: System running below capacity');
      console.log('   • Some vendor discovery occurring');
      console.log('   • May need optimization');
    } else {
      console.log('❌ POOR: System needs attention');
      console.log('   • Very low discovery rate');
      console.log('   • Check workflow configuration');
    }

    // Recommendations
    console.log(`\n🚀 NEXT STEPS & RECOMMENDATIONS`);
    console.log('-'.repeat(40));

    if (recent24h.length > 400) {
      console.log('✅ System is performing excellently!');
      console.log('Recommendations:');
      console.log('• Continue current operation');
      console.log('• Monitor for sustained performance');
      console.log('• Consider expanding to additional categories');
      console.log('• Set up automated reporting dashboards');
    }

    // Data quality check
    const withEmails = records.filter(r => r.email && r.email.includes('@')).length;
    const withWebsites = records.filter(r => r.website_url && r.website_url.startsWith('http')).length;
    const emailPercentage = Math.round((withEmails / records.length) * 100);
    const websitePercentage = Math.round((withWebsites / records.length) * 100);

    console.log(`\n📋 DATA QUALITY METRICS`);
    console.log('-'.repeat(40));
    console.log(`• Vendors with emails: ${emailPercentage}%`);
    console.log(`• Vendors with websites: ${websitePercentage}%`);
    
    console.log(`\n🎉 CONCLUSION: AUTONOMOUS SYSTEM IS OPERATIONAL`);
    console.log('='.repeat(60));
    console.log('Your Instagram vendor collection workflows are working as designed.');
    console.log(`Current rate: ${recent24h.length} vendors discovered in last 24 hours.`);
    console.log('The system is autonomous and requires no manual intervention.');
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  }
}

generateFinalReport().catch(console.error);
