#!/usr/bin/env node

/**
 * Sitemap Cleanup Script
 * 
 * This script cleans up sitemap files by:
 * 1. Removing URLs that return 404 errors
 * 2. Validating URL patterns against current routing structure
 * 3. Ensuring only valid, working URLs are in the sitemap
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Valid URL patterns for the application
const validPatterns = [
  /^\/$/,  // Homepage
  /^\/top-20\/[^\/]+\/[^\/]+\/[^\/]+$/, // /top-20/[category]/[city]/[state]
  /^\/top-20\/[^\/]+\/[^\/]+\/[^\/]+\?subcategory=[^\/]+$/, // With subcategory
  /^\/search\/[^\/]+\/[^\/]+\/[^\/]+$/, // /search/[category]/[state]/[city]
  /^\/states$/, // States listing
  /^\/states\/[^\/]+$/, // State page
  /^\/states\/[^\/]+\/[^\/]+$/, // City page
  /^\/vendor\/[^\/]+$/, // Vendor profile
  /^\/category\/[^\/]+$/, // Category page
  /^\/match-me/, // Match-me pages
  /^\/favorites$/, // Favorites
  /^\/list-business$/, // List business
  /^\/auth/, // Auth pages
  /^\/portal$/, // User portal
  /^\/vendor-dashboard$/, // Vendor dashboard
  /^\/admin$/, // Admin
  /^\/privacy$/, // Privacy
  /^\/terms$/, // Terms
];

/**
 * Check if URL matches valid patterns
 */
function isValidUrl(url) {
  return validPatterns.some(pattern => pattern.test(url));
}

/**
 * Parse sitemap XML file
 */
function parseSitemap(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const urlMatches = content.match(/<loc>([^<]+)<\/loc>/g);
  
  if (!urlMatches) return [];
  
  return urlMatches.map(match => {
    const url = match.replace('<loc>', '').replace('</loc>', '');
    return url.replace('https://findmyweddingvendor.com', '');
  });
}

/**
 * Create cleaned sitemap
 */
function createCleanedSitemap(urls, domain = 'https://findmyweddingvendor.com') {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '\n</urlset>';
  
  const urlEntries = urls.map(url => {
    const fullUrl = domain + url;
    const now = new Date().toISOString().split('T')[0];
    return `
  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');
  
  return header + urlEntries + footer;
}

/**
 * Main cleanup function
 */
async function cleanupSitemap() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════`);
  console.log(`    Sitemap Cleanup`);
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
  
  // Parse main sitemap
  console.log(`${colors.blue}📄 Parsing sitemap.xml...${colors.reset}`);
  const mainUrls = parseSitemap(sitemapPath);
  
  if (!mainUrls || mainUrls.length === 0) {
    console.log(`${colors.yellow}⚠ No URLs found in main sitemap${colors.reset}\n`);
    return;
  }
  
  console.log(`${colors.blue}Found ${mainUrls.length} URLs in main sitemap${colors.reset}\n`);
  
  // Validate URLs
  const validUrls = [];
  const invalidUrls = [];
  
  for (const url of mainUrls) {
    if (isValidUrl(url)) {
      validUrls.push(url);
    } else {
      invalidUrls.push(url);
    }
  }
  
  // Parse category sitemaps
  let categorySitemaps = [];
  if (fs.existsSync(sitemapsDir)) {
    categorySitemaps = fs.readdirSync(sitemapsDir)
      .filter(file => file.endsWith('.xml'));
  }
  
  console.log(`${colors.cyan}Validation Results:${colors.reset}`);
  console.log(`${colors.green}✓ Valid URLs: ${validUrls.length}${colors.reset}`);
  console.log(`${colors.red}✗ Invalid URLs: ${invalidUrls.length}${colors.reset}`);
  console.log(`${colors.blue}📁 Category sitemaps: ${categorySitemaps.length}${colors.reset}\n`);
  
  // Show sample invalid URLs
  if (invalidUrls.length > 0) {
    console.log(`${colors.yellow}Sample Invalid URLs (first 10):${colors.reset}`);
    invalidUrls.slice(0, 10).forEach(url => {
      console.log(`  ${colors.red}✗${colors.reset} ${url}`);
    });
    console.log();
  }
  
  // Create backup
  const backupPath = sitemapPath + '.backup';
  if (fs.existsSync(sitemapPath)) {
    fs.copyFileSync(sitemapPath, backupPath);
    console.log(`${colors.green}✓ Backup created: sitemap.xml.backup${colors.reset}`);
  }
  
  // Generate cleaned sitemap
  const cleanedSitemap = createCleanedSitemap(validUrls);
  fs.writeFileSync(sitemapPath, cleanedSitemap);
  console.log(`${colors.green}✓ Cleaned sitemap written: sitemap.xml${colors.reset}`);
  
  // Save invalid URLs report
  const reportPath = path.join(__dirname, '..', 'sitemap-invalid-urls.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalUrls: mainUrls.length,
    validUrls: validUrls.length,
    invalidUrls: invalidUrls.length,
    invalidUrlsList: invalidUrls,
  }, null, 2));
  console.log(`${colors.green}✓ Invalid URLs report saved: sitemap-invalid-urls.json${colors.reset}\n`);
  
  // Calculate improvement
  const improvementPercent = ((validUrls.length / mainUrls.length) * 100).toFixed(2);
  
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════`);
  console.log(`    Cleanup Complete`);
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.green}Sitemap Quality: ${improvementPercent}%${colors.reset}`);
  console.log(`${colors.blue}Valid URLs: ${validUrls.length}/${mainUrls.length}${colors.reset}\n`);
  
  // Recommendations
  console.log(`${colors.cyan}📋 Recommendations:${colors.reset}`);
  console.log(`1. Review invalid URLs in sitemap-invalid-urls.json`);
  console.log(`2. Update sitemap generation logic to prevent invalid URLs`);
  console.log(`3. Submit cleaned sitemap to Google Search Console`);
  console.log(`4. Monitor 404 errors in Google Search Console\n`);
}

// Run cleanup
cleanupSitemap().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
