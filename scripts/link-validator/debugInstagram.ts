#!/usr/bin/env tsx

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function debugInstagramResponse(handle: string): Promise<void> {
  const url = `https://www.instagram.com/${handle}/`;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  console.log(`🔍 Debugging Instagram response for: @${handle}`);
  console.log(`URL: ${url}`);
  console.log('━'.repeat(60));

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
      validateStatus: (status) => true,
    });

    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📏 Content Length: ${response.data.length} characters`);
    console.log(`🕐 Response Headers:`, Object.keys(response.headers).join(', '));
    
    // Save raw HTML for inspection
    const filename = `debug_${handle}_response.html`;
    fs.writeFileSync(filename, response.data);
    console.log(`💾 Raw HTML saved to: ${filename}`);

    // Parse with cheerio and extract key information
    const $ = cheerio.load(response.data);
    
    console.log('\n🔍 Meta Tag Analysis:');
    console.log('─'.repeat(40));
    
    // Check various meta tags that might indicate profile existence
    const ogUrl = $('meta[property="og:url"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text();
    
    console.log(`og:url: ${ogUrl || 'NOT FOUND'}`);
    console.log(`og:title: ${ogTitle || 'NOT FOUND'}`);
    console.log(`og:description: ${ogDescription || 'NOT FOUND'}`);
    console.log(`og:image: ${ogImage || 'NOT FOUND'}`);
    console.log(`twitter:title: ${twitterTitle || 'NOT FOUND'}`);
    console.log(`<title>: ${pageTitle || 'NOT FOUND'}`);
    
    console.log('\n🔍 Content Analysis:');
    console.log('─'.repeat(40));
    
    // Look for Instagram-specific content patterns
    const bodyText = $('body').text().toLowerCase();
    const hasInstagramContent = bodyText.includes('instagram');
    const hasProfileContent = bodyText.includes('profile') || bodyText.includes('posts') || bodyText.includes('followers');
    const hasErrorContent = bodyText.includes('page not found') || bodyText.includes('sorry') || bodyText.includes('error');
    
    console.log(`Contains "instagram": ${hasInstagramContent}`);
    console.log(`Contains profile terms: ${hasProfileContent}`);
    console.log(`Contains error terms: ${hasErrorContent}`);
    
    // Check for JavaScript-rendered content indicators
    const scriptTags = $('script').length;
    const hasReactRoot = $('#react-root').length > 0;
    const hasAppShell = $('.application').length > 0 || $('[data-react-root]').length > 0;
    
    console.log(`Script tags count: ${scriptTags}`);
    console.log(`Has React root: ${hasReactRoot}`);
    console.log(`Has app shell: ${hasAppShell}`);
    
    // Look for specific Instagram patterns
    const instagramPatterns = [
      'window._sharedData',
      'window.__additionalDataLoaded',
      'instagram.com',
      'profilePage',
      'PostsCollectionPage'
    ];
    
    console.log('\n🔍 Instagram-specific patterns:');
    console.log('─'.repeat(40));
    
    instagramPatterns.forEach(pattern => {
      const found = response.data.includes(pattern);
      console.log(`${pattern}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
    });
    
    // Extract any JSON-LD structured data
    const jsonLdScripts = $('script[type="application/ld+json"]');
    console.log(`\n📋 JSON-LD scripts found: ${jsonLdScripts.length}`);
    
    jsonLdScripts.each((i, script) => {
      try {
        const jsonData = JSON.parse($(script).html() || '{}');
        console.log(`JSON-LD ${i + 1}:`, Object.keys(jsonData));
      } catch (e) {
        console.log(`JSON-LD ${i + 1}: Parse error`);
      }
    });
    
    // Check for specific error indicators
    console.log('\n🚨 Error Detection:');
    console.log('─'.repeat(40));
    
    const errorIndicators = [
      'Sorry, this page isn\'t available',
      'The link you followed may be broken',
      'Page Not Found',
      'User not found',
      'This account is private'
    ];
    
    errorIndicators.forEach(indicator => {
      const found = response.data.includes(indicator);
      console.log(`"${indicator}": ${found ? '🚨 FOUND' : '✅ NOT FOUND'}`);
    });

  } catch (error: any) {
    console.log(`❌ Request failed: ${error.message}`);
    
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log(`Response headers:`, error.response.headers);
    }
  }
}

// Test multiple handles
async function runDiagnostics(): Promise<void> {
  const testHandles = [
    'instagram', // Known to exist
    'nasa',      // Known to exist
    'fakeusernamethatshouldnotexist123456', // Should not exist
    'dallasarboretum' // From our Dallas data
  ];

  for (let i = 0; i < testHandles.length; i++) {
    await debugInstagramResponse(testHandles[i]);
    console.log('\n' + '═'.repeat(80) + '\n');
    
    if (i < testHandles.length - 1) {
      console.log('Waiting 2 seconds before next request...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Run diagnostics
if (require.main === module) {
  runDiagnostics().catch(console.error);
}