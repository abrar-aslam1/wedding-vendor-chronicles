#!/usr/bin/env python3
"""
Direct test script for Dallas local vendor collection
Non-interactive version for testing
"""

import asyncio
import logging
import sys
from datetime import datetime

# Import the local vendor collector
from local_vendor_collector import LocalVendorCollector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'dallas_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

async def test_dallas_collection():
    """Run Dallas collection test"""
    
    print("🏪 DALLAS LOCAL VENDOR COLLECTION TEST")
    print("=" * 60)
    print("Testing local vendor collection for Dallas, TX")
    print("Categories: All 12 wedding vendor categories")
    print("Target: 15 local vendors per category")
    print("=" * 60)
    
    collector = LocalVendorCollector()
    
    # All wedding vendor categories
    categories = [
        "photographers",
        "makeup-artists",
        "hair-stylists",
        "wedding-planners",
        "florists",
        "videographers",
        "caterers",
        "venues",
        "djs-and-bands",
        "cake-designers",
        "bridal-shops",
        "wedding-decorators"
    ]
    
    total_collected = 0
    results = {}
    
    print(f"\n🌆 Starting collection for Dallas, TX")
    print(f"📋 Categories to collect: {len(categories)}")
    print("-" * 40)
    
    for idx, category in enumerate(categories):
        print(f"\n📸 Category {idx + 1}/{len(categories)}: {category}")
        
        try:
            # Collect local vendors
            collected = await collector.collect_local_vendors_for_city(
                "Dallas", "TX", category, target_count=15
            )
            
            results[category] = collected
            total_collected += collected
            
            print(f"   ✅ Collected: {collected} vendors")
            
            # Rate limiting between categories
            if idx < len(categories) - 1:
                print(f"   ⏳ Waiting 60 seconds before next category...")
                await asyncio.sleep(60)
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            logging.exception(f"Error collecting {category}")
            results[category] = 0
            continue
    
    # Summary
    print(f"\n🎉 DALLAS COLLECTION COMPLETE!")
    print("=" * 60)
    print(f"📊 RESULTS:")
    print(f"   Total vendors collected: {total_collected}")
    print(f"\n📋 BREAKDOWN BY CATEGORY:")
    
    for category, count in results.items():
        print(f"   {category}: {count} vendors")
    
    # Save results
    import json
    results_file = f"dallas_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "city": "Dallas, TX",
            "timestamp": datetime.now().isoformat(),
            "total_collected": total_collected,
            "categories": results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {results_file}")
    
    return total_collected

if __name__ == "__main__":
    # Run the test
    asyncio.run(test_dallas_collection())