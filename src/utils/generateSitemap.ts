
import { categories } from '@/config/categories';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://findmyweddingvendor.com';
const TODAY = new Date().toISOString().split('T')[0];

const generateSitemap = () => {
  const urls = [
    // Static Pages
    { url: '/', priority: '1.0' },
    { url: '/auth', priority: '0.8' },
    { url: '/favorites', priority: '0.7' },
    { url: '/privacy', priority: '0.5' },
    { url: '/terms', priority: '0.5' },
  ];

  // Add category search pages - limiting to just the main categories
  categories.forEach(category => {
    urls.push({
      url: `/search/${category.slug}`,
      priority: '0.8'
    });
  });

  // Build a simpler XML structure
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority }) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${TODAY}</lastmod>
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
