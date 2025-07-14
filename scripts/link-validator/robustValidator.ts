#!/usr/bin/env tsx

import axios from 'axios';

interface RobustResult {
  handle: string;
  exists: boolean;
  method: string;
  confidence: 'high' | 'medium' | 'low';
  error?: string;
  debugInfo?: {
    statusCode: number;
    contentLength: number;
    hasProfileData: boolean;
  };
}

export class RobustInstagramValidator {
  
  async validateHandle(handle: string): Promise<RobustResult> {
    const cleanHandle = handle.replace('@', '');
    
    try {
      // Use Instagram's GraphQL endpoint which is more reliable
      const response = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanHandle}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        },
        timeout: 10000,
        validateStatus: (status) => true // Accept all status codes
      });

      const debugInfo = {
        statusCode: response.status,
        contentLength: JSON.stringify(response.data).length,
        hasProfileData: false
      };

      // Check status code first
      if (response.status === 404) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'api-404',
          confidence: 'high',
          debugInfo
        };
      }

      if (response.status === 200) {
        // Check if we have actual user data
        if (response.data?.data?.user) {
          debugInfo.hasProfileData = true;
          return {
            handle: cleanHandle,
            exists: true,
            method: 'api-user-data',
            confidence: 'high',
            debugInfo
          };
        }
        
        // Sometimes Instagram returns 200 but no user data for non-existent users
        return {
          handle: cleanHandle,
          exists: false,
          method: 'api-no-user-data',
          confidence: 'high',
          debugInfo
        };
      }

      // Handle rate limiting
      if (response.status === 429) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'rate-limited',
          confidence: 'low',
          error: 'Rate limited by Instagram',
          debugInfo
        };
      }

      // Unknown status
      return {
        handle: cleanHandle,
        exists: false,
        method: `unknown-status-${response.status}`,
        confidence: 'low',
        debugInfo
      };

    } catch (error: any) {
      // Network errors often mean the profile doesn't exist
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'network-error',
          confidence: 'medium',
          error: error.message
        };
      }

      // For other errors, we're not sure
      return {
        handle: cleanHandle,
        exists: false,
        method: 'error',
        confidence: 'low',
        error: error.message
      };
    }
  }

  // Fallback method using the regular web endpoint
  async validateHandleFallback(handle: string): Promise<RobustResult> {
    const cleanHandle = handle.replace('@', '');
    
    try {
      const response = await axios.get(`https://www.instagram.com/${cleanHandle}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: (status) => true
      });

      // Look for specific indicators in the HTML
      const html = response.data;
      
      // Check for login redirect (indicates profile doesn't exist)
      if (response.status === 302 || response.headers.location?.includes('/accounts/login/')) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'login-redirect',
          confidence: 'high'
        };
      }

      // Look for structured data that indicates a real profile
      const hasUsername = html.includes(`"username":"${cleanHandle}"`) || 
                         html.includes(`@${cleanHandle}`);
      const hasProfilePic = html.includes('"profile_pic_url"') || 
                           html.includes('profilePicUrl');
      const hasFollowers = html.includes('"edge_followed_by"') || 
                          html.includes('followerCount');
      
      const indicators = [hasUsername, hasProfilePic, hasFollowers].filter(Boolean).length;
      
      if (indicators >= 2) {
        return {
          handle: cleanHandle,
          exists: true,
          method: `html-indicators-${indicators}`,
          confidence: indicators === 3 ? 'high' : 'medium'
        };
      }

      // Check for "not found" indicators
      if (html.includes('Sorry, this page isn\'t available') ||
          html.includes('The link you followed may be broken')) {
        return {
          handle: cleanHandle,
          exists: false,
          method: 'not-found-message',
          confidence: 'high'
        };
      }

      // If we can't determine, assume it doesn't exist
      return {
        handle: cleanHandle,
        exists: false,
        method: 'insufficient-indicators',
        confidence: 'low'
      };

    } catch (error: any) {
      return {
        handle: cleanHandle,
        exists: false,
        method: 'fallback-error',
        confidence: 'low',
        error: error.message
      };
    }
  }
}

// Test the robust validator
async function testRobustValidator() {
  const validator = new RobustInstagramValidator();
  
  const testCases = [
    'instagram',
    'nasa', 
    'dallasarboretum',
    'fakeusernamethatshouldnotexist123456'
  ];

  console.log('🚀 TESTING ROBUST VALIDATOR');
  console.log('═'.repeat(50));

  for (const handle of testCases) {
    console.log(`\n🔍 Testing: @${handle}`);
    console.log('─'.repeat(30));
    
    try {
      // Try API method first
      console.log('API Method:');
      const apiResult = await validator.validateHandle(handle);
      console.log(`  Exists: ${apiResult.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Method: ${apiResult.method}`);
      console.log(`  Confidence: ${apiResult.confidence}`);
      if (apiResult.debugInfo) {
        console.log(`  Debug: Status ${apiResult.debugInfo.statusCode}, ` +
                   `Content ${apiResult.debugInfo.contentLength} bytes, ` +
                   `Has Profile: ${apiResult.debugInfo.hasProfileData}`);
      }
      
      // Try fallback method
      console.log('\nFallback Method:');
      const fallbackResult = await validator.validateHandleFallback(handle);
      console.log(`  Exists: ${fallbackResult.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Method: ${fallbackResult.method}`);
      console.log(`  Confidence: ${fallbackResult.confidence}`);
      
    } catch (error) {
      console.log(`  ❌ Test failed: ${error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

if (require.main === module) {
  testRobustValidator().catch(console.error);
}