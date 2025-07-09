#!/usr/bin/env python3
"""
Debug the search functionality by checking database values
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def debug_search():
    """Debug the search functionality"""
    
    print("🔍 DEBUGGING SEARCH FUNCTIONALITY")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Check what cities and states are in the database
    print("📊 Checking city and state values in database:")
    
    response = supabase.table('instagram_vendors')\
        .select('city, state, category, instagram_handle, business_name')\
        .execute()
    
    if not response.data:
        print("❌ No vendors found in database")
        return
    
    # Get unique city/state combinations
    locations = set()
    for vendor in response.data:
        city = vendor.get('city', 'None')
        state = vendor.get('state', 'None')
        locations.add(f"{city}, {state}")
    
    print(f"📍 Unique locations in database:")
    for location in sorted(locations):
        print(f"  - {location}")
    
    print(f"\n📊 Total vendors: {len(response.data)}")
    
    # Test specific searches
    print("\n🔍 Testing specific searches:")
    
    # Test florists in Dallas
    print("\n1. Testing florists in Dallas, TX:")
    florists = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('category', 'florists')\
        .eq('city', 'Dallas')\
        .eq('state', 'TX')\
        .execute()
    
    print(f"   Found {len(florists.data)} florists with exact match")
    
    # Test with ilike (case insensitive)
    print("\n2. Testing florists with ilike:")
    florists_ilike = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('category', 'florists')\
        .ilike('city', '%Dallas%')\
        .ilike('state', '%TX%')\
        .execute()
    
    print(f"   Found {len(florists_ilike.data)} florists with ilike")
    
    if florists_ilike.data:
        for vendor in florists_ilike.data:
            print(f"   ✅ @{vendor['instagram_handle']} - {vendor['business_name']}")
            print(f"       City: '{vendor.get('city', 'None')}', State: '{vendor.get('state', 'None')}'")
    
    # Test makeup artists
    print("\n3. Testing makeup artists:")
    makeup = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('category', 'makeup-artists')\
        .ilike('city', '%Dallas%')\
        .ilike('state', '%TX%')\
        .execute()
    
    print(f"   Found {len(makeup.data)} makeup artists")
    
    if makeup.data:
        for vendor in makeup.data[:3]:  # Show first 3
            print(f"   ✅ @{vendor['instagram_handle']} - {vendor['business_name']}")
            print(f"       City: '{vendor.get('city', 'None')}', State: '{vendor.get('state', 'None')}'")

if __name__ == "__main__":
    debug_search()