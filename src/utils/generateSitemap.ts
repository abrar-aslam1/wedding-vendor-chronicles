import { categories } from '@/config/categories';
import { locationCodes } from '@/config/locations';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0];

const generateSitemap = () => {
  const urls = [
    // Static Pages
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/auth', priority: '0.8', changefreq: 'monthly' },
    { url: '/search', priority: '0.9', changefreq: 'daily' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
  ];

  // Add category search pages
  categories.forEach(category => {
    urls.push({
      url: `/search/${category.slug}`,
      priority: '0.8',
      changefreq: 'daily'
    });

    // Add location-specific category pages for major cities
    Object.entries(locationCodes).forEach(([state, stateData]) => {
      Object.keys(stateData.cities).forEach((city) => {
        urls.push({
          url: `/top-20/${category.slug}/${city.toLowerCase().replace(/ /g, '-')}/${state.toLowerCase().replace(/ /g, '-')}`,
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
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

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

export default generateSitemap;