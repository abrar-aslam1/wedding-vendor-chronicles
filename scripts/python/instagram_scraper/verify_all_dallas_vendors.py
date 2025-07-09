#!/usr/bin/env python3
"""
Verification script to check all Dallas vendors are real and exist on Instagram
Only keeps verified vendors that can actually be found
"""

import os
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def check_instagram_exists(handle):
    """Check if an Instagram handle actually exists"""
    try:
        # Try to access the Instagram profile page
        url = f"https://www.instagram.com/{handle}/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        # Check if the page loads successfully
        if response.status_code == 200:
            # Check if it's not a "user not found" page
            if "Sorry, this page isn't available." not in response.text:
                return True
        
        return False
        
    except Exception as e:
        print(f"    ⚠️  Error checking @{handle}: {str(e)}")
        return False

def verify_all_dallas_vendors():
    """Verify all Dallas vendors are real and exist on Instagram"""
    
    print("🔍 VERIFYING ALL DALLAS VENDORS")
    print("=" * 60)
    print("Checking each vendor's Instagram profile to ensure they exist")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Get all Dallas vendors
    response = supabase.table('instagram_vendors')\
        .select('id, instagram_handle, business_name, category, instagram_url')\
        .eq('city', 'Dallas')\
        .eq('state', 'TX')\
        .execute()
    
    if not response.data:
        print("❌ No Dallas vendors found")
        return
    
    print(f"📊 Found {len(response.data)} Dallas vendors to verify")
    print()
    
    verified_vendors = []
    invalid_vendors = []
    
    for vendor in response.data:
        vendor_id = vendor['id']
        handle = vendor['instagram_handle']
        business_name = vendor['business_name']
        category = vendor['category']
        
        print(f"🔍 Checking @{handle} ({business_name})")
        print(f"    Category: {category}")
        
        # Check if Instagram profile exists
        if check_instagram_exists(handle):
            print(f"    ✅ VERIFIED - Profile exists")
            verified_vendors.append(vendor)
        else:
            print(f"    ❌ INVALID - Profile not found or inaccessible")
            invalid_vendors.append(vendor)
        
        print()
        
        # Rate limiting - wait between requests
        time.sleep(2)
    
    # Summary
    print("=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"✅ Verified vendors: {len(verified_vendors)}")
    print(f"❌ Invalid vendors: {len(invalid_vendors)}")
    print(f"📈 Success rate: {(len(verified_vendors) / len(response.data) * 100):.1f}%")
    
    if verified_vendors:
        print(f"\\n✅ VERIFIED VENDORS ({len(verified_vendors)}):")
        for vendor in verified_vendors:
            print(f"   @{vendor['instagram_handle']} - {vendor['business_name']} ({vendor['category']})")
    
    if invalid_vendors:
        print(f"\\n❌ INVALID VENDORS TO REMOVE ({len(invalid_vendors)}):")
        for vendor in invalid_vendors:
            print(f"   @{vendor['instagram_handle']} - {vendor['business_name']} ({vendor['category']})")
        
        # Ask if we should remove invalid vendors
        print(f"\\n🗑️  CLEANUP RECOMMENDATION:")
        print("The following vendors should be removed from the database:")
        
        for vendor in invalid_vendors:
            print(f"   - @{vendor['instagram_handle']} (ID: {vendor['id']})")
    
    return verified_vendors, invalid_vendors

def remove_invalid_vendors(invalid_vendors):
    """Remove invalid vendors from the database"""
    
    if not invalid_vendors:
        print("✅ No invalid vendors to remove")
        return
    
    print(f"\\n🗑️  REMOVING {len(invalid_vendors)} INVALID VENDORS")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    supabase: Client = create_client(url, key)
    
    removed_count = 0
    
    for vendor in invalid_vendors:
        vendor_id = vendor['id']
        handle = vendor['instagram_handle']
        business_name = vendor['business_name']
        
        try:
            # Delete the vendor
            delete_response = supabase.table('instagram_vendors')\
                .delete()\
                .eq('id', vendor_id)\
                .execute()
            
            if delete_response.data:
                print(f"   ✅ Removed @{handle} - {business_name}")
                removed_count += 1
            else:
                print(f"   ❌ Failed to remove @{handle}")
                
        except Exception as e:
            print(f"   ❌ Error removing @{handle}: {str(e)}")
    
    print(f"\\n🎉 Successfully removed {removed_count} invalid vendors")

if __name__ == "__main__":
    verified_vendors, invalid_vendors = verify_all_dallas_vendors()
    
    if invalid_vendors:
        print("\\n" + "=" * 60)
        print("⚠️  CLEANUP REQUIRED")
        print("=" * 60)
        print("Run with cleanup=True to remove invalid vendors")
        print("Example: python3 verify_all_dallas_vendors.py --cleanup")
        
        # Uncomment the next line to automatically remove invalid vendors
        # remove_invalid_vendors(invalid_vendors)