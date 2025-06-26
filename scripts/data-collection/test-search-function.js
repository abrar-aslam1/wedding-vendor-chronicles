/**
 * Test Search Function
 * 
 * This script tests the search function directly to see if Instagram photographers
 * are being returned in search results.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wpbdveyuuudhmwflrmqw.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test the search function directly
 */
async function testSearchFunction() {
  try {
    console.log('Testing search function...\n');
    
    // Test search parameters
    const testCases = [
      {
        keyword: 'photographers',
        location: 'Chicago, IL',
        subcategory: null,
        description: 'General photographer search in Chicago'
      },
      {
        keyword: 'photographers',
        location: 'New York, NY',
        subcategory: null,
        description: 'General photographer search in New York'
      },
      {
        keyword: 'photographers',
        location: 'Chicago, IL',
        subcategory: 'Traditional Photography',
        description: 'Traditional photography search in Chicago'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.description}`);
      console.log(`   Keyword: ${testCase.keyword}`);
      console.log(`   Location: ${testCase.location}`);
      console.log(`   Subcategory: ${testCase.subcategory || 'None'}`);
      
      try {
        // Call the search function
        const { data, error } = await supabase.functions.invoke('search-vendors', {
          body: {
            keyword: testCase.keyword,
            location: testCase.location,
            subcategory: testCase.subcategory
          }
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          continue;
        }
        
        if (!data || !Array.isArray(data)) {
          console.log(`   ❌ Invalid response format`);
          continue;
        }
        
        // Analyze results
        const totalResults = data.length;
        const instagramResults = data.filter(result => result.vendor_source === 'instagram');
        const googleMapsResults = data.filter(result => result.vendor_source !== 'instagram');
        
        console.log(`   ✅ Total results: ${totalResults}`);
        console.log(`   📸 Instagram photographers: ${instagramResults.length}`);
        console.log(`   🗺️  Google Maps results: ${googleMapsResults.length}`);
        
        if (instagramResults.length > 0) {
          console.log(`   📋 First few Instagram photographers:`);
          instagramResults.slice(0, 3).forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.title} (@${result.instagram_handle})`);
          });
        } else {
          console.log(`   ⚠️  No Instagram photographers found`);
        }
        
      } catch (functionError) {
        console.log(`   ❌ Function error: ${functionError.message}`);
      }
      
      console.log('');
    }
    
    // Also test direct database query to compare
    console.log('🔍 Testing direct database query for comparison...');
    
    const { data: directResults, error: directError } = await supabase
      .from('instagram_vendors')
      .select('*')
      .eq('category', 'photographers')
      .eq('city', 'Chicago')
      .eq('state', 'IL')
      .limit(5);
    
    if (directError) {
      console.log(`   ❌ Direct query error: ${directError.message}`);
    } else {
      console.log(`   ✅ Direct query found ${directResults?.length || 0} Chicago Instagram photographers`);
      if (directResults && directResults.length > 0) {
        console.log(`   📋 Sample photographers from direct query:`);
        directResults.slice(0, 3).forEach((result, index) => {
          console.log(`      ${index + 1}. ${result.business_name} (@${result.instagram_handle})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testSearchFunction().catch(console.error);
