// Test script to verify subcategory logic
import { subcategories } from './src/config/subcategories.ts';

console.log('Testing subcategory logic...\n');

// Test normalization function
const normalizeCategoryForSubcategories = (categoryName) => {
  const normalized = categoryName.toLowerCase();
  if (normalized === 'photographer' || normalized === 'photographers') return 'photographers';
  if (normalized === 'wedding planner' || normalized === 'wedding-planners' || normalized === 'wedding planners') return 'wedding-planners';
  if (normalized === 'dj' || normalized === 'djs' || normalized === 'djs & bands' || normalized === 'djs and bands') return 'djs-and-bands';
  if (normalized === 'videographer' || normalized === 'videographers') return 'videographers';
  if (normalized === 'cake designer' || normalized === 'cake designers' || normalized === 'cake-designers') return 'cake-designers';
  if (normalized === 'bridal shop' || normalized === 'bridal shops' || normalized === 'bridal-shops') return 'bridal-shops';
  if (normalized === 'makeup artist' || normalized === 'makeup artists' || normalized === 'makeup-artists') return 'makeup-artists';
  if (normalized === 'hair stylist' || normalized === 'hair stylists' || normalized === 'hair-stylists') return 'hair-stylists';
  if (normalized === 'florist' || normalized === 'florists') return 'florists';
  if (normalized === 'venue' || normalized === 'venues') return 'venues';
  if (normalized === 'caterer' || normalized === 'caterers') return 'caterers';
  return categoryName.toLowerCase().replace(/\s+&\s+/g, '-and-').replace(/\s+/g, '-');
};

// Test cases
const testCategories = [
  'Photographers',
  'Wedding Planners', 
  'Videographers',
  'Caterers',
  'DJs & Bands'
];

console.log('Available subcategory keys:', Object.keys(subcategories));
console.log('\nTesting category normalization:');

testCategories.forEach(category => {
  const normalized = normalizeCategoryForSubcategories(category);
  const hasSubcategories = normalized && subcategories[normalized];
  const count = hasSubcategories ? subcategories[normalized].length : 0;
  
  console.log(`${category} -> ${normalized} -> ${hasSubcategories ? '✅' : '❌'} (${count} subcategories)`);
  
  if (hasSubcategories) {
    console.log(`  Subcategories: ${subcategories[normalized].map(s => s.name).join(', ')}`);
  }
});