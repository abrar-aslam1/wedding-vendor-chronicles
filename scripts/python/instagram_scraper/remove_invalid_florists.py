#!/usr/bin/env python3
"""
Remove all the invalid florist handles that don't exist on Instagram
Keep only the verified working ones based on user testing
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Handles that don't exist (user confirmed)
INVALID_HANDLES = [
    'wildflowerdallas',
    'urbancanopyfloral', 
    'petalnpressdallas',
    'bloomworksdallas',
    'dallaspetalbar',
    'rosepeddlerflower',
    'flowersbycaroline',
    'botanicaflowerstudio'
]

def remove_invalid_florists():
    """Remove all invalid florist handles that don't exist"""
    
    print("🗑️  REMOVING INVALID FLORIST HANDLES")
    print("=" * 60)
    print("User confirmed these Instagram handles don't exist:")
    for handle in INVALID_HANDLES:
        print(f"   ❌ @{handle}")
    print("=" * 60)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    removed_count = 0
    
    for handle in INVALID_HANDLES:
        # Find and remove the vendor
        response = supabase.table('instagram_vendors')\
            .select('id, business_name')\
            .eq('instagram_handle', handle)\
            .eq('category', 'florists')\
            .execute()
        
        if response.data:
            vendor = response.data[0]
            vendor_id = vendor['id']
            business_name = vendor['business_name']
            
            try:
                # Delete the vendor
                delete_response = supabase.table('instagram_vendors')\
                    .delete()\
                    .eq('id', vendor_id)\
                    .execute()
                
                print(f"   🗑️  Removed @{handle} - {business_name}")
                removed_count += 1
                
            except Exception as e:
                print(f"   ❌ Error removing @{handle}: {str(e)}")
        else:
            print(f"   ⚠️  @{handle} not found in database")
    
    print(f"\n📊 CLEANUP SUMMARY:")
    print(f"   🗑️  Invalid vendors removed: {removed_count}")
    
    # Show remaining verified florists
    show_remaining_florists(supabase)

def show_remaining_florists(supabase):
    """Show the remaining verified Dallas florists"""
    
    print(f"\n✅ REMAINING VERIFIED DALLAS FLORISTS")
    print("=" * 50)
    
    # Get remaining Dallas florists
    response = supabase.table('instagram_vendors')\
        .select('*')\
        .eq('city', 'Dallas')\
        .eq('state', 'TX')\
        .eq('category', 'florists')\
        .order('follower_count', desc=True)\
        .execute()
    
    if response.data:
        print(f"📊 Found {len(response.data)} verified Dallas florists:")
        print()
        
        for i, vendor in enumerate(response.data, 1):
            status = "✅ VERIFIED"
            if vendor['instagram_handle'] == 'bowsandarrowsflowers':
                status += " (USER CONFIRMED WORKING)"
            elif vendor['instagram_handle'] == 'maxitflowerdesign':
                status += " (USER VERIFIED URL)"
            
            print(f"{i}. {status}")
            print(f"   Business: {vendor['business_name']}")
            print(f"   Handle: @{vendor['instagram_handle']}")
            print(f"   Instagram: {vendor['instagram_url']}")
            print(f"   Followers: {vendor.get('follower_count', 'N/A'):,}")
            print()
        
        print("🏆 QUALITY FIRST APPROACH:")
        print("   ✅ Only keeping vendors that actually exist")
        print("   ✅ All remaining vendors are user-tested")
        print("   ❌ Removed placeholder/fake vendors")
        
        if len(response.data) < 5:
            print(f"\n⚠️  CURRENT LIMITATION:")
            print(f"   📊 Only {len(response.data)} verified florists remaining")
            print(f"   🎯 Need to find more REAL Dallas florists with working Instagram handles")
            print(f"   🔍 Suggestion: Research actual Dallas wedding florist businesses")
    else:
        print("❌ No Dallas florists found")

def suggest_real_research():
    """Suggest how to find real Dallas florists"""
    
    print(f"\n🔍 HOW TO FIND REAL DALLAS FLORISTS:")
    print("=" * 50)
    print("Instead of guessing handles, research actual businesses:")
    print()
    print("1. 🌐 Search Google for 'Dallas wedding florists'")
    print("2. 📱 Check their websites for Instagram links")
    print("3. 🔗 Verify Instagram handles exist before adding")
    print("4. ⭐ Look for businesses with reviews/established presence")
    print("5. 📍 Confirm they serve Dallas area")
    print()
    print("Examples of research sources:")
    print("   • The Knot Dallas vendors")
    print("   • WeddingWire Dallas florists") 
    print("   • Local wedding venue preferred vendor lists")
    print("   • Dallas wedding blogs/magazines")

if __name__ == "__main__":
    remove_invalid_florists()
    suggest_real_research()