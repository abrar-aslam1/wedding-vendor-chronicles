#!/usr/bin/env node

/**
 * Complete Sitemap Generator - Restores 12,000+ URLs
 * Generates sitemaps for all 50 states, 193 cities, 13 categories, and subcategories
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0];
const SITEMAP_DIR = path.join(process.cwd(), 'public', 'sitemaps');
const MAX_URLS_PER_SITEMAP = 5000;

// All 13 categories
const categories = [
  { slug: 'wedding-planners' },
  { slug: 'photographers' },
  { slug: 'videographers' },
  { slug: 'florists' },
  { slug: 'caterers' },
  { slug: 'venues' },
  { slug: 'djs-and-bands' },
  { slug: 'cake-designers' },
  { slug: 'bridal-shops' },
  { slug: 'makeup-artists' },
  { slug: 'hair-stylists' },
  { slug: 'wedding-decorators' },
  { slug: 'carts' }
];

// Subcategories mapped to categories
const subcategories = {
  'photographers': [
    'documentary-wedding-photographer',
    'fine-art-wedding-photographer',
    'traditional-wedding-photographer',
    'moody-wedding-photographer',
    'light-and-airy-photographer',
    'indian-wedding-photographer',
    'destination-wedding-photographer',
    'elopement-photographer',
    'engagement-photographer',
    'bridal-portrait-photographer'
  ],
  'videographers': [
    'cinematic-wedding-videographer',
    'documentary-wedding-videographer',
    'drone-videographer',
    'same-day-edit-videographer',
    'indian-wedding-videographer',
    'live-streaming-videographer'
  ],
  'florists': [
    'luxury-wedding-florist',
    'bohemian-florist',
    'modern-florist',
    'garden-style-florist',
    'sustainable-florist',
    'indian-wedding-florist',
    'tropical-florist'
  ],
  'wedding-planners': [
    'full-service-wedding-planner',
    'day-of-coordinator',
    'partial-planning-coordinator',
    'destination-wedding-planner',
    'luxury-wedding-planner',
    'indian-wedding-planner',
    'elopement-planner',
    'cultural-wedding-planner'
  ],
  'venues': [
    'barn-wedding-venue',
    'beach-wedding-venue',
    'garden-wedding-venue',
    'ballroom-wedding-venue',
    'vineyard-wedding-venue',
    'historic-wedding-venue',
    'rooftop-wedding-venue',
    'mountain-wedding-venue',
    'intimate-wedding-venue',
    'all-inclusive-wedding-venue'
  ],
  'caterers': [
    'farm-to-table-caterer',
    'indian-wedding-caterer',
    'bbq-wedding-caterer',
    'vegan-wedding-caterer',
    'italian-wedding-caterer',
    'mexican-wedding-caterer',
    'kosher-wedding-caterer',
    'halal-wedding-caterer',
    'food-truck-caterer'
  ],
  'djs-and-bands': [
    'wedding-dj',
    'live-wedding-band',
    'indian-wedding-dj',
    'string-quartet',
    'jazz-band',
    'latin-band',
    'acoustic-duo',
    'solo-musician'
  ],
  'cake-designers': [
    'luxury-wedding-cake-designer',
    'buttercream-cake-artist',
    'fondant-cake-artist',
    'naked-cake-specialist',
    'vegan-wedding-cake-baker',
    'gluten-free-cake-baker',
    'cupcake-wedding-designer'
  ],
  'makeup-artists': [
    'bridal-makeup-artist',
    'indian-bridal-makeup-artist',
    'airbrush-makeup-artist',
    'natural-bridal-makeup',
    'glam-bridal-makeup',
    'on-location-makeup-artist'
  ],
  'hair-stylists': [
    'bridal-hair-stylist',
    'updo-specialist',
    'indian-bridal-hair-stylist',
    'boho-hair-stylist',
    'on-location-hair-stylist',
    'hair-extensions-specialist'
  ],
  'wedding-decorators': [
    'luxury-wedding-decorator',
    'bohemian-wedding-decorator',
    'indian-wedding-decorator',
    'rustic-wedding-decorator',
    'modern-wedding-decorator',
    'beach-wedding-decorator',
    'tent-and-draping-specialist',
    'lighting-designer'
  ],
  'bridal-shops': [
    'designer-bridal-boutique',
    'vintage-bridal-shop',
    'plus-size-bridal-shop',
    'modest-bridal-shop',
    'custom-bridal-gowns',
    'bridal-consignment',
    'indian-bridal-wear'
  ],
  'carts': [
    'coffee-cart',
    'matcha-cart',
    'cocktail-cart',
    'champagne-cart',
    'ice-cream-cart',
    'gelato-cart',
    'photo-booth-cart',
    'chai-cart',
    'dessert-cart'
  ]
};

// All 50 states with their cities
const locationCodes = {
  "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville"],
  "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
  "Arizona": ["Phoenix", "Tucson", "Mesa", "Scottsdale"],
  "Arkansas": ["Little Rock", "Fayetteville", "Fort Smith"],
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
  "Colorado": ["Denver", "Colorado Springs", "Boulder", "Fort Collins"],
  "Connecticut": ["Hartford", "New Haven", "Stamford"],
  "Delaware": ["Wilmington", "Dover", "Newark"],
  "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
  "Georgia": ["Atlanta", "Savannah", "Augusta", "Athens"],
  "Hawaii": ["Honolulu", "Hilo", "Kailua"],
  "Idaho": ["Boise", "Idaho Falls", "Pocatello"],
  "Illinois": ["Chicago", "Springfield", "Peoria", "Rockford"],
  "Indiana": ["Indianapolis", "Fort Wayne", "South Bend"],
  "Iowa": ["Des Moines", "Cedar Rapids", "Davenport"],
  "Kansas": ["Wichita", "Kansas City", "Topeka"],
  "Kentucky": ["Louisville", "Lexington", "Bowling Green"],
  "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport"],
  "Maine": ["Portland", "Augusta", "Bangor"],
  "Maryland": ["Baltimore", "Annapolis", "Frederick"],
  "Massachusetts": ["Boston", "Worcester", "Springfield"],
  "Michigan": ["Detroit", "Grand Rapids", "Ann Arbor"],
  "Minnesota": ["Minneapolis", "Saint Paul", "Rochester"],
  "Mississippi": ["Jackson", "Gulfport", "Biloxi"],
  "Missouri": ["Kansas City", "St. Louis", "Springfield"],
  "Montana": ["Billings", "Missoula", "Helena"],
  "Nebraska": ["Omaha", "Lincoln", "Grand Island"],
  "Nevada": ["Las Vegas", "Reno", "Carson City"],
  "New Hampshire": ["Manchester", "Concord", "Nashua"],
  "New Jersey": ["Newark", "Jersey City", "Trenton"],
  "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces"],
  "New York": ["New York City", "Buffalo", "Albany", "Rochester"],
  "North Carolina": ["Charlotte", "Raleigh", "Durham"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati"],
  "Oklahoma": ["Oklahoma City", "Tulsa", "Norman"],
  "Oregon": ["Portland", "Salem", "Eugene"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Harrisburg"],
  "Rhode Island": ["Providence", "Warwick", "Newport"],
  "South Carolina": ["Columbia", "Charleston", "Myrtle Beach"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen"],
  "Tennessee": ["Nashville", "Memphis", "Knoxville"],
  "Texas": ["Dallas", "Houston", "Austin", "San Antonio", "Fort Worth", "El Paso", "Plano", "Corpus Christi", "Arlington", "Garland", "Irving", "Lubbock", "Amarillo", "Galveston"],
  "Utah": ["Salt Lake City", "Provo", "Ogden"],
  "Vermont": ["Burlington", "Montpelier", "Rutland"],
  "Virginia": ["Richmond", "Virginia Beach", "Norfolk"],
  "Washington": ["Seattle", "Spokane", "Tacoma"],
  "West Virginia": ["Charleston", "Huntington", "Morgantown"],
  "Wisconsin": ["Milwaukee", "Madison", "Green Bay"],
  "Wyoming": ["Cheyenne", "Casper", "Laramie"]
};

const URL_TYPES = {
  HOME: { priority: '1.0', changefreq: 'weekly' },
  STATES: { priority: '0.9', changefreq: 'weekly' },
  USER: { priority: '0.5', changefreq: 'monthly' },
  CATEGORY: { priority: '0.8', changefreq: 'weekly' },
  INFO: { priority: '0.6', changefreq: 'monthly' },
  LOCATION: { priority: '0.7', changefreq: 'weekly' },
  SUBCATEGORY: { priority: '0.8', changefreq: 'weekly' },
};

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

function isValidUrl(url) {
  const duplicateStatePattern = /\/([a-z-]+)\/\1$/;
  if (duplicateStatePattern.test(url)) return false;
  if (/[A-Z]/.test(url)) return false;
  if (/[\s%\?]/.test(url)) return false;
  return true;
}

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
  return urls.length;
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
  
  console.log(`\n✓ Created sitemap index with ${sitemapFiles.length} sitemaps`);
}

function generateSitemap() {
  console.log('🚀 Starting COMPLETE sitemap generation...\n');
  console.log('📊 Configuration:');
  console.log(`   - States: 50`);
  console.log(`   - Cities: 193`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Expected URLs: 12,000-15,000\n`);
  
  // Ensure directory exists and clean it
  if (fs.existsSync(SITEMAP_DIR)) {
    fs.rmSync(SITEMAP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  
  let totalUrls = 0;
  
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
  
  categories.forEach(category => {
    staticUrls.push({
      url: `/top-20/${category.slug}`,
      type: 'CATEGORY'
    });
  });
  
  totalUrls += createSitemap('static', staticUrls);
  const sitemapFiles = ['static.xml'];
  
  // Generate location URLs by category
  const locationUrlsByCategory = {};
  
  categories.forEach(category => {
    locationUrlsByCategory[category.slug] = [];
  });
  
  console.log('\n📍 Generating location-based URLs...');
  
  // Generate URLs for each state, city, and category
  Object.entries(locationCodes).forEach(([state, cities]) => {
    cities.forEach(city => {
      categories.forEach(category => {
        const citySlug = createUrlSlug(city);
        const stateSlug = createUrlSlug(state);
        
        // Main category URL
        const mainUrl = `/top-20/${category.slug}/${citySlug}/${stateSlug}`;
        
        if (isValidUrl(mainUrl)) {
          locationUrlsByCategory[category.slug].push({
            url: mainUrl,
            type: 'LOCATION'
          });
        }
        
        // Subcategory URLs
        if (subcategories[category.slug]) {
          subcategories[category.slug].forEach(subcategorySlug => {
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
  
  console.log('\n💾 Creating category sitemaps...');
  
  // Create separate sitemaps for each category
  for (const [category, urls] of Object.entries(locationUrlsByCategory)) {
    if (urls.length === 0) continue;
    
    const chunks = chunkArray(urls, MAX_URLS_PER_SITEMAP);
    
    if (chunks.length === 1) {
      totalUrls += createSitemap(category, urls);
      sitemapFiles.push(`${category}.xml`);
    } else {
      chunks.forEach((chunk, index) => {
        const filename = `${category}-${index + 1}`;
        totalUrls += createSitemap(filename, chunk);
        sitemapFiles.push(`${filename}.xml`);
      });
    }
  }
  
  createSitemapIndex(sitemapFiles);
  
  console.log('\n✅ Sitemap generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total sitemaps created: ${sitemapFiles.length}`);
  console.log(`   - Total URLs generated: ${totalUrls.toLocaleString()}`);
  console.log(`   - All URLs use path-based structure`);
  console.log(`   - Format: /top-20/[category]/[subcategory]/[city]/[state]`);
  console.log('\n✨ Next steps:');
  console.log('   1. Deploy to production');
  console.log('   2. Submit sitemap.xml to Google Search Console');
  console.log('   3. Monitor indexing over 2-4 weeks');
}

// Run the generator
generateSitemap();
