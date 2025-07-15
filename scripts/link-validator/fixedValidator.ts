import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FixedInstagramResult {
  handle: string;
  url: string;
  profileExists: boolean;
  accountStatus: 'exists' | 'not_found' | 'private' | 'suspended' | 'unknown';
  detectionMethod: string;
  responseTime: number;
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}

export class FixedInstagramValidator {
  private readonly userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  async validateProfile(handle: string): Promise<FixedInstagramResult> {
    const cleanHandle = handle.replace('@', '');
    const url = `https://www.instagram.com/${cleanHandle}/`;
    const startTime = Date.now();

    try {
      // Method 1: Try to get profile page
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
        maxRedirects: 3
      });

      const responseTime = Date.now() - startTime;
      const content = response.data;

      // Method 1: Check for explicit 404 or error pages
      if (response.status === 404) {
        return {
          handle: cleanHandle,
          url,
          profileExists: false,
          accountStatus: 'not_found',
          detectionMethod: 'HTTP 404',
          responseTime,
          confidence: 'high'
        };
      }

      // Method 2: Look for "Sorry, this page isn't available" message
      if (content.includes('Sorry, this page isn\'t available') || 
          content.includes('The link you followed may be broken')) {
        return {
          handle: cleanHandle,
          url,
          profileExists: false,
          accountStatus: 'not_found',
          detectionMethod: 'Error message detection',
          responseTime,
          confidence: 'high'
        };
      }

      // Method 3: Check for private account indicators
      if (content.includes('This Account is Private') || 
          content.includes('user is private') ||
          content.includes('private_user')) {
        return {
          handle: cleanHandle,
          url,
          profileExists: true,
          accountStatus: 'private',
          detectionMethod: 'Private account detection',
          responseTime,
          confidence: 'high'
        };
      }

      // Method 4: Parse the page and look for profile-specific content
      const $ = cheerio.load(content);
      
      // Check page title - should contain the username for valid profiles
      const pageTitle = $('title').text();
      const titleContainsHandle = pageTitle.toLowerCase().includes(cleanHandle.toLowerCase()) && 
                                 pageTitle !== 'Instagram' && 
                                 pageTitle !== '';

      // Look for JSON-LD structured data that might contain profile info
      let hasStructuredData = false;
      $('script').each((_, script) => {
        const scriptContent = $(script).html() || '';
        if (scriptContent.includes(cleanHandle) || 
            scriptContent.includes('"@type":"Person"') ||
            scriptContent.includes('"profilePage"')) {
          hasStructuredData = true;
          return false; // break
        }
      });

      // Method 5: Look for profile-specific URL patterns in the content
      const profileUrlPattern = new RegExp(`instagram\\.com/${cleanHandle}/?["\\'\\s]`, 'i');
      const hasProfileUrl = profileUrlPattern.test(content);

      // Method 6: Check for profile-specific meta content
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const hasProfileInMeta = metaDescription.toLowerCase().includes(cleanHandle.toLowerCase());

      // Method 7: Look for React/JS data that contains profile information
      const hasProfileInJS = content.includes(`"username":"${cleanHandle}"`) ||
                            content.includes(`'username':'${cleanHandle}'`) ||
                            content.includes(`username:${cleanHandle}`) ||
                            content.includes(`/${cleanHandle}/`);

      // Method 8: Check content length (real profiles tend to have more content)
      const contentLength = content.length;
      const isSubstantialContent = contentLength > 400000; // Real profiles usually have 400k+ chars

      // Method 9: Advanced Pattern Detection
      const patterns = {
        profilePage: /profilePage["\']?\s*:\s*true/i.test(content),
        userAgent: /instagram/i.test(content),
        postCount: /posts?["\']?\s*:\s*\d+/i.test(content),
        followerCount: /followers?["\']?\s*:\s*\d+/i.test(content),
        followingCount: /following["\']?\s*:\s*\d+/i.test(content),
        sharedData: content.includes('window._sharedData')
      };

      // Scoring system
      let confidenceScore = 0;
      const detectionMethods: string[] = [];

      if (titleContainsHandle) { 
        confidenceScore += 3; 
        detectionMethods.push('title-match');
      }
      if (hasStructuredData) { 
        confidenceScore += 3; 
        detectionMethods.push('structured-data');
      }
      if (hasProfileUrl) { 
        confidenceScore += 2; 
        detectionMethods.push('profile-url');
      }
      if (hasProfileInMeta) { 
        confidenceScore += 2; 
        detectionMethods.push('meta-description');
      }
      if (hasProfileInJS) { 
        confidenceScore += 2; 
        detectionMethods.push('js-data');
      }
      if (isSubstantialContent) { 
        confidenceScore += 1; 
        detectionMethods.push('content-length');
      }
      if (patterns.profilePage) { 
        confidenceScore += 2; 
        detectionMethods.push('profile-page-flag');
      }
      if (patterns.postCount || patterns.followerCount) { 
        confidenceScore += 2; 
        detectionMethods.push('social-metrics');
      }

      // Determine result based on confidence score
      const profileExists = confidenceScore >= 3;
      const confidence: 'high' | 'medium' | 'low' = 
        confidenceScore >= 5 ? 'high' : 
        confidenceScore >= 3 ? 'medium' : 'low';

      return {
        handle: cleanHandle,
        url,
        profileExists,
        accountStatus: profileExists ? 'exists' : 'not_found',
        detectionMethod: detectionMethods.join(', ') || 'no-indicators',
        responseTime,
        confidence
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Handle specific error cases
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          handle: cleanHandle,
          url,
          profileExists: false,
          accountStatus: 'not_found',
          detectionMethod: 'network-error',
          responseTime,
          confidence: 'medium',
          error: 'Network error'
        };
      }

      if (error.response?.status === 404) {
        return {
          handle: cleanHandle,
          url,
          profileExists: false,
          accountStatus: 'not_found',
          detectionMethod: 'HTTP 404',
          responseTime,
          confidence: 'high'
        };
      }

      if (error.response?.status === 429) {
        return {
          handle: cleanHandle,
          url,
          profileExists: false,
          accountStatus: 'unknown',
          detectionMethod: 'rate-limited',
          responseTime,
          confidence: 'low',
          error: 'Rate limited'
        };
      }

      return {
        handle: cleanHandle,
        url,
        profileExists: false,
        accountStatus: 'unknown',
        detectionMethod: 'error',
        responseTime,
        confidence: 'low',
        error: error.message
      };
    }
  }

  // Alternative validation method using different approach
  async validateProfileAlternative(handle: string): Promise<FixedInstagramResult> {
    const cleanHandle = handle.replace('@', '');
    
    try {
      // Try to access Instagram's "web" endpoint which sometimes provides different responses
      const webUrl = `https://www.instagram.com/web/search/topsearch/?query=${cleanHandle}`;
      
      const response = await axios.get(webUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json, text/javascript, */*; q=0.01'
        },
        timeout: 5000
      });

      const data = response.data;
      
      // Check if the user appears in search results
      if (data.users && Array.isArray(data.users)) {
        const userFound = data.users.some((user: any) => 
          user.user && user.user.username === cleanHandle
        );
        
        if (userFound) {
          return {
            handle: cleanHandle,
            url: `https://www.instagram.com/${cleanHandle}/`,
            profileExists: true,
            accountStatus: 'exists',
            detectionMethod: 'search-api',
            responseTime: 0,
            confidence: 'high'
          };
        }
      }
      
      return {
        handle: cleanHandle,
        url: `https://www.instagram.com/${cleanHandle}/`,
        profileExists: false,
        accountStatus: 'not_found',
        detectionMethod: 'search-api-negative',
        responseTime: 0,
        confidence: 'medium'
      };
      
    } catch (error) {
      // Fall back to main validation method
      return this.validateProfile(handle);
    }
  }
}