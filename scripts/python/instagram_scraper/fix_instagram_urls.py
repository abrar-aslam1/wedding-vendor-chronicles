#!/usr/bin/env python3
"""
Fix Instagram URLs for manually added vendors
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def fix_instagram_urls():
    """Update Instagram URLs for vendors that are missing them"""
    
    print("🔧 FIXING INSTAGRAM URLS")
    print("=" * 50)
    
    # Initialize Supabase client
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    supabase: Client = create_client(url, key)
    
    # Get vendors with missing Instagram URLs
    response = supabase.table('instagram_vendors')\
        .select('*')\
        .is_('instagram_url', 'null')\
        .execute()
    
    if not response.data:
        print("✅ All vendors already have Instagram URLs")
        return
    
    print(f"📊 Found {len(response.data)} vendors missing Instagram URLs")
    
    updated_count = 0
    
    for vendor in response.data:
        handle = vendor['instagram_handle']
        instagram_url = f"https://www.instagram.com/{handle}"
        
        try:
            # Update the record
            update_response = supabase.table('instagram_vendors')\
                .update({'instagram_url': instagram_url})\
                .eq('id', vendor['id'])\
                .execute()
            
            if update_response.data:
                print(f"   ✅ Fixed @{handle} -> {instagram_url}")
                updated_count += 1
            else:
                print(f"   ❌ Failed to update @{handle}")
                
        except Exception as e:
            print(f"   ❌ Error updating @{handle}: {str(e)}")
    
    print(f"\n🎉 Updated {updated_count} Instagram URLs!")

if __name__ == "__main__":
    fix_instagram_urls()