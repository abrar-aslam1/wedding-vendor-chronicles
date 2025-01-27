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
    { url: '/search', priority: '0.9', changefreq: 'daily' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
  ];

  // Add category pages
  categories.forEach(category => {
    urls.push({
      url: `/search/${category.slug}`,
      priority: '0.8',
      changefreq: 'daily'
    });

    // Add location-specific category pages
    Object.entries(locationCodes).forEach(([state, stateData]) => {
      Object.entries(stateData.cities).forEach(([city]) => {
        urls.push({
          url: `/search/${category.slug}/${city.toLowerCase()}-${state.toLowerCase()}`,
          priority: '0.8',
          changefreq: 'daily'
        });
      });
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')}
</urlset>`;

  fs.writeFileSync(
    path.join(process.cwd(), 'public', 'sitemap.xml'),
    sitemap
  );
}

export default generateSitemap;