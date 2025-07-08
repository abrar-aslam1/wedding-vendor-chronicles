#!/usr/bin/env python3
"""
Optimized Mass Instagram Vendor Collector
Maximizes data extraction from each Apify request to minimize API calls
"""

from comprehensive_collection_plan import ComprehensiveWeddingVendorCollector
import asyncio
from typing import Dict, List, Tuple
import logging
from datetime import datetime

class OptimizedMassCollector(ComprehensiveWeddingVendorCollector):
    """Optimized collector that maximizes data per API call"""
    
    # Optimized seed profiles - verified working accounts with large followings
    OPTIMIZED_SEED_PROFILES = {
        'makeup-artists': [
            'patmcgrathreal',           # 6M followers - Pat McGrath Labs
            'makeupbyariel',            # 2.6M followers - Celebrity MUA
            'makeupbyjenny',            # 83K followers - Wedding specialist
            'charlottechampagne',       # Wedding makeup artist
            'hinasharkawi',             # 3M followers - Middle Eastern makeup
            'dontcallmesarah',         # 1.5M followers - Beauty influencer
            'lauramercier',             # 2.1M followers - Brand account
            'bobbibrown',              # 1.8M followers - Brand account
            'anastasiabeverlyhills',   # 23M followers - Brand account
            'nyxcosmetics'             # 17M followers - Brand account
        ],
        'hair-stylists': [
            'bridalhairandmakeup',     # 803 followers - Bridal specialist
            'bridalhairdesign',        # 3.4K followers - UK based
            'jenatkinhair',            # 1.2M followers - Celebrity stylist
            'chrismcmillanhair',       # 200K followers - Celebrity stylist
            'thegoodhairguru',         # 400K followers - Hair care
            'bumbleandbumble',         # 3.2M followers - Brand account
            'redken',                  # 2.8M followers - Brand account
            'schwarzkopfpro',          # 1.1M followers - Brand account
            'matrxbiolage',            # 500K followers - Brand account
            'paulateschuk'             # 2.5M followers - Celebrity stylist
        ],
        'photographers': [
            'jordanhammond',           # Wedding photographer
            'jenhuangphoto',           # Wedding photographer  
            'bradengunem',             # Wedding photographer
            'sonyakhegay',             # Wedding photographer
            'bethandjacob',            # Wedding photographer
            'the_nickdacostas',        # Wedding photographer
            'photobyjess',             # Wedding photographer
            'rayofsunshinephotography', # Wedding photographer
            'canon',                   # 15M followers - Brand account
            'nikon'                    # 5M followers - Brand account
        ],
        'wedding-planners': [
            'joyproctor',              # Celebrity wedding planner
            'kristinlavoiePlanning',   # Wedding planner
            'ashleydouglasevents',     # Event planning
            'jenniferlauradesign',     # Wedding design
            'theperfectpalette',       # Wedding planning resource
            'coordinatedbykristina',   # Wedding coordinator
            'theknot',                 # 4M followers - Wedding platform
            'weddingwire',             # 1.5M followers - Wedding platform
            'marthastewartweddings',   # 2.5M followers - Wedding content
            'stylemepretty'            # 3.5M followers - Wedding inspiration
        ],
        'florists': [
            'wildflowersinc',          # Wedding florist
            'theflowergirls',          # Floral design
            'petalsandposies',         # Wedding flowers
            'bloomdesigns',            # Floral arrangements
            'floralartistry',          # Wedding florals
            'weddingflowers',          # Wedding specific
            'teleflora',               # 500K followers - Flower delivery
            'ftdflowers',              # 300K followers - Flower service
            'proflowers',              # 200K followers - Flower delivery
            'flowersbyfreshmarket'     # Local florist chain
        ],
        'venues': [
            'theknot',                 # Wedding venue listings
            'weddingwire',             # Venue platform
            'stylemepretty',           # Venue features
            'marthastewartweddings',   # Venue content
            'brooklynbotanicgarden',   # Venue account
            'centralpark',             # NYC venue
            'weddingchicks',           # 2M followers - Wedding content
            'greenweddingshoes',       # 1.8M followers - Wedding blog
            'oncewed',                 # 800K followers - Wedding inspiration
            'junebugweddings'          # 500K followers - Wedding blog
        ],
        'videographers': [
            'stillmotion',             # Wedding videography
            'mattwalkerfilm',          # Wedding films
            'revellerweddings',        # Wedding videography
            'jonathanivyphoto',        # Photo + video
            'mattharveyphoto',         # Wedding content
            'forloveandalways',        # Wedding films
            'nathanielweddings',       # Wedding videographer
            'theweddingfilmco',        # Wedding films
            'weddingfilms',            # Generic wedding films
            'cinematicweddings'        # Cinematic wedding content
        ],
        'caterers': [
            'tastecatering',           # Catering service
            'weddingcakes',            # Wedding catering
            'finedining',              # Fine dining catering
            'gourmetcatering',         # Gourmet services
            'seasonalflavors',         # Seasonal catering
            'artisancatering',         # Artisan catering
            'farmtotable',             # Farm to table
            'custommenus',             # Custom catering
            'chefsplate',              # 300K followers - Meal service
            'blueapron'                # 1.2M followers - Meal service
        ],
        'djs-and-bands': [
            'weddingdj',               # Generic wedding DJ
            'livemusic',               # Live music services
            'weddingband',             # Wedding band
            'djservices',              # DJ services
            'receptionmusic',          # Reception music
            'weddingentertainment',    # Entertainment
            'liveband',                # Live band services
            'musicservices',           # Music services
            'spotify',                 # 4.5M followers - Music platform
            'applemusic'               # 3M followers - Music platform
        ],
        'cake-designers': [
            'customcakes',             # Custom cake design
            'weddingcakes',            # Wedding cakes
            'artisancakes',            # Artisan cakes
            'sweetcreations',          # Sweet creations
            'cakeartistry',            # Cake artistry
            'designercakes',           # Designer cakes
            'gourmetcakes',            # Gourmet cakes
            'specialtycakes',          # Specialty cakes
            'cakesbyjill',             # Individual cake designer
            'charmcitycakes'           # 1M followers - Famous cake shop
        ],
        'bridal-shops': [
            'kleinfeld',               # 1.2M followers - Famous bridal shop
            'davidsbridalofficial',    # 500K followers - Major chain
            'bhldn',                   # 1.5M followers - Bridal retailer
            'pronovias',               # 2M followers - Designer brand
            'maggiesottero',           # 800K followers - Designer brand
            'allurebridal',            # 600K followers - Designer brand
            'morilee',                 # 400K followers - Designer brand
            'justinalexander',         # 300K followers - Designer brand
            'essenseofaustralia',      # 200K followers - Designer brand
            'watters'                  # 300K followers - Designer brand
        ],
        'wedding-decorators': [
            'weddingdecor',            # Wedding decor
            'eventdesign',             # Event design
            'ceremonydecorations',     # Ceremony decor
            'receptiondecor',          # Reception decor
            'floraldecor',             # Floral decor
            'lightingdesign',          # Lighting design
            'eventflowers',            # Event flowers
            'weddingstyling',          # Wedding styling
            'decorativeservices',      # Decorative services
            'theknot'                  # Wedding decoration ideas
        ]
    }
    
    async def run_optimized_mass_collection(self, target_vendors_per_category: int = 100):
        """Run optimized collection targeting specific number of vendors per category"""
        
        logging.info(f"🚀 OPTIMIZED MASS COLLECTION STARTING")
        logging.info(f"🎯 Target: {target_vendors_per_category} vendors per category")
        logging.info(f"📊 Total Target: {len(self.ALL_CATEGORIES) * target_vendors_per_category} vendors")
        logging.info(f"💡 Strategy: Profile-based collection with maximum data extraction")
        
        results = {}
        total_collected = 0
        
        for i, category in enumerate(self.ALL_CATEGORIES):
            logging.info(f"\n🎭 CATEGORY {i+1}/{len(self.ALL_CATEGORIES)}: {category.upper()}")
            logging.info("=" * 60)
            
            # Check current count
            current_count = self.get_category_count(category)
            needed = max(0, target_vendors_per_category - current_count)
            
            if needed <= 0:
                logging.info(f"✅ {category}: Already has {current_count} vendors (target: {target_vendors_per_category})")
                results[category] = 0
                continue
            
            logging.info(f"📊 Current: {current_count} vendors")
            logging.info(f"🎯 Need: {needed} more vendors")
            
            # Get seed profiles for this category
            seed_profiles = self.OPTIMIZED_SEED_PROFILES.get(category, [])
            
            if not seed_profiles:
                logging.warning(f"⚠️  No seed profiles for {category}, skipping")
                results[category] = 0
                continue
            
            logging.info(f"🌱 Using {len(seed_profiles)} seed profiles")
            
            # Collect from seed profiles
            category_collected = 0
            
            # Process seed profiles in batches to maximize efficiency
            for j, profile in enumerate(seed_profiles):
                if category_collected >= needed:
                    logging.info(f"✅ Reached target for {category}")
                    break
                
                try:
                    logging.info(f"   🔍 Processing seed {j+1}/{len(seed_profiles)}: @{profile}")
                    
                    # Enhanced profile collection with maximum data extraction
                    collected = await self.collect_from_profile_optimized(profile, category, needed - category_collected)
                    category_collected += collected
                    
                    logging.info(f"   📊 Collected {collected} vendors from @{profile} (total: {category_collected})")
                    
                    # Rate limiting between profiles
                    await asyncio.sleep(30)  # 30 seconds between profiles
                    
                except Exception as e:
                    logging.error(f"   ❌ Error processing @{profile}: {e}")
                    continue
            
            results[category] = category_collected
            total_collected += category_collected
            
            logging.info(f"🏆 {category}: {category_collected} vendors collected")
            
            # Break between categories
            if i < len(self.ALL_CATEGORIES) - 1:
                logging.info(f"⏳ Waiting 2 minutes before next category...")
                await asyncio.sleep(120)
        
        # Final summary
        logging.info(f"\n🎉 OPTIMIZED MASS COLLECTION COMPLETE!")
        logging.info("=" * 60)
        logging.info(f"📊 RESULTS BY CATEGORY:")
        
        for category, count in results.items():
            final_count = self.get_category_count(category)
            status = "✅" if final_count >= target_vendors_per_category else "📝"
            logging.info(f"   {status} {category:20} +{count:3} new ({final_count:3} total)")
        
        logging.info(f"\n🏆 TOTAL COLLECTED: {total_collected} new vendors")
        
        # Database summary
        total_db = self.get_total_vendor_count()
        logging.info(f"📈 TOTAL DATABASE: {total_db} vendors")
        
        return results
    
    def get_category_count(self, category: str) -> int:
        """Get current vendor count for a category"""
        try:
            result = self.db_manager.client.table('instagram_vendors')\
                .select('*', count='exact')\
                .eq('category', category)\
                .execute()
            return result.count
        except Exception as e:
            logging.error(f"Error getting count for {category}: {e}")
            return 0
    
    def get_total_vendor_count(self) -> int:
        """Get total vendor count across all categories"""
        try:
            result = self.db_manager.client.table('instagram_vendors')\
                .select('*', count='exact')\
                .execute()
            return result.count
        except Exception as e:
            logging.error(f"Error getting total count: {e}")
            return 0
    
    async def collect_from_profile_optimized(self, profile_handle: str, category: str, max_needed: int) -> int:
        """Optimized collection from a single profile with maximum data extraction"""
        
        try:
            # Enhanced input config to maximize data extraction
            input_config = {
                "directUrls": [f"https://www.instagram.com/{profile_handle}/"],
                "resultsType": "details",
                "resultsLimit": 1,
                "addParentData": True,           # Get additional context
                "addMetadata": True,            # Get all available metadata
                "enhanceUserSearchWithFacebookPage": True,  # Cross-platform data
                "proxyConfiguration": {
                    "useApifyProxy": True,
                    "apifyProxyGroups": ["RESIDENTIAL"]
                }
            }
            
            # Run collection
            run_id = await self.apify_manager.run_instagram_scraper(input_config)
            run_data = self.apify_manager.wait_for_completion(run_id, timeout=180)
            
            dataset_id = run_data['defaultDatasetId']
            raw_profiles = self.apify_manager.get_dataset_items(dataset_id)
            
            if not raw_profiles or 'error' in str(raw_profiles[0]):
                logging.warning(f"   ⚠️  No data for @{profile_handle}")
                return 0
            
            # Process the profile data
            processed = self.process_enhanced_profiles(
                raw_profiles, category, f"seed_{profile_handle}", max_results=max_needed
            )
            
            return processed
            
        except Exception as e:
            logging.error(f"Error collecting from @{profile_handle}: {e}")
            return 0
    
    def process_enhanced_profiles(self, raw_profiles: List[Dict], category: str, context: str, max_results: int = 10) -> int:
        """Enhanced profile processing with better location detection and data extraction"""
        
        processed_count = 0
        existing_handles = self.db_manager.get_existing_handles(category)
        
        for profile_data in raw_profiles:
            if processed_count >= max_results:
                break
            
            try:
                # Enhanced field mapping for Instagram data
                handle = (profile_data.get('ownerUsername') or 
                         profile_data.get('username') or 
                         profile_data.get('handle', '')).lower()
                
                if not handle or handle in existing_handles:
                    continue
                
                # Enhanced quality scoring
                quality_score = self.calculate_enhanced_quality_score(profile_data, category)
                
                if quality_score < 2:  # Very lenient threshold for mass collection
                    continue
                
                # Enhanced data extraction
                bio = profile_data.get('ownerBio') or profile_data.get('bio', '')
                follower_count = (profile_data.get('ownerFollowersCount') or 
                                profile_data.get('followersCount', 0))
                
                # Enhanced location detection
                city, state = self.extract_enhanced_location(bio, profile_data)
                
                # Enhanced contact extraction
                external_url = (profile_data.get('ownerExternalUrl') or 
                              profile_data.get('externalUrl'))
                email, phone = self.extract_enhanced_contact(bio, external_url)
                
                # Enhanced business name extraction
                business_name = self.extract_enhanced_business_name(bio, handle, profile_data)
                
                # Create vendor record
                vendor = InstagramVendor(
                    instagram_handle=handle,
                    business_name=business_name,
                    category=category,
                    subcategory=self.determine_enhanced_subcategory(bio, category),
                    bio=bio[:500] if bio else '',
                    website_url=external_url,
                    email=email,
                    phone=phone,
                    follower_count=follower_count,
                    post_count=(profile_data.get('ownerPostsCount') or 
                              profile_data.get('postsCount', 0)),
                    is_verified=(profile_data.get('ownerIsVerified') or 
                               profile_data.get('verified', False)),
                    is_business_account=(profile_data.get('ownerIsBusinessAccount') or 
                                       profile_data.get('isBusinessAccount', False)),
                    profile_image_url=(profile_data.get('ownerProfilePicUrl') or 
                                     profile_data.get('profilePicUrl', '')),
                    city=city,
                    state=state,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                # Save to database
                if self.db_manager.upsert_vendor(vendor):
                    processed_count += 1
                    existing_handles.append(handle)
                
            except Exception as e:
                logging.error(f"Error processing profile in {context}: {e}")
                continue
        
        return processed_count
    
    def extract_enhanced_location(self, bio: str, profile_data: Dict) -> Tuple[str, str]:
        """Enhanced location extraction from bio and profile data"""
        city, state = None, None
        
        if bio:
            # Enhanced location patterns
            import re
            
            # US State patterns
            state_patterns = [
                r'\b(California|CA|New York|NY|Texas|TX|Florida|FL|Illinois|IL)\b',
                r'\b(Pennsylvania|PA|Ohio|OH|Georgia|GA|North Carolina|NC|Michigan|MI)\b',
                r'\b(Washington|WA|Arizona|AZ|Massachusetts|MA|Tennessee|TN|Indiana|IN)\b',
                r'\b(Missouri|MO|Maryland|MD|Wisconsin|WI|Colorado|CO|Minnesota|MN)\b'
            ]
            
            for pattern in state_patterns:
                match = re.search(pattern, bio, re.IGNORECASE)
                if match:
                    state_abbrev = {
                        'California': 'CA', 'New York': 'NY', 'Texas': 'TX', 'Florida': 'FL',
                        'Illinois': 'IL', 'Pennsylvania': 'PA', 'Ohio': 'OH', 'Georgia': 'GA',
                        'North Carolina': 'NC', 'Michigan': 'MI', 'Washington': 'WA',
                        'Arizona': 'AZ', 'Massachusetts': 'MA', 'Tennessee': 'TN',
                        'Indiana': 'IN', 'Missouri': 'MO', 'Maryland': 'MD',
                        'Wisconsin': 'WI', 'Colorado': 'CO', 'Minnesota': 'MN'
                    }
                    state = state_abbrev.get(match.group(1), match.group(1))
                    break
            
            # City patterns
            city_patterns = [
                r'\b(New York|NYC|Los Angeles|LA|Chicago|Miami|San Francisco|Boston)\b',
                r'\b(Seattle|Austin|Nashville|Denver|Atlanta|Dallas|Houston|Phoenix)\b',
                r'\b(Philadelphia|San Diego|Charlotte|Portland|Las Vegas|Orlando)\b'
            ]
            
            for pattern in city_patterns:
                match = re.search(pattern, bio, re.IGNORECASE)
                if match:
                    city_map = {
                        'NYC': 'New York', 'LA': 'Los Angeles'
                    }
                    city = city_map.get(match.group(1), match.group(1))
                    break
        
        return city, state
    
    def extract_enhanced_contact(self, bio: str, external_url: str) -> Tuple[str, str]:
        """Enhanced contact information extraction"""
        email, phone = None, None
        
        if bio:
            import re
            
            # Enhanced email patterns
            email_patterns = [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                r'\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b'
            ]
            
            for pattern in email_patterns:
                match = re.search(pattern, bio)
                if match:
                    email = match.group(0).replace(' ', '').lower()
                    break
            
            # Enhanced phone patterns
            phone_patterns = [
                r'\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b',
                r'\b(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})\b',
                r'\b(\+1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b'
            ]
            
            for pattern in phone_patterns:
                match = re.search(pattern, bio)
                if match:
                    phone = match.group(0)
                    break
        
        return email, phone
    
    def extract_enhanced_business_name(self, bio: str, handle: str, profile_data: Dict) -> str:
        """Enhanced business name extraction"""
        
        # Try full name first
        full_name = profile_data.get('ownerFullName') or profile_data.get('fullName', '')
        if full_name and len(full_name) < 50:
            return full_name
        
        # Try first line of bio
        if bio:
            lines = bio.split('\n')
            first_line = lines[0].strip()
            if (first_line and 
                len(first_line) < 50 and 
                not first_line.startswith('@') and 
                not first_line.startswith('#')):
                return first_line
        
        # Fallback to cleaned handle
        return handle.replace('_', ' ').replace('.', ' ').title()

# Command line runner
async def run_optimized_collection():
    """Run the optimized mass collection"""
    
    print("🚀 OPTIMIZED MASS INSTAGRAM COLLECTION")
    print("=" * 60)
    print("Strategy: Maximum data extraction per API call")
    print("Target: 100 vendors per category (1,200 total)")
    
    collector = OptimizedMassCollector()
    
    results = await collector.run_optimized_mass_collection(target_vendors_per_category=100)
    
    print(f"\n🎉 Collection Complete!")
    print(f"Results: {results}")

if __name__ == "__main__":
    asyncio.run(run_optimized_collection())