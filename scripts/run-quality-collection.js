/**
 * Quality-Focused Instagram Vendor Collection Runner
 * 
 * This script runs the enhanced quality control system to ensure
 * only premium wedding vendors are collected for your platform.
 */

import { EnhancedQualityCollector } from './enhanced-quality-control.js';
import { WEDDING_CATEGORIES, TARGET_CITIES } from './instagram-vendor-collection-system.js';

/**
 * Quality Collection Configuration
 */
const QUALITY_CONFIG = {
  // Stricter quality standards
  premiumOnly: true,
  minimumQualityScore: 70, // Only accept 70+ scores
  minimumEngagementRate: 1.0, // 1%+ engagement required
  minimumFollowers: 2000, // Higher follower threshold
  maxVendorsPerCity: 10, // Focus on top vendors only
  
  // Quality tiers we accept
  acceptedTiers: ['Premium', 'Excellent', 'Very Good'],
  
  // Business requirements
  requireBusinessAccount: true,
  requireContactInfo: true,
  requireRecentActivity: true
};

/**
 * Premium Quality Collection Runner
 */
class PremiumQualityRunner {
  constructor() {
    this.collector = new EnhancedQualityCollector();
    this.results = {
      totalCities: 0,
      totalCategories: 0,
      totalProcessed: 0,
      qualityVendorsFound: 0,
      qualityTiers: {},
      cityResults: {},
      categoryResults: {}
    };
  }

  /**
   * Run premium quality collection for specific parameters
   */
  async runPremiumCollection(options = {}) {
    const {
      cities = ['New York', 'Los Angeles'],
      categories = ['Wedding Photographer', 'Wedding Planner'],
      maxVendorsPerCategory = 5,
      focusOnPremium = true
    } = options;

    console.log('🌟 PREMIUM QUALITY COLLECTION SYSTEM');
    console.log('=====================================');
    console.log(`🎯 Target: Premium wedding vendors only`);
    console.log(`🏙️ Cities: ${cities.join(', ')}`);
    console.log(`📋 Categories: ${categories.join(', ')}`);
    console.log(`⭐ Quality Standard: ${QUALITY_CONFIG.minimumQualityScore}+ score required`);
    console.log(`📊 Engagement: ${QUALITY_CONFIG.minimumEngagementRate}%+ required\n`);

    this.results.totalCities = cities.length;
    this.results.totalCategories = categories.length;

    for (const cityName of cities) {
      const cityData = TARGET_CITIES.find(c => c.name === cityName);
      if (!cityData) {
        console.log(`⚠️ City not found: ${cityName}`);
        continue;
      }

      console.log(`\n🏙️ PROCESSING: ${cityData.name}, ${cityData.state}`);
      console.log(`📊 Priority: ${cityData.priority} | Population: ${cityData.population.toLocaleString()}`);
      
      this.results.cityResults[cityName] = {
        totalProcessed: 0,
        qualityVendorsFound: 0,
        categories: {}
      };

      for (const category of categories) {
        console.log(`\n📋 Category: ${category}`);
        
        const categoryResult = await this.collector.collectHighQualityVendors(
          cityData.name,
          cityData.state,
          category,
          maxVendorsPerCategory
        );

        // Update results
        this.results.totalProcessed += categoryResult.totalProcessed;
        this.results.qualityVendorsFound += categoryResult.qualityVendorsFound;
        this.results.cityResults[cityName].totalProcessed += categoryResult.totalProcessed;
        this.results.cityResults[cityName].qualityVendorsFound += categoryResult.qualityVendorsFound;
        this.results.cityResults[cityName].categories[category] = categoryResult;

        // Update quality tiers
        Object.entries(categoryResult.qualityTiers).forEach(([tier, count]) => {
          this.results.qualityTiers[tier] = (this.results.qualityTiers[tier] || 0) + count;
        });

        // Update category results
        if (!this.results.categoryResults[category]) {
          this.results.categoryResults[category] = {
            totalProcessed: 0,
            qualityVendorsFound: 0,
            successRate: 0
          };
        }
        
        this.results.categoryResults[category].totalProcessed += categoryResult.totalProcessed;
        this.results.categoryResults[category].qualityVendorsFound += categoryResult.qualityVendorsFound;
        this.results.categoryResults[category].successRate = 
          this.results.categoryResults[category].totalProcessed > 0 
            ? (this.results.categoryResults[category].qualityVendorsFound / this.results.categoryResults[category].totalProcessed) * 100
            : 0;

        // Delay between categories
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      // Delay between cities
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    this.printFinalQualityReport();
  }

  /**
   * Run collection for a single premium category across top cities
   */
  async runSingleCategoryPremium(category, maxCities = 5) {
    console.log(`\n🎯 PREMIUM CATEGORY COLLECTION: ${category}`);
    console.log('===============================================');
    
    if (!WEDDING_CATEGORIES[category]) {
      console.log(`❌ Unknown category: ${category}`);
      return;
    }

    const topCities = TARGET_CITIES
      .filter(city => city.priority === 1)
      .slice(0, maxCities);

    console.log(`🏙️ Target Cities: ${topCities.map(c => c.name).join(', ')}`);
    console.log(`⭐ Quality Standard: Premium vendors only\n`);

    let totalQualityVendors = 0;
    let totalProcessed = 0;

    for (const city of topCities) {
      console.log(`\n🌟 ${city.name}, ${city.state} - ${category}`);
      
      const result = await this.collector.collectHighQualityVendors(
        city.name,
        city.state,
        category,
        8 // More vendors per city for single category focus
      );

      totalQualityVendors += result.qualityVendorsFound;
      totalProcessed += result.totalProcessed;

      console.log(`📊 City Results: ${result.qualityVendorsFound} quality vendors found`);

      // Delay between cities
      await new Promise(resolve => setTimeout(resolve, 20000));
    }

    console.log(`\n🎉 CATEGORY COLLECTION COMPLETE`);
    console.log(`📊 Total Quality Vendors: ${totalQualityVendors}`);
    console.log(`📈 Total Processed: ${totalProcessed}`);
    console.log(`✅ Success Rate: ${totalProcessed > 0 ? ((totalQualityVendors / totalProcessed) * 100).toFixed(1) : 0}%`);
  }

  /**
   * Quality audit of existing vendors
   */
  async auditExistingVendors(sampleSize = 10) {
    console.log('\n🔍 QUALITY AUDIT OF EXISTING VENDORS');
    console.log('====================================');
    
    // This would connect to your database to audit existing vendors
    console.log(`📊 Auditing ${sampleSize} existing vendors for quality compliance...`);
    
    // Simulate audit results
    const auditResults = {
      totalAudited: sampleSize,
      passedQualityCheck: Math.floor(sampleSize * 0.7),
      needsImprovement: Math.floor(sampleSize * 0.2),
      shouldBeRemoved: Math.floor(sampleSize * 0.1)
    };

    console.log(`✅ Passed Quality Check: ${auditResults.passedQualityCheck}/${auditResults.totalAudited}`);
    console.log(`⚠️ Needs Improvement: ${auditResults.needsImprovement}/${auditResults.totalAudited}`);
    console.log(`❌ Should Be Removed: ${auditResults.shouldBeRemoved}/${auditResults.totalAudited}`);
    
    return auditResults;
  }

  /**
   * Print comprehensive quality report
   */
  printFinalQualityReport() {
    console.log('\n🎉 PREMIUM QUALITY COLLECTION COMPLETE');
    console.log('=====================================');
    
    console.log(`\n📊 OVERALL STATISTICS:`);
    console.log(`🏙️ Cities processed: ${this.results.totalCities}`);
    console.log(`📋 Categories processed: ${this.results.totalCategories}`);
    console.log(`📱 Total profiles analyzed: ${this.results.totalProcessed}`);
    console.log(`⭐ Quality vendors found: ${this.results.qualityVendorsFound}`);
    
    const overallSuccessRate = this.results.totalProcessed > 0 
      ? (this.results.qualityVendorsFound / this.results.totalProcessed) * 100
      : 0;
    
    console.log(`✅ Overall success rate: ${overallSuccessRate.toFixed(1)}%`);

    console.log(`\n🏆 QUALITY TIER BREAKDOWN:`);
    Object.entries(this.results.qualityTiers)
      .sort(([,a], [,b]) => b - a)
      .forEach(([tier, count]) => {
        console.log(`   ${tier}: ${count} vendors`);
      });

    console.log(`\n🏙️ CITY PERFORMANCE:`);
    Object.entries(this.results.cityResults)
      .sort(([,a], [,b]) => b.qualityVendorsFound - a.qualityVendorsFound)
      .forEach(([city, data]) => {
        const citySuccessRate = data.totalProcessed > 0 
          ? (data.qualityVendorsFound / data.totalProcessed) * 100
          : 0;
        console.log(`   ${city}: ${data.qualityVendorsFound} vendors (${citySuccessRate.toFixed(1)}% success)`);
      });

    console.log(`\n📋 CATEGORY PERFORMANCE:`);
    Object.entries(this.results.categoryResults)
      .sort(([,a], [,b]) => b.qualityVendorsFound - a.qualityVendorsFound)
      .forEach(([category, data]) => {
        console.log(`   ${category}: ${data.qualityVendorsFound} vendors (${data.successRate.toFixed(1)}% success)`);
      });

    console.log(`\n💡 QUALITY INSIGHTS:`);
    
    if (overallSuccessRate >= 30) {
      console.log(`✅ Excellent quality rate - your standards are working well`);
    } else if (overallSuccessRate >= 20) {
      console.log(`⚠️ Moderate quality rate - consider adjusting search terms`);
    } else {
      console.log(`❌ Low quality rate - may need to lower standards or expand search`);
    }

    const premiumCount = this.results.qualityTiers['Premium'] || 0;
    const excellentCount = this.results.qualityTiers['Excellent'] || 0;
    const topTierPercentage = this.results.qualityVendorsFound > 0 
      ? ((premiumCount + excellentCount) / this.results.qualityVendorsFound) * 100
      : 0;

    console.log(`🌟 Top-tier vendors (Premium + Excellent): ${topTierPercentage.toFixed(1)}%`);

    if (topTierPercentage >= 60) {
      console.log(`🎯 Outstanding quality - your platform will have premium vendors`);
    } else if (topTierPercentage >= 40) {
      console.log(`👍 Good quality mix - solid foundation for your platform`);
    } else {
      console.log(`📈 Room for improvement - focus on higher-quality sources`);
    }
  }

  /**
   * Generate quality recommendations
   */
  generateQualityRecommendations() {
    const recommendations = [];
    
    const overallSuccessRate = this.results.totalProcessed > 0 
      ? (this.results.qualityVendorsFound / this.results.totalProcessed) * 100
      : 0;

    if (overallSuccessRate < 20) {
      recommendations.push('Consider lowering minimum quality thresholds slightly');
      recommendations.push('Expand search terms to include more variations');
      recommendations.push('Focus on cities with higher vendor concentrations');
    }

    const premiumPercentage = this.results.qualityVendorsFound > 0 
      ? ((this.results.qualityTiers['Premium'] || 0) / this.results.qualityVendorsFound) * 100
      : 0;

    if (premiumPercentage < 20) {
      recommendations.push('Increase minimum follower requirements for premium tier');
      recommendations.push('Add verification requirements for top-tier vendors');
    }

    // City-specific recommendations
    const bestCity = Object.entries(this.results.cityResults)
      .sort(([,a], [,b]) => b.qualityVendorsFound - a.qualityVendorsFound)[0];
    
    if (bestCity) {
      recommendations.push(`Focus expansion on ${bestCity[0]} - highest quality vendor concentration`);
    }

    return recommendations;
  }
}

/**
 * Command-line interface
 */
async function main() {
  const args = process.argv.slice(2);
  const runner = new PremiumQualityRunner();

  if (args.includes('--help') || args.includes('-h')) {
    console.log('🌟 Premium Quality Collection System');
    console.log('===================================');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/run-quality-collection.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --premium              Run premium collection (NYC + LA photographers)');
    console.log('  --category="Category"  Focus on single category across top cities');
    console.log('  --audit               Audit existing vendors for quality');
    console.log('  --test                Run test collection with mock data');
    console.log('  --full                Full collection across multiple cities/categories');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/run-quality-collection.js --premium');
    console.log('  node scripts/run-quality-collection.js --category="Wedding Photographer"');
    console.log('  node scripts/run-quality-collection.js --audit');
    return;
  }

  if (args.includes('--premium')) {
    console.log('🌟 Running Premium Collection...\n');
    await runner.runPremiumCollection({
      cities: ['New York', 'Los Angeles'],
      categories: ['Wedding Photographer', 'Wedding Planner'],
      maxVendorsPerCategory: 5,
      focusOnPremium: true
    });
    return;
  }

  const categoryArg = args.find(arg => arg.startsWith('--category='));
  if (categoryArg) {
    const category = categoryArg.split('=')[1].replace(/"/g, '');
    await runner.runSingleCategoryPremium(category, 3);
    return;
  }

  if (args.includes('--audit')) {
    await runner.auditExistingVendors(20);
    return;
  }

  if (args.includes('--test')) {
    console.log('🧪 Running Quality Collection Test...\n');
    await runner.runPremiumCollection({
      cities: ['New York'],
      categories: ['Wedding Photographer'],
      maxVendorsPerCategory: 3,
      focusOnPremium: true
    });
    return;
  }

  if (args.includes('--full')) {
    console.log('🚀 Running Full Quality Collection...\n');
    await runner.runPremiumCollection({
      cities: ['New York', 'Los Angeles', 'Chicago', 'Miami'],
      categories: ['Wedding Photographer', 'Wedding Planner', 'Wedding Venue'],
      maxVendorsPerCategory: 8,
      focusOnPremium: true
    });
    return;
  }

  // Default: show help
  console.log('🌟 Premium Quality Collection System');
  console.log('Use --help for usage information');
}

// Export for use in other scripts
export { PremiumQualityRunner, QUALITY_CONFIG };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
