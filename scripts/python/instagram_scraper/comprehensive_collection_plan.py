#!/usr/bin/env python3
"""
Comprehensive Instagram Wedding Vendor Collection System
Covers all 12 wedding vendor categories with top 20 results per category per city
"""

from enterprise_collection import *
import asyncio
from typing import Dict, List

class ComprehensiveWeddingVendorCollector(EnterpriseCollectionSystem):
    """Enhanced collector for all 12 wedding vendor categories"""
    
    # All 12 wedding vendor categories from the web app
    ALL_CATEGORIES = [
        'wedding-planners',
        'photographers', 
        'videographers',
        'florists',
        'caterers',
        'venues',
        'djs-and-bands',
        'cake-designers',
        'bridal-shops',
        'makeup-artists',
        'hair-stylists',
        'wedding-decorators'
    ]
    
    # Category-specific hashtag strategies
    CATEGORY_HASHTAGS = {
        'wedding-planners': {
            'keywords': ['weddingplanner', 'eventplanner', 'weddingcoordinator', 'bridalplanning'],
            'business_terms': ['planning', 'coordinator', 'coordination', 'event', 'planner']
        },
        'photographers': {
            'keywords': ['weddingphotographer', 'bridalphotography', 'engagementphotos', 'weddingphotos'],
            'business_terms': ['photographer', 'photography', 'photo', 'capture', 'portraits']
        },
        'videographers': {
            'keywords': ['weddingvideographer', 'weddingfilm', 'cinematicwedding', 'weddingvideo'],
            'business_terms': ['videographer', 'videography', 'film', 'cinema', 'video']
        },
        'florists': {
            'keywords': ['weddingflorist', 'bridalflowers', 'weddingbouquet', 'weddingflowers'],
            'business_terms': ['florist', 'flowers', 'floral', 'bouquet', 'arrangements']
        },
        'caterers': {
            'keywords': ['weddingcatering', 'weddingfood', 'receptioncatering', 'weddingmenu'],
            'business_terms': ['catering', 'caterer', 'food', 'chef', 'menu']
        },
        'venues': {
            'keywords': ['weddingvenue', 'receptionvenue', 'ceremonyvenue', 'weddingvenues'],
            'business_terms': ['venue', 'location', 'space', 'hall', 'reception']
        },
        'djs-and-bands': {
            'keywords': ['weddingdj', 'weddingband', 'receptionmusic', 'weddingentertainment'],
            'business_terms': ['dj', 'band', 'music', 'entertainment', 'live music']
        },
        'cake-designers': {
            'keywords': ['weddingcakes', 'customcakes', 'bridalcakes', 'weddingdesserts'],
            'business_terms': ['cake', 'bakery', 'dessert', 'baker', 'custom cakes']
        },
        'bridal-shops': {
            'keywords': ['bridalshop', 'weddingdress', 'bridalgown', 'bridalfashion'],
            'business_terms': ['bridal', 'dress', 'gown', 'boutique', 'attire']
        },
        'makeup-artists': {
            'keywords': ['bridalmakeup', 'weddingmakeup', 'bridalbeauty', 'makeupartist'],
            'business_terms': ['makeup artist', 'mua', 'beauty', 'cosmetics', 'glam']
        },
        'hair-stylists': {
            'keywords': ['bridalhair', 'weddinghair', 'bridalhairstylist', 'weddinghairstylist'],
            'business_terms': ['hair stylist', 'hairstylist', 'updo', 'bridal hair', 'styling']
        },
        'wedding-decorators': {
            'keywords': ['weddingdecor', 'ceremonydecorations', 'receptiondecor', 'weddingdesign'],
            'business_terms': ['decorator', 'decor', 'design', 'styling', 'installations']
        }
    }
    
    # Top 20 wedding markets (prioritized for maximum coverage)
    TOP_WEDDING_MARKETS = [
        ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Miami", "FL"),
        ("San Francisco", "CA"), ("Boston", "MA"), ("Seattle", "WA"), ("Austin", "TX"),
        ("Nashville", "TN"), ("Denver", "CO"), ("Atlanta", "GA"), ("Dallas", "TX"),
        ("San Diego", "CA"), ("Charleston", "SC"), ("Savannah", "GA"), ("Portland", "OR"),
        ("Las Vegas", "NV"), ("Phoenix", "AZ"), ("Houston", "TX"), ("Philadelphia", "PA")
    ]
    
    def get_enhanced_hashtags_for_category(self, city: str, state: str, category: str, limit: int = 10) -> List[str]:
        """Generate enhanced hashtag strategy for any wedding vendor category"""
        
        city_clean = city.lower().replace(' ', '').replace('-', '')
        state_clean = state.lower()
        
        hashtags = []
        
        if category in self.CATEGORY_HASHTAGS:
            category_data = self.CATEGORY_HASHTAGS[category]
            
            # City-specific hashtags
            for keyword in category_data['keywords'][:3]:  # Top 3 keywords
                hashtags.extend([
                    f"#{city_clean}{keyword}",
                    f"#{state_clean}{keyword}"
                ])
            
            # General category hashtags
            hashtags.extend([f"#{keyword}" for keyword in category_data['keywords'][:4]])
            
        # Always include general wedding hashtags
        hashtags.extend([
            "#wedding", "#bridal", "#bride", f"#{city_clean}wedding"
        ])
        
        return hashtags[:limit]
    
    def calculate_enhanced_quality_score(self, profile_data: Dict, category: str) -> int:
        """Enhanced quality scoring for all wedding vendor categories"""
        score = 0
        
        # Bio analysis (0-4 points) - Enhanced
        bio = profile_data.get('bio', '').lower()
        
        if category in self.CATEGORY_HASHTAGS:
            category_terms = self.CATEGORY_HASHTAGS[category]['business_terms']
            # More flexible matching
            bio_matches = sum(1 for term in category_terms if term in bio or term.replace(' ', '') in bio)
            score += min(bio_matches, 3)
        
        # Wedding-related keywords (additional point)
        wedding_keywords = ['wedding', 'bridal', 'bride', 'engaged', 'ceremony', 'reception']
        if any(keyword in bio for keyword in wedding_keywords):
            score += 1
        
        # Follower metrics (0-2 points) - More lenient for local vendors
        followers = profile_data.get('followersCount', 0)
        if followers > 500:
            score += 1
        if followers > 2000:  # Lowered from 5000
            score += 1
        
        # Activity metrics (0-2 points)
        posts = profile_data.get('postsCount', 0)
        if posts > 30:  # Lowered from 50
            score += 1
        if posts > 100:  # Lowered from 200
            score += 1
        
        # Business indicators (0-2 points)
        if profile_data.get('externalUrl'):
            score += 1
        if profile_data.get('verified') or profile_data.get('isBusinessAccount'):
            score += 1
        
        return min(score, 10)
    
    async def run_comprehensive_category_collection(self, category: str, max_cities: int = 20):
        """Collect vendors for a specific category across top wedding markets"""
        
        logging.info(f"🎯 Starting comprehensive collection for {category}")
        
        total_processed = 0
        cities_to_process = self.TOP_WEDDING_MARKETS[:max_cities]
        
        for i, (city, state) in enumerate(cities_to_process):
            try:
                logging.info(f"📍 Processing {city}, {state} for {category} ({i+1}/{len(cities_to_process)})")
                
                # Generate category-specific hashtags
                hashtags = self.get_enhanced_hashtags_for_category(city, state, category)
                
                input_config = {
                    "addParentData": False,
                    "directUrls": [],
                    "enhanceUserSearchWithFacebookPage": False,
                    "isUserReelFeedURL": False,
                    "isUserTaggedFeedURL": False,
                    "resultsLimit": 30,  # Get 30 to filter down to top 20
                    "resultsType": "details",
                    "searchLimit": 25,
                    "searchType": "hashtag",
                    "hashtags": hashtags,
                    "searchQueries": [],
                    "addMetadata": True,
                    "proxyConfiguration": {
                        "useApifyProxy": True,
                        "apifyProxyGroups": ["RESIDENTIAL"]
                    }
                }
                
                # Start scraper run
                run_id = await self.apify_manager.run_instagram_scraper(input_config)
                
                # Wait for completion
                run_data = self.apify_manager.wait_for_completion(run_id, timeout=180)
                
                # Process results with enhanced quality scoring
                dataset_id = run_data['defaultDatasetId']
                raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
                
                if raw_profiles and 'error' not in str(raw_profiles[0]):
                    processed_count = self.process_enhanced_profiles(
                        raw_profiles, category, f"{city}_{state}", max_results=20
                    )
                    total_processed += processed_count
                    
                    logging.info(f"✅ {city}, {state}: {processed_count} {category} vendors processed")
                else:
                    logging.warning(f"⚠️  No data for {city}, {state} - {category}")
                
                # Rate limiting between cities
                await asyncio.sleep(120)  # 2 minutes between cities
                
            except Exception as e:
                logging.error(f"❌ Error processing {city}, {state} for {category}: {e}")
                continue
        
        logging.info(f"🎉 Completed {category}: {total_processed} total vendors processed")
        return total_processed
    
    def process_enhanced_profiles(self, raw_profiles: List[Dict], category: str, location_context: str, max_results: int = 20) -> int:
        """Process profiles with enhanced quality scoring and top-N filtering"""
        
        processed_count = 0
        existing_handles = self.db_manager.get_existing_handles(category)
        scored_profiles = []
        
        # Score all profiles first
        for profile_data in raw_profiles:
            try:
                handle = profile_data.get('ownerUsername') or profile_data.get('username', '')
                if handle in existing_handles:
                    continue
                
                # Use enhanced quality scoring
                quality_score = self.calculate_enhanced_quality_score(profile_data, category)
                
                if quality_score >= 3:  # Lowered threshold
                    follower_count = profile_data.get('ownerFollowersCount') or profile_data.get('followersCount', 0)
                    if follower_count >= 200:  # Lowered minimum
                        scored_profiles.append((quality_score, follower_count, profile_data))
                        
            except Exception as e:
                logging.error(f"Error scoring profile: {e}")
                continue
        
        # Sort by quality score, then by follower count
        scored_profiles.sort(key=lambda x: (x[0], x[1]), reverse=True)
        
        # Take top N results
        top_profiles = scored_profiles[:max_results]
        
        logging.info(f"📊 {category} in {location_context}: {len(scored_profiles)} qualified, processing top {len(top_profiles)}")
        
        # Process the top profiles
        for quality_score, follower_count, profile_data in top_profiles:
            try:
                # Process the profile (existing logic)
                if self.process_single_profile(profile_data, category, location_context):
                    processed_count += 1
                    
            except Exception as e:
                logging.error(f"Error processing top profile: {e}")
                continue
        
        return processed_count
    
    def process_single_profile(self, profile_data: Dict, category: str, location_context: str) -> bool:
        """Process a single profile and save to database"""
        try:
            # Extract data using existing logic
            handle = profile_data.get('ownerUsername') or profile_data.get('username', '')
            bio = profile_data.get('ownerBio') or profile_data.get('bio', '')
            
            # Extract location
            city, state, _ = self.quality_controller.extract_location(bio)
            
            # Extract contact info
            external_url = profile_data.get('ownerExternalUrl') or profile_data.get('externalUrl')
            email, phone = self.quality_controller.extract_contact_info(bio, external_url)
            
            # Determine subcategory
            subcategory = self.determine_enhanced_subcategory(bio, category)
            
            # Extract business name
            business_name = self.extract_business_name(bio, handle)
            
            # Create vendor object
            vendor = InstagramVendor(
                instagram_handle=handle,
                business_name=business_name,
                category=category,
                subcategory=subcategory,
                bio=bio[:500],
                website_url=external_url,
                email=email,
                phone=phone,
                follower_count=profile_data.get('ownerFollowersCount') or profile_data.get('followersCount', 0),
                post_count=profile_data.get('ownerPostsCount') or profile_data.get('postsCount', 0),
                is_verified=profile_data.get('ownerIsVerified') or profile_data.get('verified', False),
                is_business_account=profile_data.get('ownerIsBusinessAccount') or profile_data.get('isBusinessAccount', False),
                profile_image_url=profile_data.get('ownerProfilePicUrl') or profile_data.get('profilePicUrl', ''),
                city=city,
                state=state,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Save to database
            return self.db_manager.upsert_vendor(vendor)
            
        except Exception as e:
            logging.error(f"Error processing single profile: {e}")
            return False
    
    def determine_enhanced_subcategory(self, bio: str, category: str) -> Optional[str]:
        """Enhanced subcategory detection for all vendor types"""
        bio_lower = bio.lower()
        
        subcategory_patterns = {
            'photographers': {
                'engagement-photography': ['engagement', 'couple', 'proposal'],
                'portrait-photography': ['portrait', 'headshot', 'family'],
                'destination-photography': ['destination', 'travel', 'elopement'],
                'fine-art-photography': ['fine art', 'artistic', 'editorial']
            },
            'venues': {
                'outdoor-venues': ['outdoor', 'garden', 'barn', 'farm', 'beach'],
                'indoor-venues': ['ballroom', 'hotel', 'historic', 'hall'],
                'destination-venues': ['destination', 'resort', 'winery', 'vineyard']
            },
            'caterers': {
                'full-service-catering': ['full service', 'complete', 'all inclusive'],
                'specialty-cuisine': ['italian', 'mexican', 'asian', 'mediterranean'],
                'dessert-catering': ['dessert', 'sweet', 'cake', 'pastry']
            }
            # Add more category-specific subcategories as needed
        }
        
        if category in subcategory_patterns:
            for subcategory, patterns in subcategory_patterns[category].items():
                if any(pattern in bio_lower for pattern in patterns):
                    return subcategory
        
        return None
    
    def extract_business_name(self, bio: str, handle: str) -> Optional[str]:
        """Extract business name from bio or handle"""
        if not bio:
            return handle.replace('_', ' ').title()
        
        bio_lines = bio.split('\n')
        for line in bio_lines:
            line = line.strip()
            # Look for lines that seem like business names
            if (len(line) < 50 and 
                not line.startswith('@') and 
                not line.startswith('#') and
                not line.startswith('http') and
                any(char.isupper() for char in line)):
                return line
        
        return handle.replace('_', ' ').title()
    
    async def run_full_comprehensive_collection(self, max_cities_per_category: int = 10):
        """Run comprehensive collection for ALL 12 wedding vendor categories"""
        
        logging.info(f"🚀 Starting FULL comprehensive wedding vendor collection")
        logging.info(f"📋 Categories: {len(self.ALL_CATEGORIES)}")
        logging.info(f"🌍 Cities per category: {max_cities_per_category}")
        logging.info(f"🎯 Target: ~{20 * max_cities_per_category} vendors per category")
        
        total_results = {}
        
        for i, category in enumerate(self.ALL_CATEGORIES):
            logging.info(f"\n🎭 CATEGORY {i+1}/{len(self.ALL_CATEGORIES)}: {category.upper()}")
            
            try:
                count = await self.run_comprehensive_category_collection(category, max_cities_per_category)
                total_results[category] = count
                
                logging.info(f"✅ {category}: {count} vendors collected")
                
                # Longer break between categories
                if i < len(self.ALL_CATEGORIES) - 1:
                    logging.info(f"⏳ Waiting 5 minutes before next category...")
                    await asyncio.sleep(300)  # 5 minutes between categories
                    
            except Exception as e:
                logging.error(f"❌ Failed to collect {category}: {e}")
                total_results[category] = 0
                continue
        
        # Final summary
        total_vendors = sum(total_results.values())
        logging.info(f"\n🎉 COMPREHENSIVE COLLECTION COMPLETE!")
        logging.info(f"📊 FINAL RESULTS:")
        logging.info(f"   Total vendors collected: {total_vendors}")
        
        for category, count in total_results.items():
            logging.info(f"   {category}: {count} vendors")
        
        return total_results

# Command line interface for comprehensive collection
async def run_comprehensive_collection():
    """Run the comprehensive collection system"""
    
    print("🎯 Comprehensive Wedding Vendor Instagram Collection")
    print("=" * 60)
    print("This will collect the top 20 vendors for each category in top wedding cities")
    print(f"Categories: {len(ComprehensiveWeddingVendorCollector.ALL_CATEGORIES)}")
    print(f"Markets: {len(ComprehensiveWeddingVendorCollector.TOP_WEDDING_MARKETS)}")
    
    collector = ComprehensiveWeddingVendorCollector()
    
    # Run full collection (10 cities per category = ~200 vendors per category)
    results = await collector.run_full_comprehensive_collection(max_cities_per_category=10)
    
    print(f"\n🎉 Collection Complete!")
    print(f"Total vendors collected across all categories: {sum(results.values())}")

if __name__ == "__main__":
    asyncio.run(run_comprehensive_collection())