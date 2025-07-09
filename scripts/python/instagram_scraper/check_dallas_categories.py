#!/usr/bin/env python3
"""
Check Dallas vendors by category (excluding photographers)
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def check_dallas_categories():
    """Check Dallas vendors by category"""
    
    print("📊 DALLAS VENDORS BY CATEGORY (excluding photographers)")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Get Dallas vendors by category (excluding photographers)
    response = supabase.table('instagram_vendors')\
        .select('category, instagram_handle, business_name, instagram_url, profile_image_url')\
        .eq('city', 'Dallas')\
        .neq('category', 'photographers')\
        .execute()
    
    if not response.data:
        print("❌ No Dallas vendors found")
        return
    
    # Group by category
    categories = {}
    for vendor in response.data:
        cat = vendor['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(vendor)
    
    print(f"Found {len(response.data)} Dallas vendors in {len(categories)} categories")
    print()
    
    for category, vendors in categories.items():
        print(f"📸 {category.upper()} ({len(vendors)} vendors):")
        print("-" * 40)
        
        for vendor in vendors:
            handle = vendor['instagram_handle']
            business_name = vendor['business_name']
            instagram_url = vendor['instagram_url']
            profile_image_url = vendor['profile_image_url']
            
            print(f"  ✅ @{handle}")
            print(f"      Business: {business_name}")
            print(f"      Instagram: {instagram_url}")
            print(f"      Profile Image: {'✅ Set' if profile_image_url else '❌ Missing'}")
            print()
        
        print(f"  📊 Total in {category}: {len(vendors)}")
        print()
    
    # Summary
    total_vendors = len(response.data)
    categories_count = len(categories)
    
    print("=" * 60)
    print(f"📈 SUMMARY:")
    print(f"   📊 Total Dallas vendors (non-photographers): {total_vendors}")
    print(f"   📂 Categories: {categories_count}")
    print(f"   🏪 Categories available for testing:")
    
    for category in sorted(categories.keys()):
        print(f"      - {category} ({len(categories[category])} vendors)")

if __name__ == "__main__":
    check_dallas_categories()