#!/usr/bin/env python3
"""
Parallel Mass Collector - Leverages 30 Apify Proxies for Maximum Speed
Runs multiple collection streams simultaneously
"""

from optimized_mass_collector import OptimizedMassCollector
import asyncio
from typing import Dict, List
import logging
from datetime import datetime

class ParallelMassCollector(OptimizedMassCollector):
    """Parallel collector that leverages multiple proxies simultaneously"""
    
    def __init__(self, max_concurrent_runs: int = 10):
        super().__init__()
        self.max_concurrent_runs = max_concurrent_runs
        self.semaphore = asyncio.Semaphore(max_concurrent_runs)
    
    async def run_parallel_collection(self, target_vendors_per_category: int = 100):
        """Run parallel collection across multiple categories and profiles"""
        
        logging.info(f"🚀 PARALLEL MASS COLLECTION STARTING")
        logging.info(f"🎯 Target: {target_vendors_per_category} vendors per category")
        logging.info(f"⚡ Concurrent runs: {self.max_concurrent_runs}")
        logging.info(f"🔗 Proxy pool: 30 residential proxies")
        
        # Create collection tasks for all categories
        tasks = []
        
        for category in self.ALL_CATEGORIES:
            # Check if category needs vendors
            current_count = self.get_category_count(category)
            needed = max(0, target_vendors_per_category - current_count)
            
            if needed <= 0:
                logging.info(f"✅ {category}: Already has {current_count} vendors")
                continue
            
            # Get seed profiles for this category
            seed_profiles = self.OPTIMIZED_SEED_PROFILES.get(category, [])
            
            if not seed_profiles:
                logging.warning(f"⚠️  No seed profiles for {category}")
                continue
            
            # Create parallel tasks for each seed profile
            for i, profile in enumerate(seed_profiles):
                if len(tasks) >= needed:  # Don't create more tasks than needed vendors
                    break
                
                task = self.collect_profile_with_semaphore(
                    profile, category, needed, f"batch_{i}"
                )
                tasks.append(task)
        
        logging.info(f"📊 Created {len(tasks)} parallel collection tasks")
        
        # Run all tasks in parallel with concurrency control
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        total_collected = 0
        successful_runs = 0
        failed_runs = 0
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logging.error(f"Task {i} failed: {result}")
                failed_runs += 1
            else:
                total_collected += result
                successful_runs += 1
        
        # Final summary
        logging.info(f"\n🎉 PARALLEL COLLECTION COMPLETE!")
        logging.info(f"📊 RESULTS:")
        logging.info(f"   ✅ Successful runs: {successful_runs}")
        logging.info(f"   ❌ Failed runs: {failed_runs}")
        logging.info(f"   🏆 Total vendors collected: {total_collected}")
        logging.info(f"   ⚡ Efficiency: {successful_runs}/{len(tasks)} ({successful_runs/len(tasks)*100:.1f}%)")
        
        # Category breakdown
        logging.info(f"\n📋 FINAL CATEGORY BREAKDOWN:")
        for category in self.ALL_CATEGORIES:
            final_count = self.get_category_count(category)
            status = "✅" if final_count >= target_vendors_per_category else "📝"
            logging.info(f"   {status} {category:20} {final_count:3} vendors")
        
        return total_collected
    
    async def collect_profile_with_semaphore(self, profile_handle: str, category: str, 
                                           max_needed: int, batch_id: str) -> int:
        """Collect from profile with semaphore control for concurrency"""
        
        async with self.semaphore:
            try:
                logging.info(f"🔍 [{batch_id}] Processing @{profile_handle} for {category}")
                
                # Enhanced input config with proxy optimization
                input_config = {
                    "directUrls": [f"https://www.instagram.com/{profile_handle}/"],
                    "resultsType": "details",
                    "resultsLimit": 1,
                    "addParentData": True,
                    "addMetadata": True,
                    "enhanceUserSearchWithFacebookPage": True,
                    "proxyConfiguration": {
                        "useApifyProxy": True,
                        "apifyProxyGroups": ["RESIDENTIAL"],
                        "apifyProxyCountry": "US"  # Focus on US proxies for better success
                    }
                }
                
                # Run collection
                run_id = await self.apify_manager.run_instagram_scraper(input_config)
                run_data = self.apify_manager.wait_for_completion(run_id, timeout=180)
                
                dataset_id = run_data['defaultDatasetId']
                raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
                
                if not raw_profiles or 'error' in str(raw_profiles[0]):
                    logging.warning(f"⚠️  [{batch_id}] No data for @{profile_handle}")
                    return 0
                
                # Process the profile data
                processed = self.process_enhanced_profiles(
                    raw_profiles, category, f"parallel_{batch_id}", max_results=5
                )
                
                logging.info(f"✅ [{batch_id}] Collected {processed} vendors from @{profile_handle}")
                return processed
                
            except Exception as e:
                logging.error(f"❌ [{batch_id}] Error collecting from @{profile_handle}: {e}")
                return 0

# Quick deployment script
async def run_parallel_collection():
    """Run the parallel mass collection with 30 proxies"""
    
    print("⚡ PARALLEL MASS COLLECTION WITH 30 PROXIES")
    print("=" * 60)
    print("Strategy: Maximum concurrency with proxy pool")
    print("Target: 100 vendors per category with 10x speed boost")
    
    collector = ParallelMassCollector(max_concurrent_runs=10)
    
    total_collected = await collector.run_parallel_collection(target_vendors_per_category=100)
    
    print(f"\n🎉 Parallel Collection Complete!")
    print(f"Total collected: {total_collected} vendors")

if __name__ == "__main__":
    asyncio.run(run_parallel_collection())