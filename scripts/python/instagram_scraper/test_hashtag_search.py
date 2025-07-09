#!/usr/bin/env python3
"""
Test hashtag search functionality with simple Dallas query
"""

import asyncio
import logging
import os
from datetime import datetime
from apify_client import ApifyClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

async def test_simple_hashtag_search():
    """Test basic hashtag search for Dallas photographers"""
    
    print("🔍 TESTING HASHTAG SEARCH")
    print("=" * 60)
    
    # Initialize Apify client
    client = ApifyClient(os.getenv('APIFY_TOKEN'))
    
    # Simple test with just one hashtag
    hashtags = ["#dallasphotographer"]
    
    print(f"Testing with hashtag: {hashtags[0]}")
    
    input_config = {
        "hashtags": hashtags,
        "resultsLimit": 5,  # Just get 5 results for testing
        "resultsType": "details",
        "searchType": "hashtag",
        "searchLimit": 5,
        "addMetadata": True
    }
    
    print(f"\nInput configuration:")
    print(f"  Hashtags: {hashtags}")
    print(f"  Results limit: 5")
    print(f"  Search type: hashtag")
    
    try:
        # Run the actor
        actor_id = 'apify/instagram-scraper'
        print(f"\nStarting Instagram scraper...")
        
        run = client.actor(actor_id).call(
            run_input=input_config,
            timeout_secs=120
        )
        
        print(f"Run ID: {run['id']}")
        print(f"Status: {run['status']}")
        
        # Get results
        if run['status'] == 'SUCCEEDED':
            # Get dataset
            dataset_id = run['defaultDatasetId']
            print(f"Dataset ID: {dataset_id}")
            
            # Get items
            items = list(client.dataset(dataset_id).iterate_items())
            
            print(f"\nResults found: {len(items)}")
            
            if items:
                print("\nSample results:")
                for i, item in enumerate(items[:3]):
                    username = item.get('ownerUsername') or item.get('username', 'N/A')
                    followers = item.get('ownerFollowersCount') or item.get('followersCount', 0)
                    bio = item.get('ownerBio') or item.get('bio', 'No bio')
                    
                    print(f"\n{i+1}. @{username}")
                    print(f"   Followers: {followers}")
                    print(f"   Bio: {bio[:100]}...")
            else:
                print("\n❌ No results returned")
                print("This could be due to:")
                print("  1. API rate limits")
                print("  2. Invalid API key")
                print("  3. Instagram blocking the scraper")
                print("  4. Hashtag doesn't exist or has no posts")
        else:
            print(f"\n❌ Run failed with status: {run['status']}")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        logging.exception("Full error:")

if __name__ == "__main__":
    # Check if API key is set
    if not os.getenv('APIFY_TOKEN'):
        print("❌ APIFY_TOKEN environment variable not set!")
        print("Please set it using:")
        print("export APIFY_TOKEN='your-api-key-here'")
    else:
        asyncio.run(test_simple_hashtag_search())