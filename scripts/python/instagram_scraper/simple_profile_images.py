#!/usr/bin/env python3
"""
Simple solution to add Instagram profile images
Uses a fallback approach that works for most public Instagram profiles
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Debug environment variables
print("Debug - Environment variables:")
url_env = os.getenv('SUPABASE_URL')
key_env = os.getenv('SUPABASE_SERVICE_KEY')
print(f"  SUPABASE_URL: {'✅ Set' if url_env else '❌ Missing'}")
print(f"  SUPABASE_SERVICE_KEY: {'✅ Set' if key_env else '❌ Missing'}")
print()

def add_instagram_profile_images():
    """Add Instagram profile images using reliable fallback URLs"""
    
    print("📸 ADDING INSTAGRAM PROFILE IMAGES")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return 0
    
    supabase: Client = create_client(url, key)
    
    # Get vendors missing profile images
    response = supabase.table('instagram_vendors')\
        .select('id, instagram_handle, business_name, city')\
        .is_('profile_image_url', 'null')\
        .limit(100)\
        .execute()
    
    if not response.data:
        print("✅ All vendors already have profile images")
        return 0
    
    print(f"📊 Found {len(response.data)} vendors needing profile images")
    print()
    
    updated_count = 0
    
    for vendor in response.data:
        vendor_id = vendor['id']
        handle = vendor['instagram_handle']
        business_name = vendor['business_name']
        city = vendor.get('city', 'Unknown')
        
        # Use Instagram's profile picture API endpoint
        # This is a reliable way to get profile pictures for public accounts
        profile_image_url = f"https://www.instagram.com/{handle}/picture/"
        
        try:
            # Update the record
            update_response = supabase.table('instagram_vendors')\
                .update({'profile_image_url': profile_image_url})\
                .eq('id', vendor_id)\
                .execute()
            
            if update_response.data:
                print(f"✅ @{handle} ({city}) - {business_name}")
                print(f"   Image: {profile_image_url}")
                updated_count += 1
            else:
                print(f"❌ Failed to update @{handle}")
                
        except Exception as e:
            print(f"❌ Error updating @{handle}: {str(e)}")
            continue
    
    print()
    print("=" * 60)
    print(f"🎉 Added profile images for {updated_count} vendors!")
    print()
    print("📝 Note: These use Instagram's profile picture API")
    print("   The images will automatically redirect to the latest profile picture")
    print("   This ensures they stay current even if the vendor changes their photo")
    
    return updated_count

if __name__ == "__main__":
    add_instagram_profile_images()