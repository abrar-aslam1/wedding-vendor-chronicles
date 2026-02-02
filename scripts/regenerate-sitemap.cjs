#!/usr/bin/env node

/**
 * Script to regenerate the sitemap with correct path-based URLs
 * Run with: node scripts/regenerate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Import configuration (we'll need to use require for JS files)
const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0];
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const MAX_URLS_PER_SITEMAP = 1000;

// Simplified categories list (you can expand this)
const categories = [
  { slug: 'photographers' },
  { slug: 'videographers' },
  { slug: 'venues' },
  { slug: 'caterers' },
  { slug: 'florists' },
  { slug: 'djs-and-bands' },
  { slug: 'cake-designers' },
  { slug: 'wedding-planners' },
  { slug: 'hair-stylists' },
  { slug: 'makeup-artists' },
  { slug: 'bridal-shops' },
  { slug: 'wedding-decorators' }
];

// Simplified subcategories (photographer subcategories as example)
const subcategories = {
  'photographers': [
    { name: 'Documentary Wedding Photographer' },
    { name: 'Fine Art Wedding Photographer' },
    { name: 'Traditional Wedding Photographer' },
    { name: 'Moody Wedding Photographer' },
    { name: 'Light and Airy Photographer' },
    { name: 'Indian Wedding Photographer' },
    { name: 'Destination Wedding Photographer' },
    { name: 'Elopement Photographer' },
    { name: 'Engagement Photographer' },
    { name: 'Bridal Portrait Photographer' }
  ]
};

// Sample locations (first few states for testing)
const locationCodes = {
  'Alabama': {
    cities: {
      'Birmingham': 'BHM',
      'Montgomery': 'MGM',
      'Mobile': 'MOB',
      'Huntsville': 'HSV'
    }
  },
  'Alaska': {
    cities: {
      'Anchorage': 'ANC',
      'Fairbanks': 'FAI',
      'Juneau': 'JNU'
    }
  }
  // Add more states as needed
};

// Helper function to create URL-safe slugs
function createUrlSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate URL
function isValidUrl(url) {
  const duplicateStatePattern = /\/([a-z-]+)\/\1$/;
  if (duplicateStatePattern.test(url)) {
    return false;
  }
  if (/[A-Z]/.test(url)) {
    return false;
  }
  if (/[\s%\?]/.test(url)) {
    return false;
  }
  return true;
}

const URL_TYPES = {
  HOME: { priority: '1.0', changefreq: 'weekly' },
  STATES: { priority: '0.9', changefreq: 'weekly' },
  USER: { priority: '0.5', changefreq: 'monthly' },
  CATEGORY: { priority: '0.8', changefreq: 'weekly' },
  INFO: { priority: '0.6', changefreq: 'monthly' },
  LOCATION: { priority: '0.7', changefreq: 'weekly' },
  SUBCATEGORY: { priority: '0.8', changefreq: 'weekly' },
};

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatUrl({ url, type }) {
  const { priority, changefreq } = URL_TYPES[type];
  const escapedUrl = escapeXml(`${BASE_URL}${url}`);
  return `  <url>\n    <loc>${escapedUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
}

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function createSitemap(name, urls) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';
  
  const urlsXml = urls.map(formatUrl).join('');
  const sitemap = xmlHeader + urlsetOpen + urlsXml + urlsetClose;
  
  fs.writeFileSync(path.join(SITEMAP_DIR, `${name}.xml`), sitemap.trim());
  
  const compressed = zlib.gzipSync(sitemap);
  fs.writeFileSync(path.join(SITEMAP_DIR, `${name}.xml.gz`), compressed);
  
  console.log(`✓ Created sitemap: ${name}.xml with ${urls.length} URLs`);
}

function createSitemapIndex(sitemapFiles) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapIndexClose = '</sitemapindex>';
  
  const sitemapsXml = sitemapFiles.map(file => {
    const escapedUrl = escapeXml(`${BASE_URL}/sitemaps/${file}`);
    return `  <sitemap>\n    <loc>${escapedUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n`;
  }).join('');
  
  const sitemapIndex = xmlHeader + sitemapIndexOpen + sitemapsXml + sitemapIndexClose;
  
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemapIndex.trim());
  
  const compressed = zlib.gzipSync(sitemapIndex);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml.gz'), compressed);
  
  console.log(`✓ Created sitemap index with ${sitemapFiles.length} sitemaps`);
}

function generateSitemap() {
  console.log('🚀 Starting sitemap generation with PATH-BASED URLs...\n');
  
  // Ensure directory exists
  if (!fs.existsSync(SITEMAP_DIR)) {
    fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  }
  
  // Static URLs
  const staticUrls = [
    { url: '/', type: 'HOME' },
    { url: '/states', type: 'STATES' },
    { url: '/auth', type: 'USER' },
    { url: '/favorites', type: 'USER' },
    { url: '/privacy', type: 'INFO' },
    { url: '/terms', type: 'INFO' },
    { url: '/list-business', type: 'INFO' }
  ];
  
  // Add category URLs
  categories.forEach(category => {
    staticUrls.push({
      url: `/top-20/${category.slug}`,
      type: 'CATEGORY'
    });
  });
  
  createSitemap('static', staticUrls);
  const sitemapFiles = ['static.xml'];
  
  // Generate location URLs by category
  const locationUrlsByCategory = {};
  
  categories.forEach(category => {
    locationUrlsByCategory[category.slug] = [];
  });
  
  // Generate URLs for each state, city, and category
  Object.entries(locationCodes).forEach(([state, stateData]) => {
    Object.entries(stateData.cities).forEach(([city, cityCode]) => {
      categories.forEach(category => {
        const citySlug = createUrlSlug(city);
        const stateSlug = createUrlSlug(state);
        
        // Main category URL (2 segments)
        const mainUrl = `/top-20/${category.slug}/${citySlug}/${stateSlug}`;
        
        if (isValidUrl(mainUrl)) {
          locationUrlsByCategory[category.slug].push({
            url: mainUrl,
            type: 'LOCATION'
          });
        }
        
        // Subcategory URLs (3 segments) - NEW PATH-BASED STRUCTURE
        if (subcategories[category.slug]) {
          subcategories[category.slug].forEach(subcategory => {
            const subcategorySlug = createUrlSlug(subcategory.name);
            // NEW: /top-20/[category]/[subcategory]/[city]/[state]
            const subcategoryUrl = `/top-20/${category.slug}/${subcategorySlug}/${citySlug}/${stateSlug}`;
            
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
  
  // Create separate sitemaps for each category
  for (const [category, urls] of Object.entries(locationUrlsByCategory)) {
    if (urls.length === 0) continue;
    
    const chunks = chunkArray(urls, MAX_URLS_PER_SITEMAP);
    
    if (chunks.length === 1) {
      createSitemap(category, urls);
      sitemapFiles.push(`${category}.xml`);
    } else {
      chunks.forEach((chunk, index) => {
        const filename = `${category}-${index + 1}`;
        createSitemap(filename, chunk);
        sitemapFiles.push(`${filename}.xml`);
      });
    }
  }
  
  createSitemapIndex(sitemapFiles);
  
  console.log('\n✅ Sitemap generation complete!');
  console.log(`📊 Total sitemaps created: ${sitemapFiles.length}`);
  console.log('\n🔍 Verification:');
  console.log('   - All URLs use path-based structure (NO query parameters)');
  console.log('   - Format: /top-20/[category]/[subcategory]/[city]/[state]');
  console.log('   - Example: /top-20/photographers/documentary-wedding-photographer/birmingham/alabama');
}

// Run the generator
generateSitemap();
