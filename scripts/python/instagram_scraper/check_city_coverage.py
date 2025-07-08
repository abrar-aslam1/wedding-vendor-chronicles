#!/usr/bin/env python3
"""
Check Current City-Category Coverage
Shows progress toward 20 vendors per city per category goal
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def check_current_coverage():
    """Check current vendor coverage by city and category"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    # Top wedding cities to analyze
    cities = [
        ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Miami", "FL"),
        ("San Francisco", "CA"), ("Boston", "MA"), ("Seattle", "WA"), ("Austin", "TX"),
        ("Nashville", "TN"), ("Denver", "CO"), ("Atlanta", "GA"), ("Dallas", "TX"),
        ("Houston", "TX"), ("San Diego", "CA"), ("Philadelphia", "PA"), ("Phoenix", "AZ"),
        ("Charleston", "SC"), ("Savannah", "GA"), ("Portland", "OR"), ("Las Vegas", "NV")
    ]
    
    categories = [
        'makeup-artists', 'hair-stylists', 'photographers', 'wedding-planners',
        'videographers', 'florists', 'caterers', 'venues', 'djs-and-bands',
        'cake-designers', 'bridal-shops', 'wedding-decorators'
    ]
    
    print("🏙️  CURRENT CITY-CATEGORY COVERAGE ANALYSIS")
    print("=" * 80)
    print("Goal: 20 vendors per city per category")
    print(f"Analyzing: {len(cities)} cities × {len(categories)} categories = {len(cities) * len(categories)} combinations")
    
    # Overall statistics
    total_combinations = len(cities) * len(categories)
    completed_combinations = 0
    total_vendors = 0
    
    # Check each category
    for category in categories:
        print(f"\n🎭 {category.upper()}")
        print("-" * 60)
        
        category_vendors = 0
        category_completed = 0
        city_data = []
        
        for city, state in cities:
            try:
                # Get vendor count for this city/category
                result = supabase.table('instagram_vendors')\
                    .select('*', count='exact')\
                    .eq('category', category)\
                    .eq('city', city)\
                    .eq('state', state)\
                    .execute()
                
                count = result.count
                category_vendors += count
                
                if count >= 20:
                    category_completed += 1
                    status = "✅ COMPLETE"
                elif count >= 10:
                    status = f"🟡 {count}/20"
                elif count >= 1:
                    status = f"🟠 {count}/20"
                else:
                    status = "❌ 0/20"
                
                city_data.append((city, state, count, status))
                
            except Exception as e:
                print(f"Error checking {city}, {state}: {e}")
                city_data.append((city, state, 0, "❌ ERROR"))
        
        # Show city breakdown for this category
        # Sort by count (highest first)
        city_data.sort(key=lambda x: x[2], reverse=True)
        
        print(f"📊 Category Total: {category_vendors} vendors")
        print(f"🎯 Cities with 20+: {category_completed}/{len(cities)} ({category_completed/len(cities)*100:.1f}%)")
        
        # Show top cities and cities needing work
        print(f"\n   Top Cities:")
        for city, state, count, status in city_data[:5]:
            print(f"      {city}, {state}: {status}")
        
        if category_completed < len(cities):
            print(f"\n   🚨 Cities Needing Vendors:")
            for city, state, count, status in city_data:
                if count < 20:
                    needed = 20 - count
                    print(f"      {city}, {state}: Need {needed} more ({count} current)")
                    if len([x for x in city_data if x[2] < 20]) > 10:  # If many cities need work
                        break  # Don't show all to keep output manageable
        
        completed_combinations += category_completed
        total_vendors += category_vendors
    
    # Overall summary
    print(f"\n🏆 OVERALL SUMMARY")
    print("=" * 80)
    print(f"📊 Total Vendors: {total_vendors:,}")
    print(f"📈 Total Combinations: {completed_combinations}/{total_combinations} complete ({completed_combinations/total_combinations*100:.1f}%)")
    print(f"🎯 Target: {total_combinations * 20:,} vendors")
    print(f"📝 Still Needed: {(total_combinations * 20) - total_vendors:,} vendors")
    
    # Show categories with best/worst coverage
    print(f"\n📋 PRIORITY RECOMMENDATIONS:")
    
    # Get category-level stats
    category_stats = []
    for category in categories:
        try:
            total_for_category = supabase.table('instagram_vendors')\
                .select('*', count='exact')\
                .eq('category', category)\
                .execute().count
            
            # Count cities with 20+ for this category  
            completed_cities = 0
            for city, state in cities:
                city_count = supabase.table('instagram_vendors')\
                    .select('*', count='exact')\
                    .eq('category', category)\
                    .eq('city', city)\
                    .eq('state', state)\
                    .execute().count
                
                if city_count >= 20:
                    completed_cities += 1
            
            completion_rate = completed_cities / len(cities) * 100
            category_stats.append((category, total_for_category, completed_cities, completion_rate))
            
        except Exception as e:
            print(f"Error analyzing {category}: {e}")
    
    # Sort by completion rate
    category_stats.sort(key=lambda x: x[3], reverse=True)
    
    print(f"\n✅ BEST COVERED CATEGORIES:")
    for category, total, completed, rate in category_stats[:3]:
        print(f"   {category}: {completed}/{len(cities)} cities complete ({rate:.1f}%), {total} total vendors")
    
    print(f"\n🚨 CATEGORIES NEEDING ATTENTION:")
    for category, total, completed, rate in category_stats[-3:]:
        print(f"   {category}: {completed}/{len(cities)} cities complete ({rate:.1f}%), {total} total vendors")
    
    # Action plan
    print(f"\n🎯 RECOMMENDED ACTION PLAN:")
    
    # Find categories with 0 vendors
    zero_categories = [cat for cat, total, comp, rate in category_stats if total == 0]
    if zero_categories:
        print(f"   1. START HERE - Categories with 0 vendors:")
        for cat in zero_categories[:3]:
            print(f"      • {cat}")
    
    # Find categories with low coverage
    low_coverage = [cat for cat, total, comp, rate in category_stats if rate < 25 and total > 0]
    if low_coverage:
        print(f"   2. EXPAND - Categories with <25% city coverage:")
        for cat in low_coverage[:3]:
            print(f"      • {cat}")
    
    print(f"\n🚀 NEXT STEPS:")
    print(f"   1. Run: ./run_collection.sh city-category")
    print(f"   2. Focus on categories with 0 vendors first")
    print(f"   3. Then expand categories with low city coverage")
    print(f"   4. Target specific cities needing vendors")

if __name__ == "__main__":
    check_current_coverage()