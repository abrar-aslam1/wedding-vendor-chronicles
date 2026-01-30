import { categories } from '@/config/categories';
import { locationCodes } from '@/config/locations';
import { subcategories } from '@/config/subcategories';
import { blogPosts } from '../config/blog-posts';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0]; // Just the date part for cleaner output
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const MAX_URLS_PER_SITEMAP = 1000; // Keep each sitemap file manageable

// Helper function to create URL-safe slugs
function createUrlSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/&/g, 'and')            // & to 'and' (cleaner than %26 in URLs)
    .replace(/[^\w\-]/g, '')         // remove other special chars
    .replace(/\-\-+/g, '-')          // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');        // trim hyphens from ends
}

// Validate that a URL doesn't have invalid patterns
function isValidUrl(url: string): boolean {
  // Reject URLs with duplicate state/state patterns
  const duplicateStatePattern = /\/([a-z-]+)\/\1$/;
  if (duplicateStatePattern.test(url)) {
    return false;
  }
  
  // Reject URLs with uppercase letters (should be all lowercase)
  if (/[A-Z]/.test(url)) {
    return false;
  }
  
  // Reject URLs with spaces or special chars that shouldn't be there
  if (/[\s%]/.test(url)) {
    return false;
  }
  
  return true;
}

// URL types with their priorities and change frequencies
const URL_TYPES = {
  HOME: { priority: '1.0', changefreq: 'weekly' },
  STATES: { priority: '0.9', changefreq: 'weekly' },
  USER: { priority: '0.5', changefreq: 'monthly' },
  CATEGORY: { priority: '0.8', changefreq: 'weekly' },
  INFO: { priority: '0.6', changefreq: 'monthly' },
  LOCATION: { priority: '0.7', changefreq: 'weekly' },
  SUBCATEGORY: { priority: '0.8', changefreq: 'weekly' },
  BLOG: { priority: '0.9', changefreq: 'weekly' },
  BLOG_POST: { priority: '0.8', changefreq: 'monthly' }
};

const generateSitemap = () => {
  // Ensure the sitemaps directory exists
  if (!fs.existsSync(SITEMAP_DIR)) {
    fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  }
  
  // Create arrays for different types of URLs
  const mainUrls = [
    { url: '/', type: 'HOME' },
    { url: '/states', type: 'STATES' }
  ];
  
  const userUrls = [
    { url: '/auth', type: 'USER' },
    { url: '/favorites', type: 'USER' }
  ];
  
  // Changed from /search/ to /top-20/ to match actual routes
  const categoryUrls = categories.map(category => ({
    url: `/top-20/${category.slug}`,
    type: 'CATEGORY'
  }));
  
  const infoUrls = [
    { url: '/privacy', type: 'INFO' },
    { url: '/terms', type: 'INFO' },
    { url: '/list-business', type: 'INFO' }
  ];
  
  // Generate blog URLs
  const blogMainUrl = { url: '/blog', type: 'BLOG' };
  
  // Generate individual blog post URLs
  const blogPostUrls = blogPosts.map(post => ({
    url: `/blog/${post.slug}`,
    type: 'BLOG_POST'
  }));
  
  // Generate blog category URLs
  const blogCategories = Array.from(new Set(blogPosts.map(post => post.category)))
    .filter(Boolean)
    .map(category => ({
      url: `/blog/category/${category.toLowerCase().replace(/ /g, '-')}`,
      type: 'BLOG'
    }));
  
  // Generate blog tag URLs
  const blogTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || [])))
    .filter(Boolean)
    .map(tag => ({
      url: `/blog/tag/${tag.toLowerCase().replace(/ /g, '-')}`,
      type: 'BLOG'
    }));
  
  // Generate location URLs by category
  const locationUrlsByCategory: Record<string, Array<{ url: string; type: string }>> = {};
  
  // Initialize an array for each category
  categories.forEach(category => {
    locationUrlsByCategory[category.slug] = [];
  });
  
  // Generate URLs for each state, city, and category
  Object.entries(locationCodes).forEach(([state, stateData]) => {
    Object.entries(stateData.cities).forEach(([city, cityCode]) => {
      // Add URLs for each category in this location
      categories.forEach(category => {
        const citySlug = createUrlSlug(city);
        const stateSlug = createUrlSlug(state);
        
        // Add the main category URL with properly slugified city and state
        const mainUrl = `/top-20/${category.slug}/${citySlug}/${stateSlug}`;
        
        // Validate before adding
        if (isValidUrl(mainUrl)) {
          locationUrlsByCategory[category.slug].push({
            url: mainUrl,
            type: 'LOCATION'
          });
        }
        
        // Add subcategory URLs if available for this category
        // NEW: Using path segments for subcategories instead of query parameters
        if (subcategories[category.slug]) {
          subcategories[category.slug].forEach(subcategory => {
            const subcategorySlug = createUrlSlug(subcategory.name);
            // New path structure: /top-20/[category]/[subcategory]/[city]/[state]
            const subcategoryUrl = `/top-20/${category.slug}/${subcategorySlug}/${citySlug}/${stateSlug}`;
            
            // Validate before adding
            if (isValidUrl(subcategoryUrl)) {
              locationUrlsByCategory[category.slug].push({
                url: subcategoryUrl,
                type: 'SUBCATEGORY'
              });
            }
          });
        }
      });
    });
  });
  
  // Create a sitemap for main, user, category, info, and blog pages
  const staticUrls = [
    ...mainUrls, 
    ...userUrls, 
    ...categoryUrls, 
    ...infoUrls,
    blogMainUrl,
    ...blogPostUrls,
    ...blogCategories,
    ...blogTags
  ];
  createSitemap('static', staticUrls);
  
  // Create separate sitemaps for each category's location pages
  const sitemapFiles = ['static.xml']; // Use uncompressed version in sitemap index
  
  for (const [category, urls] of Object.entries(locationUrlsByCategory)) {
    // Split into chunks if needed
    const chunks = chunkArray(urls, MAX_URLS_PER_SITEMAP);
    
    if (chunks.length === 1) {
      // Just one sitemap for this category
      createSitemap(category, urls);
      sitemapFiles.push(`${category}.xml`); // Use uncompressed version in sitemap index
    } else {
      // Multiple sitemaps for this category
      chunks.forEach((chunk, index) => {
        const filename = `${category}-${index + 1}`;
        createSitemap(filename, chunk);
        sitemapFiles.push(`${filename}.xml`); // Use uncompressed version in sitemap index
      });
    }
  }
  
  // Create sitemap index file
  createSitemapIndex(sitemapFiles);
  
  // Create/update robots.txt to reference the sitemap index
  updateRobotsTxt();
  
  console.log(`Sitemaps generated successfully in ${SITEMAP_DIR}!`);
  console.log(`Created sitemap index with ${sitemapFiles.length} sitemap files.`);
};

// Helper function to create a sitemap file
function createSitemap(name, urls) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';
  
  const urlsXml = urls.map(formatUrl).join('');
  
  const sitemap = xmlHeader + urlsetOpen + urlsXml + urlsetClose;
  
  // Write uncompressed version
  fs.writeFileSync(path.join(SITEMAP_DIR, `${name}.xml`), sitemap.trim());
  
  // Write gzipped version
  const compressed = zlib.gzipSync(sitemap);
  fs.writeFileSync(path.join(SITEMAP_DIR, `${name}.xml.gz`), compressed);
  
  console.log(`Created sitemap: ${name}.xml with ${urls.length} URLs (+ gzipped version)`);
}

// Helper function to create a sitemap index file
function createSitemapIndex(sitemapFiles) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapIndexClose = '</sitemapindex>';
  
  const sitemapsXml = sitemapFiles.map(file => {
    // Escape the URL to ensure it's valid XML
    const escapedUrl = escapeXml(`${BASE_URL}/sitemaps/${file}`);
    return `  <sitemap>\n    <loc>${escapedUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n`;
  }).join('');
  
  const sitemapIndex = xmlHeader + sitemapIndexOpen + sitemapsXml + sitemapIndexClose;
  
  // Write the sitemap index file
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemapIndex.trim());
  
  // Also create a gzipped version
  const compressed = zlib.gzipSync(sitemapIndex);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml.gz'), compressed);
}

// Helper function to update robots.txt
function updateRobotsTxt() {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  let robotsContent = '';
  
  // Read existing robots.txt if it exists
  if (fs.existsSync(robotsPath)) {
    robotsContent = fs.readFileSync(robotsPath, 'utf8');
    
    // Remove any existing Sitemap: lines and sitemap-related comments
    robotsContent = robotsContent
      .split('\n')
      .filter(line => {
        const trimmedLine = line.trim().toLowerCase();
        return !line.startsWith('Sitemap:') && 
               !trimmedLine.startsWith('# sitemap') &&
               !trimmedLine.includes('sitemap location');
      })
      .join('\n');
  } else {
    // Create a basic robots.txt if it doesn't exist
    robotsContent = 'User-agent: *\nAllow: /\n';
  }
  
  // Add sitemap reference with escaped URL
  const escapedSitemapUrl = escapeXml(`${BASE_URL}/sitemap.xml`);
  robotsContent = robotsContent.trim() + '\n\n# Sitemaps\nSitemap: ' + escapedSitemapUrl + '\n';
  
  // Write the updated robots.txt
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('Updated robots.txt with sitemap reference');
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper function to format a URL entry with proper indentation
function formatUrl({ url, type }) {
  const { priority, changefreq } = URL_TYPES[type];
  // Escape the URL to ensure it's valid XML
  const escapedUrl = escapeXml(`${BASE_URL}${url}`);
  return `  <url>\n    <loc>${escapedUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

// Helper function to split an array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export default generateSitemap;
