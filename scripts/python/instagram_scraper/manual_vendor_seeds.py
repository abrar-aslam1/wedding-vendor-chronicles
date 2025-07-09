#!/usr/bin/env python3
"""
Manual local vendor seed database
Use this to bootstrap your local vendor collection with known accounts
"""

import asyncio
import logging
from datetime import datetime
from enterprise_collection import InstagramVendor, SupabaseManager

# Known Dallas local wedding vendors (manually curated)
DALLAS_LOCAL_VENDORS = {
    "photographers": [
        {
            "handle": "amychristinaphotography",
            "business_name": "Amy Christina Photography",
            "bio": "Dallas Wedding & Portrait Photographer | Serving DFW Metroplex",
            "estimated_followers": 2500,
            "location": "Dallas, TX"
        },
        {
            "handle": "brittanybarclayphotography", 
            "business_name": "Brittany Barclay Photography",
            "bio": "Dallas Wedding Photographer | Natural Light | Available for Travel",
            "estimated_followers": 1800,
            "location": "Dallas, TX"
        },
        {
            "handle": "jenniferdavisphotography",
            "business_name": "Jennifer Davis Photography", 
            "bio": "Dallas Wedding & Engagement Photographer | 10+ Years Experience",
            "estimated_followers": 3200,
            "location": "Dallas, TX"
        }
    ],
    "makeup-artists": [
        {
            "handle": "beautybylindsayj",
            "business_name": "Beauty by Lindsay J",
            "bio": "Dallas Bridal Makeup Artist | Airbrush Specialist | On-location Services",
            "estimated_followers": 950,
            "location": "Dallas, TX"
        },
        {
            "handle": "glammakeupbyash",
            "business_name": "Glam Makeup by Ash",
            "bio": "Dallas MUA | Bridal & Special Events | Book now!",
            "estimated_followers": 1200,
            "location": "Dallas, TX"
        }
    ],
    "hair-stylists": [
        {
            "handle": "bridalhairbyjess",
            "business_name": "Bridal Hair by Jess",
            "bio": "Dallas Hair Stylist | Bridal Updos | Serving DFW Area",
            "estimated_followers": 850,
            "location": "Dallas, TX"
        },
        {
            "handle": "texashairandmakeup",
            "business_name": "Texas Hair and Makeup",
            "bio": "Dallas Bridal Hair & Makeup Team | Licensed Cosmetologists",
            "estimated_followers": 1500,
            "location": "Dallas, TX"
        }
    ],
    "wedding-planners": [
        {
            "handle": "shestudiosevents",
            "business_name": "She Studios Events",
            "bio": "Dallas Wedding Planning & Design | Full Service | Luxury Events",
            "estimated_followers": 2800,
            "location": "Dallas, TX"
        },
        {
            "handle": "lovelyplanning",
            "business_name": "Lovely Planning",
            "bio": "Dallas Wedding Planner | Coordination & Design Services",
            "estimated_followers": 1600,
            "location": "Dallas, TX"
        }
    ],
    "florists": [
        {
            "handle": "twigandcotton",
            "business_name": "Twig and Cotton",
            "bio": "Dallas Wedding Florist | Custom Arrangements | Serving DFW",
            "estimated_followers": 2200,
            "location": "Dallas, TX"
        },
        {
            "handle": "bloomsdallas",
            "business_name": "Blooms Dallas",
            "bio": "Dallas Floral Design | Wedding & Event Flowers | Local Delivery",
            "estimated_followers": 1400,
            "location": "Dallas, TX"
        }
    ]
}

async def populate_manual_seeds():
    """Populate the database with manually curated local vendors"""
    
    print("🌱 POPULATING MANUAL VENDOR SEEDS")
    print("=" * 60)
    print("Adding known Dallas local wedding vendors to database")
    print("=" * 60)
    
    db_manager = SupabaseManager()
    total_added = 0
    
    for category, vendors in DALLAS_LOCAL_VENDORS.items():
        print(f"\n📸 Category: {category}")
        print("-" * 30)
        
        category_added = 0
        
        for vendor_data in vendors:
            try:
                # Create Instagram vendor object
                vendor = InstagramVendor(
                    instagram_handle=vendor_data["handle"],
                    business_name=vendor_data["business_name"],
                    category=category,
                    subcategory=None,
                    bio=vendor_data["bio"],
                    website_url=f"https://instagram.com/{vendor_data['handle']}",
                    email=None,
                    phone=None,
                    follower_count=vendor_data["estimated_followers"],
                    post_count=100,  # Estimated
                    is_verified=False,
                    is_business_account=True,
                    profile_image_url="",
                    city="Dallas",
                    state="TX",
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                # Check if vendor already exists
                existing = db_manager.client.table('instagram_vendors')\
                    .select('*')\
                    .eq('instagram_handle', vendor_data["handle"])\
                    .eq('category', category)\
                    .execute()
                
                if existing.data:
                    print(f"   ⚠️  @{vendor_data['handle']} already exists - skipping")
                    continue
                
                # Insert vendor
                success = db_manager.upsert_vendor(vendor)
                
                if success:
                    print(f"   ✅ Added @{vendor_data['handle']} - {vendor_data['business_name']}")
                    category_added += 1
                    total_added += 1
                else:
                    print(f"   ❌ Failed to add @{vendor_data['handle']}")
                    
            except Exception as e:
                print(f"   ❌ Error adding @{vendor_data['handle']}: {str(e)}")
                continue
        
        print(f"   📊 {category}: {category_added} vendors added")
    
    print(f"\n🎉 MANUAL SEED POPULATION COMPLETE!")
    print(f"📊 Total vendors added: {total_added}")
    print(f"🌍 Location: Dallas, TX")
    print(f"📅 Categories: {len(DALLAS_LOCAL_VENDORS)}")
    
    return total_added

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(populate_manual_seeds())