/**
 * Script to generate sitemap entries for Wedding Hashtag Generator location pages
 * 
 * This script reads the location data from src/config/hashtag-locations.ts
 * and generates sitemap entries for all states and cities.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getAllStatesSlugs, getCitySlugsForState } from '../src/config/hashtag-locations.js';

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://findmyweddingvendor.com';
const BASE_PATH = '/tools/wedding-hashtag-generator';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemaps/wedding-tools.xml');
const CURRENT_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// Generate sitemap XML content
function generateSitemapXml(): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Main Wedding Hashtag Generator page
  xml += '  <!-- Main Wedding Hashtag Generator page -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}${BASE_PATH}</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `  </url>\n`;
  
  // Legacy URL - redirects to new URL
  xml += '  <!-- Legacy URL - redirects to new URL -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/free-tools/hashtag-generator</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
  
  // States listing page
  xml += '  <!-- States listing page -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}${BASE_PATH}/states</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
  
  // Get all state slugs
  const statesSlugs = getAllStatesSlugs();
  
  // Generate entries for each state and its cities
  statesSlugs.forEach(stateSlug => {
    // State page
    xml += `  <!-- ${stateSlug} state page -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${BASE_PATH}/states/${stateSlug}</loc>\n`;
    xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
    
    // Get all city slugs for this state
    const citySlugs = getCitySlugsForState(stateSlug);
    
    // Generate entries for each city
    if (citySlugs.length > 0) {
      xml += `  <!-- ${stateSlug} cities -->\n`;
      
      citySlugs.forEach(citySlug => {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}${BASE_PATH}/states/${stateSlug}/${citySlug}</loc>\n`;
        xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    }
  });
  
  // Free Timeline Generator - Legacy URL
  xml += '  <!-- Free Timeline Generator - Legacy URL -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/free-tools/timeline-generator</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
  
  // Wedding Timeline Generator - SEO Optimized URLs
  xml += '  <!-- Wedding Timeline Generator - Main page -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/tools/wedding-timeline-generator</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.9</priority>\n`;
  xml += `  </url>\n`;
  
  // Timeline Generator States listing page
  xml += '  <!-- Timeline Generator States listing page -->\n';
  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/tools/wedding-timeline-generator/states</loc>\n`;
  xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
  
  // Generate entries for each state and its cities for Timeline Generator
  statesSlugs.forEach(stateSlug => {
    // State page for Timeline Generator
    xml += `  <!-- ${stateSlug} state page for Timeline Generator -->\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/tools/wedding-timeline-generator/states/${stateSlug}</loc>\n`;
    xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
    
    // Get all city slugs for this state
    const citySlugs = getCitySlugsForState(stateSlug);
    
    // Generate entries for each city for Timeline Generator
    if (citySlugs.length > 0) {
      xml += `  <!-- ${stateSlug} cities for Timeline Generator -->\n`;
      
      citySlugs.forEach(citySlug => {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/tools/wedding-timeline-generator/states/${stateSlug}/${citySlug}</loc>\n`;
        xml += `    <lastmod>${CURRENT_DATE}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    }
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Write sitemap to file
function writeSitemap(xml: string): void {
  try {
    fs.writeFileSync(SITEMAP_PATH, xml);
    console.log(`Sitemap successfully written to ${SITEMAP_PATH}`);
  } catch (error) {
    console.error('Error writing sitemap:', error);
  }
}

// Main function
function main(): void {
  console.log('Generating Wedding Hashtag Generator sitemap...');
  const xml = generateSitemapXml();
  writeSitemap(xml);
  console.log('Done!');
}

// Run the script
main();
