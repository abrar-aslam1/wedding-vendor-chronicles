#!/usr/bin/env python3
"""
Test Supabase connection and basic functionality
"""

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

def test_supabase_connection():
    """Test basic Supabase connection"""
    
    print("🔍 Testing Supabase connection...")
    
    try:
        # Initialize Supabase client
        supabase = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
        print("✓ Supabase client created successfully")
        
        # Test connection by checking instagram_vendors table
        result = supabase.table('instagram_vendors').select('*', count='exact').limit(1).execute()
        
        print(f"✓ Connected to instagram_vendors table (current count: {result.count})")
        
        return True
        
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

def test_apify_token():
    """Test if Apify token is configured"""
    
    print("\n🔍 Testing Apify configuration...")
    
    token = os.getenv('APIFY_TOKEN')
    
    if not token or token == 'your-apify-token':
        print("✗ Apify token not configured")
        print("  Please add your Apify token to the .env file")
        print("  Get it from: https://console.apify.com/account/integrations")
        return False
    else:
        print("✓ Apify token is configured")
        return True

def show_next_steps():
    """Show next steps for setup"""
    
    print("\n📋 Next Steps:")
    print("1. Add your Apify API token to .env file:")
    print("   APIFY_TOKEN=your-actual-token")
    print("")
    print("2. Test the scraper with a small collection:")
    print("   ./run_collection.sh test")
    print("")
    print("3. Run full collection:")
    print("   ./run_collection.sh all")

if __name__ == "__main__":
    print("🧪 Instagram Scraper Connection Test")
    print("=" * 40)
    
    supabase_ok = test_supabase_connection()
    apify_ok = test_apify_token()
    
    print("\n" + "=" * 40)
    
    if supabase_ok and apify_ok:
        print("🎉 All connections successful! Ready to start scraping.")
    elif supabase_ok:
        print("⚠️  Supabase ready, but need to configure Apify token.")
        show_next_steps()
    else:
        print("❌ Setup incomplete. Please check your configuration.")
        show_next_steps()