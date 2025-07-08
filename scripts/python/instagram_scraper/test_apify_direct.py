#!/usr/bin/env python3
"""
Test Apify Instagram scraper directly with different approaches
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

def test_apify_actors():
    """Test different Apify Instagram actors to see which ones work"""
    
    token = os.getenv('APIFY_TOKEN')
    base_url = "https://api.apify.com/v2"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Different Instagram scrapers to try
    actors_to_test = [
        {
            "name": "Instagram Scraper",
            "id": "shu8hvrXbJbY3Eb9W",
            "config": {
                "directUrls": ["https://www.instagram.com/explore/tags/bridalmakeup/"],
                "resultsType": "posts",
                "resultsLimit": 10,
                "addParentData": False
            }
        },
        {
            "name": "Instagram Profile Scraper", 
            "id": "apify/instagram-profile-scraper",
            "config": {
                "usernames": ["bridalmakeup", "weddingmakeup"],
                "resultsLimit": 5
            }
        },
        {
            "name": "Instagram Hashtag Scraper",
            "id": "jaroslavhejlek/instagram-hashtag-scraper", 
            "config": {
                "hashtags": ["bridalmakeup"],
                "resultsLimit": 5
            }
        }
    ]
    
    for actor in actors_to_test:
        print(f"\n🔍 Testing {actor['name']} ({actor['id']})")
        print("-" * 50)
        
        try:
            # Start the run
            run_url = f"{base_url}/acts/{actor['id']}/runs"
            response = requests.post(run_url, json=actor['config'], headers=headers)
            
            if response.status_code == 201:
                run_data = response.json()
                run_id = run_data['data']['id']
                print(f"✅ Run started: {run_id}")
                
                # Wait a bit and check status
                time.sleep(10)
                
                status_url = f"{base_url}/actor-runs/{run_id}"
                status_response = requests.get(status_url, headers=headers)
                
                if status_response.status_code == 200:
                    status_data = status_response.json()['data']
                    print(f"   Status: {status_data['status']}")
                    
                    if status_data['status'] in ['SUCCEEDED', 'FAILED']:
                        # Get dataset
                        dataset_id = status_data['defaultDatasetId']
                        dataset_url = f"{base_url}/datasets/{dataset_id}/items"
                        dataset_response = requests.get(dataset_url, headers=headers)
                        
                        if dataset_response.status_code == 200:
                            items = dataset_response.json()
                            print(f"   Results: {len(items)} items found")
                            
                            if items:
                                print(f"   Sample result keys: {list(items[0].keys())}")
                                if 'error' in items[0]:
                                    print(f"   ❌ Error: {items[0].get('error')} - {items[0].get('errorDescription', '')}")
                                else:
                                    print(f"   ✅ Data found!")
                        else:
                            print(f"   ❌ Dataset access failed: {dataset_response.status_code}")
                    else:
                        print(f"   ⏳ Still running...")
                else:
                    print(f"   ❌ Status check failed: {status_response.status_code}")
                    
            elif response.status_code == 404:
                print(f"   ❌ Actor not found")
            elif response.status_code == 401:
                print(f"   ❌ Authentication failed - check API token")
            else:
                print(f"   ❌ Failed to start: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_profile_direct():
    """Test scraping a specific Instagram profile"""
    
    token = os.getenv('APIFY_TOKEN')
    base_url = "https://api.apify.com/v2"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\n🎯 Testing direct profile scraping")
    print("-" * 50)
    
    # Try scraping a known makeup artist profile
    config = {
        "directUrls": ["https://www.instagram.com/patmcgrathreal/"],  # Famous makeup artist
        "resultsType": "details",
        "resultsLimit": 1,
        "addParentData": False,
        "proxyConfiguration": {
            "useApifyProxy": True
        }
    }
    
    try:
        run_url = f"{base_url}/acts/shu8hvrXbJbY3Eb9W/runs"
        response = requests.post(run_url, json=config, headers=headers)
        
        if response.status_code == 201:
            run_data = response.json()
            run_id = run_data['data']['id']
            print(f"✅ Profile scrape started: {run_id}")
            
            # Wait for completion
            max_wait = 60  # 1 minute
            waited = 0
            
            while waited < max_wait:
                time.sleep(5)
                waited += 5
                
                status_url = f"{base_url}/actor-runs/{run_id}"
                status_response = requests.get(status_url, headers=headers)
                
                if status_response.status_code == 200:
                    status_data = status_response.json()['data']
                    print(f"   Status after {waited}s: {status_data['status']}")
                    
                    if status_data['status'] == 'SUCCEEDED':
                        # Get results
                        dataset_id = status_data['defaultDatasetId']
                        dataset_url = f"{base_url}/datasets/{dataset_id}/items"
                        dataset_response = requests.get(dataset_url, headers=headers)
                        
                        if dataset_response.status_code == 200:
                            items = dataset_response.json()
                            print(f"   ✅ Profile data retrieved: {len(items)} items")
                            
                            if items and 'error' not in items[0]:
                                profile = items[0]
                                print(f"   Profile: @{profile.get('username', 'unknown')}")
                                print(f"   Followers: {profile.get('followersCount', 'unknown')}")
                                print(f"   Bio: {profile.get('bio', 'No bio')[:100]}...")
                                return True
                            else:
                                print(f"   ❌ Error in results: {items[0] if items else 'No items'}")
                        
                        break
                        
                    elif status_data['status'] == 'FAILED':
                        print(f"   ❌ Run failed: {status_data.get('statusMessage', 'Unknown error')}")
                        break
        else:
            print(f"   ❌ Failed to start profile scrape: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    return False

if __name__ == "__main__":
    print("🧪 Testing Apify Instagram Scrapers")
    print("=" * 50)
    
    # Test different actors
    test_apify_actors()
    
    # Test direct profile scraping
    success = test_profile_direct()
    
    print(f"\n📋 Summary:")
    if success:
        print("✅ At least one approach worked - Instagram scraping is possible!")
    else:
        print("❌ All approaches failed - Instagram API restrictions are blocking access")
        print("\n🔄 Alternative solutions:")
        print("   1. Try different Apify actors")
        print("   2. Use residential proxies")
        print("   3. Focus on manual vendor curation")
        print("   4. Integrate with business directory APIs")