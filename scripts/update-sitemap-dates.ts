import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { DOMParser, XMLSerializer } from 'xmldom';

/**
 * This script updates the lastmod dates in the sitemap index and individual sitemaps
 * to encourage search engines to crawl the site more frequently.
 * 
 * It should be run periodically (e.g., weekly) to keep the dates fresh.
 */

const SITEMAP_INDEX_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');
const SITEMAPS_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const TODAY = new Date().toISOString().split('T')[0]; // Just the date part for cleaner output

// Priority categories that should be updated more frequently
const HIGH_PRIORITY_CATEGORIES = ['venues', 'photographers', 'caterers', 'wedding-planners'];

/**
 * Updates the lastmod dates in the sitemap index file
 */
function updateSitemapIndex() {
  console.log('Updating sitemap index lastmod dates...');
  
  try {
    // Read the sitemap index
    const sitemapIndexContent = fs.readFileSync(SITEMAP_INDEX_PATH, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapIndexContent, 'text/xml');
    
    // Get all sitemap elements
    const sitemaps = xmlDoc.getElementsByTagName('sitemap');
    let updatedCount = 0;
    
    // Update each sitemap's lastmod date
    for (let i = 0; i < sitemaps.length; i++) {
      const sitemap = sitemaps[i];
      const locElement = sitemap.getElementsByTagName('loc')[0];
      const lastmodElement = sitemap.getElementsByTagName('lastmod')[0];
      
      if (locElement && lastmodElement) {
        const loc = locElement.textContent || '';
        
        // Check if this is a high-priority category
        const isHighPriority = HIGH_PRIORITY_CATEGORIES.some(category => 
          loc.includes(`/${category}.xml`) || loc.includes(`/${category}-`)
        );
        
        // Update the lastmod date
        if (isHighPriority) {
          lastmodElement.textContent = TODAY;
          updatedCount++;
        }
      }
    }
    
    // Serialize the XML document back to a string
    const serializer = new XMLSerializer();
    const updatedContent = serializer.serializeToString(xmlDoc);
    
    // Write the updated content back to the file
    fs.writeFileSync(SITEMAP_INDEX_PATH, updatedContent);
    
    // Also update the gzipped version if it exists
    const gzippedPath = `${SITEMAP_INDEX_PATH}.gz`;
    if (fs.existsSync(gzippedPath)) {
      const compressed = zlib.gzipSync(updatedContent);
      fs.writeFileSync(gzippedPath, compressed);
    }
    
    console.log(`Updated ${updatedCount} high-priority sitemaps in the sitemap index.`);
  } catch (error) {
    console.error('Error updating sitemap index:', error);
  }
}

/**
 * Updates the lastmod dates in individual sitemap files
 */
function updateIndividualSitemaps() {
  console.log('Updating individual sitemap lastmod dates...');
  
  try {
    // Get all XML files in the sitemaps directory
    const sitemapFiles = fs.readdirSync(SITEMAPS_DIR)
      .filter(file => file.endsWith('.xml') && !file.endsWith('.gz'));
    
    let totalUrlsUpdated = 0;
    
    // Process each sitemap file
    for (const file of sitemapFiles) {
      // Check if this is a high-priority category
      const isHighPriority = HIGH_PRIORITY_CATEGORIES.some(category => 
        file.startsWith(category) || file === 'static.xml'
      );
      
      if (!isHighPriority) continue;
      
      const filePath = path.join(SITEMAPS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      // Get all URL elements
      const urls = xmlDoc.getElementsByTagName('url');
      let urlsUpdated = 0;
      
      // Update each URL's lastmod date
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const lastmodElement = url.getElementsByTagName('lastmod')[0];
        
        if (lastmodElement) {
          lastmodElement.textContent = TODAY;
          urlsUpdated++;
        }
      }
      
      // Serialize the XML document back to a string
      const serializer = new XMLSerializer();
      const updatedContent = serializer.serializeToString(xmlDoc);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent);
      
      // Also update the gzipped version
      const gzippedPath = `${filePath}.gz`;
      if (fs.existsSync(gzippedPath)) {
        const compressed = zlib.gzipSync(updatedContent);
        fs.writeFileSync(gzippedPath, compressed);
      }
      
      console.log(`Updated ${urlsUpdated} URLs in ${file}`);
      totalUrlsUpdated += urlsUpdated;
    }
    
    console.log(`Total URLs updated across all sitemaps: ${totalUrlsUpdated}`);
  } catch (error) {
    console.error('Error updating individual sitemaps:', error);
  }
}

// Execute the updates
updateSitemapIndex();
updateIndividualSitemaps();

console.log('Sitemap date updates completed successfully!');
