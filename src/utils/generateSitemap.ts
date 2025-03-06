
import { categories } from '@/config/categories';
import { locationCodes } from '@/config/locations';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString(); // Full ISO 8601 format with time

const generateSitemap = () => {
  // Create an array of URL objects
  const urls = [
    // Main pages
    { url: '/' },
    { url: '/states' },
    
    // User pages
    { url: '/auth' },
    { url: '/favorites' },
    
    // Category pages - organized by category
    ...categories.map(category => ({
      url: `/search/${category.slug}`
    })),
    
    // Informational pages
    { url: '/privacy' },
    { url: '/terms' },
    { url: '/list-business' },
  ];

  // Location pages - for each state, city, and category
  const locationUrls = [];
  
  // Generate URLs for each state, city, and category
  Object.entries(locationCodes).forEach(([state, stateData]) => {
    Object.entries(stateData.cities).forEach(([city, cityCode]) => {
      // Add URLs for each category in this location
      categories.forEach(category => {
        locationUrls.push({
          url: `/top-20/${category.slug}/${city}/${state}`
        });
      });
    });
  });

  // Build an XML structure with proper indentation and organization
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';
  
  // Group URLs by section with comments
  const mainPages = urls
    .filter(item => !item.url.includes('/search/'))
    .filter(item => !['/privacy', '/terms', '/list-business'].includes(item.url))
    .map(formatUrl)
    .join('');
    
  const categoryPages = urls
    .filter(item => item.url.includes('/search/'))
    .map(formatUrl)
    .join('');
    
  const infoPages = urls
    .filter(item => ['/privacy', '/terms', '/list-business'].includes(item.url))
    .map(formatUrl)
    .join('');
    
  const locationPages = locationUrls.map(formatUrl).join('');
  
  // Build the complete sitemap with section comments
  const sitemap = 
    xmlHeader + 
    urlsetOpen +
    '  <!-- Main navigation pages -->\n' +
    mainPages +
    '  <!-- Category pages -->\n' +
    categoryPages +
    '  <!-- Informational pages -->\n' +
    infoPages +
    '  <!-- Location pages -->\n' +
    locationPages +
    urlsetClose;

  // Ensure the public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the sitemap file
  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    sitemap.trim()
  );

  const urlCount = urls.length + locationUrls.length;
  console.log(`Sitemap generated successfully with ${urlCount} URLs!`);
};

// Helper function to format a URL entry with proper indentation
function formatUrl({ url }: { url: string }) {
  return `  <url>\n    <loc>${BASE_URL}${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>\n`;
}

export default generateSitemap;
