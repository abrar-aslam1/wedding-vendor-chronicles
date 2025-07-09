#!/usr/bin/env python3
"""
Check the instagram_url field specifically in all Instagram vendor records
"""

from supabase import create_client
import os
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

def check_instagram_urls():
    """Check the instagram_url field across all records"""
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_KEY')
    )
    
    try:
        # Get all records with instagram_url field
        result = supabase.table('instagram_vendors').select('instagram_handle, instagram_url, business_name, category').execute()
        
        print(f"📊 Instagram URL Analysis ({len(result.data)} total records):")
        print("=" * 60)
        
        url_patterns = Counter()
        empty_urls = 0
        invalid_urls = 0
        valid_urls = 0
        
        # Show first 10 records with their URLs
        print("\n🔍 Sample Records with Instagram URLs:")
        print("-" * 60)
        
        for i, vendor in enumerate(result.data[:10]):
            handle = vendor.get('instagram_handle', 'N/A')
            url = vendor.get('instagram_url', 'N/A')
            business = vendor.get('business_name', 'N/A')
            category = vendor.get('category', 'N/A')
            
            print(f"{i+1:2d}. Handle: @{handle}")
            print(f"    URL: {url}")
            print(f"    Business: {business}")
            print(f"    Category: {category}")
            print()
        
        # Analyze URL patterns across all records
        print("\n📈 URL Pattern Analysis:")
        print("-" * 60)
        
        for vendor in result.data:
            url = vendor.get('instagram_url', '')
            
            if not url or url == 'N/A':
                empty_urls += 1
            elif url.startswith('https://www.instagram.com/'):
                valid_urls += 1
                # Extract pattern (just the base URL structure)
                url_patterns['https://www.instagram.com/'] += 1
            elif url.startswith('https://instagram.com/'):
                valid_urls += 1
                url_patterns['https://instagram.com/'] += 1
            elif url.startswith('http://'):
                # HTTP instead of HTTPS
                valid_urls += 1
                url_patterns['http://'] += 1
            else:
                invalid_urls += 1
                url_patterns[f'Invalid: {url[:50]}'] += 1
        
        print(f"✅ Valid Instagram URLs: {valid_urls}")
        print(f"❌ Empty/Missing URLs: {empty_urls}")
        print(f"⚠️  Invalid URLs: {invalid_urls}")
        print()
        
        print("URL Pattern Breakdown:")
        for pattern, count in url_patterns.most_common():
            print(f"  {pattern}: {count}")
        
        # Check if handles match URL usernames
        print("\n🔗 Handle vs URL Consistency Check:")
        print("-" * 60)
        
        mismatches = 0
        for vendor in result.data[:20]:  # Check first 20 for sample
            handle = vendor.get('instagram_handle', '').lower()
            url = vendor.get('instagram_url', '')
            
            if url and 'instagram.com/' in url:
                # Extract username from URL
                url_username = url.split('instagram.com/')[-1].split('/')[0].lower()
                
                if handle != url_username:
                    mismatches += 1
                    print(f"❌ Mismatch: Handle '@{handle}' vs URL username '{url_username}'")
                    print(f"   Full URL: {url}")
        
        if mismatches == 0:
            print("✅ All sampled handles match their URL usernames")
        else:
            print(f"⚠️  Found {mismatches} mismatches in sample")
            
    except Exception as e:
        print(f"Error checking Instagram URLs: {e}")

if __name__ == "__main__":
    check_instagram_urls()