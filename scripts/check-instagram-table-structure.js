#!/usr/bin/env node

/**
 * Check Instagram Vendors Table Structure
 */

import dotenv from 'dotenv';
dotenv.config();

async function checkTableStructure() {
  console.log('🔍 CHECKING INSTAGRAM_VENDORS TABLE STRUCTURE');
  console.log('='.repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // Try different approaches to understand the table structure

    // 1. Get one record with all columns (using select=*)
    console.log('📋 Fetching sample record with all columns...');
    const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=*&limit=1`, {
      method: 'GET',
      headers
    });
    
    if (sampleResponse.ok) {
      const sample = await sampleResponse.json();
      if (sample.length > 0) {
        console.log('✅ Sample record structure:');
        console.log(JSON.stringify(sample[0], null, 2));
        
        console.log('\n📊 Available columns:');
        Object.keys(sample[0]).forEach(column => {
          console.log(`• ${column}: ${typeof sample[0][column]}`);
        });
      } else {
        console.log('❌ No records found in instagram_vendors table');
      }
    } else {
      console.log(`❌ Failed to fetch sample: ${sampleResponse.status}`);
      const errorText = await sampleResponse.text();
      console.log('Error details:', errorText);
    }

    // 2. Get total count
    console.log('\n📈 Total record count...');
    const countResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=*`, {
      method: 'HEAD',
      headers
    });
    
    if (countResponse.ok) {
      const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`✅ Total instagram_vendors: ${totalCount}`);
    }

    // 3. Get recent records (try basic columns)
    console.log('\n📱 Recent records (basic columns)...');
    const recentResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_vendors?select=id,created_at&order=created_at.desc&limit=5`, {
      method: 'GET',
      headers
    });
    
    if (recentResponse.ok) {
      const recent = await recentResponse.json();
      console.log(`✅ Found ${recent.length} recent records:`);
      recent.forEach((record, index) => {
        const date = new Date(record.created_at).toLocaleString();
        console.log(`${index + 1}. ID: ${record.id} - Created: ${date}`);
      });
    } else {
      console.log(`❌ Failed to fetch recent records: ${recentResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
}

checkTableStructure().catch(console.error);
