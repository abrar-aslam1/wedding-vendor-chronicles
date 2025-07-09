#!/usr/bin/env python3
"""
Test collection for a single category in Dallas with better hashtags
"""

import asyncio
import logging
import sys
from datetime import datetime
from local_vendor_collector import LocalVendorCollector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'single_category_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

async def test_single_category():
    """Test collection for photographers in Dallas with optimized hashtags"""
    
    print("📸 TESTING SINGLE CATEGORY COLLECTION")
    print("=" * 60)
    print("Category: Photographers")
    print("Location: Dallas, TX")
    print("Strategy: Use broader, more popular hashtags")
    print("=" * 60)
    
    collector = LocalVendorCollector()
    
    # Test with more popular hashtags that are likely to have results
    popular_hashtags = [
        "#dallaswedding",
        "#dallasphotographer", 
        "#texaswedding",
        "#dallasbride",
        "#weddingphotography",
        "#dallasweddingphotographer"
    ]
    
    print(f"\nUsing popular hashtags: {popular_hashtags}")
    
    # Create a manual configuration with broader search
    input_config = {
        "addParentData": False,
        "directUrls": [],
        "enhanceUserSearchWithFacebookPage": False,
        "isUserReelFeedURL": False,
        "isUserTaggedFeedURL": False,
        "resultsLimit": 20,  # Get more results
        "resultsType": "details",
        "searchLimit": 15,
        "searchType": "hashtag",
        "hashtags": popular_hashtags,
        "searchQueries": [],
        "addMetadata": True,
        "proxyConfiguration": {
            "useApifyProxy": True,
            "apifyProxyGroups": ["RESIDENTIAL"]
        }
    }
    
    try:
        print(f"\n🚀 Starting Instagram scraper...")
        
        # Run scraper directly using the ApifyManager
        run_id = await collector.apify_manager.run_instagram_scraper(input_config)
        print(f"Run ID: {run_id}")
        
        # Wait for completion
        run_data = collector.apify_manager.wait_for_completion(run_id, timeout=180)
        print(f"Run status: {run_data.get('status', 'Unknown')}")
        
        # Get results
        dataset_id = run_data['defaultDatasetId']
        raw_profiles = collector.apify_manager.get_dataset_items(dataset_id)
        
        print(f"\n📊 Raw results: {len(raw_profiles)} profiles")
        
        if raw_profiles:
            print("\n🔍 Analyzing profiles...")
            
            local_count = 0
            quality_count = 0
            
            for i, profile in enumerate(raw_profiles[:10]):  # Analyze first 10
                handle = profile.get('ownerUsername') or profile.get('username', 'Unknown')
                followers = profile.get('ownerFollowersCount') or profile.get('followersCount', 0)
                bio = profile.get('ownerBio') or profile.get('bio', '')
                
                # Check local indicators
                has_local = collector.has_local_indicators(profile, "Dallas", "TX")
                quality_score = collector.calculate_local_quality_score(profile, "photographers", "Dallas")
                
                if has_local:
                    local_count += 1
                if quality_score >= collector.QUALITY_THRESHOLD_LOCAL:
                    quality_count += 1
                
                print(f"\n{i+1}. @{handle}")
                print(f"   Followers: {followers:,}")
                print(f"   Local indicators: {'✅' if has_local else '❌'}")
                print(f"   Quality score: {quality_score}/12")
                print(f"   Bio: {bio[:100]}...")
            
            print(f"\n📈 ANALYSIS SUMMARY:")
            print(f"   Total profiles: {len(raw_profiles)}")
            print(f"   Local indicators: {local_count}/{min(10, len(raw_profiles))}")
            print(f"   Quality threshold met: {quality_count}/{min(10, len(raw_profiles))}")
            
            # Now process the profiles using the collector's logic
            print(f"\n🔧 Processing profiles through local collector...")
            processed_count = collector.process_local_profiles(
                raw_profiles, "photographers", "Dallas", "TX", target_count=5
            )
            
            print(f"✅ Successfully processed: {processed_count} vendors")
            
        else:
            print("\n❌ No profiles returned")
            print("This could indicate:")
            print("  1. Instagram rate limiting")
            print("  2. Hashtags have no posts") 
            print("  3. Actor configuration issues")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        logging.exception("Full error:")

if __name__ == "__main__":
    asyncio.run(test_single_category())