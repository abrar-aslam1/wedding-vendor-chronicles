#!/usr/bin/env python3
"""
Local Instagram Wedding Vendor Collector
Focuses on discovering local vendors with smaller followings who serve specific geographic areas
"""

from comprehensive_collection_plan import ComprehensiveWeddingVendorCollector
import asyncio
from typing import Dict, List, Tuple, Optional
import json
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LocalVendorCollector(ComprehensiveWeddingVendorCollector):
    """Collector optimized for local wedding vendors"""
    
    # Local business thresholds (much lower than enterprise)
    MIN_FOLLOWERS_LOCAL = 200  # Down from 500
    QUALITY_THRESHOLD_LOCAL = 3  # Down from 4
    MAX_FOLLOWERS_LOCAL = 10000  # Cap to avoid mega-influencers
    
    # Neighborhood-based search strategy
    NEIGHBORHOOD_MAPPING = {
        "Dallas": {
            "neighborhoods": ["uptown", "deepellum", "bishopdistrict", "highland_park", "lakewood", "downtown"],
            "surrounding": ["plano", "frisco", "richardson", "addison", "garland", "irving"]
        },
        "Austin": {
            "neighborhoods": ["downtown", "southcongress", "domain", "eastaustin", "westlake", "cedar_park"],
            "surrounding": ["roundrock", "pflugerville", "lakeway", "bee_cave", "dripping_springs"]
        },
        "Houston": {
            "neighborhoods": ["midtown", "montrose", "heights", "westheimer", "galleria", "memorial"],
            "surrounding": ["katy", "sugar_land", "woodlands", "pasadena", "pearland", "cypress"]
        },
        "San Antonio": {
            "neighborhoods": ["downtown", "southtown", "alamo_heights", "stone_oak", "pearl_district"],
            "surrounding": ["new_braunfels", "boerne", "schertz", "converse", "universal_city"]
        },
        "Fort Worth": {
            "neighborhoods": ["downtown", "stockyards", "cultural_district", "west_7th", "magnolia"],
            "surrounding": ["arlington", "grapevine", "southlake", "colleyville", "keller"]
        }
    }
    
    def get_local_hashtags_for_category(self, city: str, state: str, category: str) -> List[str]:
        """Generate hyperlocal hashtags for discovering local vendors"""
        
        city_clean = city.lower().replace(' ', '').replace('-', '')
        state_clean = state.lower()
        category_clean = category.replace('-', '').replace(' ', '')
        
        hashtags = []
        
        # Core local business hashtags
        hashtags.extend([
            f"#{city_clean}{category_clean}",
            f"#{city_clean}wedding{category_clean}",
            f"#{city_clean}local{category_clean}",
            f"#{city_clean}smallbusiness",
            f"#{city_clean}weddings",
            f"#{state_clean}{category_clean}",
            f"#{state_clean}weddings"
        ])
        
        # Add neighborhood-specific hashtags if available
        if city in self.NEIGHBORHOOD_MAPPING:
            neighborhoods = self.NEIGHBORHOOD_MAPPING[city]["neighborhoods"][:3]  # Top 3 neighborhoods
            for neighborhood in neighborhoods:
                hashtags.extend([
                    f"#{neighborhood}{category_clean}",
                    f"#{neighborhood}weddings",
                    f"#{neighborhood}bridal"
                ])
        
        # Local service area hashtags
        hashtags.extend([
            f"#{city_clean}metro{category_clean}",
            f"#{city_clean}area{category_clean}",
            f"#{city_clean}surrounding",
            f"#serving{city_clean}",
            f"#{city_clean}vendor"
        ])
        
        # Community and recommendation hashtags
        hashtags.extend([
            f"#{city_clean}weddingcommunity",
            f"#{city_clean}bridetobe",
            f"#{city_clean}engaged",
            f"#support{city_clean}local",
            f"#{city_clean}vendorrecommendations"
        ])
        
        # General wedding hashtags for broader discovery
        hashtags.extend([
            "#wedding", "#bridal", "#bride", "#localbusiness", "#smallbusiness"
        ])
        
        return hashtags[:15]  # Return top 15 most relevant
    
    def calculate_local_quality_score(self, profile_data: Dict, category: str, city: str) -> int:
        """Quality scoring optimized for local vendors"""
        score = 0
        
        bio = profile_data.get('bio', '').lower()
        
        # Local business indicators (0-4 points) - Higher weight
        local_keywords = [
            'local', 'serving', 'located in', 'based in', 'studio',
            'salon', 'boutique', 'appointments', 'book now', 'contact',
            city.lower(), 'metro', 'surrounding', 'area', 'near'
        ]
        
        local_matches = sum(1 for keyword in local_keywords if keyword in bio)
        score += min(local_matches, 4)
        
        # Category relevance (0-3 points)
        if category in self.CATEGORY_HASHTAGS:
            category_terms = self.CATEGORY_HASHTAGS[category]['business_terms']
            category_matches = sum(1 for term in category_terms if term in bio or term.replace(' ', '') in bio)
            score += min(category_matches, 3)
        
        # Local follower range (0-2 points) - Sweet spot for local vendors
        followers = profile_data.get('followersCount', 0)
        if self.MIN_FOLLOWERS_LOCAL <= followers <= 2000:
            score += 2  # Perfect local range
        elif 2000 < followers <= 5000:
            score += 1  # Good local range
        elif followers > self.MAX_FOLLOWERS_LOCAL:
            score -= 1  # Too big, might not be local
        
        # Activity level (0-2 points) - Adjusted for local vendors
        posts = profile_data.get('postsCount', 0)
        if posts >= 50:
            score += 1
        if posts >= 150:
            score += 1
        
        # Business indicators (0-2 points)
        if profile_data.get('externalUrl'):
            score += 1
        if profile_data.get('isBusinessAccount'):
            score += 1
        
        # Engagement indicators (0-1 point)
        if 'phone' in bio or 'email' in bio or 'appointment' in bio:
            score += 1
        
        return min(score, 12)  # Max 12 points
    
    def has_local_indicators(self, profile_data: Dict, city: str, state: str) -> bool:
        """Check if profile has strong local indicators"""
        bio = profile_data.get('bio', '').lower()
        
        # Strong local indicators
        local_signals = [
            city.lower(),
            state.lower(),
            'local',
            'serving',
            'located in',
            'based in',
            'metro',
            'surrounding',
            'area',
            'near me'
        ]
        
        # Check for city neighborhoods
        if city in self.NEIGHBORHOOD_MAPPING:
            neighborhoods = self.NEIGHBORHOOD_MAPPING[city]["neighborhoods"]
            surrounding = self.NEIGHBORHOOD_MAPPING[city]["surrounding"]
            local_signals.extend(neighborhoods + surrounding)
        
        return any(signal in bio for signal in local_signals)
    
    async def collect_local_vendors_for_city(self, city: str, state: str, category: str, target_count: int = 15):
        """Collect local vendors for a specific city/category combination"""
        
        logging.info(f"🏪 Collecting local {category} vendors in {city}, {state}")
        
        # Generate local hashtags
        local_hashtags = self.get_local_hashtags_for_category(city, state, category)
        
        input_config = {
            "addParentData": False,
            "directUrls": [],
            "enhanceUserSearchWithFacebookPage": False,
            "isUserReelFeedURL": False,
            "isUserTaggedFeedURL": False,
            "resultsLimit": 40,  # Get more to filter for local relevance
            "resultsType": "details",
            "searchLimit": 30,
            "searchType": "hashtag",
            "hashtags": local_hashtags,
            "searchQueries": [],
            "addMetadata": True,
            "proxyConfiguration": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"]
            }
        }
        
        try:
            # Run scraper
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=180)
            
            # Process results with local scoring
            dataset_id = run_data['defaultDatasetId']
            raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
            
            if raw_profiles and 'error' not in str(raw_profiles[0]):
                processed_count = self.process_local_profiles(
                    raw_profiles, category, city, state, target_count
                )
                
                logging.info(f"✅ {city}, {state}: {processed_count} local {category} vendors collected")
                return processed_count
            else:
                logging.warning(f"⚠️  No data for {city}, {state} - {category}")
                return 0
                
        except Exception as e:
            logging.error(f"❌ Error collecting local vendors for {city}: {e}")
            return 0
    
    def process_local_profiles(self, raw_profiles: List[Dict], category: str, city: str, state: str, target_count: int) -> int:
        """Process profiles with local vendor optimization"""
        
        processed_count = 0
        existing_handles = self.db_manager.get_existing_handles(category)
        local_profiles = []
        
        # Filter and score profiles
        for profile_data in raw_profiles:
            try:
                handle = profile_data.get('ownerUsername') or profile_data.get('username', '')
                if handle in existing_handles:
                    continue
                
                # Check follower range for local vendors
                followers = profile_data.get('ownerFollowersCount') or profile_data.get('followersCount', 0)
                if not (self.MIN_FOLLOWERS_LOCAL <= followers <= self.MAX_FOLLOWERS_LOCAL):
                    continue
                
                # Check for local indicators
                if not self.has_local_indicators(profile_data, city, state):
                    continue
                
                # Calculate local quality score
                quality_score = self.calculate_local_quality_score(profile_data, category, city)
                
                if quality_score >= self.QUALITY_THRESHOLD_LOCAL:
                    local_profiles.append((quality_score, followers, profile_data))
                    
            except Exception as e:
                logging.error(f"Error processing profile for local indicators: {e}")
                continue
        
        # Sort by quality score (local relevance over follower count)
        local_profiles.sort(key=lambda x: x[0], reverse=True)
        
        # Take top local vendors
        top_local_vendors = local_profiles[:target_count]
        
        logging.info(f"📊 {category} in {city}: {len(local_profiles)} local vendors found, processing top {len(top_local_vendors)}")
        
        # Process the top local vendors
        for quality_score, followers, profile_data in top_local_vendors:
            try:
                if self.process_single_profile(profile_data, category, f"{city}_{state}"):
                    processed_count += 1
                    
            except Exception as e:
                logging.error(f"Error processing local vendor profile: {e}")
                continue
        
        return processed_count
    
    async def run_local_collection_for_cities(self, cities: List[Tuple[str, str]], categories: List[str] = None):
        """Run local vendor collection for specified cities"""
        
        if not categories:
            categories = ['photographers', 'makeup-artists', 'hair-stylists', 'wedding-planners', 'florists']
        
        logging.info(f"🏪 LOCAL VENDOR COLLECTION")
        logging.info(f"📍 Cities: {len(cities)}")
        logging.info(f"📋 Categories: {len(categories)}")
        logging.info(f"🎯 Target: 15 local vendors per city per category")
        
        total_collected = 0
        
        for city, state in cities:
            logging.info(f"\n🌆 Processing {city}, {state}")
            
            city_total = 0
            
            for category in categories:
                try:
                    collected = await self.collect_local_vendors_for_city(city, state, category, target_count=15)
                    city_total += collected
                    total_collected += collected
                    
                    # Short break between categories
                    await asyncio.sleep(60)
                    
                except Exception as e:
                    logging.error(f"Error collecting {category} in {city}: {e}")
                    continue
            
            logging.info(f"🏆 {city}, {state}: {city_total} total local vendors collected")
            
            # Longer break between cities
            await asyncio.sleep(120)
        
        logging.info(f"\n🎉 LOCAL COLLECTION COMPLETE!")
        logging.info(f"📊 Total local vendors collected: {total_collected}")
        
        return total_collected

# Command line interface
async def run_local_vendor_collection():
    """Run local vendor collection for Texas cities"""
    
    print("🏪 LOCAL WEDDING VENDOR COLLECTION")
    print("=" * 60)
    print("Focus: Local vendors with 200-10K followers")
    print("Strategy: Hyperlocal hashtags + neighborhood targeting")
    
    collector = LocalVendorCollector()
    
    # Focus on Texas cities first
    texas_cities = [
        ("Dallas", "TX"),
        ("Austin", "TX"),
        ("Houston", "TX"),
        ("San Antonio", "TX"),
        ("Fort Worth", "TX")
    ]
    
    # High-priority categories for local vendors
    local_categories = [
        'photographers', 
        'makeup-artists', 
        'hair-stylists', 
        'wedding-planners', 
        'florists'
    ]
    
    total_collected = await collector.run_local_collection_for_cities(
        texas_cities, 
        local_categories
    )
    
    print(f"\n🎉 Local Collection Complete!")
    print(f"Total local vendors collected: {total_collected}")

if __name__ == "__main__":
    asyncio.run(run_local_vendor_collection())