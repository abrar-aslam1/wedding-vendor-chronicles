#!/usr/bin/env python3
"""
Check what's currently in the instagram_vendors table
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def check_existing_data():
    """Check what categories and data exist in the database"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        # Get a few sample records to see the structure
        sample_result = supabase.table('instagram_vendors').select('*').limit(5).execute()
        
        print("📊 Sample Instagram Vendor Records:")
        print("=" * 50)
        
        if sample_result.data:
            for vendor in sample_result.data:
                print(f"Handle: @{vendor.get('instagram_handle', 'N/A')}")
                print(f"Category: {vendor.get('category', 'N/A')}")
                print(f"Business: {vendor.get('business_name', 'N/A')}")
                print(f"Location: {vendor.get('city', 'N/A')}, {vendor.get('state', 'N/A')}")
                print(f"Followers: {vendor.get('follower_count', 'N/A')}")
                print("-" * 30)
        else:
            print("No records found")
            
        # Check unique categories
        category_result = supabase.table('instagram_vendors').select('category').execute()
        
        categories = {}
        for record in category_result.data:
            cat = record.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1
            
        print(f"\n📈 Category Breakdown ({len(category_result.data)} total):")
        for category, count in categories.items():
            print(f"   {category}: {count}")
            
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_existing_data()