import { categories } from '@/config/categories';
import { locationCodes } from '@/config/locations';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = [
    // Static pages
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/auth', priority: '0.8', changefreq: 'monthly' },
    { url: '/auth/callback', priority: '0.5', changefreq: 'monthly' },
    { url: '/search', priority: '0.9', changefreq: 'daily' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
    { url: '/favorites', priority: '0.7', changefreq: 'daily' },
  ];

  // Add category pages
  categories.forEach(category => {
    // Basic category search page
    urls.push({
      url: `/search/${category.slug}`,
      priority: '0.8',
      changefreq: 'daily'
    });

    // Add location-specific category pages for major cities
    Object.entries(locationCodes).forEach(([state, stateData]) => {
      Object.keys(stateData.cities).forEach((city) => {
        // Match the exact route pattern from App.tsx: /top-20/:category/:city/:state
        const formattedCity = city.toLowerCase().replace(/ /g, '-');
        const formattedState = state.toLowerCase().replace(/ /g, '-');
        urls.push({
          url: `/top-20/${category.slug}/${formattedCity}/${formattedState}`,
          priority: '0.7',
          changefreq: 'daily'
        });
      });
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq }) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'sitemap.xml'),
    sitemap.trim()
  );

  console.log('Sitemap generation completed! The sitemap is now available at /sitemap.xml');
}

export default generateSitemap;