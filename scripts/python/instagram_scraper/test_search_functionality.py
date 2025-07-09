#!/usr/bin/env python3
"""
Test the search functionality for Dallas vendors in different categories
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_instagram_search(category="florists", city="Dallas", state="TX"):
    """Test the Instagram vendor search functionality"""
    
    print(f"🔍 TESTING INSTAGRAM SEARCH FOR {category.upper()} IN {city}, {state}")
    print("=" * 60)
    
    # Get the Supabase URL and key for the edge function
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials")
        print("Available env vars:", [k for k in os.environ.keys() if 'SUPABASE' in k])
        return
    
    # Construct the edge function URL
    edge_function_url = f"{supabase_url}/functions/v1/search-instagram-vendors"
    
    # Map category to keyword that the function expects
    category_to_keyword = {
        "photographers": "photographer",
        "wedding-planners": "wedding planner",
        "florists": "florist",
        "videographers": "videographer",
        "caterers": "caterer",
        "venues": "venue",
        "djs-and-bands": "dj",
        "cake-designers": "cake",
        "makeup-artists": "makeup",
        "hair-stylists": "hair"
    }
    
    keyword = category_to_keyword.get(category, category)
    location = f"{city}, {state}"
    
    # Test payload (matching the expected format)
    payload = {
        "keyword": keyword,
        "location": location
    }
    
    # Headers
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"📡 Calling edge function...")
        print(f"URL: {edge_function_url}")
        print(f"Payload: {payload}")
        print()
        
        response = requests.post(edge_function_url, json=payload, headers=headers)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            vendors = data.get('vendors', [])
            
            print(f"✅ Search successful!")
            print(f"📊 Found {len(vendors)} vendors")
            print()
            
            if vendors:
                for i, vendor in enumerate(vendors, 1):
                    print(f"#{i}. @{vendor.get('instagram_handle', 'N/A')}")
                    print(f"    Business: {vendor.get('business_name', 'N/A')}")
                    print(f"    Category: {vendor.get('category', 'N/A')}")
                    print(f"    Location: {vendor.get('city', 'N/A')}, {vendor.get('state', 'N/A')}")
                    print(f"    Instagram URL: {vendor.get('instagram_url', 'N/A')}")
                    print(f"    Profile Image: {'✅ Set' if vendor.get('profile_image_url') else '❌ Missing'}")
                    print(f"    Followers: {vendor.get('follower_count', 'N/A')}")
                    print()
            else:
                print("❌ No vendors found in search results")
                
        else:
            print(f"❌ Search failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing search: {str(e)}")

def test_multiple_categories():
    """Test search across multiple categories"""
    
    categories_to_test = [
        "florists",
        "makeup-artists", 
        "wedding-planners",
        "venues",
        "cake-designers"
    ]
    
    print("🧪 TESTING MULTIPLE CATEGORIES")
    print("=" * 60)
    
    for category in categories_to_test:
        print(f"\n🔍 Testing {category}...")
        test_instagram_search(category)
        print("-" * 40)

if __name__ == "__main__":
    # Test florists first (they have verified vendors)
    test_instagram_search("florists")
    
    print("\n" + "=" * 60)
    print("🔄 TESTING OTHER CATEGORIES")
    print("=" * 60)
    
    # Test other categories
    test_multiple_categories()