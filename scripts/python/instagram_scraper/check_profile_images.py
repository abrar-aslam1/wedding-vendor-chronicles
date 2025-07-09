#!/usr/bin/env python3
"""
Check Instagram vendor profile images in database
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def check_profile_images():
    """Check profile image URLs for Instagram vendors"""
    
    print("📸 CHECKING INSTAGRAM PROFILE IMAGES")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    print(f"Debug - URL: {'✅ Set' if url else '❌ Missing'}")
    print(f"Debug - Key: {'✅ Set' if key else '❌ Missing'}")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        print("Available env vars:", [k for k in os.environ.keys() if 'SUPABASE' in k])
        return
    
    supabase: Client = create_client(url, key)
    
    # Get Instagram vendors with their profile image URLs
    response = supabase.table('instagram_vendors')\
        .select('instagram_handle, business_name, profile_image_url, category')\
        .limit(20)\
        .execute()
    
    if not response.data:
        print("❌ No Instagram vendors found")
        return
    
    print(f"📊 Checking {len(response.data)} Instagram vendors:")
    print()
    
    has_image = 0
    no_image = 0
    
    for vendor in response.data:
        handle = vendor['instagram_handle']
        business_name = vendor['business_name']
        profile_image_url = vendor.get('profile_image_url')
        category = vendor['category']
        
        if profile_image_url and len(profile_image_url.strip()) > 0:
            print(f"✅ @{handle} ({category})")
            print(f"    Business: {business_name}")
            print(f"    Image URL: {profile_image_url[:80]}...")
            has_image += 1
        else:
            print(f"❌ @{handle} ({category})")
            print(f"    Business: {business_name}")
            print(f"    Image URL: None/Empty")
            no_image += 1
        print()
    
    print("=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   ✅ Vendors with profile images: {has_image}")
    print(f"   ❌ Vendors without profile images: {no_image}")
    print(f"   📈 Success rate: {(has_image / len(response.data) * 100):.1f}%")
    
    # Check if manually added Dallas vendors have images
    print(f"\n🏪 CHECKING MANUALLY ADDED DALLAS VENDORS:")
    dallas_response = supabase.table('instagram_vendors')\
        .select('instagram_handle, business_name, profile_image_url')\
        .eq('city', 'Dallas')\
        .execute()
    
    if dallas_response.data:
        print(f"Found {len(dallas_response.data)} Dallas vendors:")
        for vendor in dallas_response.data:
            handle = vendor['instagram_handle']
            profile_image_url = vendor.get('profile_image_url')
            status = "✅" if profile_image_url else "❌"
            print(f"   {status} @{handle}")
    
    return has_image, no_image

if __name__ == "__main__":
    check_profile_images()