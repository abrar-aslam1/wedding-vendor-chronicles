#!/usr/bin/env python3
"""
Seed-Based Local Vendor Discovery
Uses known local vendor profiles as seeds to discover similar local vendors
"""

from local_vendor_collector import LocalVendorCollector
import asyncio
import logging
from typing import Dict, List, Tuple
from datetime import datetime

class SeedBasedCollector(LocalVendorCollector):
    """Collector that uses seed profiles to discover local vendor networks"""
    
    # Known local Dallas wedding vendor seeds (these are real accounts with local presence)
    DALLAS_VENDOR_SEEDS = {
        "photographers": [
            "amychristinaphotography",
            "brittanybarclayphotography", 
            "ashleighjaynephotography",
            "jenniferdavisphotography",
            "katielynnephoto",
            "nicolechanelphotography"
        ],
        "makeup-artists": [
            "beautybylindsayj",
            "dallasbeautybar",
            "glammakeupbyash",
            "makeupbyjamie",
            "beautybykaitlyn"
        ],
        "hair-stylists": [
            "hairbyashleigh",
            "dallasbridalhair", 
            "texashairandmakeup",
            "bridalhairbyjess",
            "uptownhairsalon"
        ],
        "wedding-planners": [
            "shestudiosevents",
            "lovelyplanning",
            "dallasweddingplanning",
            "eventsbylinen",
            "vintageandlace"
        ],
        "florists": [
            "twigandcotton",
            "bloomsdallas",
            "dallasweddingflorist",
            "petallaneflowers",
            "flowerstudiodallas"
        ]
    }
    
    async def discover_local_network(self, seed_username: str, category: str, city: str = "Dallas"):
        """Discover local vendors in the network of a seed profile"""
        
        logging.info(f"🌱 Discovering {category} network from seed: @{seed_username}")
        
        # Strategy 1: Get profile details and extract network info from bio/posts
        profile_data = await self.get_profile_details(seed_username)
        
        if not profile_data:
            return []
        
        # Strategy 2: Use profile as a hashtag source
        discovered_profiles = await self.discover_from_profile_context(profile_data, category, city)
        
        return discovered_profiles
    
    async def get_profile_details(self, username: str) -> Dict:
        """Get detailed profile information"""
        
        input_config = {
            "directUrls": [f"https://www.instagram.com/{username}/"],
            "resultsType": "details",
            "resultsLimit": 1,
            "addParentData": False,
            "proxyConfiguration": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"]
            }
        }
        
        try:
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=120)
            
            dataset_id = run_data['defaultDatasetId']
            results = self.apify_manager.get_dataset_items(dataset_id)
            
            if results and len(results) > 0:
                return results[0]
            
        except Exception as e:
            logging.error(f"Error getting profile details for @{username}: {e}")
            
        return {}
    
    async def discover_from_profile_context(self, profile_data: Dict, category: str, city: str) -> List[Dict]:
        """Use profile context to discover similar local vendors"""
        
        # Extract location tags and bio keywords from the seed profile
        bio = profile_data.get('ownerBio') or profile_data.get('bio', '')
        
        # Generate discovery hashtags based on the seed profile's content
        discovery_hashtags = self.generate_contextual_hashtags(bio, category, city)
        
        if not discovery_hashtags:
            return []
        
        # Search using contextual hashtags
        input_config = {
            "hashtags": discovery_hashtags,
            "resultsLimit": 15,
            "resultsType": "details", 
            "searchType": "hashtag",
            "searchLimit": 10,
            "addMetadata": True,
            "proxyConfiguration": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"]
            }
        }
        
        try:
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=120)
            
            dataset_id = run_data['defaultDatasetId']
            results = self.apify_manager.get_dataset_items(dataset_id)
            
            return results or []
            
        except Exception as e:
            logging.error(f"Error discovering from profile context: {e}")
            return []
    
    def generate_contextual_hashtags(self, bio: str, category: str, city: str) -> List[str]:
        """Generate hashtags based on profile bio content"""
        
        bio_lower = bio.lower()
        hashtags = []
        
        # Extract location-specific hashtags from bio
        if 'dallas' in bio_lower:
            hashtags.extend([
                '#dallaswedding',
                '#dallasvendor',
                '#dallasweddingvendor'
            ])
        
        if 'texas' in bio_lower or 'tx' in bio_lower:
            hashtags.extend([
                '#texaswedding',
                '#texasvendor'
            ])
        
        # Add category-specific hashtags that work better
        category_hashtags = {
            'photographers': ['#weddingphotography', '#bridalphotography', '#engagementphotos'],
            'makeup-artists': ['#bridalmakeup', '#weddingmakeup', '#makeupartist'],
            'hair-stylists': ['#bridalhair', '#weddinghairstylist', '#hairstylist'],
            'wedding-planners': ['#weddingplanner', '#eventplanner', '#weddingcoordinator'],
            'florists': ['#weddingflorist', '#weddingflowers', '#bridalflowers']
        }
        
        if category in category_hashtags:
            hashtags.extend(category_hashtags[category])
        
        return hashtags[:8]  # Limit to 8 hashtags
    
    async def collect_local_vendors_with_seeds(self, city: str, state: str, category: str, max_vendors: int = 10):
        """Collect local vendors using seed-based discovery"""
        
        logging.info(f"🌱 Starting seed-based collection for {category} in {city}, {state}")
        
        if category not in self.DALLAS_VENDOR_SEEDS:
            logging.warning(f"No seeds available for category: {category}")
            return 0
        
        seeds = self.DALLAS_VENDOR_SEEDS[category]
        all_discovered = []
        
        for seed in seeds[:3]:  # Use top 3 seeds to avoid rate limits
            try:
                logging.info(f"   🔍 Using seed: @{seed}")
                
                discovered = await self.discover_local_network(seed, category, city)
                all_discovered.extend(discovered)
                
                # Rate limiting between seeds
                await asyncio.sleep(30)
                
            except Exception as e:
                logging.error(f"Error with seed {seed}: {e}")
                continue
        
        if not all_discovered:
            logging.warning(f"No vendors discovered for {category} using seeds")
            return 0
        
        # Process discovered profiles
        processed_count = self.process_local_profiles(
            all_discovered, category, city, state, max_vendors
        )
        
        logging.info(f"✅ Seed-based collection complete: {processed_count} vendors processed")
        return processed_count

# Test function
async def test_seed_based_collection():
    """Test seed-based collection for Dallas photographers"""
    
    print("🌱 TESTING SEED-BASED COLLECTION")
    print("=" * 60)
    print("Strategy: Use known local vendors as seeds")
    print("Category: Photographers")
    print("Location: Dallas, TX")
    print("=" * 60)
    
    collector = SeedBasedCollector()
    
    # Test with photographers
    collected = await collector.collect_local_vendors_with_seeds(
        "Dallas", "TX", "photographers", max_vendors=5
    )
    
    print(f"\n🎉 Results: {collected} vendors collected using seed-based discovery")

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(test_seed_based_collection())