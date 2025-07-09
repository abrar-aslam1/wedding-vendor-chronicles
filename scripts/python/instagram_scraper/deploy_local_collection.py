#!/usr/bin/env python3
"""
Deployment script for Local Instagram Vendor Collection
Systematically collects local vendors across cities and categories
"""

import asyncio
import logging
import sys
from datetime import datetime
from typing import List, Tuple
import json
import os

# Import the local vendor collector
from local_vendor_collector import LocalVendorCollector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'local_collection_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class LocalCollectionDeployment:
    """Manages deployment of local vendor collection"""
    
    # Collection configurations
    COLLECTION_CONFIGS = {
        "test": {
            "cities": [("Dallas", "TX")],
            "categories": ["photographers", "makeup-artists"],
            "vendors_per_city": 5,
            "description": "Test run with Dallas photographers and makeup artists"
        },
        "dallas_all": {
            "cities": [("Dallas", "TX")],
            "categories": [
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
            ],
            "vendors_per_city": 15,
            "description": "Complete Dallas collection - all 12 vendor categories"
        },
        "texas_priority": {
            "cities": [
                ("Dallas", "TX"),
                ("Austin", "TX"),
                ("Houston", "TX"),
                ("San Antonio", "TX"),
                ("Fort Worth", "TX")
            ],
            "categories": [
                "photographers",
                "makeup-artists",
                "hair-stylists",
                "wedding-planners",
                "florists"
            ],
            "vendors_per_city": 15,
            "description": "Priority Texas cities with top 5 vendor categories"
        },
        "texas_full": {
            "cities": [
                ("Dallas", "TX"),
                ("Austin", "TX"),
                ("Houston", "TX"),
                ("San Antonio", "TX"),
                ("Fort Worth", "TX"),
                ("Plano", "TX"),
                ("Arlington", "TX"),
                ("El Paso", "TX"),
                ("Corpus Christi", "TX"),
                ("Lubbock", "TX")
            ],
            "categories": [
                "photographers",
                "makeup-artists", 
                "hair-stylists",
                "wedding-planners",
                "florists",
                "videographers",
                "caterers",
                "venues"
            ],
            "vendors_per_city": 10,
            "description": "Full Texas deployment with 10 cities and 8 categories"
        },
        "national_tier1": {
            "cities": [
                ("New York", "NY"),
                ("Los Angeles", "CA"),
                ("Chicago", "IL"),
                ("Miami", "FL"),
                ("Seattle", "WA"),
                ("Boston", "MA"),
                ("Atlanta", "GA"),
                ("Denver", "CO")
            ],
            "categories": [
                "photographers",
                "makeup-artists",
                "hair-stylists",
                "wedding-planners",
                "florists"
            ],
            "vendors_per_city": 12,
            "description": "Tier 1 national markets with priority categories"
        }
    }
    
    def __init__(self):
        self.collector = LocalVendorCollector()
        self.start_time = datetime.now()
        self.results = {}
    
    async def run_collection(self, config_name: str = "test"):
        """Run collection based on selected configuration"""
        
        if config_name not in self.COLLECTION_CONFIGS:
            logging.error(f"Invalid configuration: {config_name}")
            logging.info(f"Available configs: {list(self.COLLECTION_CONFIGS.keys())}")
            return
        
        config = self.COLLECTION_CONFIGS[config_name]
        
        logging.info(f"🚀 STARTING LOCAL VENDOR COLLECTION")
        logging.info(f"📋 Configuration: {config_name}")
        logging.info(f"📝 Description: {config['description']}")
        logging.info(f"🌍 Cities: {len(config['cities'])}")
        logging.info(f"📦 Categories: {len(config['categories'])}")
        logging.info(f"🎯 Target per city/category: {config['vendors_per_city']}")
        logging.info("=" * 60)
        
        total_collected = 0
        city_results = {}
        
        for city_idx, (city, state) in enumerate(config['cities']):
            city_start = datetime.now()
            city_key = f"{city}, {state}"
            city_results[city_key] = {}
            
            logging.info(f"\n🌆 CITY {city_idx + 1}/{len(config['cities'])}: {city}, {state}")
            logging.info("-" * 40)
            
            city_total = 0
            
            for cat_idx, category in enumerate(config['categories']):
                try:
                    logging.info(f"📸 Collecting {category} ({cat_idx + 1}/{len(config['categories'])})")
                    
                    collected = await self.collector.collect_local_vendors_for_city(
                        city, state, category, 
                        target_count=config['vendors_per_city']
                    )
                    
                    city_results[city_key][category] = collected
                    city_total += collected
                    total_collected += collected
                    
                    logging.info(f"   ✓ Collected: {collected} vendors")
                    
                    # Rate limiting between categories
                    if cat_idx < len(config['categories']) - 1:
                        await asyncio.sleep(60)  # 1 minute between categories
                        
                except Exception as e:
                    logging.error(f"   ✗ Error: {str(e)}")
                    city_results[city_key][category] = 0
                    continue
            
            # City summary
            city_duration = (datetime.now() - city_start).total_seconds() / 60
            logging.info(f"🏆 {city}, {state} Complete:")
            logging.info(f"   Total vendors: {city_total}")
            logging.info(f"   Duration: {city_duration:.1f} minutes")
            
            # Save progress after each city
            self.save_progress(config_name, city_results, total_collected)
            
            # Longer break between cities
            if city_idx < len(config['cities']) - 1:
                logging.info(f"⏳ Waiting 2 minutes before next city...")
                await asyncio.sleep(120)
        
        # Final summary
        total_duration = (datetime.now() - self.start_time).total_seconds() / 60
        
        logging.info(f"\n🎉 COLLECTION COMPLETE!")
        logging.info("=" * 60)
        logging.info(f"📊 FINAL RESULTS:")
        logging.info(f"   Configuration: {config_name}")
        logging.info(f"   Total vendors collected: {total_collected}")
        logging.info(f"   Total duration: {total_duration:.1f} minutes")
        logging.info(f"   Average per city: {total_collected / len(config['cities']):.1f}")
        
        # Detailed breakdown
        logging.info(f"\n📋 CITY BREAKDOWN:")
        for city_key, categories in city_results.items():
            city_total = sum(categories.values())
            logging.info(f"\n{city_key}:")
            for category, count in categories.items():
                logging.info(f"   {category}: {count}")
            logging.info(f"   Total: {city_total}")
        
        # Save final results
        self.save_final_results(config_name, city_results, total_collected)
        
        return total_collected
    
    def save_progress(self, config_name: str, city_results: dict, total_collected: int):
        """Save progress to JSON file"""
        progress_data = {
            "config": config_name,
            "timestamp": datetime.now().isoformat(),
            "total_collected": total_collected,
            "city_results": city_results
        }
        
        filename = f"local_collection_progress_{config_name}.json"
        with open(filename, 'w') as f:
            json.dump(progress_data, f, indent=2)
        
        logging.info(f"   💾 Progress saved to {filename}")
    
    def save_final_results(self, config_name: str, city_results: dict, total_collected: int):
        """Save final results with summary"""
        results_data = {
            "config": config_name,
            "start_time": self.start_time.isoformat(),
            "end_time": datetime.now().isoformat(),
            "duration_minutes": (datetime.now() - self.start_time).total_seconds() / 60,
            "total_collected": total_collected,
            "city_results": city_results,
            "summary": {
                "cities_processed": len(city_results),
                "average_per_city": total_collected / len(city_results) if city_results else 0,
                "categories": list(set(cat for city in city_results.values() for cat in city.keys()))
            }
        }
        
        filename = f"local_collection_final_{config_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        logging.info(f"\n💾 Final results saved to {filename}")

async def main():
    """Main deployment function"""
    
    print("🏪 LOCAL VENDOR COLLECTION DEPLOYMENT")
    print("=" * 60)
    print("\nAvailable configurations:")
    
    deployment = LocalCollectionDeployment()
    
    for config_name, config in deployment.COLLECTION_CONFIGS.items():
        print(f"\n{config_name}:")
        print(f"  - {config['description']}")
        print(f"  - Cities: {len(config['cities'])}")
        print(f"  - Categories: {len(config['categories'])}")
        print(f"  - Vendors per city/category: {config['vendors_per_city']}")
    
    print("\n" + "-" * 60)
    
    # Get user selection
    if len(sys.argv) > 1:
        selected_config = sys.argv[1]
    else:
        selected_config = input("\nSelect configuration (default: test): ").strip() or "test"
    
    if selected_config not in deployment.COLLECTION_CONFIGS:
        print(f"❌ Invalid configuration: {selected_config}")
        return
    
    print(f"\n✅ Selected: {selected_config}")
    confirm = input("Start collection? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("Collection cancelled.")
        return
    
    # Run the collection
    try:
        total_collected = await deployment.run_collection(selected_config)
        print(f"\n✅ Successfully collected {total_collected} local vendors!")
    except Exception as e:
        print(f"\n❌ Collection failed: {str(e)}")
        logging.exception("Collection failed with exception:")

if __name__ == "__main__":
    asyncio.run(main())