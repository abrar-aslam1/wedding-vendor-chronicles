#!/usr/bin/env node

/**
 * Backfill subcategories on existing instagram_vendors that have subcategory = null.
 * Uses bio + hashtags to infer subcategory.
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
);

const subcategoryMap = {
  'wedding-photographers': [
    { match: ['photojournalis', 'candid', 'storytell', 'documentary'], value: 'Photojournalistic' },
    { match: ['fine art', 'editorial', 'artistic'], value: 'Fine Art' },
    { match: ['drone', 'aerial'], value: 'Aerial Photography' },
    { match: ['engagement', 'pre-wedding'], value: 'Engagement Specialists' },
    { match: ['traditional', 'classic', 'portrait', 'formal'], value: 'Traditional Photography' }
  ],
  'wedding-planners': [
    { match: ['full service', 'full-service', 'a to z', 'start to finish'], value: 'Full-Service Planning' },
    { match: ['day of', 'day-of', 'coordination'], value: 'Day-of Coordination' },
    { match: ['destination'], value: 'Destination Wedding Planning' },
    { match: ['partial', 'month-of'], value: 'Partial Planning' },
    { match: ['cultural', 'indian', 'south asian', 'nigerian', 'jewish'], value: 'Cultural Wedding Specialists' }
  ],
  'florists': [
    { match: ['modern', 'contemporary', 'unique'], value: 'Modern Arrangements' },
    { match: ['classic', 'traditional', 'timeless'], value: 'Classic/Traditional' },
    { match: ['rustic', 'bohemian', 'boho', 'wildflower'], value: 'Rustic/Bohemian' },
    { match: ['minimalist', 'minimal', 'simple'], value: 'Minimalist' },
    { match: ['luxury', 'extravag', 'opulent', 'high-end'], value: 'Luxury/Extravagant' }
  ],
  'venues': [
    { match: ['ballroom'], value: 'Ballrooms' },
    { match: ['barn', 'farm', 'ranch'], value: 'Barns & Farms' },
    { match: ['beach', 'waterfront', 'lakeside', 'ocean'], value: 'Beach/Waterfront' },
    { match: ['garden', 'park', 'outdoor'], value: 'Gardens & Parks' },
    { match: ['historic', 'historical', 'heritage', 'mansion'], value: 'Historic Buildings' },
    { match: ['hotel', 'resort'], value: 'Hotels & Resorts' },
    { match: ['winery', 'vineyard'], value: 'Wineries & Vineyards' },
    { match: ['industrial', 'loft', 'warehouse'], value: 'Industrial Spaces' }
  ],
  'videographers': [
    { match: ['cinematic', 'cinema'], value: 'Cinematic' },
    { match: ['documentary', 'storytell'], value: 'Documentary' },
    { match: ['highlight', 'reel'], value: 'Highlight Reels' }
  ],
  'makeup-artists': [
    { match: ['airbrush'], value: 'Airbrush' },
    { match: ['natural', 'organic'], value: 'Natural/Organic' },
    { match: ['glamour', 'glam', 'editorial'], value: 'Glamour/Editorial' }
  ]
};

const defaults = {
  'wedding-photographers': 'Traditional Photography',
  'wedding-planners': 'Full-Service Planning',
  'florists': 'Classic/Traditional',
  'venues': null,
  'videographers': 'Cinematic',
  'makeup-artists': null
};

function inferSubcategory(category, bio, hashtags) {
  const text = ((bio || '') + ' ' + (hashtags || []).join(' ')).toLowerCase();
  // Normalize category: "photographers" -> "wedding-photographers"
  let normCat = category;
  if (normCat === 'photographers') normCat = 'wedding-photographers';
  if (normCat === 'planners') normCat = 'wedding-planners';
  const rules = subcategoryMap[normCat];
  if (!rules) return defaults[normCat] || null;

  for (const rule of rules) {
    if (rule.match.some(kw => text.includes(kw))) return rule.value;
  }
  return defaults[category] || null;
}

async function main() {
  // Fetch all vendors with null subcategory
  const { data: vendors, error } = await supabase
    .from('instagram_vendors')
    .select('id, category, bio, hashtags')
    .is('subcategory', null)
    .limit(5000);

  if (error) {
    console.error('Failed to fetch vendors:', error.message);
    process.exit(1);
  }

  console.log(`Found ${vendors.length} vendors with null subcategory`);

  let updated = 0;
  let skipped = 0;

  for (const vendor of vendors) {
    const sub = inferSubcategory(vendor.category, vendor.bio, vendor.hashtags);
    if (!sub) {
      skipped++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('instagram_vendors')
      .update({ subcategory: sub })
      .eq('id', vendor.id);

    if (updateErr) {
      console.error(`Failed to update ${vendor.id}: ${updateErr.message}`);
    } else {
      updated++;
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main();
