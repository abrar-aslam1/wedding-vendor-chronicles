#!/usr/bin/env python3
"""
Enterprise Instagram Bridal Makeup Artist Data Collection System
Integrated with Supabase for Wedding Vendor Chronicles
"""

import asyncio
import logging
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import schedule
import time
import os
from concurrent.futures import ThreadPoolExecutor
import re
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
class Config:
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    
    # Apify Configuration
    APIFY_TOKEN = os.getenv('APIFY_TOKEN')
    
    # System Configuration
    LOG_LEVEL = logging.INFO
    MAX_CONCURRENT_SCRAPES = 3
    QUALITY_THRESHOLD = 4
    MIN_FOLLOWERS = 500
    
    # Categories to collect (aligned with existing system)
    CATEGORIES = ['makeup-artists', 'hair-stylists']
    
    # Location focus
    PRIMARY_STATES = ['TX', 'CA', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']

# Data Models
@dataclass
class InstagramVendor:
    instagram_handle: str
    business_name: Optional[str]
    category: str
    subcategory: Optional[str]
    bio: str
    website_url: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    follower_count: int
    post_count: int
    is_verified: bool
    is_business_account: bool
    profile_image_url: Optional[str]
    city: Optional[str]
    state: Optional[str]
    created_at: datetime
    updated_at: datetime

class ScrapingStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class CollectionPriority(Enum):
    HIGH = 1      # Major cities, high-follower accounts
    MEDIUM = 2    # Secondary markets, network expansion
    LOW = 3       # Long-tail discovery, validation runs

# Core System Classes
class SupabaseManager:
    """Handles all Supabase database operations"""
    
    def __init__(self):
        self.client: Client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_SERVICE_KEY  # Use service key for admin operations
        )
    
    def upsert_vendor(self, vendor: InstagramVendor) -> bool:
        """Insert or update Instagram vendor"""
        try:
            vendor_data = asdict(vendor)
            # Convert datetime objects to ISO strings
            vendor_data['created_at'] = vendor.created_at.isoformat()
            vendor_data['updated_at'] = vendor.updated_at.isoformat()
            
            response = self.client.table('instagram_vendors').upsert(
                vendor_data,
                on_conflict='instagram_handle,category'
            ).execute()
            
            return True
            
        except Exception as e:
            logging.error(f"Database error inserting vendor {vendor.instagram_handle}: {e}")
            return False
    
    def get_existing_handles(self, category: str) -> List[str]:
        """Get list of existing Instagram handles for a category"""
        try:
            response = self.client.table('instagram_vendors').select('instagram_handle').eq('category', category).execute()
            return [item['instagram_handle'] for item in response.data]
        except Exception as e:
            logging.error(f"Error fetching existing handles: {e}")
            return []
    
    def get_discovery_seeds(self, category: str, limit: int = 20) -> List[str]:
        """Get high-quality profiles for network expansion"""
        try:
            response = self.client.table('instagram_vendors')\
                .select('instagram_handle')\
                .eq('category', category)\
                .gte('follower_count', 5000)\
                .order('follower_count', desc=True)\
                .limit(limit)\
                .execute()
            
            return [item['instagram_handle'] for item in response.data]
        except Exception as e:
            logging.error(f"Error fetching discovery seeds: {e}")
            return []
    
    def record_scraping_run(self, run_data: Dict):
        """Record scraping run metrics"""
        try:
            # Try to insert, but don't fail if table doesn't exist
            self.client.table('scraping_runs').insert(run_data).execute()
        except Exception as e:
            logging.warning(f"Could not record scraping run (table may not exist): {e}")
            # Continue without failing

class QualityController:
    """Advanced quality scoring and validation for wedding vendors"""
    
    @staticmethod
    def calculate_quality_score(profile_data: Dict, category: str) -> int:
        """Calculate quality score (0-10) for vendor profiles"""
        score = 0
        
        # Bio analysis (0-3 points)
        bio = profile_data.get('bio', '').lower()
        
        # Category-specific keywords
        if category == 'makeup-artists':
            keywords = ['bridal', 'bride', 'wedding', 'makeup artist', 'mua', 'beauty']
        elif category == 'hair-stylists':
            keywords = ['bridal', 'bride', 'wedding', 'hair stylist', 'hairstylist', 'updo']
        else:
            keywords = ['wedding', 'bridal', 'bride']
        
        location_keywords = ['dallas', 'houston', 'austin', 'nyc', 'los angeles', 'chicago', 'atlanta', 'miami']
        business_keywords = ['booking', 'dm for', 'contact', 'available', 'inquiries']
        
        bio_score = sum(1 for keyword in keywords if keyword in bio)
        if any(keyword in bio for keyword in location_keywords):
            bio_score += 1
        if any(keyword in bio for keyword in business_keywords):
            bio_score += 1
        
        score += min(bio_score, 3)
        
        # Follower metrics (0-2 points)
        followers = profile_data.get('followersCount', 0)
        if followers > 1000:
            score += 1
        if followers > 5000:
            score += 1
        
        # Activity metrics (0-2 points)
        posts = profile_data.get('postsCount', 0)
        if posts > 50:
            score += 1
        if posts > 200:
            score += 1
        
        # Business indicators (0-3 points)
        if profile_data.get('externalUrl'):
            score += 1
        if profile_data.get('verified'):
            score += 1
        if profile_data.get('isBusinessAccount'):
            score += 1
        
        return min(score, 10)
    
    @staticmethod
    def extract_location(bio: str, location_data: Dict = None) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Extract city, state, and location from bio and location data"""
        city = None
        state = None
        location = None
        
        # First check location data from Instagram
        if location_data:
            location = location_data.get('name', '')
            
        # Extract from bio
        bio_location = bio
        
        # State patterns
        state_patterns = [
            r'\b(TX|Texas|CA|California|NY|New York|FL|Florida|IL|Illinois|PA|Pennsylvania|OH|Ohio|GA|Georgia|NC|North Carolina|MI|Michigan)\b',
        ]
        
        for pattern in state_patterns:
            match = re.search(pattern, bio_location, re.IGNORECASE)
            if match:
                state_match = match.group(1).upper()
                # Normalize state names to abbreviations
                state_map = {
                    'TEXAS': 'TX', 'CALIFORNIA': 'CA', 'NEW YORK': 'NY',
                    'FLORIDA': 'FL', 'ILLINOIS': 'IL', 'PENNSYLVANIA': 'PA',
                    'OHIO': 'OH', 'GEORGIA': 'GA', 'NORTH CAROLINA': 'NC',
                    'MICHIGAN': 'MI'
                }
                state = state_map.get(state_match, state_match)
                break
        
        # City patterns
        city_patterns = [
            r'(Dallas|Houston|Austin|San Antonio|Fort Worth|NYC|New York|Los Angeles|LA|Chicago|Miami|Atlanta|Philadelphia|Phoenix|San Diego)',
        ]
        
        for pattern in city_patterns:
            match = re.search(pattern, bio_location, re.IGNORECASE)
            if match:
                city = match.group(1).title()
                # Normalize city names
                city_map = {'Nyc': 'New York', 'La': 'Los Angeles'}
                city = city_map.get(city, city)
                break
        
        return city, state, location
    
    @staticmethod
    def extract_contact_info(bio: str, external_url: str = None) -> Tuple[Optional[str], Optional[str]]:
        """Extract email and phone from bio"""
        email = None
        phone = None
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, bio)
        if email_match:
            email = email_match.group(0).lower()
        
        # Phone pattern (US numbers)
        phone_patterns = [
            r'\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b',
            r'\b(\(\d{3}\)\s*\d{3}[-.]?\d{4})\b',
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, bio)
            if phone_match:
                phone = phone_match.group(0)
                break
        
        return email, phone
    
    @staticmethod
    def determine_subcategory(bio: str, category: str) -> Optional[str]:
        """Determine vendor subcategory based on bio content"""
        bio_lower = bio.lower()
        
        if category == 'makeup-artists':
            if any(word in bio_lower for word in ['airbrush', 'hd makeup', 'hd foundation']):
                return 'airbrush-specialist'
            elif any(word in bio_lower for word in ['natural', 'organic', 'clean beauty']):
                return 'natural-makeup'
            elif any(word in bio_lower for word in ['glam', 'glamour', 'dramatic']):
                return 'glam-specialist'
            elif any(word in bio_lower for word in ['traditional', 'cultural', 'asian', 'indian', 'mexican']):
                return 'cultural-specialist'
        
        elif category == 'hair-stylists':
            if any(word in bio_lower for word in ['updo', 'updos', 'bridal updo']):
                return 'updo-specialist'
            elif any(word in bio_lower for word in ['extensions', 'hair extensions']):
                return 'extensions-specialist'
            elif any(word in bio_lower for word in ['color', 'colorist', 'balayage']):
                return 'color-specialist'
            elif any(word in bio_lower for word in ['natural hair', 'textured hair', 'curly']):
                return 'textured-hair-specialist'
        
        return None

class ApifyManager:
    """Manages all Apify API interactions"""
    
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.apify.com/v2"
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    async def run_instagram_scraper(self, input_config: Dict) -> str:
        """Start Instagram scraper run"""
        # Using the Instagram Scraper actor
        url = f"{self.base_url}/acts/shu8hvrXbJbY3Eb9W/runs"
        
        try:
            response = self.session.post(url, json=input_config)
            response.raise_for_status()
            
            run_data = response.json()
            run_id = run_data['data']['id']
            
            logging.info(f"Started Instagram scraper run: {run_id}")
            return run_id
            
        except requests.RequestException as e:
            logging.error(f"Failed to start scraper: {e}")
            raise
    
    def wait_for_completion(self, run_id: str, timeout: int = 3600) -> Dict:
        """Wait for scraper run to complete"""
        url = f"{self.base_url}/actor-runs/{run_id}"
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = self.session.get(url)
                response.raise_for_status()
                
                run_data = response.json()['data']
                status = run_data['status']
                
                if status == 'SUCCEEDED':
                    return run_data
                elif status == 'FAILED':
                    raise Exception(f"Scraper run failed: {run_data.get('statusMessage')}")
                
                time.sleep(30)
                
            except requests.RequestException as e:
                logging.error(f"Error checking run status: {e}")
                time.sleep(60)
        
        raise TimeoutError(f"Scraper run {run_id} timed out after {timeout} seconds")
    
    def get_dataset_items(self, dataset_id: str) -> List[Dict]:
        """Download dataset items from completed run"""
        url = f"{self.base_url}/datasets/{dataset_id}/items"
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logging.error(f"Failed to download dataset: {e}")
            return []

class GeographicStrategy:
    """Manages geographic coverage for wedding vendors"""
    
    # Major wedding markets
    MAJOR_MARKETS = [
        ("Dallas", "TX"), ("Houston", "TX"), ("Austin", "TX"), ("San Antonio", "TX"),
        ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"),
        ("Phoenix", "AZ"), ("Philadelphia", "PA"), ("San Diego", "CA"),
        ("San Francisco", "CA"), ("Boston", "MA"), ("Atlanta", "GA"), ("Miami", "FL"),
        ("Seattle", "WA"), ("Denver", "CO"), ("Nashville", "TN"), ("Portland", "OR"),
        ("Las Vegas", "NV"), ("Charlotte", "NC"), ("Orlando", "FL")
    ]
    
    # Secondary wedding markets
    SECONDARY_MARKETS = [
        ("Fort Worth", "TX"), ("Plano", "TX"), ("Arlington", "TX"),
        ("Sacramento", "CA"), ("San Jose", "CA"), ("Fresno", "CA"),
        ("Tampa", "FL"), ("Jacksonville", "FL"), ("Fort Lauderdale", "FL"),
        ("Columbus", "OH"), ("Indianapolis", "IN"), ("Milwaukee", "WI"),
        ("Kansas City", "MO"), ("St. Louis", "MO"), ("Minneapolis", "MN"),
        ("Raleigh", "NC"), ("Richmond", "VA"), ("Baltimore", "MD")
    ]
    
    @classmethod
    def get_hashtags_for_location(cls, city: str, state: str, category: str) -> List[str]:
        """Generate location and category specific hashtags"""
        city_clean = city.lower().replace(' ', '')
        
        hashtags = []
        
        if category == 'makeup-artists':
            hashtags = [
                f"#{city_clean}makeupartist",
                f"#{city_clean}mua",
                f"#{city_clean}bridalmakeup",
                f"#{city_clean}weddingmakeup",
                f"#{state.lower()}makeupartist",
                f"#{state.lower()}bridalmakeup"
            ]
        elif category == 'hair-stylists':
            hashtags = [
                f"#{city_clean}hairstylist",
                f"#{city_clean}bridalhair",
                f"#{city_clean}weddinghair",
                f"#{state.lower()}hairstylist",
                f"#{state.lower()}bridalhair"
            ]
        
        # Add general wedding hashtags
        hashtags.extend([
            "#bridalmakeup",
            "#weddingmakeup",
            "#bridalbeauty",
            "#weddingbeauty"
        ])
        
        return hashtags[:10]  # Limit to 10 hashtags

class EnterpriseCollectionSystem:
    """Main orchestration class for Instagram vendor collection"""
    
    def __init__(self):
        # Initialize components
        self.db_manager = SupabaseManager()
        self.apify_manager = ApifyManager(Config.APIFY_TOKEN)
        self.quality_controller = QualityController()
        
        # Setup logging
        logging.basicConfig(
            level=Config.LOG_LEVEL,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('instagram_collection.log'),
                logging.StreamHandler()
            ]
        )
        
        logging.info("Enterprise Collection System initialized")
    
    async def run_geographic_sweep(self, category: str, priority: CollectionPriority):
        """Run geographic data collection for a specific category"""
        if priority == CollectionPriority.HIGH:
            cities = GeographicStrategy.MAJOR_MARKETS[:10]
        elif priority == CollectionPriority.MEDIUM:
            cities = GeographicStrategy.SECONDARY_MARKETS[:10]
        else:
            cities = (GeographicStrategy.MAJOR_MARKETS + GeographicStrategy.SECONDARY_MARKETS)[20:30]
        
        for city, state in cities:
            try:
                hashtags = GeographicStrategy.get_hashtags_for_location(city, state, category)
                
                input_config = {
                    "addParentData": False,
                    "directUrls": [],
                    "enhanceUserSearchWithFacebookPage": False,
                    "isUserReelFeedURL": False,
                    "isUserTaggedFeedURL": False,
                    "resultsLimit": 100,
                    "resultsType": "details",
                    "searchLimit": 50,
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
                
                # Record run
                self.db_manager.record_scraping_run({
                    'run_id': run_id,
                    'category': category,
                    'location': f"{city}, {state}",
                    'status': 'running',
                    'started_at': datetime.now().isoformat()
                })
                
                # Wait for completion
                run_data = self.apify_manager.wait_for_completion(run_id)
                
                # Process results
                dataset_id = run_data['defaultDatasetId']
                raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
                
                processed_count = self.process_raw_profiles(raw_profiles, category, f"{city}, {state}")
                
                logging.info(f"Completed {city}, {state} for {category}: {processed_count} profiles processed")
                
                # Rate limiting
                await asyncio.sleep(300)  # 5 minutes between cities
                
            except Exception as e:
                logging.error(f"Error processing {city}, {state} for {category}: {e}")
    
    def process_raw_profiles(self, raw_profiles: List[Dict], category: str, location_context: str) -> int:
        """Process and validate raw profile data"""
        processed_count = 0
        existing_handles = self.db_manager.get_existing_handles(category)
        
        for profile_data in raw_profiles:
            try:
                # Handle both owner* and direct field names (Instagram scraper inconsistency)
                handle = profile_data.get('ownerUsername') or profile_data.get('username', '')
                if handle in existing_handles:
                    continue
                
                # Calculate quality score
                quality_score = self.quality_controller.calculate_quality_score(profile_data, category)
                
                # Skip low-quality profiles
                if quality_score < Config.QUALITY_THRESHOLD:
                    continue
                
                # Skip if below minimum followers
                follower_count = profile_data.get('ownerFollowersCount') or profile_data.get('followersCount', 0)
                if follower_count < Config.MIN_FOLLOWERS:
                    continue
                
                # Extract profile details
                bio = profile_data.get('ownerBio') or profile_data.get('bio', '')
                location_data = profile_data.get('locationData', {})
                
                # Extract location
                city, state, location = self.quality_controller.extract_location(bio, location_data)
                
                # Skip if not in target states (but allow if no state detected)
                if state and state not in Config.PRIMARY_STATES:
                    continue
                
                # Extract contact info
                external_url = profile_data.get('ownerExternalUrl') or profile_data.get('externalUrl')
                email, phone = self.quality_controller.extract_contact_info(bio, external_url)
                
                # Determine subcategory
                subcategory = self.quality_controller.determine_subcategory(bio, category)
                
                # Extract business name from bio or use handle
                business_name = None
                bio_lines = bio.split('\n')
                if bio_lines:
                    # Often the first line is the business name
                    potential_name = bio_lines[0].strip()
                    if len(potential_name) < 50 and not potential_name.startswith('@'):
                        business_name = potential_name
                
                # Create vendor object
                vendor = InstagramVendor(
                    instagram_handle=handle,
                    business_name=business_name,
                    category=category,
                    subcategory=subcategory,
                    bio=bio[:500],  # Limit bio length
                    website_url=external_url,
                    email=email,
                    phone=phone,
                    follower_count=follower_count,
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
                if self.db_manager.upsert_vendor(vendor):
                    processed_count += 1
                    existing_handles.append(handle)  # Update local cache
                
            except Exception as e:
                logging.error(f"Error processing profile {profile_data.get('ownerUsername', 'unknown')}: {e}")
        
        return processed_count
    
    async def run_collection_cycle(self):
        """Run a complete collection cycle for all categories"""
        for category in Config.CATEGORIES:
            logging.info(f"Starting collection for category: {category}")
            
            # Run high priority locations first
            await self.run_geographic_sweep(category, CollectionPriority.HIGH)
            
            # Then medium priority
            await self.run_geographic_sweep(category, CollectionPriority.MEDIUM)
            
            logging.info(f"Completed collection for category: {category}")
    
    def run_manual_collection(self, category: str, hashtags: List[str]):
        """Run manual collection with specific hashtags"""
        try:
            input_config = {
                "addParentData": False,
                "directUrls": [],
                "enhanceUserSearchWithFacebookPage": False,
                "isUserReelFeedURL": False,
                "isUserTaggedFeedURL": False,
                "resultsLimit": 200,
                "resultsType": "details",
                "searchLimit": 50,
                "searchType": "hashtag",
                "hashtags": hashtags,
                "searchQueries": [],
                "addMetadata": True,
                "proxyConfiguration": {
                    "useApifyProxy": True,
                    "apifyProxyGroups": ["RESIDENTIAL"]
                }
            }
            
            # Run synchronously for manual collection
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            run_id = loop.run_until_complete(
                self.apify_manager.run_instagram_scraper(input_config)
            )
            
            run_data = self.apify_manager.wait_for_completion(run_id)
            dataset_id = run_data['defaultDatasetId']
            raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
            
            processed_count = self.process_raw_profiles(raw_profiles, category, "manual")
            
            logging.info(f"Manual collection completed: {processed_count} profiles processed")
            return processed_count
            
        except Exception as e:
            logging.error(f"Manual collection error: {e}")
            return 0

# Command-line interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        system = EnterpriseCollectionSystem()
        
        if command == "collect-all":
            # Run full collection cycle
            asyncio.run(system.run_collection_cycle())
            
        elif command == "collect-category" and len(sys.argv) > 2:
            # Collect specific category
            category = sys.argv[2]
            if category in Config.CATEGORIES:
                asyncio.run(system.run_geographic_sweep(category, CollectionPriority.HIGH))
            else:
                print(f"Invalid category. Choose from: {', '.join(Config.CATEGORIES)}")
                
        elif command == "collect-hashtags" and len(sys.argv) > 3:
            # Manual collection with hashtags
            category = sys.argv[2]
            hashtags = sys.argv[3].split(',')
            
            if category in Config.CATEGORIES:
                system.run_manual_collection(category, hashtags)
            else:
                print(f"Invalid category. Choose from: {', '.join(Config.CATEGORIES)}")
                
        else:
            print("Usage:")
            print("  python enterprise_collection.py collect-all")
            print("  python enterprise_collection.py collect-category <category>")
            print("  python enterprise_collection.py collect-hashtags <category> <hashtag1,hashtag2,...>")
            print(f"\nCategories: {', '.join(Config.CATEGORIES)}")
    else:
        print("Starting automated collection system...")
        system = EnterpriseCollectionSystem()
        asyncio.run(system.run_collection_cycle())