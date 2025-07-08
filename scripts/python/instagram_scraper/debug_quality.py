#!/usr/bin/env python3
"""
Debug the quality scoring to see why profiles aren't being saved
"""

import requests
import json
import time
import os
from dotenv import load_dotenv
from enterprise_collection import QualityController

load_dotenv()

def debug_profile_data():
    """Get actual Instagram data and debug the quality scoring"""
    
    token = os.getenv('APIFY_TOKEN')
    base_url = "https://api.apify.com/v2"
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test with Pat McGrath (we know this profile exists)
    config = {
        "directUrls": ["https://www.instagram.com/patmcgrathreal/"],
        "resultsType": "details",
        "resultsLimit": 1,
        "addParentData": False,
        "proxyConfiguration": {
            "useApifyProxy": True
        }
    }
    
    print("🔍 Debugging Instagram profile data and quality scoring")
    print("=" * 60)
    
    try:
        # Start scraper
        run_url = f"{base_url}/acts/shu8hvrXbJbY3Eb9W/runs"
        response = requests.post(run_url, json=config, headers=headers)
        
        if response.status_code == 201:
            run_data = response.json()
            run_id = run_data['data']['id']
            print(f"✅ Started run: {run_id}")
            
            # Wait for completion
            max_wait = 60
            waited = 0
            
            while waited < max_wait:
                time.sleep(5)
                waited += 5
                
                status_url = f"{base_url}/actor-runs/{run_id}"
                status_response = requests.get(status_url, headers=headers)
                
                if status_response.status_code == 200:
                    status_data = status_response.json()['data']
                    
                    if status_data['status'] == 'SUCCEEDED':
                        # Get results
                        dataset_id = status_data['defaultDatasetId']
                        dataset_url = f"{base_url}/datasets/{dataset_id}/items"
                        dataset_response = requests.get(dataset_url, headers=headers)
                        
                        if dataset_response.status_code == 200:
                            items = dataset_response.json()
                            
                            if items and 'error' not in items[0]:
                                profile = items[0]
                                
                                print(f"\n📊 Raw Instagram Data:")
                                print("-" * 30)
                                print(f"Username: {profile.get('username', 'N/A')}")
                                print(f"Full Name: {profile.get('fullName', 'N/A')}")
                                print(f"Bio: {profile.get('bio', 'N/A')}")
                                print(f"Followers: {profile.get('followersCount', 0):,}")
                                print(f"Following: {profile.get('followsCount', 0):,}")
                                print(f"Posts: {profile.get('postsCount', 0):,}")
                                print(f"External URL: {profile.get('externalUrl', 'N/A')}")
                                print(f"Verified: {profile.get('verified', False)}")
                                print(f"Business: {profile.get('isBusinessAccount', False)}")
                                
                                # Debug quality scoring
                                print(f"\n🎯 Quality Score Analysis:")
                                print("-" * 30)
                                
                                # Test both categories
                                for category in ['makeup-artists', 'hair-stylists']:
                                    score = QualityController.calculate_quality_score(profile, category)
                                    print(f"{category}: {score}/10")
                                    
                                    # Break down the scoring
                                    bio = profile.get('bio', '').lower()
                                    
                                    if category == 'makeup-artists':
                                        keywords = ['bridal', 'bride', 'wedding', 'makeup artist', 'mua', 'beauty']
                                    elif category == 'hair-stylists':
                                        keywords = ['bridal', 'bride', 'wedding', 'hair stylist', 'hairstylist', 'updo']
                                    
                                    bio_matches = [keyword for keyword in keywords if keyword in bio]
                                    print(f"  Bio keywords found: {bio_matches}")
                                    
                                    # Check followers
                                    followers = profile.get('followersCount', 0)
                                    print(f"  Follower score: {min(2, (1 if followers > 1000 else 0) + (1 if followers > 5000 else 0))}/2")
                                    
                                    # Check activity
                                    posts = profile.get('postsCount', 0)
                                    print(f"  Activity score: {min(2, (1 if posts > 50 else 0) + (1 if posts > 200 else 0))}/2")
                                    
                                    # Check business indicators
                                    business_score = 0
                                    if profile.get('externalUrl'):
                                        business_score += 1
                                        print(f"  Has external URL: +1")
                                    if profile.get('verified'):
                                        business_score += 1
                                        print(f"  Verified: +1")
                                    if profile.get('isBusinessAccount'):
                                        business_score += 1
                                        print(f"  Business account: +1")
                                    
                                    print(f"  Business indicators: {business_score}/3")
                                    print(f"  Quality threshold: 4")
                                    print(f"  Passes: {'✅' if score >= 4 else '❌'}")
                                    print()
                                
                                return profile
                            else:
                                print(f"❌ Error in data: {items[0] if items else 'No items'}")
                        break
                        
                    elif status_data['status'] == 'FAILED':
                        print(f"❌ Run failed: {status_data.get('statusMessage')}")
                        break
        else:
            print(f"❌ Failed to start: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def suggest_improvements():
    """Suggest ways to improve quality scoring"""
    
    print(f"\n💡 Suggestions to Improve Collection:")
    print("-" * 40)
    print("1. Lower quality threshold from 4 to 3")
    print("2. Add more keyword variations")
    print("3. Use different scoring criteria for celebrities vs local vendors")
    print("4. Focus on business accounts specifically")
    print("5. Add location-based scoring")

if __name__ == "__main__":
    profile_data = debug_profile_data()
    suggest_improvements()