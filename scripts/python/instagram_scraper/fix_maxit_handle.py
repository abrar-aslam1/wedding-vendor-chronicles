#!/usr/bin/env python3
"""
Fix the incorrect Instagram handle for Maxit Flower Design
Correct handle: @maxitflowerdesign (not @maxit_flowerdesign)
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def fix_maxit_handle():
    """Fix the incorrect Instagram handle for Maxit Flower Design"""
    
    print("🔧 FIXING MAXIT FLOWER DESIGN INSTAGRAM HANDLE")
    print("=" * 60)
    print("Correcting: @maxit_flowerdesign -> @maxitflowerdesign")
    print("User reported URL: https://www.instagram.com/maxitflowerdesign/")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Find the vendor with the incorrect handle
    response = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('instagram_handle', 'maxit_flowerdesign')\
        .eq('business_name', 'Maxit Flower Design')\
        .execute()
    
    if not response.data:
        print("❌ Vendor not found with handle @maxit_flowerdesign")
        
        # Check if it already exists with correct handle
        check_response = supabase.table('instagram_vendors')\
            .select('*')\
            .eq('instagram_handle', 'maxitflowerdesign')\
            .execute()
        
        if check_response.data:
            print("✅ Vendor already exists with correct handle @maxitflowerdesign")
            for vendor in check_response.data:
                print(f"   Business: {vendor['business_name']}")
                print(f"   Instagram URL: {vendor['instagram_url']}")
        return
    
    vendor = response.data[0]
    vendor_id = vendor['id']
    
    print(f"🔍 Found vendor:")
    print(f"   ID: {vendor_id}")
    print(f"   Business: {vendor['business_name']}")
    print(f"   Current handle: @{vendor['instagram_handle']}")
    print(f"   Current Instagram URL: {vendor['instagram_url']}")
    print()
    
    # Update with correct handle and URLs
    correct_handle = 'maxitflowerdesign'
    correct_instagram_url = f"https://www.instagram.com/{correct_handle}/"
    correct_profile_image_url = f"https://www.instagram.com/{correct_handle}/picture/"
    
    try:
        update_response = supabase.table('instagram_vendors')\
            .update({
                'instagram_handle': correct_handle,
                'instagram_url': correct_instagram_url,
                'website_url': correct_instagram_url,
                'profile_image_url': correct_profile_image_url
            })\
            .eq('id', vendor_id)\
            .execute()
        
        if update_response.data:
            print("✅ SUCCESSFULLY UPDATED MAXIT FLOWER DESIGN")
            print(f"   ✅ Handle: @{correct_handle}")
            print(f"   ✅ Instagram URL: {correct_instagram_url}")
            print(f"   ✅ Profile Image: {correct_profile_image_url}")
            print()
            print("🎉 Users can now access the correct Instagram profile!")
        else:
            print("❌ Failed to update vendor")
            
    except Exception as e:
        print(f"❌ Error updating vendor: {str(e)}")

def verify_correction():
    """Verify the correction was applied"""
    
    print("\n🔍 VERIFYING CORRECTION")
    print("=" * 40)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    supabase: Client = create_client(url, key)
    
    # Check the updated vendor
    response = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('business_name', 'Maxit Flower Design')\
        .execute()
    
    if response.data:
        vendor = response.data[0]
        print(f"✅ Verification successful:")
        print(f"   Business: {vendor['business_name']}")
        print(f"   Handle: @{vendor['instagram_handle']}")
        print(f"   Instagram URL: {vendor['instagram_url']}")
        print(f"   Profile Image: {vendor['profile_image_url']}")
        print(f"   City: {vendor['city']}, {vendor['state']}")
        print(f"   Category: {vendor['category']}")
        
        # Test the URL format
        expected_url = "https://www.instagram.com/maxitflowerdesign/"
        if vendor['instagram_url'] == expected_url:
            print(f"   ✅ URL matches user-reported correct URL")
        else:
            print(f"   ⚠️  URL mismatch - Expected: {expected_url}")
    else:
        print("❌ Vendor not found after update")

if __name__ == "__main__":
    fix_maxit_handle()
    verify_correction()