/**
 * Generate SEO-optimized sitemaps according to agent brief requirements
 * Structure:
 * - /sitemap-index.xml (main index)
 * - /sitemaps/sitemap-top20-[state].xml
 * - /sitemaps/sitemap-search-[category].xml  
 * - /sitemaps/sitemap-vendors-[alpha].xml
 */

import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://findmyweddingvendor.com';
const SITEMAP_DIR = 'public/sitemaps';
const MAIN_SITEMAP = 'public/sitemap-index.xml';

// US States for Top-20 sitemaps
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Wedding vendor categories
const CATEGORIES = [
  'wedding-planners', 'photographers', 'videographers', 'florists', 'caterers', 'venues',
  'djs-and-bands', 'cake-designers', 'bridal-shops', 'makeup-artists', 'hair-stylists',
  'wedding-decorators'
];

// Major cities by state (sample data - in production this would come from database)
const CITIES_BY_STATE = {
  'Texas': ['Dallas', 'Houston', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Plano', 'Corpus Christi', 'Arlington', 'Garland', 'Irving', 'Lubbock', 'Amarillo', 'Galveston'],
  'California': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
  'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'New York': ['New York City', 'Buffalo', 'Albany', 'Rochester'],
  // Add more states as needed
};

// Subcategories for photographers (example)
const PHOTOGRAPHER_SUBCATEGORIES = [
  'traditional-photography', 'photojournalistic', 'fine-art', 'aerial-photography', 'engagement-specialists'
];

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(urls) {
  const urlEntries = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index XML
 */
function generateSitemapIndexXML(sitemaps) {
  const sitemapEntries = sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Generate Top-20 sitemaps by state
 */
function generateTop20Sitemaps() {
  const sitemaps = [];
  const today = new Date().toISOString().split('T')[0];

  US_STATES.forEach(state => {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    const cities = CITIES_BY_STATE[state] || [state.split(' ')[0]]; // Fallback to first word of state name
    const urls = [];

    // Generate URLs for each category and city in this state
    CATEGORIES.forEach(category => {
      cities.forEach(city => {
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        
        // Main category page
        urls.push({
          loc: `${DOMAIN}/top-20/${category}/${citySlug}/${stateSlug}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: '0.7'
        });

        // Subcategory pages (example for photographers)
        if (category === 'photographers') {
          PHOTOGRAPHER_SUBCATEGORIES.forEach(subcategory => {
            urls.push({
              loc: `${DOMAIN}/top-20/${category}/${subcategory}/${citySlug}/${stateSlug}`,
              lastmod: today,
              changefreq: 'weekly',
              priority: '0.8'
            });
          });
        }
      });
    });

    if (urls.length > 0) {
      const filename = `sitemap-top20-${stateSlug}.xml`;
      const content = generateSitemapXML(urls);
      
      fs.writeFileSync(path.join(SITEMAP_DIR, filename), content);
      console.log(`Generated ${filename} with ${urls.length} URLs`);
      
      sitemaps.push({
        loc: `${DOMAIN}/sitemaps/${filename}`,
        lastmod: today
      });
    }
  });

  return sitemaps;
}

/**
 * Generate search hub sitemaps by category
 */
function generateSearchSitemaps() {
  const sitemaps = [];
  const today = new Date().toISOString().split('T')[0];

  CATEGORIES.forEach(category => {
    const urls = [{
      loc: `${DOMAIN}/search/${category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8'
    }];

    const filename = `sitemap-search-${category}.xml`;
    const content = generateSitemapXML(urls);
    
    fs.writeFileSync(path.join(SITEMAP_DIR, filename), content);
    console.log(`Generated ${filename} with ${urls.length} URLs`);
    
    sitemaps.push({
      loc: `${DOMAIN}/sitemaps/${filename}`,
      lastmod: today
    });
  });

  return sitemaps;
}

/**
 * Generate vendor profile sitemaps (alphabetically segmented)
 */
function generateVendorSitemaps() {
  const sitemaps = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Create alphabetical segments (A-C, D-F, G-I, etc.)
  const alphabetSegments = [
    { range: 'a-c', letters: ['a', 'b', 'c'] },
    { range: 'd-f', letters: ['d', 'e', 'f'] },
    { range: 'g-i', letters: ['g', 'h', 'i'] },
    { range: 'j-l', letters: ['j', 'k', 'l'] },
    { range: 'm-o', letters: ['m', 'n', 'o'] },
    { range: 'p-r', letters: ['p', 'q', 'r'] },
    { range: 's-u', letters: ['s', 't', 'u'] },
    { range: 'v-z', letters: ['v', 'w', 'x', 'y', 'z'] }
  ];

  alphabetSegments.forEach(segment => {
    // In production, this would query the database for vendors starting with these letters
    // For now, create placeholder structure
    const urls = [];
    
    // Example vendor URLs (in production, fetch from database)
    segment.letters.forEach(letter => {
      // Add sample vendor URLs - in production this would be real vendor data
      for (let i = 1; i <= 10; i++) {
        urls.push({
          loc: `${DOMAIN}/vendor/sample-vendor-${letter}${i}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: '0.6'
        });
      }
    });

    if (urls.length > 0) {
      const filename = `sitemap-vendors-${segment.range}.xml`;
      const content = generateSitemapXML(urls);
      
      fs.writeFileSync(path.join(SITEMAP_DIR, filename), content);
      console.log(`Generated ${filename} with ${urls.length} URLs`);
      
      sitemaps.push({
        loc: `${DOMAIN}/sitemaps/${filename}`,
        lastmod: today
      });
    }
  });

  return sitemaps;
}

/**
 * Generate static pages sitemap
 */
function generateStaticSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    { loc: `${DOMAIN}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: `${DOMAIN}/states`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
    { loc: `${DOMAIN}/auth`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { loc: `${DOMAIN}/favorites`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
    { loc: `${DOMAIN}/privacy`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { loc: `${DOMAIN}/terms`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { loc: `${DOMAIN}/list-business`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
    { loc: `${DOMAIN}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.9' }
  ];

  // Add search hub pages
  CATEGORIES.forEach(category => {
    urls.push({
      loc: `${DOMAIN}/search/${category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  const filename = 'sitemap-static.xml';
  const content = generateSitemapXML(urls);
  
  fs.writeFileSync(path.join(SITEMAP_DIR, filename), content);
  console.log(`Generated ${filename} with ${urls.length} URLs`);
  
  return [{
    loc: `${DOMAIN}/sitemaps/${filename}`,
    lastmod: today
  }];
}

/**
 * Main function to generate all sitemaps
 */
function generateAllSitemaps() {
  console.log('🚀 Generating SEO-optimized sitemaps...');
  
  // Ensure sitemaps directory exists
  if (!fs.existsSync(SITEMAP_DIR)) {
    fs.mkdirSync(SITEMAP_DIR, { recursive: true });
  }

  // Generate all sitemap types
  const staticSitemaps = generateStaticSitemap();
  const top20Sitemaps = generateTop20Sitemaps();
  const searchSitemaps = generateSearchSitemaps();
  const vendorSitemaps = generateVendorSitemaps();

  // Combine all sitemaps for the index
  const allSitemaps = [
    ...staticSitemaps,
    ...top20Sitemaps,
    ...searchSitemaps,
    ...vendorSitemaps
  ];

  // Generate main sitemap index
  const indexContent = generateSitemapIndexXML(allSitemaps);
  fs.writeFileSync(MAIN_SITEMAP, indexContent);
  
  console.log(`✅ Generated sitemap-index.xml with ${allSitemaps.length} sitemaps`);
  console.log(`📊 Total sitemaps generated: ${allSitemaps.length}`);
  console.log('🎯 Sitemap structure now matches agent brief requirements!');
}

// Run the generator
generateAllSitemaps();
