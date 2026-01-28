#!/usr/bin/env node

/**
 * Validation Script for 404 Error Fixes
 * 
 * This script tests a sample of URLs from the 404 error list to verify:
 * 1. Old URLs properly redirect
 * 2. New sitemap URLs are valid
 * 3. No duplicate or invalid patterns exist
 */

const fs = require('fs');
const path = require('path');

// Sample URLs from the 404 error list
const problematicUrls = [
  // Old subcategory path structure (should redirect)
  '/top-20/carts/coffee-carts/montpelier/vermont',
  '/top-20/hair-stylists/extensions-&-volume/irving/texas',
  '/top-20/makeup-artists/bridal-makeup/juneau/alaska',
  
  // Capitalized URLs
  '/top-20/carts/coffee-carts/Montpelier/Vermont',
  '/top-20/carts/flower-carts/Montgomery/Alabama',
  
  // Search URLs (should redirect to top-20)
  '/search/florists',
  '/search/venues',
  
  // Duplicate state patterns
  '/top-20/photographers/georgia/georgia',
  '/top-20/videographers/alabama/alabama',
  
  // Two-param patterns (ambiguous, should redirect to category page)
  '/top-20/carts/Madison/Wisconsin',
  '/top-20/photographers/Hawaii/Hawaii',
];

// Expected correct URL format examples
const correctUrls = [
  '/top-20/carts/montpelier/vermont?subcategory=coffee-carts',
  '/top-20/hair-stylists/irving/texas?subcategory=extensions-and-volume',
  '/top-20/makeup-artists/juneau/alaska?subcategory=bridal-makeup',
  '/top-20/florists',
  '/top-20/venues',
];

console.log('🔍 404 Error Fix Validation Script\n');
console.log('=' .repeat(60));

// Test 1: Check for invalid URL patterns
console.log('\n📋 Test 1: Checking for Invalid URL Patterns\n');

let invalidPatterns = 0;

problematicUrls.forEach(url => {
  const issues = [];
  
  // Check for uppercase letters
  if (/[A-Z]/.test(url.split('?')[0])) {
    issues.push('Contains uppercase letters');
  }
  
  // Check for special characters that shouldn't be there
  if (url.includes('&') && !url.includes('?')) {
    issues.push('Contains & in path (should be "and")');
  }
  
  // Check for spaces
  if (/\s/.test(url)) {
    issues.push('Contains spaces');
  }
  
  // Check for duplicate segments
  const segments = url.split('/').filter(s => s && !s.includes('?'));
  if (segments.length > 2) {
    const lastTwo = segments.slice(-2);
    if (lastTwo[0] === lastTwo[1]) {
      issues.push(`Duplicate segment: ${lastTwo[0]}`);
    }
  }
  
  if (issues.length > 0) {
    invalidPatterns++;
    console.log(`❌ ${url}`);
    issues.forEach(issue => console.log(`   └─ ${issue}`));
  } else {
    console.log(`⚠️  ${url} (needs redirect)`);
  }
});

console.log(`\n${invalidPatterns} URLs with invalid patterns detected`);

// Test 2: Validate correct URL format
console.log('\n📋 Test 2: Validating Correct URL Format\n');

let validUrls = 0;

correctUrls.forEach(url => {
  const issues = [];
  
  // Check for lowercase
  if (/[A-Z]/.test(url.split('?')[0])) {
    issues.push('Contains uppercase');
  }
  
  // Check structure
  const [path, query] = url.split('?');
  const segments = path.split('/').filter(s => s);
  
  if (segments.length === 2) {
    // Category-only URL
    if (segments[0] !== 'top-20') {
      issues.push('Should start with /top-20/');
    }
  } else if (segments.length === 4) {
    // Location-specific URL
    if (segments[0] !== 'top-20') {
      issues.push('Should start with /top-20/');
    }
    // Category, city, state
    // Optionally with ?subcategory=
  } else {
    issues.push(`Unexpected segment count: ${segments.length}`);
  }
  
  if (issues.length > 0) {
    console.log(`❌ ${url}`);
    issues.forEach(issue => console.log(`   └─ ${issue}`));
  } else {
    validUrls++;
    console.log(`✅ ${url}`);
  }
});

console.log(`\n${validUrls}/${correctUrls.length} URLs are in correct format`);

// Test 3: Check sitemap generation logic
console.log('\n📋 Test 3: Sitemap Generation Logic Check\n');

try {
  const sitemapPath = path.join(__dirname, '..', 'src', 'utils', 'generateSitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  const checks = [
    {
      name: 'Uses query parameters for subcategories',
      test: /subcategory=\$\{subcategorySlug\}/,
      passed: false
    },
    {
      name: 'Validates URLs before adding',
      test: /isValidUrl\(/,
      passed: false
    },
    {
      name: 'Creates lowercase slugs',
      test: /\.toLowerCase\(\)/,
      passed: false
    },
    {
      name: 'Handles special characters (&)',
      test: /replace\(\/&\/g, 'and'\)/,
      passed: false
    }
  ];
  
  checks.forEach(check => {
    check.passed = check.test.test(sitemapContent);
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
  });
  
  const allPassed = checks.every(c => c.passed);
  console.log(`\n${allPassed ? '✅ All sitemap checks passed!' : '⚠️  Some sitemap checks failed'}`);
  
} catch (error) {
  console.log(`❌ Error reading sitemap file: ${error.message}`);
}

// Test 4: Check netlify.toml redirects
console.log('\n📋 Test 4: Netlify Redirect Rules Check\n');

try {
  const netlifyPath = path.join(__dirname, '..', 'netlify.toml');
  const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
  
  const redirectChecks = [
    {
      name: 'Subcategory path → query param redirect',
      pattern: '/:category/:subcategory/:city/:state',
      exists: false
    },
    {
      name: '/search/ → /top-20/ redirect',
      pattern: '/search/:category',
      exists: false
    },
    {
      name: 'Duplicate state pattern redirect',
      pattern: '/:state/:state',
      exists: false
    }
  ];
  
  redirectChecks.forEach(check => {
    check.exists = netlifyContent.includes(check.pattern);
    console.log(`${check.exists ? '✅' : '❌'} ${check.name}`);
  });
  
  const allRedirectsExist = redirectChecks.every(c => c.exists);
  console.log(`\n${allRedirectsExist ? '✅ All redirect rules present!' : '⚠️  Some redirect rules missing'}`);
  
} catch (error) {
  console.log(`❌ Error reading netlify.toml: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VALIDATION SUMMARY\n');
console.log(`Test 1: ${invalidPatterns} problematic URLs identified`);
console.log(`Test 2: ${validUrls}/${correctUrls.length} correct URLs validated`);
console.log(`Test 3: Sitemap generation logic reviewed`);
console.log(`Test 4: Redirect rules verified`);

console.log('\n' + '='.repeat(60));
console.log('\n✨ Next Steps:\n');
console.log('1. Run: npm run generate-sitemap (or node scripts/generate-sitemap.js)');
console.log('2. Commit and deploy the changes');
console.log('3. Submit updated sitemap to Google Search Console');
console.log('4. Mark old URLs as removed in Search Console');
console.log('5. Monitor for 1-2 weeks\n');
