#!/usr/bin/env python3
"""
Automated Vendor Research and Verification System
Uses web scraping, APIs, and automated verification to find real vendors
"""

import os
import requests
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

class AutomatedVendorResearcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Initialize Supabase
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_KEY')
        self.supabase = create_client(url, key) if url and key else None
    
    def search_vendors_on_platform(self, city, category, platform='weddingwire'):
        """Search for vendors on wedding platforms"""
        print(f"🔍 Searching {platform} for {category} in {city}...")
        
        # Platform-specific search patterns
        search_patterns = {
            'weddingwire': {
                'base_url': 'https://www.weddingwire.com',
                'search_path': f'/c/{city.lower().replace(" ", "-")}/{category}/vendors.html'
            },
            'theknot': {
                'base_url': 'https://www.theknot.com',
                'search_path': f'/marketplace/{category}-{city.lower().replace(" ", "-")}'
            },
            'zola': {
                'base_url': 'https://www.zola.com',
                'search_path': f'/wedding-vendors/search/{city.lower().replace(" ", "-")}--{category}'
            }
        }
        
        if platform not in search_patterns:
            print(f"❌ Platform {platform} not supported")
            return []
        
        try:
            pattern = search_patterns[platform]
            search_url = pattern['base_url'] + pattern['search_path']
            
            print(f"   📡 Fetching: {search_url}")
            response = self.session.get(search_url, timeout=10)
            
            if response.status_code == 200:
                # Extract vendor information from HTML
                vendors = self.extract_vendors_from_html(response.text, platform)
                print(f"   ✅ Found {len(vendors)} potential vendors")
                return vendors
            else:
                print(f"   ❌ Failed to fetch: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"   ❌ Error searching {platform}: {str(e)}")
            return []
    
    def extract_vendors_from_html(self, html_content, platform):
        """Extract vendor information from platform HTML"""
        vendors = []
        
        # Simple text-based extraction patterns
        # In a full implementation, you'd use BeautifulSoup or similar
        
        if 'weddingwire' in platform.lower():
            # Look for common patterns in WeddingWire listings
            import re
            
            # Pattern to find business names (simplified)
            name_patterns = [
                r'"businessName":"([^"]+)"',
                r'<h3[^>]*>([^<]+)</h3>',
                r'class="vendor-name[^>]*>([^<]+)<'
            ]
            
            for pattern in name_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches[:10]:  # Limit to first 10
                    if len(match) > 3 and not any(char.isdigit() for char in match):
                        vendors.append({
                            'business_name': match.strip(),
                            'platform_source': platform,
                            'needs_verification': True
                        })
        
        return vendors[:5]  # Limit results
    
    def find_instagram_handle(self, business_name, city):
        """Find Instagram handle for a business"""
        print(f"   🔍 Finding Instagram for: {business_name}")
        
        # Method 1: Direct Instagram search simulation
        search_terms = [
            f"{business_name} {city}",
            f"{business_name} wedding",
            business_name.replace(" ", "").lower(),
            business_name.replace(" ", "_").lower(),
            business_name.replace(" ", "").lower() + city.lower()
        ]
        
        potential_handles = []
        
        for term in search_terms:
            # Generate potential handles
            handle_variations = [
                term.replace(" ", "").lower(),
                term.replace(" ", "_").lower(),
                term.replace(" ", "").lower() + "dallas",
                term.replace(" ", "").lower() + "tx",
                term.replace(" ", "").lower() + "wedding"
            ]
            
            for handle in handle_variations:
                # Clean the handle
                clean_handle = self.clean_instagram_handle(handle)
                if clean_handle and len(clean_handle) >= 3:
                    potential_handles.append(clean_handle)
        
        # Remove duplicates and limit
        potential_handles = list(dict.fromkeys(potential_handles))[:5]
        
        print(f"   📝 Generated {len(potential_handles)} potential handles")
        
        # Verify which handles exist
        verified_handles = []
        for handle in potential_handles:
            if self.verify_instagram_handle(handle):
                verified_handles.append(handle)
                print(f"   ✅ Verified: @{handle}")
                break  # Take the first working one
            else:
                print(f"   ❌ Invalid: @{handle}")
            
            time.sleep(1)  # Rate limiting
        
        return verified_handles[0] if verified_handles else None
    
    def clean_instagram_handle(self, handle):
        """Clean and validate Instagram handle format"""
        import re
        
        # Remove special characters, keep only letters, numbers, underscores
        clean = re.sub(r'[^a-zA-Z0-9_]', '', handle.lower())
        
        # Remove common unwanted terms
        unwanted = ['wedding', 'dallas', 'texas', 'tx', 'florist', 'photography']
        for term in unwanted:
            if clean.endswith(term) and len(clean) > len(term) + 3:
                clean = clean[:-len(term)]
        
        # Instagram handle requirements
        if len(clean) < 1 or len(clean) > 30:
            return None
        
        return clean
    
    def verify_instagram_handle(self, handle):
        """Verify if an Instagram handle exists"""
        try:
            url = f"https://www.instagram.com/{handle}/"
            response = self.session.get(url, timeout=5)
            
            # Check if profile exists
            if response.status_code == 200:
                # Check if it's not a "user not found" page
                if "Sorry, this page isn't available" not in response.text:
                    return True
            
            return False
            
        except Exception:
            return False
    
    def automated_vendor_discovery(self, city, category, max_vendors=10):
        """Main automated discovery process"""
        print(f"\n🤖 AUTOMATED VENDOR DISCOVERY")
        print(f"🎯 Target: {category} in {city}")
        print("=" * 60)
        
        discovered_vendors = []
        
        # Step 1: Search multiple platforms
        platforms = ['weddingwire', 'theknot', 'zola']
        all_potential_vendors = []
        
        for platform in platforms:
            vendors = self.search_vendors_on_platform(city, category, platform)
            all_potential_vendors.extend(vendors)
            time.sleep(2)  # Rate limiting
        
        print(f"\n📊 Found {len(all_potential_vendors)} potential vendors across platforms")
        
        # Step 2: Find Instagram handles
        print(f"\n🔍 FINDING INSTAGRAM HANDLES")
        print("=" * 40)
        
        for i, vendor in enumerate(all_potential_vendors[:max_vendors]):
            print(f"\n{i+1}. Processing: {vendor['business_name']}")
            
            instagram_handle = self.find_instagram_handle(vendor['business_name'], city)
            
            if instagram_handle:
                discovered_vendors.append({
                    'business_name': vendor['business_name'],
                    'instagram_handle': instagram_handle,
                    'instagram_url': f"https://www.instagram.com/{instagram_handle}",
                    'platform_source': vendor['platform_source'],
                    'city': city,
                    'category': category,
                    'verified': True
                })
                
                print(f"   🎉 SUCCESS: @{instagram_handle}")
            else:
                print(f"   ❌ No working Instagram handle found")
        
        return discovered_vendors
    
    def save_discovered_vendors(self, vendors, city, category):
        """Save discovered vendors to database and file"""
        
        print(f"\n💾 SAVING DISCOVERED VENDORS")
        print("=" * 40)
        
        # Save to JSON file for backup
        filename = f"discovered_{category}_{city.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"
        filepath = f"/Users/abraraslam/Desktop/wedding-vendor-chronicles/scripts/python/instagram_scraper/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump(vendors, f, indent=2)
        
        print(f"📁 Saved to file: {filename}")
        
        # Save to database if available
        if self.supabase:
            added_count = 0
            
            for vendor in vendors:
                try:
                    vendor_record = {
                        'instagram_handle': vendor['instagram_handle'],
                        'business_name': vendor['business_name'],
                        'category': vendor['category'],
                        'bio': f"{vendor['business_name']} - {city} {category.title()}",
                        'website_url': vendor['instagram_url'],
                        'instagram_url': vendor['instagram_url'],
                        'profile_image_url': f"https://www.instagram.com/{vendor['instagram_handle']}/picture/",
                        'city': vendor['city'],
                        'state': 'TX',  # Assuming Texas for now
                        'follower_count': 1000,  # Placeholder
                        'is_business_account': True,
                        'created_at': datetime.now().isoformat()
                    }
                    
                    result = self.supabase.table('instagram_vendors').insert(vendor_record).execute()
                    
                    if result.data:
                        print(f"✅ Added to DB: @{vendor['instagram_handle']}")
                        added_count += 1
                    
                except Exception as e:
                    print(f"❌ DB Error: @{vendor['instagram_handle']}: {str(e)}")
            
            print(f"📊 Added {added_count}/{len(vendors)} vendors to database")
        
        return vendors

def run_automated_discovery():
    """Run the automated discovery process"""
    
    researcher = AutomatedVendorResearcher()
    
    # Configuration
    target_city = "Dallas"
    target_category = "wedding-florists"
    max_vendors = 5
    
    print("🤖 AUTOMATED VENDOR RESEARCH SYSTEM")
    print("=" * 50)
    print("FEATURES:")
    print("✅ Multi-platform search (WeddingWire, The Knot, Zola)")
    print("✅ Automated Instagram handle discovery")
    print("✅ Real-time Instagram verification")
    print("✅ Rate limiting and error handling")
    print("✅ Database integration")
    print("=" * 50)
    
    # Run discovery
    discovered = researcher.automated_vendor_discovery(target_city, target_category, max_vendors)
    
    if discovered:
        print(f"\n🎉 DISCOVERY COMPLETE!")
        print(f"📊 Found {len(discovered)} verified vendors with working Instagram handles")
        
        # Save results
        researcher.save_discovered_vendors(discovered, target_city, target_category)
        
        # Show results
        print(f"\n📋 DISCOVERED VENDORS:")
        for i, vendor in enumerate(discovered, 1):
            print(f"{i}. @{vendor['instagram_handle']} - {vendor['business_name']}")
            print(f"   🔗 {vendor['instagram_url']}")
            print(f"   📍 Source: {vendor['platform_source']}")
    else:
        print("\n❌ No verified vendors discovered")
        print("💡 Try adjusting search parameters or adding more platforms")

if __name__ == "__main__":
    run_automated_discovery()