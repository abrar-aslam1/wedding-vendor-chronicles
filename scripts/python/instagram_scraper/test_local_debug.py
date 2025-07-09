#!/usr/bin/env python3
"""
Debug test for local vendor collector
"""

import os
import sys
import logging
from dotenv import load_dotenv
from local_vendor_collector import LocalVendorCollector

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def test_local_collector_setup():
    """Test the local collector setup and configuration"""
    
    print("🔧 LOCAL VENDOR COLLECTOR DEBUG TEST")
    print("=" * 60)
    
    # Test environment variables
    print("\n1. Environment Variables:")
    apify_token = os.getenv('APIFY_TOKEN')
    supabase_url = os.getenv('SUPABASE_URL')
    
    print(f"   APIFY_TOKEN: {'✅ Set' if apify_token else '❌ Missing'}")
    print(f"   SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
    
    if apify_token:
        print(f"   Token prefix: {apify_token[:15]}...")
    
    # Test local collector initialization
    print("\n2. Local Collector Initialization:")
    try:
        collector = LocalVendorCollector()
        print("   ✅ LocalVendorCollector initialized successfully")
        
        # Test hashtag generation
        print("\n3. Hashtag Generation:")
        hashtags = collector.get_local_hashtags_for_category("Dallas", "TX", "photographers")
        print(f"   Generated {len(hashtags)} hashtags for Dallas photographers:")
        for i, hashtag in enumerate(hashtags[:10]):  # Show first 10
            print(f"      {i+1}. {hashtag}")
        
        # Test quality scoring
        print("\n4. Quality Scoring Test:")
        sample_profile = {
            'bio': 'Dallas wedding photographer. Serving Dallas metro area. Book appointments now!',
            'followersCount': 1500,
            'postsCount': 120,
            'isBusinessAccount': True,
            'externalUrl': 'https://example.com'
        }
        
        quality_score = collector.calculate_local_quality_score(sample_profile, "photographers", "Dallas")
        print(f"   Sample profile quality score: {quality_score}/12")
        
        # Test local indicators
        has_local = collector.has_local_indicators(sample_profile, "Dallas", "TX")
        print(f"   Has local indicators: {'✅ Yes' if has_local else '❌ No'}")
        
        print("\n✅ All tests passed! Local collector is ready to use.")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        logging.exception("Full error:")
        return False

if __name__ == "__main__":
    success = test_local_collector_setup()
    if not success:
        sys.exit(1)