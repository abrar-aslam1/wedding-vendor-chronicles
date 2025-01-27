import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';

const categories = [
  'wedding-photographers',
  'wedding-planners',
  'wedding-venues',
  'wedding-caterers',
  'wedding-florists',
  'wedding-dj',
  'wedding-makeup-artists',
  'wedding-videographers'
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = [
    // Static pages
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/auth', priority: '0.8', changefreq: 'monthly' },
    { url: '/search', priority: '0.9', changefreq: 'daily' },
    { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'monthly' },
    
    // Generate category pages
    ...categories.map(category => ({
      url: `/search/${category}`,
      priority: '0.8',
      changefreq: 'daily'
    }))
  ];

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