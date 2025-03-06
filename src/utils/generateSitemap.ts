
import { categories } from '@/config/categories';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0];

const generateSitemap = () => {
  // Create an array of URL objects with priority levels
  const urls = [
    // High priority pages
    { url: '/', priority: '1.0' },
    { url: '/states', priority: '0.9' },
    
    // Medium priority pages
    { url: '/auth', priority: '0.8' },
    { url: '/favorites', priority: '0.7' },
    
    // Category pages - organized by category
    ...categories.map(category => ({
      url: `/search/${category.slug}`,
      priority: '0.8'
    })),
    
    // Informational pages - lower priority
    { url: '/privacy', priority: '0.5' },
    { url: '/terms', priority: '0.5' },
    { url: '/list-business', priority: '0.6' },
  ];

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

  const urlCount = urls.length;
  console.log(`Sitemap generated successfully with ${urlCount} URLs!`);
};

// Helper function to format a URL entry with proper indentation
function formatUrl({ url, priority }: { url: string, priority: string }) {
  return `  <url>\n    <loc>${BASE_URL}${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <priority>${priority}</priority>\n  </url>\n`;
}

export default generateSitemap;
