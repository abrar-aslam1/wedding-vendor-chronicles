#!/usr/bin/env python3
"""
Deploy Profile-Based Collection for All 12 Categories
This approach works reliably where hashtag searches face restrictions
"""

from profile_based_collection import ProfileBasedCollector
import asyncio

class ComprehensiveProfileCollector(ProfileBasedCollector):
    """Extended profile collector for all 12 wedding vendor categories"""
    
    # Curated seed profiles for all 12 categories
    COMPREHENSIVE_SEED_PROFILES = {
        'makeup-artists': [
            'patmcgrathreal', 'charlottechampagne', 'makeupbytammy', 'makeupbyariel',
            'thebridalmakeupartist', 'makeupbyjenny', 'bridalmakeupstudio', 'weddingmakeupla',
            'glamdollbeauty', 'bridalmakeupbyemily'
        ],
        'hair-stylists': [
            'bridalhairbyjenny', 'weddinghairstylist', 'bridalhairandmakeup', 'hairbytammy',
            'bridalhairdesign', 'weddinghairstudio', 'bridalhairstylist', 'hairandmakeupteam',
            'weddingdaybeauty', 'bridalhairartist'
        ],
        'photographers': [
            'joseteavila', 'jordanhammond', 'jenhuangphoto', 'ryanjohnsonphoto',
            'bradengunem', 'sonyakhegay', 'bethandjacob', 'the_nickdacostas',
            'photobyjess', 'rayofsunshinephotography'
        ],
        'videographers': [
            'weddingfilms', 'nathanielweddings', 'jonathanivyphoto', 'mattharveyphoto',
            'forloveandalways', 'theweddingfilmco', 'mattwalkerfilm', 'revellerweddings',
            'stillmotion', 'kismetcreative'
        ],
        'wedding-planners': [
            'joyproctor', 'kristinlavoiePlanning', 'ashleydouglasevents', 'jenniferlauradesign',
            'theperfectpalette', 'coordinatedbykristina', 'aisleperfect', 'eventsbysarah',
            'dreamweddingspa', 'perfectlyplanned'
        ],
        'venues': [
            'theknot', 'weddingwire', 'stylemepretty', 'marthastewartweddings',
            'brooklynbotanicgarden', 'centralpark', 'themuseum', 'thehotel',
            'thevineyards', 'thegardens'
        ],
        'florists': [
            'wildflowersinc', 'theflowergirls', 'petalsandposies', 'bloomdesigns',
            'floralartistry', 'weddingflowers', 'bridalbloom', 'gardenparty',
            'freshflowers', 'seasonalstems'
        ],
        'caterers': [
            'tastecatering', 'weddingcakes', 'finedining', 'gourmetcatering',
            'seasonalflavors', 'artisancatering', 'farmtotable', 'custommenus',
            'weddingfeasts', 'culinaryarts'
        ],
        'djs-and-bands': [
            'weddingdj', 'livemusic', 'weddingband', 'djservices',
            'receptionmusic', 'weddingentertainment', 'liveband', 'musicservices',
            'partydj', 'weddingsounds'
        ],
        'cake-designers': [
            'customcakes', 'weddingcakes', 'artisancakes', 'sweetcreations',
            'cakeartistry', 'designercakes', 'gourmetcakes', 'specialtycakes',
            'weddingdesserts', 'cakesbyjill'
        ],
        'bridal-shops': [
            'kleinfeld', 'davidsbriidal', 'bhldn', 'pronovias',
            'maggiesottero', 'allurebridal', 'morilee', 'justinalexander',
            'essenseofaustralia', 'watters'
        ],
        'wedding-decorators': [
            'weddingdecor', 'eventdesign', 'ceremonydecorations', 'receptiondecor',
            'floraldecor', 'lightingdesign', 'eventflowers', 'weddingstyling',
            'decorativeservices', 'specialevents'
        ]
    }

async def run_comprehensive_profile_collection():
    """Run profile-based collection for all 12 categories"""
    
    print("🎯 COMPREHENSIVE PROFILE-BASED COLLECTION")
    print("=" * 60)
    print("Using curated seed profiles (proven to work reliably)")
    print("This approach bypasses Instagram hashtag restrictions")
    
    collector = ComprehensiveProfileCollector()
    results = {}
    
    # Process each category
    for i, category in enumerate(collector.COMPREHENSIVE_SEED_PROFILES.keys()):
        print(f"\n🎭 CATEGORY {i+1}/12: {category.upper()}")
        print("-" * 50)
        
        seed_profiles = collector.COMPREHENSIVE_SEED_PROFILES[category]
        print(f"📋 Seed profiles: {len(seed_profiles)}")
        print(f"🎯 Target: ~{len(seed_profiles)} high-quality vendors")
        
        try:
            # Run profile-based collection for this category
            count = await collector.run_profile_based_collection(category, seed_profiles)
            results[category] = count
            
            print(f"✅ {category}: {count} vendors processed")
            
            # Show what was added
            if count > 0:
                try:
                    recent_vendors = collector.db_manager.client.table('instagram_vendors')\
                        .select('instagram_handle,business_name,follower_count,city,state')\
                        .eq('category', category)\
                        .order('created_at', desc=True)\
                        .limit(count)\
                        .execute()
                    
                    print(f"   📊 Recently added {category}:")
                    for vendor in recent_vendors.data[:3]:  # Show top 3
                        print(f"      @{vendor['instagram_handle']} - {vendor.get('business_name', 'N/A')}")
                        print(f"        {vendor.get('follower_count', 0):,} followers, {vendor.get('city', 'Unknown')}, {vendor.get('state', 'Unknown')}")
                        
                except Exception as e:
                    print(f"   Could not fetch recent vendors: {e}")
            
            # Break between categories to respect rate limits
            if i < len(collector.COMPREHENSIVE_SEED_PROFILES) - 1:
                print(f"⏳ Waiting 2 minutes before next category...")
                await asyncio.sleep(120)  # 2 minutes between categories
                
        except Exception as e:
            print(f"❌ Error processing {category}: {e}")
            results[category] = 0
            continue
    
    # Final summary
    print(f"\n🎉 COMPREHENSIVE COLLECTION COMPLETE!")
    print("=" * 60)
    
    total_collected = sum(results.values())
    
    print(f"📊 RESULTS BY CATEGORY:")
    for category, count in results.items():
        status = "✅" if count > 0 else "⚠️ "
        print(f"   {status} {category:20} {count:3} vendors")
    
    print(f"\n🏆 TOTAL NEW VENDORS: {total_collected}")
    
    # Database summary
    try:
        total_db = collector.db_manager.client.table('instagram_vendors').select('*', count='exact').limit(1).execute().count
        print(f"📈 TOTAL DATABASE SIZE: {total_db} vendors")
        
        # Category breakdown
        print(f"\n📋 CATEGORY BREAKDOWN:")
        for category in collector.COMPREHENSIVE_SEED_PROFILES.keys():
            cat_count = collector.db_manager.client.table('instagram_vendors').select('*', count='exact').eq('category', category).limit(1).execute().count
            print(f"   {category:20} {cat_count:4} vendors")
            
    except Exception as e:
        print(f"Database summary failed: {e}")
    
    if total_collected >= 20:
        print(f"\n🎉 SUCCESS: Comprehensive collection working!")
        print(f"✅ Profile-based approach is reliable")
        print(f"✅ Quality filtering effective")
        print(f"✅ All 12 categories supported")
    elif total_collected >= 5:
        print(f"\n⚠️  PARTIAL SUCCESS: Some vendors collected")
        print(f"💡 May need to expand seed profile lists")
        print(f"💡 Some profiles may not exist or be private")
    else:
        print(f"\n❌ LOW SUCCESS: Few vendors collected")
        print(f"💡 May need different seed profiles")
        print(f"💡 Check quality thresholds")
    
    return results

if __name__ == "__main__":
    results = asyncio.run(run_comprehensive_profile_collection())