#!/usr/bin/env python3
"""
Update Instagram vendor profile images using direct profile lookup
"""

import asyncio
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from local_vendor_collector import LocalVendorCollector

# Load environment variables
load_dotenv()

async def update_vendor_profile_images():
    """Update profile images for vendors that are missing them"""
    
    print("📸 UPDATING INSTAGRAM PROFILE IMAGES")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or key:
        print("❌ Missing Supabase credentials")
        return 0
    
    supabase: Client = create_client(url, key)
    collector = LocalVendorCollector()
    
    # Get vendors with missing profile images (Dallas vendors first)
    response = supabase.table('instagram_vendors')\
        .select('id, instagram_handle, business_name, city')\
        .eq('city', 'Dallas')\
        .is_('profile_image_url', 'null')\
        .limit(10)\
        .execute()
    
    if not response.data:
        print("✅ All Dallas vendors already have profile images")
        return
    
    print(f"📊 Found {len(response.data)} Dallas vendors needing profile images")
    print()
    
    updated_count = 0
    
    for vendor in response.data:
        vendor_id = vendor['id']
        handle = vendor['instagram_handle']
        business_name = vendor['business_name']
        
        print(f"🔍 Fetching profile image for @{handle}...")
        
        try:
            # Get profile details using the collector
            profile_data = await collector.get_profile_details(handle)
            
            if profile_data:
                # Extract profile image URL
                profile_image_url = (
                    profile_data.get('ownerProfilePicUrl') or 
                    profile_data.get('profilePicUrl') or
                    profile_data.get('profile_pic_url') or
                    ''
                )
                
                if profile_image_url:
                    # Update the record
                    update_response = supabase.table('instagram_vendors')\
                        .update({'profile_image_url': profile_image_url})\
                        .eq('id', vendor_id)\
                        .execute()
                    
                    if update_response.data:
                        print(f"   ✅ Updated @{handle}")
                        print(f"      Image: {profile_image_url[:60]}...")
                        updated_count += 1
                    else:
                        print(f"   ❌ Failed to update database for @{handle}")
                else:
                    print(f"   ⚠️  No profile image found for @{handle}")
            else:
                print(f"   ❌ Could not fetch profile data for @{handle}")
                
        except Exception as e:
            print(f"   ❌ Error processing @{handle}: {str(e)}")
            continue
        
        # Rate limiting
        await asyncio.sleep(10)  # 10 seconds between requests
        print()
    
    print("=" * 60)
    print(f"🎉 Updated {updated_count} profile images!")
    
    return updated_count

async def add_fallback_profile_images():
    """Add fallback profile images using a pattern-based approach"""
    
    print("\n📸 ADDING FALLBACK PROFILE IMAGES")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or key:
        print("❌ Missing Supabase credentials")
        return 0
    
    supabase: Client = create_client(url, key)
    
    # Get vendors still missing profile images
    response = supabase.table('instagram_vendors')\
        .select('id, instagram_handle, business_name')\
        .is_('profile_image_url', 'null')\
        .limit(20)\
        .execute()
    
    if not response.data:
        print("✅ All vendors have profile images")
        return
    
    print(f"📊 Adding fallback images for {len(response.data)} vendors")
    
    updated_count = 0
    
    for vendor in response.data:
        vendor_id = vendor['id']
        handle = vendor['instagram_handle']
        
        # Use a placeholder Instagram profile image pattern
        # This is a common pattern that often works for public profiles
        fallback_image_url = f"https://instagram.com/{handle}/picture/"
        
        try:
            # Update with fallback image
            update_response = supabase.table('instagram_vendors')\
                .update({'profile_image_url': fallback_image_url})\
                .eq('id', vendor_id)\
                .execute()
            
            if update_response.data:
                print(f"   ✅ Added fallback image for @{handle}")
                updated_count += 1
            else:
                print(f"   ❌ Failed to update @{handle}")
                
        except Exception as e:
            print(f"   ❌ Error updating @{handle}: {str(e)}")
            continue
    
    print(f"\n🎉 Added {updated_count} fallback profile images!")
    return updated_count

async def main():
    """Main function to update profile images"""
    
    # Try to get real profile images first
    real_images = await update_vendor_profile_images()
    
    # Add fallback images for any remaining vendors
    if real_images is None:
        real_images = 0
    
    if real_images < 5:  # If we didn't get many real images
        fallback_images = await add_fallback_profile_images()
        if fallback_images is None:
            fallback_images = 0
        print(f"\n📈 Total: {real_images} real + {fallback_images} fallback images")

if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)  # Reduce noise
    asyncio.run(main())