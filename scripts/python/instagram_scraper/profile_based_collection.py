#!/usr/bin/env python3
"""
Profile-based Instagram collection using known vendor profiles
This approach works better than hashtag scraping due to Instagram restrictions
"""

from enterprise_collection import *
import asyncio

class ProfileBasedCollector(EnterpriseCollectionSystem):
    """Enhanced collector that uses known profile lists instead of hashtag discovery"""
    
    # Curated lists of known wedding vendors on Instagram
    SEED_PROFILES = {
        'makeup-artists': [
            'patmcgrathreal',      # Famous makeup artist (verified working)
            'charlottechampagne',   # Bridal makeup specialist
            'makeupbytammy',       # Wedding makeup
            'bridalmakeupbyemily', # Bridal specialist
            'makeupbyariel',       # Wedding MUA
            'thebridalmakeupartist', # Bridal focused
            'makeupbyjenny',       # Wedding specialist
            'glamdollbeauty',      # Bridal glam
            'bridalmakeupstudio',  # Studio based
            'weddingmakeupla'      # LA based
        ],
        'hair-stylists': [
            'bridalhairbyjenny',   # Bridal hair specialist
            'weddinghairstylist',  # Wedding focused
            'bridalhairandmakeup', # Combo services
            'hairbytammy',         # Wedding hair
            'bridalhairdesign',    # Bridal specialist
            'weddinghairstudio',   # Studio based
            'bridalhairstylist',   # Specialist
            'hairandmakeupteam',   # Team services
            'weddingdaybeauty',    # Wedding day focus
            'bridalhairartist'     # Hair artist
        ]
    }
    
    async def run_profile_based_collection(self, category: str, profile_list: List[str] = None):
        """Collect data from known Instagram profiles"""
        
        if profile_list is None:
            profile_list = self.SEED_PROFILES.get(category, [])
        
        if not profile_list:
            logging.error(f"No profile list provided for category: {category}")
            return 0
        
        logging.info(f"Starting profile-based collection for {category} with {len(profile_list)} profiles")
        
        processed_count = 0
        
        for username in profile_list:
            try:
                logging.info(f"Processing profile: @{username}")
                
                # Create direct URL for the profile
                profile_url = f"https://www.instagram.com/{username}/"
                
                input_config = {
                    "directUrls": [profile_url],
                    "resultsType": "details",
                    "resultsLimit": 1,
                    "addParentData": False,
                    "proxyConfiguration": {
                        "useApifyProxy": True,
                        "apifyProxyGroups": ["RESIDENTIAL"]
                    }
                }
                
                # Start scraper run
                run_id = await self.apify_manager.run_instagram_scraper(input_config)
                
                # Record the run
                self.db_manager.record_scraping_run({
                    'run_id': run_id,
                    'category': category,
                    'location': f"profile_@{username}",
                    'status': 'running',
                    'started_at': datetime.now().isoformat()
                })
                
                # Wait for completion
                run_data = self.apify_manager.wait_for_completion(run_id, timeout=120)
                
                # Process results
                dataset_id = run_data['defaultDatasetId']
                raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
                
                if raw_profiles and 'error' not in raw_profiles[0]:
                    profile_processed = self.process_raw_profiles(raw_profiles, category, f"profile_seed_{username}")
                    processed_count += profile_processed
                    
                    if profile_processed > 0:
                        logging.info(f"✅ Successfully processed @{username}")
                    else:
                        logging.info(f"⚠️  @{username} did not meet quality criteria")
                else:
                    logging.warning(f"❌ Failed to get data for @{username}: {raw_profiles[0] if raw_profiles else 'No data'}")
                
                # Rate limiting - wait between profiles
                await asyncio.sleep(10)  # 10 seconds between profiles
                
            except Exception as e:
                logging.error(f"Error processing @{username}: {e}")
                continue
        
        logging.info(f"Profile-based collection completed: {processed_count} profiles processed from {len(profile_list)} attempted")
        return processed_count
    
    async def discover_similar_profiles(self, seed_username: str, category: str):
        """Discover similar profiles by analyzing followers/following of seed profiles"""
        
        logging.info(f"Discovering similar profiles from @{seed_username}")
        
        try:
            # Get detailed profile data including followers sample
            input_config = {
                "directUrls": [f"https://www.instagram.com/{seed_username}/"],
                "resultsType": "details", 
                "addParentData": True,  # This might include follower samples
                "resultsLimit": 1,
                "proxyConfiguration": {
                    "useApifyProxy": True,
                    "apifyProxyGroups": ["RESIDENTIAL"]
                }
            }
            
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id)
            
            dataset_id = run_data['defaultDatasetId']
            results = self.apify_manager.get_dataset_items(dataset_id)
            
            if results and 'error' not in results[0]:
                # Look for related profiles in the data
                profile_data = results[0]
                
                # Extract any mentioned profiles from bio or related data
                bio = profile_data.get('bio', '')
                potential_handles = []
                
                # Look for @mentions in bio
                import re
                mentions = re.findall(r'@([a-zA-Z0-9._]+)', bio)
                potential_handles.extend(mentions)
                
                # Filter to likely vendor profiles
                vendor_handles = [
                    handle for handle in potential_handles 
                    if any(keyword in handle.lower() for keyword in 
                          ['makeup', 'hair', 'bridal', 'wedding', 'beauty', 'mua', 'artist'])
                ]
                
                logging.info(f"Found {len(vendor_handles)} potential vendor profiles from @{seed_username}")
                
                if vendor_handles:
                    # Process discovered profiles
                    discovered_count = await self.run_profile_based_collection(category, vendor_handles[:5])  # Limit to 5
                    return discovered_count
                
            return 0
            
        except Exception as e:
            logging.error(f"Error discovering profiles from @{seed_username}: {e}")
            return 0

def run_reliable_collection():
    """Run collection using the reliable profile-based approach"""
    
    print("🎯 Starting Profile-Based Instagram Collection")
    print("=" * 50)
    print("This approach uses known vendor profiles instead of hashtag discovery")
    print("It's more reliable due to Instagram's API restrictions on hashtag searches")
    
    collector = ProfileBasedCollector()
    
    async def collect_all_categories():
        total_processed = 0
        
        for category in ['makeup-artists', 'hair-stylists']:
            print(f"\n📊 Collecting {category}...")
            
            # Run profile-based collection
            count = await collector.run_profile_based_collection(category)
            total_processed += count
            
            print(f"✅ {category}: {count} profiles processed")
            
            # Optional: Try to discover more profiles from successful ones
            if count > 0:
                print(f"🔍 Discovering similar profiles...")
                seed_profiles = collector.SEED_PROFILES[category][:3]  # Use top 3 as seeds
                
                for seed in seed_profiles:
                    discovered = await collector.discover_similar_profiles(seed, category)
                    total_processed += discovered
                    if discovered > 0:
                        print(f"   Found {discovered} additional profiles from @{seed}")
        
        print(f"\n🎉 Collection Complete!")
        print(f"   Total profiles processed: {total_processed}")
        
        # Show final stats
        try:
            makeup_count = collector.db_manager.client.table('instagram_vendors').select('*', count='exact').eq('category', 'makeup-artists').limit(1).execute().count
            hair_count = collector.db_manager.client.table('instagram_vendors').select('*', count='exact').eq('category', 'hair-stylists').limit(1).execute().count
            
            print(f"   Makeup Artists in DB: {makeup_count}")
            print(f"   Hair Stylists in DB: {hair_count}")
            
        except Exception as e:
            print(f"   Database stats unavailable: {e}")
    
    # Run the collection
    asyncio.run(collect_all_categories())

if __name__ == "__main__":
    run_reliable_collection()