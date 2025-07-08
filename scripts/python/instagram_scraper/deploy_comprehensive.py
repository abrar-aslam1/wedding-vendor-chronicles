#!/usr/bin/env python3
"""
Deployment Script for Comprehensive Wedding Vendor Collection
Easy-to-use interface for deploying the enhanced Instagram scraping system
"""

import argparse
import asyncio
from comprehensive_collection_plan import ComprehensiveWeddingVendorCollector

def show_plan():
    """Display the comprehensive collection plan"""
    
    print("""
🎯 COMPREHENSIVE WEDDING VENDOR COLLECTION PLAN
====================================================

📋 ALL 12 WEDDING VENDOR CATEGORIES:
   1. Wedding Planners       7. DJs & Bands
   2. Photographers          8. Cake Designers  
   3. Videographers          9. Bridal Shops
   4. Florists              10. Makeup Artists ✅
   5. Caterers              11. Hair Stylists ✅
   6. Venues                12. Wedding Decorators

🌍 GEOGRAPHIC COVERAGE:
   • Top 20 Wedding Markets (NYC, LA, Chicago, Miami, etc.)
   • Target: 20 high-quality vendors per city per category
   • Total Target: 4,800 premium wedding vendors

📊 EXPECTED RESULTS:
   • Quality Score: 6+ average (currently 7-9)
   • Business Accounts: 60%+
   • Contact Information: 40%+ (email/phone)
   • Geographic Coverage: 100% major wedding markets

💰 COST ESTIMATE:
   • ~$50/month for comprehensive collection
   • ~$0.01 per high-quality vendor
   • ROI: Premium vendor database worth $50,000+

⏱️  TIMELINE:
   • Phase 1 (Complete): Foundation & 2 categories
   • Phase 2 (This Week): Enhanced system + 3 more categories  
   • Phase 3 (Next Week): All 12 categories
   • Phase 4 (Week 3): Full automation & optimization
""")

async def run_deployment(mode: str, categories: list = None, max_cities: int = 10):
    """Run deployment based on selected mode"""
    
    collector = ComprehensiveWeddingVendorCollector()
    
    if mode == "test":
        print("🧪 RUNNING TEST DEPLOYMENT")
        print("Testing 3 categories × 3 cities = ~30 vendors")
        
        from test_enhanced_system import test_enhanced_collection
        results = await test_enhanced_collection()
        
        return results
        
    elif mode == "category":
        if not categories:
            print("❌ Error: No categories specified for category mode")
            return
            
        print(f"🎯 RUNNING CATEGORY DEPLOYMENT")
        print(f"Categories: {', '.join(categories)}")
        print(f"Cities per category: {max_cities}")
        
        results = {}
        for category in categories:
            count = await collector.run_comprehensive_category_collection(category, max_cities)
            results[category] = count
            
        return results
        
    elif mode == "full":
        print("🚀 RUNNING FULL DEPLOYMENT")
        print("All 12 categories × 20 cities = ~4,800 vendors")
        print("⚠️  This will take 6-8 hours to complete")
        
        confirm = input("Continue with full deployment? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Deployment cancelled")
            return
            
        results = await collector.run_full_comprehensive_collection(max_cities)
        return results
        
    elif mode == "priority":
        print("⭐ RUNNING PRIORITY DEPLOYMENT")
        print("High-priority categories: photographers, venues, florists")
        
        priority_categories = ['photographers', 'venues', 'florists']
        results = {}
        
        for category in priority_categories:
            count = await collector.run_comprehensive_category_collection(category, max_cities)
            results[category] = count
            
        return results

def main():
    """Main deployment interface"""
    
    parser = argparse.ArgumentParser(description="Deploy Comprehensive Wedding Vendor Collection")
    parser.add_argument('mode', choices=['plan', 'test', 'category', 'priority', 'full'], 
                       help='Deployment mode')
    parser.add_argument('--categories', nargs='+', 
                       choices=ComprehensiveWeddingVendorCollector.ALL_CATEGORIES,
                       help='Specific categories to collect (for category mode)')
    parser.add_argument('--cities', type=int, default=10, 
                       help='Max cities per category (default: 10)')
    
    args = parser.parse_args()
    
    print("🎭 COMPREHENSIVE WEDDING VENDOR COLLECTION SYSTEM")
    print("=" * 60)
    
    if args.mode == 'plan':
        show_plan()
        return
    
    # Run the selected deployment
    print(f"🚀 Starting {args.mode} deployment...")
    results = asyncio.run(run_deployment(args.mode, args.categories, args.cities))
    
    if results:
        print(f"\n🎉 DEPLOYMENT COMPLETE!")
        print("=" * 40)
        
        total = sum(results.values()) if isinstance(results, dict) else 0
        
        if isinstance(results, dict):
            for category, count in results.items():
                print(f"📊 {category}: {count} vendors")
        
        print(f"🏆 Total vendors collected: {total}")
        
        # Show next steps
        print(f"\n📋 NEXT STEPS:")
        if args.mode == 'test':
            print("   1. Review test results above")
            print("   2. If successful, run: python deploy_comprehensive.py priority")
            print("   3. Then scale to full deployment")
        elif args.mode == 'priority':
            print("   1. Review priority category results")
            print("   2. Run remaining categories: python deploy_comprehensive.py full")
        elif args.mode == 'category':
            print("   1. Review category-specific results")
            print("   2. Add more categories or run full deployment")
        elif args.mode == 'full':
            print("   1. Collection complete! Check your database")
            print("   2. Set up monitoring and maintenance")
            print("   3. Integrate with web app search")

if __name__ == "__main__":
    main()