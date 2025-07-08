#!/usr/bin/env python3
"""
Test Enhanced Collection System with Multiple Categories
Validates the comprehensive approach before full deployment
"""

from comprehensive_collection_plan import ComprehensiveWeddingVendorCollector
import asyncio

async def test_enhanced_collection():
    """Test the enhanced collection system with 3 categories"""
    
    print("🧪 Testing Enhanced Wedding Vendor Collection System")
    print("=" * 60)
    
    collector = ComprehensiveWeddingVendorCollector()
    
    # Test with 3 diverse categories
    test_categories = [
        'photographers',      # High Instagram presence
        'wedding-planners',   # Business-focused  
        'florists'           # Visual content heavy
    ]
    
    # Test with 3 major cities
    test_cities = [
        ("New York", "NY"),
        ("Los Angeles", "CA"), 
        ("Chicago", "IL")
    ]
    
    print(f"🎯 Testing Categories: {', '.join(test_categories)}")
    print(f"📍 Testing Cities: {', '.join([f'{c}, {s}' for c, s in test_cities])}")
    print(f"🎪 Expected Results: ~20 vendors per category per city")
    
    results = {}
    
    for category in test_categories:
        print(f"\n🎭 Testing Category: {category.upper()}")
        print("-" * 40)
        
        category_total = 0
        
        for city, state in test_cities:
            try:
                print(f"📍 Processing {city}, {state}...")
                
                # Generate hashtags for this category/city
                hashtags = collector.get_enhanced_hashtags_for_category(city, state, category)
                print(f"   Hashtags: {', '.join(hashtags[:5])}...")
                
                # Single city collection for testing
                input_config = {
                    "addParentData": False,
                    "directUrls": [],
                    "enhanceUserSearchWithFacebookPage": False,
                    "isUserReelFeedURL": False,
                    "isUserTaggedFeedURL": False,
                    "resultsLimit": 20,  # Smaller for testing
                    "resultsType": "details",
                    "searchLimit": 15,
                    "searchType": "hashtag", 
                    "hashtags": hashtags,
                    "searchQueries": [],
                    "addMetadata": True,
                    "proxyConfiguration": {
                        "useApifyProxy": True,
                        "apifyProxyGroups": ["RESIDENTIAL"]
                    }
                }
                
                # Run collection
                run_id = await collector.apify_manager.run_instagram_scraper(input_config)
                run_data = collector.apify_manager.wait_for_completion(run_id, timeout=120)
                
                # Process results
                dataset_id = run_data['defaultDatasetId']
                raw_profiles = collector.apify_manager.get_dataset_items(dataset_id)
                
                if raw_profiles and 'error' not in str(raw_profiles[0]):
                    processed_count = collector.process_enhanced_profiles(
                        raw_profiles, category, f"{city}_{state}", max_results=10  # Top 10 for testing
                    )
                    category_total += processed_count
                    
                    print(f"   ✅ Found {processed_count} high-quality {category} vendors")
                else:
                    print(f"   ⚠️  No data available for {city}")
                
                # Short delay between cities
                await asyncio.sleep(30)
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                continue
        
        results[category] = category_total
        print(f"🏆 {category} Total: {category_total} vendors")
        
        # Break between categories
        if category != test_categories[-1]:
            print(f"⏳ Waiting 60 seconds before next category...")
            await asyncio.sleep(60)
    
    # Final results
    print(f"\n🎉 TEST RESULTS SUMMARY")
    print("=" * 40)
    
    total_vendors = sum(results.values())
    
    for category, count in results.items():
        print(f"📊 {category}: {count} vendors")
    
    print(f"📈 Total: {total_vendors} high-quality vendors")
    
    # Validate system performance
    print(f"\n🔍 SYSTEM VALIDATION")
    print("-" * 40)
    
    if total_vendors >= 15:  # Expect ~30 vendors (3 categories × 3 cities × ~3 each)
        print("✅ SUCCESS: System is working well")
        print("✅ Quality filtering is effective") 
        print("✅ Ready for full deployment")
        
        # Show what's in database now
        try:
            for category in test_categories:
                db_result = collector.db_manager.client.table('instagram_vendors')\
                    .select('instagram_handle,business_name,follower_count,city,state')\
                    .eq('category', category)\
                    .order('created_at', desc=True)\
                    .limit(5)\
                    .execute()
                
                if db_result.data:
                    print(f"\n📋 Recent {category} additions:")
                    for vendor in db_result.data:
                        print(f"   @{vendor['instagram_handle']} - {vendor.get('business_name', 'N/A')}")
                        print(f"     {vendor.get('follower_count', 0):,} followers, {vendor.get('city', 'Unknown')}, {vendor.get('state', 'Unknown')}")
        except Exception as e:
            print(f"Database check failed: {e}")
            
    else:
        print("⚠️  RESULTS BELOW EXPECTED")
        print("⚠️  May need to adjust quality thresholds")
        print("⚠️  Consider lowering minimum requirements")
    
    return results

if __name__ == "__main__":
    results = asyncio.run(test_enhanced_collection())