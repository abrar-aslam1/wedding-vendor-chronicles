/**
 * Expand Instagram Photographers to Multiple Locations
 * 
 * This script duplicates existing Instagram photographers to multiple major cities
 * so they appear in searches across different locations.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wpbdveyuuudhmwflrmqw.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Major cities to expand Instagram photographers to
const MAJOR_CITIES = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Boston', state: 'MA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Washington', state: 'DC' },
  { city: 'Philadelphia', state: 'PA' }
];

/**
 * Main function to expand Instagram photographers to multiple locations
 */
async function main() {
  try {
    console.log('Expanding Instagram photographers to multiple locations...\n');
    
    // Get existing Chicago photographers
    const { data: chicagoPhotographers, error: fetchError } = await supabase
      .from('instagram_vendors')
      .select('*')
      .eq('category', 'photographers')
      .eq('city', 'Chicago')
      .eq('state', 'IL');
    
    if (fetchError) {
      console.error('Error fetching Chicago photographers:', fetchError);
      return;
    }
    
    if (!chicagoPhotographers || chicagoPhotographers.length === 0) {
      console.log('No Chicago photographers found to expand.');
      return;
    }
    
    console.log(`Found ${chicagoPhotographers.length} Chicago photographers to expand`);
    
    let totalCreated = 0;
    
    // For each major city, create copies of the Chicago photographers
    for (const location of MAJOR_CITIES) {
      console.log(`\nExpanding to ${location.city}, ${location.state}...`);
      
      // Check if photographers already exist in this location
      const { data: existingInLocation, error: checkError } = await supabase
        .from('instagram_vendors')
        .select('instagram_handle')
        .eq('category', 'photographers')
        .eq('city', location.city)
        .eq('state', location.state);
      
      if (checkError) {
        console.error(`Error checking existing photographers in ${location.city}:`, checkError);
        continue;
      }
      
      const existingHandles = new Set(existingInLocation?.map(p => p.instagram_handle) || []);
      
      // Create new photographers for this location
      const newPhotographers = chicagoPhotographers
        .filter(photographer => !existingHandles.has(photographer.instagram_handle))
        .map(photographer => ({
          instagram_handle: photographer.instagram_handle,
          business_name: photographer.business_name,
          category: photographer.category,
          subcategory: photographer.subcategory,
          bio: photographer.bio,
          follower_count: photographer.follower_count,
          post_count: photographer.post_count,
          is_verified: photographer.is_verified,
          is_business_account: photographer.is_business_account,
          profile_image_url: photographer.profile_image_url,
          website_url: photographer.website_url,
          email: photographer.email,
          phone: photographer.phone,
          city: location.city,
          state: location.state,
          location: `${location.city}, ${location.state}`,
          // Don't copy the original ID, let Supabase generate new ones
        }));
      
      if (newPhotographers.length === 0) {
        console.log(`  All photographers already exist in ${location.city}, ${location.state}`);
        continue;
      }
      
      // Insert new photographers in batches
      const batchSize = 10;
      for (let i = 0; i < newPhotographers.length; i += batchSize) {
        const batch = newPhotographers.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('instagram_vendors')
          .insert(batch);
        
        if (insertError) {
          console.error(`Error inserting batch for ${location.city}:`, insertError);
        } else {
          console.log(`  Created ${batch.length} photographers in ${location.city}, ${location.state}`);
          totalCreated += batch.length;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`\n✅ Successfully expanded Instagram photographers!`);
    console.log(`📊 Total new photographers created: ${totalCreated}`);
    console.log(`🌍 Now available in ${MAJOR_CITIES.length + 1} cities (including original Chicago)`);
    
    // Verify the expansion
    const { data: allPhotographers, error: countError } = await supabase
      .from('instagram_vendors')
      .select('city, state')
      .eq('category', 'photographers');
    
    if (!countError && allPhotographers) {
      const locationCounts = {};
      allPhotographers.forEach(p => {
        const location = `${p.city}, ${p.state}`;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });
      
      console.log('\n📍 Instagram photographers by location:');
      Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([location, count]) => {
          console.log(`  ${location}: ${count} photographers`);
        });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main().catch(console.error);
