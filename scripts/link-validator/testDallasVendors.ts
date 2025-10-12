import { LinkValidator, InstagramValidationResult } from './linkValidator';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

interface DallasVendor {
  id?: string;
  business_name: string;
  instagram_handle: string;
  instagram_url: string;
  category: string;
  city: string;
  state: string;
  website_url?: string;
  verified?: boolean;
}

interface ValidationReport {
  timestamp: string;
  totalVendors: number;
  totalChecked: number;
  results: {
    valid: number;
    invalid: number;
    redirect: number;
    error: number;
  };
  invalidVendors: Array<{
    businessName: string;
    category: string;
    instagramHandle: string;
    instagramUrl: string;
    status: string;
    error?: string;
    statusCode?: number;
  }>;
  privateAccounts: Array<{
    businessName: string;
    category: string;
    instagramHandle: string;
  }>;
  redirects: Array<{
    businessName: string;
    category: string;
    originalUrl: string;
    redirectUrl: string;
  }>;
  detailedResults: InstagramValidationResult[];
}

async function loadDallasVendors(): Promise<DallasVendor[]> {
  // First, try to load from the JSON file
  const jsonPath = path.join(__dirname, '../python/instagram_scraper/complete_dallas_directory_20250709_182301.json');
  
  if (fs.existsSync(jsonPath)) {
    console.log('Loading Dallas vendors from JSON file...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // Extract vendors from detailed_vendors structure
    const vendors: DallasVendor[] = [];
    if (data.detailed_vendors) {
      for (const [category, categoryVendors] of Object.entries(data.detailed_vendors)) {
        if (Array.isArray(categoryVendors)) {
          vendors.push(...categoryVendors.map((vendor: any) => ({
            ...vendor,
            category: category.replace('-', ' ')
          })));
        }
      }
    }
    
    return vendors;
  }

  // If JSON doesn't exist, load from database
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    console.log('Loading Dallas vendors from Supabase...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('instagram_vendors')
      .select('*')
      .eq('city', 'Dallas')
      .eq('state', 'TX');

    if (error) {
      throw new Error(`Failed to load vendors from database: ${error.message}`);
    }

    return data || [];
  }

  throw new Error('No data source available. Please provide either JSON file or Supabase credentials.');
}

async function testDallasVendors(outputPath?: string): Promise<ValidationReport> {
  console.log('Starting Dallas vendor link validation...\n');
  
  const validator = new LinkValidator(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Load vendors
  const vendors = await loadDallasVendors();
  console.log(`Found ${vendors.length} Dallas vendors to validate\n`);

  // Validate Instagram links
  const results: InstagramValidationResult[] = [];
  const invalidVendors: ValidationReport['invalidVendors'] = [];
  const privateAccounts: ValidationReport['privateAccounts'] = [];
  const redirects: ValidationReport['redirects'] = [];

  // Group vendors by category for better reporting
  const vendorsByCategory = vendors.reduce((acc, vendor) => {
    if (!acc[vendor.category]) {
      acc[vendor.category] = [];
    }
    acc[vendor.category].push(vendor);
    return acc;
  }, {} as Record<string, DallasVendor[]>);

  // Process vendors by category
  for (const [category, categoryVendors] of Object.entries(vendorsByCategory)) {
    console.log(`\nValidating ${category} (${categoryVendors.length} vendors)...`);
    
    for (let i = 0; i < categoryVendors.length; i++) {
      const vendor = categoryVendors[i];
      process.stdout.write(`  [${i + 1}/${categoryVendors.length}] ${vendor.business_name}... `);
      
      try {
        const result = await validator.validateInstagramProfile(vendor.instagram_handle);
        results.push(result);
        
        if (result.status === 'invalid' || !result.profileExists) {
          process.stdout.write('❌ INVALID\n');
          invalidVendors.push({
            businessName: vendor.business_name,
            category: vendor.category,
            instagramHandle: vendor.instagram_handle,
            instagramUrl: vendor.instagram_url,
            status: result.status,
            error: result.error,
            statusCode: result.statusCode,
          });
        } else if (result.status === 'redirect') {
          process.stdout.write('↪️ REDIRECT\n');
          redirects.push({
            businessName: vendor.business_name,
            category: vendor.category,
            originalUrl: result.url,
            redirectUrl: result.redirectUrl || 'Unknown',
          });
        } else if (result.isPrivate) {
          process.stdout.write('🔒 PRIVATE\n');
          privateAccounts.push({
            businessName: vendor.business_name,
            category: vendor.category,
            instagramHandle: vendor.instagram_handle,
          });
        } else {
          process.stdout.write('✅ OK\n');
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        process.stdout.write('⚠️ ERROR\n');
        console.error(`    Error: ${error}`);
      }
    }
  }

  // Generate report
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    totalVendors: vendors.length,
    totalChecked: results.length,
    results: {
      valid: results.filter(r => r.status === 'valid' && r.profileExists).length,
      invalid: results.filter(r => r.status === 'invalid' || !r.profileExists).length,
      redirect: results.filter(r => r.status === 'redirect').length,
      error: results.filter(r => r.status === 'error').length,
    },
    invalidVendors,
    privateAccounts,
    redirects,
    detailedResults: results,
  };

  // Save report
  const reportPath = outputPath || path.join(__dirname, `dallas_vendor_validation_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate human-readable summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Vendors: ${report.totalVendors}`);
  console.log(`Checked: ${report.totalChecked}`);
  console.log(`Valid: ${report.results.valid} (${((report.results.valid / report.totalChecked) * 100).toFixed(1)}%)`);
  console.log(`Invalid: ${report.results.invalid} (${((report.results.invalid / report.totalChecked) * 100).toFixed(1)}%)`);
  console.log(`Private Accounts: ${report.privateAccounts.length}`);
  console.log(`Redirects: ${report.results.redirect}`);
  console.log(`Errors: ${report.results.error}`);
  
  if (invalidVendors.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('INVALID VENDORS (Need Attention)');
    console.log('='.repeat(60));
    
    const invalidByCategory = invalidVendors.reduce((acc, vendor) => {
      if (!acc[vendor.category]) {
        acc[vendor.category] = [];
      }
      acc[vendor.category].push(vendor);
      return acc;
    }, {} as Record<string, typeof invalidVendors>);
    
    for (const [category, vendors] of Object.entries(invalidByCategory)) {
      console.log(`\n${category}:`);
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.businessName} (@${vendor.instagramHandle})`);
        console.log(`    Status: ${vendor.status}, Error: ${vendor.error || 'Profile not found'}`);
      });
    }
  }
  
  console.log(`\nFull report saved to: ${reportPath}`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  testDallasVendors()
    .then(() => {
      console.log('\nValidation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export { testDallasVendors };
export type { ValidationReport };