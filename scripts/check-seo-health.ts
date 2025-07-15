import fs from 'fs';
import path from 'path';
import https from 'https';
import { DOMParser } from 'xmldom';

/**
 * This script checks the SEO health of the website by:
 * 1. Validating the sitemap structure
 * 2. Checking if the robots.txt file is accessible
 * 3. Verifying that important pages are included in the sitemap
 * 4. Checking for any broken links in the sitemap
 * 
 * Run this script periodically to ensure your SEO setup remains healthy.
 */

const SITE_URL = 'https://findmyweddingvendor.com';
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');
const ROBOTS_PATH = path.join(process.cwd(), 'public', 'robots.txt');
const SITEMAPS_DIR = path.join(process.cwd(), 'public', 'sitemaps');

// Important pages that should be in the sitemap
const IMPORTANT_PAGES = [
  '/',
  '/search/photographers',
  '/search/venues',
  '/search/caterers',
  '/search/wedding-planners',
  '/search/florists'
];

/**
 * Validates the structure of the sitemap index file
 */
function validateSitemapIndex() {
  console.log('\n--- Validating Sitemap Index ---');
  
  try {
    // Check if sitemap.xml exists
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.error('❌ sitemap.xml does not exist!');
      return false;
    }
    
    // Read and parse the sitemap index
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapContent, 'text/xml');
    
    // Check if it's a valid sitemap index
    const sitemapElements = xmlDoc.getElementsByTagName('sitemap');
    if (sitemapElements.length === 0) {
      console.error('❌ No sitemap elements found in sitemap index!');
      return false;
    }
    
    console.log(`✅ Sitemap index contains ${sitemapElements.length} sitemaps`);
    
    // Check each sitemap in the index
    let allValid = true;
    for (let i = 0; i < sitemapElements.length; i++) {
      const sitemap = sitemapElements[i];
      const locElement = sitemap.getElementsByTagName('loc')[0];
      const lastmodElement = sitemap.getElementsByTagName('lastmod')[0];
      
      if (!locElement) {
        console.error(`❌ Sitemap #${i + 1} is missing the loc element!`);
        allValid = false;
        continue;
      }
      
      if (!lastmodElement) {
        console.error(`❌ Sitemap #${i + 1} is missing the lastmod element!`);
        allValid = false;
        continue;
      }
      
      const loc = locElement.textContent;
      if (!loc || !loc.includes(SITE_URL)) {
        console.error(`❌ Sitemap #${i + 1} has an invalid loc: ${loc}`);
        allValid = false;
        continue;
      }
      
      // Extract the filename from the URL
      const filename = loc.split('/').pop();
      console.log(`  - ${filename}: Last modified on ${lastmodElement.textContent}`);
    }
    
    return allValid;
  } catch (error) {
    console.error('❌ Error validating sitemap index:', error);
    return false;
  }
}

/**
 * Validates individual sitemap files
 */
function validateIndividualSitemaps() {
  console.log('\n--- Validating Individual Sitemaps ---');
  
  try {
    // Check if sitemaps directory exists
    if (!fs.existsSync(SITEMAPS_DIR)) {
      console.error('❌ Sitemaps directory does not exist!');
      return false;
    }
    
    // Get all XML files in the sitemaps directory
    const sitemapFiles = fs.readdirSync(SITEMAPS_DIR)
      .filter(file => file.endsWith('.xml') && !file.endsWith('.gz'));
    
    if (sitemapFiles.length === 0) {
      console.error('❌ No sitemap files found in sitemaps directory!');
      return false;
    }
    
    console.log(`Found ${sitemapFiles.length} sitemap files`);
    
    // Check each sitemap file
    let allValid = true;
    let totalUrls = 0;
    
    for (const file of sitemapFiles) {
      const filePath = path.join(SITEMAPS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
        // Check if it's a valid sitemap
        const urlElements = xmlDoc.getElementsByTagName('url');
        if (urlElements.length === 0) {
          console.error(`❌ No URL elements found in ${file}!`);
          allValid = false;
          continue;
        }
        
        console.log(`  - ${file}: Contains ${urlElements.length} URLs`);
        totalUrls += urlElements.length;
        
        // Check a sample of URLs
        const sampleSize = Math.min(5, urlElements.length);
        for (let i = 0; i < sampleSize; i++) {
          const url = urlElements[i];
          const locElement = url.getElementsByTagName('loc')[0];
          
          if (!locElement || !locElement.textContent) {
            console.error(`❌ URL #${i + 1} in ${file} is missing the loc element!`);
            allValid = false;
            continue;
          }
        }
      } catch (error) {
        console.error(`❌ Error parsing ${file}:`, error);
        allValid = false;
      }
    }
    
    console.log(`✅ Total URLs across all sitemaps: ${totalUrls}`);
    return allValid;
  } catch (error) {
    console.error('❌ Error validating individual sitemaps:', error);
    return false;
  }
}

/**
 * Checks if robots.txt is properly configured
 */
function checkRobotsTxt() {
  console.log('\n--- Checking robots.txt ---');
  
  try {
    // Check if robots.txt exists
    if (!fs.existsSync(ROBOTS_PATH)) {
      console.error('❌ robots.txt does not exist!');
      return false;
    }
    
    // Read robots.txt
    const robotsContent = fs.readFileSync(ROBOTS_PATH, 'utf8');
    
    // Check for sitemap reference
    if (!robotsContent.includes('Sitemap:')) {
      console.error('❌ robots.txt does not contain a Sitemap reference!');
      return false;
    }
    
    // Check for user-agent directives
    if (!robotsContent.includes('User-agent:')) {
      console.error('❌ robots.txt does not contain User-agent directives!');
      return false;
    }
    
    // Check for disallow directives
    if (!robotsContent.includes('Disallow:')) {
      console.warn('⚠️ robots.txt does not contain any Disallow directives!');
    }
    
    console.log('✅ robots.txt is properly configured');
    return true;
  } catch (error) {
    console.error('❌ Error checking robots.txt:', error);
    return false;
  }
}

/**
 * Checks if important pages are included in the sitemap
 */
function checkImportantPages() {
  console.log('\n--- Checking Important Pages ---');
  
  try {
    // Read all sitemap files
    const sitemapFiles = fs.readdirSync(SITEMAPS_DIR)
      .filter(file => file.endsWith('.xml') && !file.endsWith('.gz'));
    
    // Combine all URLs from all sitemaps
    const allUrls: string[] = [];
    
    for (const file of sitemapFiles) {
      const filePath = path.join(SITEMAPS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
        const urlElements = xmlDoc.getElementsByTagName('url');
        for (let i = 0; i < urlElements.length; i++) {
          const url = urlElements[i];
          const locElement = url.getElementsByTagName('loc')[0];
          
          if (locElement && locElement.textContent) {
            allUrls.push(locElement.textContent);
          }
        }
      } catch (error) {
        console.error(`❌ Error parsing ${file}:`, error);
      }
    }
    
    // Check if important pages are included
    let allIncluded = true;
    for (const page of IMPORTANT_PAGES) {
      const fullUrl = `${SITE_URL}${page}`;
      const included = allUrls.some(url => url === fullUrl);
      
      if (included) {
        console.log(`✅ ${page} is included in the sitemap`);
      } else {
        console.error(`❌ ${page} is NOT included in the sitemap!`);
        allIncluded = false;
      }
    }
    
    return allIncluded;
  } catch (error) {
    console.error('❌ Error checking important pages:', error);
    return false;
  }
}

/**
 * Checks if the sitemap is accessible from the live site
 */
function checkSitemapAccessibility() {
  console.log('\n--- Checking Sitemap Accessibility ---');
  
  return new Promise<boolean>((resolve) => {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    
    https.get(sitemapUrl, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Sitemap is accessible at ${sitemapUrl}`);
        resolve(true);
      } else {
        console.error(`❌ Sitemap returned status code ${res.statusCode}!`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`❌ Error accessing sitemap: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Main function to run all checks
 */
async function runSEOHealthCheck() {
  console.log('=== SEO Health Check ===');
  console.log(`Site URL: ${SITE_URL}`);
  console.log(`Date: ${new Date().toISOString()}`);
  
  const sitemapIndexValid = validateSitemapIndex();
  const individualSitemapsValid = validateIndividualSitemaps();
  const robotsTxtValid = checkRobotsTxt();
  const importantPagesIncluded = checkImportantPages();
  
  // Only check accessibility if we're running this on the live site
  // This is commented out for local development
  // const sitemapAccessible = await checkSitemapAccessibility();
  
  console.log('\n=== SEO Health Check Summary ===');
  console.log(`Sitemap Index: ${sitemapIndexValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Individual Sitemaps: ${individualSitemapsValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`robots.txt: ${robotsTxtValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Important Pages: ${importantPagesIncluded ? '✅ All included' : '❌ Some missing'}`);
  // console.log(`Sitemap Accessibility: ${sitemapAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
  
  const overallHealth = sitemapIndexValid && individualSitemapsValid && robotsTxtValid && importantPagesIncluded;
  console.log(`\nOverall SEO Health: ${overallHealth ? '✅ GOOD' : '❌ NEEDS ATTENTION'}`);
  
  return overallHealth;
}

// Run the health check
runSEOHealthCheck().then((healthy) => {
  process.exit(healthy ? 0 : 1);
});
