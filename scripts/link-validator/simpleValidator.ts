#!/usr/bin/env tsx

import axios from 'axios';

interface SimpleResult {
  handle: string;
  exists: boolean;
  method: string;
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}

export class SimpleInstagramValidator {
  
  async validateHandle(handle: string): Promise<SimpleResult> {
    const cleanHandle = handle.replace('@', '');
    
    try {
      // Method 1: Check if we get redirected to login
      const response = await axios.get(`https://www.instagram.com/${cleanHandle}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });

      // Check the final URL after any redirects
      if (response.request?.res?.responseUrl || response.config.url) {
        const finalUrl = response.request?.res?.responseUrl || response.config.url;
        
        // If we're redirected away from the profile URL, it likely doesn't exist
        if (finalUrl.includes('/accounts/login/') || finalUrl.includes('/?__a=1')) {
          return {
            handle: cleanHandle,
            exists: false,
            method: 'redirect-to-login',
            confidence: 'high'
          };
        }
      }

      // Method 2: Check page title - Instagram usually puts username in title for real profiles
      const titleMatch = response.data.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';
      
      // Real profiles usually have titles like "@username • Instagram photos and videos"
      // or just the username, while non-existent ones typically just say "Instagram"
      if (title === 'Instagram' || title === '') {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'generic-title',
          confidence: 'medium'
        };
      }

      if (title.includes(cleanHandle) || title.includes('@' + cleanHandle)) {
        return {
          handle: cleanHandle,
          exists: true,
          method: 'title-contains-username',
          confidence: 'high'
        };
      }

      // Method 3: Check for specific error messages in content
      const content = response.data.toLowerCase();
      
      if (content.includes('sorry, this page isn\'t available') ||
          content.includes('the link you followed may be broken') ||
          content.includes('user not found')) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'error-message',
          confidence: 'high'
        };
      }

      // Method 4: Check content length - real profiles have substantial content
      if (response.data.length < 100000) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'minimal-content',
          confidence: 'medium'
        };
      }

      // Method 5: Look for profile-specific patterns in the content
      const profilePatterns = [
        new RegExp(`"username":"${cleanHandle}"`, 'i'),
        new RegExp(`/${cleanHandle}/`, 'g'),
        /followers.*following.*posts/i,
        /"is_private":(true|false)/,
        /"edge_followed_by"/,
        /"profile_pic_url"/
      ];

      let patternMatches = 0;
      for (const pattern of profilePatterns) {
        if (pattern.test(response.data)) {
          patternMatches++;
        }
      }

      if (patternMatches >= 2) {
        return {
          handle: cleanHandle,
          exists: true,
          method: `profile-patterns-${patternMatches}`,
          confidence: patternMatches >= 4 ? 'high' : 'medium'
        };
      }

      // Default to not found if we can't determine
      return {
        handle: cleanHandle,
        exists: false,
        method: 'insufficient-evidence',
        confidence: 'low'
      };

    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'http-404',
          confidence: 'high'
        };
      }

      if (error.response?.status === 302 || error.response?.status === 301) {
        // Handle redirects manually
        const location = error.response.headers.location;
        if (location?.includes('/accounts/login/')) {
          return {
            handle: cleanHandle,
            exists: false,
            method: 'redirect-to-login',
            confidence: 'high'
          };
        }
      }

      return {
        handle: cleanHandle,
        exists: false,
        method: 'error',
        confidence: 'low',
        error: error.message
      };
    }
  }
}

// Test the simple validator
async function testSimpleValidator() {
  const validator = new SimpleInstagramValidator();
  
  const testCases = [
    'instagram',
    'nasa', 
    'dallasarboretum',
    'fakeusernamethatshouldnotexist123456'
  ];

  console.log('🧪 TESTING SIMPLE VALIDATOR');
  console.log('═'.repeat(50));

  for (const handle of testCases) {
    console.log(`🔍 Testing: @${handle}`);
    try {
      const result = await validator.validateHandle(handle);
      console.log(`  Exists: ${result.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Method: ${result.method}`);
      console.log(`  Confidence: ${result.confidence}`);
      if (result.error) console.log(`  Error: ${result.error}`);
    } catch (error) {
      console.log(`  ❌ Test failed: ${error}`);
    }
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

if (require.main === module) {
  testSimpleValidator().catch(console.error);
}

// Export already declared above