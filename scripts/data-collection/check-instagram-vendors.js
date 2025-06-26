/**
 * Check Instagram Vendors Script
 * 
 * This script checks what Instagram vendors are in the database
 * and their subcategory values to help diagnose the integration issue.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wpbdveyuuudhmwflrmqw.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Main function to check Instagram vendor data
 */
async function main() {
  try {
    console.log('Checking Instagram vendors in database...\n');
    
    // First, check if the table exists and get total count
    const { count, error: countError } = await supabase
      .from('instagram_vendors')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error accessing instagram_vendors table:', countError);
      return;
    }
    
    console.log(`Total Instagram vendors in database: ${count}\n`);
    
    if (count === 0) {
      console.log('No Instagram vendors found in database.');
      console.log('You may need to run the data collection script first.');
      return;
    }
    
    // Get photographers specifically
    const { data: photographers, error: photoError } = await supabase
      .from('instagram_vendors')
      .select('*')
      .eq('category', 'photographers')
      .limit(20);
    
    if (photoError) {
      console.error('Error fetching photographers:', photoError);
      return;
    }
    
    console.log(`Found ${photographers.length} Instagram photographers\n`);
    
    if (photographers.length === 0) {
      console.log('No Instagram photographers found.');
      
      // Check what categories do exist
      const { data: categories, error: catError } = await supabase
        .from('instagram_vendors')
        .select('category')
        .limit(100);
      
      if (!catError && categories) {
        const uniqueCategories = [...new Set(categories.map(c => c.category))];
        console.log('Available categories:', uniqueCategories.join(', '));
      }
      
      return;
    }
    
    // Display photographer details
    console.log('=== Instagram Photographers ===\n');
    
    photographers.forEach((vendor, index) => {
      console.log(`[${index + 1}] ${vendor.business_name || vendor.instagram_handle}`);
      console.log(`    Handle: @${vendor.instagram_handle}`);
      console.log(`    Category: ${vendor.category}`);
      console.log(`    Subcategory: ${vendor.subcategory || 'NOT SET'}`);
      console.log(`    Location: ${vendor.city || 'N/A'}, ${vendor.state || 'N/A'}`);
      console.log(`    Followers: ${vendor.follower_count || 'N/A'}`);
      console.log(`    Bio: ${vendor.bio ? vendor.bio.substring(0, 100) + (vendor.bio.length > 100 ? '...' : '') : 'N/A'}`);
      console.log('');
    });
    
    // Analyze subcategory distribution
    const subcategoryCounts = {};
    photographers.forEach(p => {
      const subcat = p.subcategory || 'NULL/EMPTY';
      subcategoryCounts[subcat] = (subcategoryCounts[subcat] || 0) + 1;
    });
    
    console.log('=== Subcategory Distribution ===');
    Object.entries(subcategoryCounts).forEach(([subcat, count]) => {
      console.log(`${subcat}: ${count} photographers`);
    });
    
    console.log('\n=== Expected Subcategories (from config) ===');
    const expectedSubcategories = [
      'Traditional Photography',
      'Photojournalistic', 
      'Fine Art',
      'Aerial Photography',
      'Engagement Specialists'
    ];
    expectedSubcategories.forEach(subcat => {
      console.log(`- ${subcat}`);
    });
    
    console.log('\n=== Analysis ===');
    const hasMatchingSubcategories = photographers.some(p => 
      expectedSubcategories.includes(p.subcategory)
    );
    
    if (!hasMatchingSubcategories) {
      console.log('❌ ISSUE FOUND: No Instagram photographers have subcategories that match your predefined ones.');
      console.log('   This is why they\'re not showing up in subcategory searches.');
    } else {
      console.log('✅ Some photographers have matching subcategories.');
    }
    
    const hasEmptySubcategories = photographers.some(p => !p.subcategory);
    if (hasEmptySubcategories) {
      console.log('⚠️  WARNING: Some photographers have empty subcategory fields.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(console.error);
