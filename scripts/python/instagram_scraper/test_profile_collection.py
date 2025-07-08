#!/usr/bin/env python3
"""
Test the profile-based collection with a small sample
"""

from profile_based_collection import ProfileBasedCollector
import asyncio

async def test_small_collection():
    """Test with just 2-3 profiles to verify it works"""
    
    print("🧪 Testing Profile-Based Collection")
    print("=" * 40)
    
    collector = ProfileBasedCollector()
    
    # Test with a small list of known profiles
    test_profiles = [
        'patmcgrathreal',     # We know this one works
        'charlottechampagne', # Popular bridal makeup artist
        'makeupbytammy'       # Wedding makeup specialist
    ]
    
    print(f"Testing with {len(test_profiles)} makeup artist profiles:")
    for profile in test_profiles:
        print(f"  - @{profile}")
    
    print(f"\n⏳ Starting collection...")
    
    try:
        processed_count = await collector.run_profile_based_collection('makeup-artists', test_profiles)
        
        print(f"\n✅ Test completed!")
        print(f"   Profiles processed: {processed_count}")
        
        if processed_count > 0:
            print(f"   🎉 SUCCESS - Profile-based collection is working!")
            
            # Check what was saved
            try:
                recent_vendors = collector.db_manager.client.table('instagram_vendors')\
                    .select('instagram_handle,business_name,follower_count,city,state')\
                    .eq('category', 'makeup-artists')\
                    .order('created_at', desc=True)\
                    .limit(processed_count)\
                    .execute()
                
                if recent_vendors.data:
                    print(f"\n📊 Recently added makeup artists:")
                    for vendor in recent_vendors.data:
                        print(f"   @{vendor['instagram_handle']} - {vendor.get('business_name', 'N/A')}")
                        print(f"      {vendor.get('follower_count', 0):,} followers, {vendor.get('city', 'Unknown')}, {vendor.get('state', 'Unknown')}")
                        
            except Exception as e:
                print(f"   Could not fetch recent vendors: {e}")
        else:
            print(f"   ⚠️  No profiles met quality criteria or were already in database")
            
    except Exception as e:
        print(f"   ❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_small_collection())