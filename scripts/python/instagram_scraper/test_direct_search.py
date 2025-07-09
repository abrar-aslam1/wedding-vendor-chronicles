#!/usr/bin/env python3
"""
Test direct search functionality that mimics the edge function logic
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_direct_search():
    """Test search functionality directly against the database"""
    
    print("🔍 TESTING DIRECT SEARCH (mimicking edge function)")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Test parameters
    test_cases = [
        ("florist", "Dallas, TX"),
        ("makeup", "Dallas, TX"),
        ("wedding planner", "Dallas, TX"),
        ("venue", "Dallas, TX"),
        ("cake", "Dallas, TX")
    ]
    
    # Category mapping (from the edge function)
    def getVendorCategory(keyword):
        keyword_lower = keyword.lower()
        if 'photographer' in keyword_lower or 'photography' in keyword_lower or 'photo' in keyword_lower:
            return 'photographers'
        if 'wedding planner' in keyword_lower or 'planner' in keyword_lower:
            return 'wedding-planners'
        if 'videographer' in keyword_lower or 'videography' in keyword_lower or 'video' in keyword_lower:
            return 'videographers'
        if 'florist' in keyword_lower or 'floral' in keyword_lower:
            return 'florists'
        if 'caterer' in keyword_lower or 'catering' in keyword_lower:
            return 'caterers'
        if 'venue' in keyword_lower:
            return 'venues'
        if 'dj' in keyword_lower or 'band' in keyword_lower or 'music' in keyword_lower:
            return 'djs-and-bands'
        if 'cake' in keyword_lower:
            return 'cake-designers'
        if 'bridal' in keyword_lower:
            return 'bridal-shops'
        if 'makeup' in keyword_lower:
            return 'makeup-artists'
        if 'hair' in keyword_lower:
            return 'hair-stylists'
        return None
    
    for keyword, location in test_cases:
        print(f"\n🔍 Testing: {keyword} in {location}")
        print("-" * 40)
        
        # Parse location (mimicking edge function logic)
        city, state = location.split(',')
        city = city.strip()
        state = state.strip()
        
        # Get vendor category
        vendor_category = getVendorCategory(keyword)
        print(f"   📂 Category mapping: {keyword} -> {vendor_category}")
        
        if not vendor_category:
            print(f"   ❌ No category mapping found")
            continue
        
        # Build query (mimicking edge function logic)
        query = supabase.table('instagram_vendors').select('*').eq('category', vendor_category)
        
        # Apply location filters
        if city and state:
            query = query.ilike('city', f'%{city}%').ilike('state', f'%{state}%')
        
        # Execute query
        try:
            result = query.limit(20).execute()
            vendors = result.data
            
            print(f"   📊 Found {len(vendors)} vendors")
            
            if vendors:
                for vendor in vendors[:3]:  # Show first 3
                    print(f"   ✅ @{vendor['instagram_handle']} - {vendor['business_name']}")
                    print(f"       Location: {vendor.get('city', 'N/A')}, {vendor.get('state', 'N/A')}")
            else:
                print(f"   ❌ No vendors found")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    test_direct_search()