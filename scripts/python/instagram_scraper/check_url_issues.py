#!/usr/bin/env python3
"""
Check specific issues with Instagram URLs
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def check_url_issues():
    """Check records with empty or invalid Instagram URLs"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        # Get all records
        result = supabase.table('instagram_vendors').select('*').execute()
        
        print(f"📊 URL Issues Analysis ({len(result.data)} total records):")
        print("=" * 60)
        
        # Find records with empty or missing URLs
        empty_urls = []
        invalid_urls = []
        
        for vendor in result.data:
            url = vendor.get('instagram_url', '')
            handle = vendor.get('instagram_handle', '')
            
            if not url or url == 'N/A' or url.strip() == '':
                empty_urls.append(vendor)
            elif not url.startswith('http') or 'instagram.com' not in url:
                invalid_urls.append(vendor)
        
        print(f"\n❌ Records with Empty/Missing URLs ({len(empty_urls)}):")
        print("-" * 60)
        
        for i, vendor in enumerate(empty_urls[:10]):  # Show first 10
            print(f"{i+1:2d}. Handle: @{vendor.get('instagram_handle', 'N/A')}")
            print(f"    Business: {vendor.get('business_name', 'N/A')}")
            print(f"    Category: {vendor.get('category', 'N/A')}")
            print(f"    URL: '{vendor.get('instagram_url', 'N/A')}'")
            print(f"    Location: {vendor.get('city', 'N/A')}, {vendor.get('state', 'N/A')}")
            print()
        
        if len(empty_urls) > 10:
            print(f"... and {len(empty_urls) - 10} more")
        
        print(f"\n⚠️  Records with Invalid URLs ({len(invalid_urls)}):")
        print("-" * 60)
        
        for i, vendor in enumerate(invalid_urls):
            print(f"{i+1:2d}. Handle: @{vendor.get('instagram_handle', 'N/A')}")
            print(f"    Business: {vendor.get('business_name', 'N/A')}")
            print(f"    Category: {vendor.get('category', 'N/A')}")
            print(f"    URL: '{vendor.get('instagram_url', 'N/A')}'")
            print(f"    Location: {vendor.get('city', 'N/A')}, {vendor.get('state', 'N/A')}")
            print()
        
        # Check recent vs older records
        print(f"\n🕒 Recent Record Quality Check:")
        print("-" * 60)
        
        # Sort by created_at
        sorted_records = sorted(result.data, key=lambda x: x.get('created_at', ''), reverse=True)
        
        print("Most Recent 5 Records:")
        for i, vendor in enumerate(sorted_records[:5]):
            url = vendor.get('instagram_url', '')
            status = "✅ Valid" if url and url.startswith('http') and 'instagram.com' in url else "❌ Invalid/Empty"
            
            print(f"{i+1}. @{vendor.get('instagram_handle', 'N/A')} - {status}")
            print(f"   URL: {url}")
            print(f"   Created: {vendor.get('created_at', 'N/A')}")
            print()
        
        # Summary statistics
        total_valid = len([v for v in result.data if v.get('instagram_url', '') and v.get('instagram_url', '').startswith('http') and 'instagram.com' in v.get('instagram_url', '')])
        
        print(f"\n📊 Summary:")
        print(f"Total Records: {len(result.data)}")
        print(f"Valid URLs: {total_valid} ({total_valid/len(result.data)*100:.1f}%)")
        print(f"Empty URLs: {len(empty_urls)} ({len(empty_urls)/len(result.data)*100:.1f}%)")
        print(f"Invalid URLs: {len(invalid_urls)} ({len(invalid_urls)/len(result.data)*100:.1f}%)")
            
    except Exception as e:
        print(f"Error checking URL issues: {e}")

if __name__ == "__main__":
    check_url_issues()