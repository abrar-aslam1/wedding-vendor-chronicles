import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import pLimit from 'p-limit';

config();

export interface LinkValidationResult {
  url: string;
  status: 'valid' | 'invalid' | 'redirect' | 'error';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
  responseTime?: number;
  vendorInfo?: {
    businessName: string;
    category: string;
    instagramHandle?: string;
  };
}

export interface InstagramValidationResult extends LinkValidationResult {
  profileExists: boolean;
  isPrivate?: boolean;
  followerCount?: number;
  bio?: string;
  profileImageUrl?: string;
}

export class LinkValidator {
  private readonly limit = pLimit(5); // Limit concurrent requests
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  constructor(
    private readonly supabaseUrl?: string,
    private readonly supabaseKey?: string
  ) {}

  async validateLink(url: string): Promise<LinkValidationResult> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });

      const responseTime = Date.now() - startTime;
      
      if (response.status >= 200 && response.status < 300) {
        return {
          url,
          status: 'valid',
          statusCode: response.status,
          responseTime,
        };
      } else if (response.status >= 300 && response.status < 400) {
        return {
          url,
          status: 'redirect',
          statusCode: response.status,
          redirectUrl: response.headers.location,
          responseTime,
        };
      } else {
        return {
          url,
          status: 'invalid',
          statusCode: response.status,
          responseTime,
        };
      }
    } catch (error: any) {
      return {
        url,
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  async validateInstagramProfile(handle: string): Promise<InstagramValidationResult> {
    const cleanHandle = handle.replace('@', '');
    const url = `https://www.instagram.com/${cleanHandle}/`;
    const startTime = Date.now();
    
    try {
      // Use Instagram's GraphQL API endpoint for more reliable results
      const apiResponse = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanHandle}`, {
        headers: {
          'User-Agent': this.userAgent,
          'X-IG-App-ID': '936619743392459',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*'
        },
        timeout: 10000,
        validateStatus: (status) => true
      });

      const responseTime = Date.now() - startTime;

      // Handle 404 - profile doesn't exist
      if (apiResponse.status === 404) {
        return {
          url,
          status: 'invalid',
          statusCode: 404,
          profileExists: false,
          responseTime,
          error: 'Profile not found',
        };
      }

      // Handle rate limiting
      if (apiResponse.status === 429) {
        return {
          url,
          status: 'error',
          statusCode: 429,
          profileExists: false,
          responseTime,
          error: 'Rate limited by Instagram',
        };
      }

      // Handle successful response
      if (apiResponse.status === 200) {
        const userData = apiResponse.data?.data?.user;
        
        if (!userData) {
          // No user data means profile doesn't exist
          return {
            url,
            status: 'invalid',
            statusCode: 200,
            profileExists: false,
            responseTime,
            error: 'Profile not found',
          };
        }

        // Extract profile information from API response
        const followerCount = userData.edge_followed_by?.count || 0;
        const isPrivate = userData.is_private || false;
        const bio = userData.biography || '';
        const profileImageUrl = userData.profile_pic_url_hd || userData.profile_pic_url;

        return {
          url,
          status: 'valid',
          statusCode: 200,
          profileExists: true,
          isPrivate,
          followerCount,
          bio,
          profileImageUrl,
          responseTime,
        };
      }

      // Handle other status codes
      return {
        url,
        status: 'error',
        statusCode: apiResponse.status,
        profileExists: false,
        responseTime,
        error: `HTTP ${apiResponse.status}`,
      };
      
    } catch (error: any) {
      // Network errors usually mean profile doesn't exist or there's a connection issue
      return {
        url,
        status: 'error',
        profileExists: false,
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }


  async validateWebsite(url: string): Promise<LinkValidationResult> {
    // Handle relative URLs or missing protocols
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }

    return this.validateLink(fullUrl);
  }

  async validateLinks(urls: string[]): Promise<LinkValidationResult[]> {
    const results = await Promise.all(
      urls.map(url => this.limit(() => this.validateLink(url)))
    );
    return results;
  }

  async validateInstagramHandles(handles: string[]): Promise<InstagramValidationResult[]> {
    const results = await Promise.all(
      handles.map(handle => this.limit(() => this.validateInstagramProfile(handle)))
    );
    return results;
  }

  async validateVendorFromDatabase(vendorId: string): Promise<LinkValidationResult[]> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase credentials not provided');
    }

    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    const { data: vendor, error } = await supabase
      .from('instagram_vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error || !vendor) {
      throw new Error(`Vendor not found: ${vendorId}`);
    }

    const results: LinkValidationResult[] = [];

    // Validate Instagram
    if (vendor.instagram_handle) {
      const instagramResult = await this.validateInstagramProfile(vendor.instagram_handle);
      results.push({
        ...instagramResult,
        vendorInfo: {
          businessName: vendor.business_name,
          category: vendor.category,
          instagramHandle: vendor.instagram_handle,
        },
      });
    }

    // Validate website
    if (vendor.website_url) {
      const websiteResult = await this.validateWebsite(vendor.website_url);
      results.push({
        ...websiteResult,
        vendorInfo: {
          businessName: vendor.business_name,
          category: vendor.category,
        },
      });
    }

    return results;
  }

  generateReport(results: LinkValidationResult[]): string {
    const summary = {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      invalid: results.filter(r => r.status === 'invalid').length,
      redirect: results.filter(r => r.status === 'redirect').length,
      error: results.filter(r => r.status === 'error').length,
    };

    let report = `Link Validation Report\n`;
    report += `=====================\n\n`;
    report += `Summary:\n`;
    report += `- Total Links: ${summary.total}\n`;
    report += `- Valid: ${summary.valid} (${((summary.valid / summary.total) * 100).toFixed(1)}%)\n`;
    report += `- Invalid: ${summary.invalid} (${((summary.invalid / summary.total) * 100).toFixed(1)}%)\n`;
    report += `- Redirects: ${summary.redirect}\n`;
    report += `- Errors: ${summary.error}\n\n`;

    // Group by status
    const grouped = {
      valid: results.filter(r => r.status === 'valid'),
      invalid: results.filter(r => r.status === 'invalid'),
      redirect: results.filter(r => r.status === 'redirect'),
      error: results.filter(r => r.status === 'error'),
    };

    // Report invalid links
    if (grouped.invalid.length > 0) {
      report += `Invalid Links:\n`;
      report += `--------------\n`;
      grouped.invalid.forEach(result => {
        report += `- ${result.url} (${result.statusCode || 'N/A'})\n`;
        if (result.vendorInfo) {
          report += `  Vendor: ${result.vendorInfo.businessName} (${result.vendorInfo.category})\n`;
        }
      });
      report += `\n`;
    }

    // Report errors
    if (grouped.error.length > 0) {
      report += `Errors:\n`;
      report += `-------\n`;
      grouped.error.forEach(result => {
        report += `- ${result.url}: ${result.error}\n`;
        if (result.vendorInfo) {
          report += `  Vendor: ${result.vendorInfo.businessName} (${result.vendorInfo.category})\n`;
        }
      });
      report += `\n`;
    }

    // Report redirects
    if (grouped.redirect.length > 0) {
      report += `Redirects:\n`;
      report += `----------\n`;
      grouped.redirect.forEach(result => {
        report += `- ${result.url} -> ${result.redirectUrl}\n`;
        if (result.vendorInfo) {
          report += `  Vendor: ${result.vendorInfo.businessName} (${result.vendorInfo.category})\n`;
        }
      });
    }

    return report;
  }
}