#!/usr/bin/env python3
"""
City-Category Instagram Vendor Collector
Systematically collects 20 vendors per city per category
"""

from comprehensive_collection_plan import ComprehensiveWeddingVendorCollector
import asyncio
from typing import Dict, List, Tuple
import json
from datetime import datetime

class CityByCategoryCollector(ComprehensiveWeddingVendorCollector):
    """Collector that ensures 20 vendors per city per category"""
    
    # Top wedding cities from your web app
    WEDDING_CITIES = [
        # Tier 1 Major Markets
        ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Miami", "FL"),
        ("San Francisco", "CA"), ("Boston", "MA"), ("Seattle", "WA"), ("Austin", "TX"),
        ("Nashville", "TN"), ("Denver", "CO"), ("Atlanta", "GA"), ("Dallas", "TX"),
        ("Houston", "TX"), ("San Diego", "CA"), ("Philadelphia", "PA"), ("Phoenix", "AZ"),
        
        # Tier 2 Wedding Destinations  
        ("Charleston", "SC"), ("Savannah", "GA"), ("Portland", "OR"), ("Las Vegas", "NV"),
        ("Orlando", "FL"), ("Tampa", "FL"), ("Charlotte", "NC"), ("Raleigh", "NC"),
        ("Fort Worth", "TX"), ("San Antonio", "TX"), ("Jacksonville", "FL"), ("Columbus", "OH"),
        ("Indianapolis", "IN"), ("Milwaukee", "WI"), ("Kansas City", "MO"), ("St. Louis", "MO"),
        ("Minneapolis", "MN"), ("Richmond", "VA"), ("Baltimore", "MD"), ("Louisville", "KY"),
        
        # Tier 3 Secondary Markets
        ("Sacramento", "CA"), ("San Jose", "CA"), ("Fresno", "CA"), ("Oakland", "CA"),
        ("Fort Lauderdale", "FL"), ("Virginia Beach", "VA"), ("Memphis", "TN"), 
        ("Oklahoma City", "OK"), ("Albuquerque", "NM"), ("Tucson", "AZ")
    ]
    
    TARGET_VENDORS_PER_CITY_CATEGORY = 20
    
    def get_current_city_category_count(self, city: str, state: str, category: str) -> int:
        """Get current number of vendors for a specific city/category combination"""
        try:
            result = self.db_manager.client.table('instagram_vendors')\
                .select('*', count='exact')\
                .eq('category', category)\
                .eq('city', city)\
                .eq('state', state)\
                .execute()
            
            return result.count
        except Exception as e:
            logging.error(f"Error checking count for {city}, {state} - {category}: {e}")
            return 0
    
    def get_cities_needing_vendors(self, category: str) -> List[Tuple[str, str, int]]:
        """Get cities that need more vendors for a specific category"""
        cities_needing_vendors = []
        
        for city, state in self.WEDDING_CITIES:
            current_count = self.get_current_city_category_count(city, state, category)
            needed = self.TARGET_VENDORS_PER_CITY_CATEGORY - current_count
            
            if needed > 0:
                cities_needing_vendors.append((city, state, needed))
        
        # Sort by most needed first
        cities_needing_vendors.sort(key=lambda x: x[2], reverse=True)
        return cities_needing_vendors
    
    async def collect_for_city_category(self, city: str, state: str, category: str, target_count: int = 20):
        """Collect vendors for a specific city/category combination"""
        
        current_count = self.get_current_city_category_count(city, state, category)
        needed = target_count - current_count
        
        if needed <= 0:
            logging.info(f"✅ {city}, {state} - {category}: Already has {current_count} vendors (target: {target_count})")
            return 0
        
        logging.info(f"🎯 {city}, {state} - {category}: Need {needed} more vendors (current: {current_count})")
        
        # Strategy 1: Hashtag-based collection
        collected_hashtag = await self.try_hashtag_collection(city, state, category, needed)
        
        current_after_hashtag = self.get_current_city_category_count(city, state, category)
        still_needed = target_count - current_after_hashtag
        
        # Strategy 2: Profile-based collection if still need more
        if still_needed > 0:
            collected_profile = await self.try_profile_collection(city, state, category, still_needed)
        else:
            collected_profile = 0
        
        total_collected = collected_hashtag + collected_profile
        final_count = self.get_current_city_category_count(city, state, category)
        
        logging.info(f"🏆 {city}, {state} - {category}: Collected {total_collected} vendors (total now: {final_count})")
        return total_collected
    
    async def try_hashtag_collection(self, city: str, state: str, category: str, needed: int):
        """Try hashtag-based collection for city/category"""
        try:
            hashtags = self.get_enhanced_hashtags_for_category(city, state, category)
            
            input_config = {
                "addParentData": False,
                "directUrls": [],
                "enhanceUserSearchWithFacebookPage": False,
                "isUserReelFeedURL": False,
                "isUserTaggedFeedURL": False,
                "resultsLimit": min(50, needed * 3),  # Get 3x what we need for filtering
                "resultsType": "details",
                "searchLimit": 30,
                "searchType": "hashtag",
                "hashtags": hashtags,
                "searchQueries": [],
                "addMetadata": True,
                "proxyConfiguration": {
                    "useApifyProxy": True,
                    "apifyProxyGroups": ["RESIDENTIAL"]
                }
            }
            
            # Run hashtag collection
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=180)
            
            dataset_id = run_data['defaultDatasetId']
            raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
            
            if raw_profiles and 'error' not in str(raw_profiles[0]):
                collected = self.process_enhanced_profiles(
                    raw_profiles, category, f"{city}_{state}", max_results=needed
                )
                logging.info(f"   📊 Hashtag collection: {collected} vendors from {city}")
                return collected
            else:
                logging.warning(f"   ⚠️  Hashtag collection failed for {city} - {category}")
                return 0
                
        except Exception as e:
            logging.error(f"   ❌ Hashtag collection error for {city}: {e}")
            return 0
    
    async def try_profile_collection(self, city: str, state: str, category: str, needed: int):
        """Try profile-based collection as fallback"""
        try:
            # Use relevant seed profiles for this category
            if category in self.SEED_PROFILES:
                seed_profiles = self.SEED_PROFILES[category][:5]  # Use top 5 seeds
                
                collected = 0
                for profile in seed_profiles:
                    if collected >= needed:
                        break
                    
                    # Try to find related profiles from this seed
                    similar_count = await self.discover_city_specific_profiles(profile, city, state, category)
                    collected += similar_count
                
                logging.info(f"   📊 Profile collection: {collected} vendors from seeds")
                return collected
            else:
                logging.warning(f"   ⚠️  No seed profiles for {category}")
                return 0
                
        except Exception as e:
            logging.error(f"   ❌ Profile collection error: {e}")
            return 0
    
    async def discover_city_specific_profiles(self, seed_profile: str, city: str, state: str, category: str):
        """Discover profiles related to a seed profile in a specific city"""
        try:
            # Enhanced search looking for city mentions in profiles
            input_config = {
                "directUrls": [f"https://www.instagram.com/{seed_profile}/"],
                "resultsType": "details",
                "addParentData": True,
                "resultsLimit": 1,
                "proxyConfiguration": {"useApifyProxy": True}
            }
            
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=120)
            
            dataset_id = run_data['defaultDatasetId']
            results = self.apify_manager.get_dataset_items(dataset_id)
            
            # For now, this is a placeholder for network discovery
            # In a real implementation, we'd analyze followers/following
            return 0
            
        except Exception as e:
            logging.error(f"Error discovering from {seed_profile}: {e}")
            return 0
    
    async def run_systematic_collection(self, categories: List[str] = None, max_cities: int = 20):
        """Run systematic collection to ensure 20 vendors per city per category"""
        
        if not categories:
            categories = self.ALL_CATEGORIES
        
        cities_to_process = self.WEDDING_CITIES[:max_cities]
        
        logging.info(f"🎯 SYSTEMATIC CITY-BY-CATEGORY COLLECTION")
        logging.info(f"📋 Categories: {len(categories)}")
        logging.info(f"🌍 Cities: {len(cities_to_process)}")
        logging.info(f"🎪 Target: {self.TARGET_VENDORS_PER_CITY_CATEGORY} vendors per city per category")
        logging.info(f"📈 Total Target: {len(categories) * len(cities_to_process) * self.TARGET_VENDORS_PER_CITY_CATEGORY:,} vendors")
        
        overall_stats = {
            'categories_processed': 0,
            'cities_processed': 0,
            'vendors_collected': 0,
            'city_category_combinations': 0
        }
        
        for cat_idx, category in enumerate(categories):
            logging.info(f"\n🎭 CATEGORY {cat_idx + 1}/{len(categories)}: {category.upper()}")
            logging.info("=" * 60)
            
            # Get cities that need vendors for this category
            cities_needing_vendors = self.get_cities_needing_vendors(category)
            
            if not cities_needing_vendors:
                logging.info(f"✅ {category}: All cities already have 20+ vendors!")
                continue
            
            logging.info(f"📍 Cities needing {category} vendors: {len(cities_needing_vendors)}")
            
            category_total = 0
            
            # Process only cities that need vendors
            for city, state, needed in cities_needing_vendors[:max_cities]:
                try:
                    logging.info(f"\n📍 Processing {city}, {state} ({needed} needed)")
                    
                    collected = await self.collect_for_city_category(
                        city, state, category, self.TARGET_VENDORS_PER_CITY_CATEGORY
                    )
                    
                    category_total += collected
                    overall_stats['vendors_collected'] += collected
                    overall_stats['city_category_combinations'] += 1
                    
                    # Rate limiting between cities
                    await asyncio.sleep(90)  # 1.5 minutes between cities
                    
                except Exception as e:
                    logging.error(f"❌ Error processing {city}, {state}: {e}")
                    continue
            
            logging.info(f"🏆 {category}: {category_total} vendors collected across all cities")
            overall_stats['categories_processed'] += 1
            
            # Break between categories
            if cat_idx < len(categories) - 1:
                logging.info(f"⏳ Waiting 5 minutes before next category...")
                await asyncio.sleep(300)
        
        # Final summary
        logging.info(f"\n🎉 SYSTEMATIC COLLECTION COMPLETE!")
        logging.info("=" * 60)
        logging.info(f"📊 RESULTS:")
        logging.info(f"   Categories processed: {overall_stats['categories_processed']}")
        logging.info(f"   City-category combinations: {overall_stats['city_category_combinations']}")
        logging.info(f"   Total vendors collected: {overall_stats['vendors_collected']}")
        
        # Show progress toward 20-per-city goal
        await self.generate_coverage_report(categories, cities_to_process)
        
        return overall_stats
    
    async def generate_coverage_report(self, categories: List[str], cities: List[Tuple[str, str]]):
        """Generate a coverage report showing progress toward 20 vendors per city per category"""
        
        logging.info(f"\n📊 COVERAGE REPORT")
        logging.info("=" * 60)
        
        total_combinations = len(categories) * len(cities)
        completed_combinations = 0
        
        for category in categories:
            logging.info(f"\n🎭 {category.upper()}:")
            
            category_completed = 0
            for city, state in cities[:10]:  # Show top 10 cities
                count = self.get_current_city_category_count(city, state, category)
                status = "✅" if count >= 20 else f"📝 {count}/20"
                
                if count >= 20:
                    category_completed += 1
                
                logging.info(f"   {city}, {state}: {status}")
            
            completion_rate = (category_completed / min(len(cities), 10)) * 100
            logging.info(f"   Category completion: {completion_rate:.1f}%")
            
            if category_completed >= min(len(cities), 10):
                completed_combinations += 1
        
        overall_completion = (completed_combinations / len(categories)) * 100
        logging.info(f"\n🏆 OVERALL COMPLETION: {overall_completion:.1f}%")

# Command line interface
async def run_city_category_collection():
    """Run the city-by-category collection system"""
    
    print("🏙️  CITY-BY-CATEGORY COLLECTION SYSTEM")
    print("=" * 60)
    print("Goal: 20 vendors per city per category")
    print("Strategy: Systematic city-by-city collection")
    
    collector = CityByCategoryCollector()
    
    # Start with high-priority categories
    priority_categories = ['photographers', 'makeup-artists', 'hair-stylists', 'wedding-planners', 'florists']
    
    results = await collector.run_systematic_collection(
        categories=priority_categories,
        max_cities=20
    )
    
    print(f"\n🎉 Collection Complete!")
    print(f"Total vendors collected: {results['vendors_collected']}")

if __name__ == "__main__":
    asyncio.run(run_city_category_collection())