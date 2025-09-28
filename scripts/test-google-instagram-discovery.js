#!/usr/bin/env node

/**
 * Test Google Instagram Discovery System
 * Validates DataForSEO Google Organic Search endpoint and Instagram profile extraction
 */

import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

async function makeGoogleSearchRequest(query, locationCode) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify([{
      keyword: query,
      location_code: locationCode,
      language_code: "en",
      device: "desktop",
      calculate_rectangles: true,
      include_subdomains: true
    }]);

    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: '/v3/serp/google/organic/live/advanced',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function extractInstagramUsernames(searchResults) {
  const instagramProfiles = [];
  
  if (!searchResults.tasks || !searchResults.tasks[0] || !searchResults.tasks[0].result) {
    return instagramProfiles;
  }

  const results = searchResults.tasks[0].result;
  
  if (results.length > 0 && results[0].items) {
    console.log(`\n📋 Analyzing ${results[0].items.length} search results:`);
    
    results[0].items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title || 'No title'}`);
      console.log(`   URL: ${item.url || 'No URL'}`);
      console.log(`   Description: ${(item.description || 'No description').substring(0, 100)}...`);
      
      if (item.url && item.url.includes('instagram.com/')) {
        // Extract username from Instagram URL
        const urlMatch = item.url.match(/instagram\.com\/([^\/\?]+)/);
        if (urlMatch && urlMatch[1]) {
          const username = urlMatch[1];
          
          // Skip Instagram's own pages
          if (!['explore', 'stories', 'reels', 'tv', 'accounts'].includes(username)) {
            instagramProfiles.push({
              username: username,
              search_title: item.title || null,
              search_description: item.description || null,
              search_url: item.url,
              search_rank: item.rank_group || null
            });
            console.log(`   🎯 INSTAGRAM PROFILE FOUND: @${username}`);
          } else {
            console.log(`   ⚠️ Skipped Instagram system page: ${username}`);
          }
        }
      } else {
        console.log(`   ❌ Not an Instagram URL`);
      }
    });
  }
  
  return instagramProfiles;
}

async function testGoogleInstagramDiscovery() {
  console.log('🧪 Testing Google Instagram Discovery System');
  console.log('============================================');
  
  // Verify credentials
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    console.error('❌ Missing DataForSEO credentials');
    console.log('Please check your .env file has:');
    console.log('DATAFORSEO_LOGIN=your_login');
    console.log('DATAFORSEO_PASSWORD=your_password');
    return;
  }
  
  console.log(`✅ Credentials found for: ${DATAFORSEO_LOGIN}`);
  
  // Test searches
  const testQueries = [
    'coffee cart rental Seattle instagram',
    'mobile coffee bar Seattle site:instagram.com',
    'wedding coffee cart Seattle instagram'
  ];
  
  const seattleLocationCode = 1026916;
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing search: "${query}"`);
    console.log('-'.repeat(50));
    
    try {
      const response = await makeGoogleSearchRequest(query, seattleLocationCode);
      
      console.log('📊 API Response Analysis:');
      console.log('Status:', response.status_code);
      console.log('Status message:', response.status_message);
      console.log('Cost:', response.cost || 0);
      
      if (response.status_code === 20000) {
        console.log('✅ Google Organic Search API is working!');
        
        const instagramProfiles = extractInstagramUsernames(response);
        
        if (instagramProfiles.length > 0) {
          console.log(`\n🎉 SUCCESS: Found ${instagramProfiles.length} Instagram profiles!`);
          
          instagramProfiles.forEach((profile, index) => {
            console.log(`\n📸 Instagram Profile ${index + 1}:`);
            console.log(`   Username: @${profile.username}`);
            console.log(`   Title: ${profile.search_title}`);
            console.log(`   Description: ${profile.search_description?.substring(0, 150)}...`);
            console.log(`   URL: ${profile.search_url}`);
            console.log(`   Search Rank: ${profile.search_rank}`);
          });
          
          console.log('\n💡 Next Steps:');
          console.log('1. ✅ Google Organic Search API works perfectly');
          console.log('2. ✅ Instagram profile extraction works');
          console.log('3. 🔄 Ready to integrate with MCP Instagram scraper');
          console.log('4. 🚀 Ready to run full discovery across all cities');
          
        } else {
          console.log('⚠️ No Instagram profiles found in this search');
          console.log('💡 Try different search terms or locations');
        }
        
      } else {
        console.error(`❌ API Error: ${response.status_code} - ${response.status_message}`);
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    // Rate limiting between tests
    if (query !== testQueries[testQueries.length - 1]) {
      console.log('\n⏳ Waiting 6 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
  }
  
  console.log('\n============================================');
  console.log('🎉 Google Instagram Discovery Test Complete!');
  console.log('============================================');
}

testGoogleInstagramDiscovery();
