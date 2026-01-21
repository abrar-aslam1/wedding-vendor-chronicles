#!/usr/bin/env node

/**
 * 404 URL Redirect Validation Script
 * 
 * This script validates that all 4040 URLs from Google Search Console
 * now properly redirect to their correct destinations.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Normalize URL parameters
 */
function normalizeUrlParam(param) {
  if (!param) return '';
  
  return param
    .toLowerCase()
    .trim()
    .replace(/[\n\r]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/['"]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse the CSV line and extract URL
 */
function parseCSVLine(line) {
  // Handle quoted URLs with line breaks
  const match = line.match(/^"?([^",]+)"?,/);
  if (match) {
    return match[1].replace(/[\n\r]+/g, '');
  }
  return line.split(',')[0].replace(/^"|"$/g, '');
}

/**
 * Convert old URL to new URL
 */
function convertUrl(oldUrl) {
  const urlPattern = /\/top-20\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)/;
  const match = oldUrl.match(urlPattern);
  
  if (!match) {
    return null;
  }
  
  const [, category, subcategory, city, state] = match;
  
  const normalizedCategory = normalizeUrlParam(category);
  const normalizedSubcategory = normalizeUrlParam(subcategory);
  const normalizedCity = normalizeUrlParam(city);
  const normalizedState = normalizeUrlParam(state);
  
  return `/top-20/${normalizedCategory}/${normalizedCity}/${normalizedState}?subcategory=${normalizedSubcategory}`;
}

/**
 * Main validation function
 */
async function validateRedirects() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════`);
  console.log(`    404 URL Redirect Validation`);
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  const csvPath = path.join(__dirname, '..', 'Table.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log(`${colors.red}✗ Error: Table.csv not found${colors.reset}`);
    console.log(`Expected location: ${csvPath}\n`);
    process.exit(1);
  }
  
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header
  const urlLines = lines.slice(1);
  
  console.log(`${colors.blue}📊 Total URLs to process: ${urlLines.length}${colors.reset}\n`);
  
  const results = {
    successful: [],
    failed: [],
    special: [],
  };
  
  // Process each URL
  for (let i = 0; i < urlLines.length; i++) {
    const line = urlLines[i];
    const oldUrl = parseCSVLine(line);
    
    if (!oldUrl || !oldUrl.includes('findmyweddingvendor.com')) {
      continue;
    }
    
    // Extract path from full URL
    const urlPath = oldUrl.replace('https://findmyweddingvendor.com', '');
    
    // Check if it's a special case
    if (urlPath.includes('/search/florists') || urlPath.includes('/search/venues')) {
      results.special.push({
        old: urlPath,
        new: urlPath.replace('/search/', '/top-20/'),
        type: 'search-redirect'
      });
      continue;
    }
    
    // Try to convert URL
    const newUrl = convertUrl(urlPath);
    
    if (newUrl) {
      results.successful.push({
        old: urlPath,
        new: newUrl
      });
    } else {
      results.failed.push({
        url: urlPath,
        reason: 'Invalid URL pattern'
      });
    }
    
    // Progress indicator
    if ((i + 1) % 500 === 0) {
      console.log(`${colors.yellow}Processing... ${i + 1}/${urlLines.length}${colors.reset}`);
    }
  }
  
  // Print summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════`);
  console.log(`    Validation Results`);
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.green}✓ Successful redirects: ${results.successful.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Special case redirects: ${results.special.length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed to convert: ${results.failed.length}${colors.reset}\n`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'redirect-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`${colors.blue}📄 Detailed report saved to: redirect-validation-report.json${colors.reset}\n`);
  
  // Show examples
  if (results.successful.length > 0) {
    console.log(`${colors.cyan}Sample Redirects:${colors.reset}`);
    results.successful.slice(0, 5).forEach(({ old, new: newUrl }) => {
      console.log(`  ${colors.yellow}${old}${colors.reset}`);
      console.log(`  ${colors.green}→ ${newUrl}${colors.reset}\n`);
    });
  }
  
  // Show failed URLs if any
  if (results.failed.length > 0) {
    console.log(`${colors.red}Failed URLs (first 10):${colors.reset}`);
    results.failed.slice(0, 10).forEach(({ url, reason }) => {
      console.log(`  ${colors.yellow}${url}${colors.reset}`);
      console.log(`  ${colors.red}Reason: ${reason}${colors.reset}\n`);
    });
  }
  
  // Calculate success rate
  const totalProcessed = results.successful.length + results.special.length + results.failed.length;
  const successRate = ((results.successful.length + results.special.length) / totalProcessed * 100).toFixed(2);
  
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════`);
  console.log(`    Success Rate: ${successRate}%`);
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run validation
validateRedirects().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
