/**
 * View Instagram Vendors Script
 * 
 * This script retrieves and displays Instagram vendor data from the Supabase database.
 * It can be used to verify that the data collection process worked correctly.
 */

// Import Supabase client
// Use dynamic import to handle both ESM and CommonJS environments
let supabase;
async function initSupabase() {
  try {
    const { supabase: supabaseClient } = await import('../../src/integrations/supabase/client.js');
    supabase = supabaseClient;
  } catch (error) {
    console.error('Error importing Supabase client:', error);
    process.exit(1);
  }
}

// Available categories
const CATEGORIES = [
  'wedding-planners',
  'photographers',
  'videographers',
  'florists',
  'caterers',
  'venues',
  'djs-and-bands',
  'cake-designers',
  'bridal-shops',
  'makeup-artists',
  'hair-stylists'
];

/**
 * Main function to view Instagram vendor data
 */
async function main() {
  // Initialize Supabase client
  await initSupabase();
  
  const args = process.argv.slice(2);
  const category = args[0];
  const limit = parseInt(args[1]) || 10;
  
  if (category && !CATEGORIES.includes(category)) {
    console.log(`Invalid category: ${category}`);
    console.log(`Available categories: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  
  try {
    // Build query
    let query = supabase.from('instagram_vendors').select('*');
    
    // Apply category filter if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    // Apply limit
    query = query.limit(limit);
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error retrieving Instagram vendors:', error);
      process.exit(1);
    }
    
    // Display results
    console.log(`Found ${data.length} Instagram vendors${category ? ` in category: ${category}` : ''}`);
    
    // Display vendor data in a table format
    console.log('\n=== Instagram Vendors ===\n');
    
    if (data.length === 0) {
      console.log('No vendors found.');
    } else {
      // Display each vendor
      data.forEach((vendor, index) => {
        console.log(`[${index + 1}] ${vendor.business_name} (@${vendor.instagram_handle})`);
        console.log(`    Category: ${vendor.category}${vendor.subcategory ? ` (${vendor.subcategory})` : ''}`);
        console.log(`    Followers: ${vendor.follower_count || 'N/A'}, Posts: ${vendor.post_count || 'N/A'}`);
        console.log(`    Bio: ${vendor.bio ? vendor.bio.substring(0, 100) + (vendor.bio.length > 100 ? '...' : '') : 'N/A'}`);
        console.log(`    Website: ${vendor.website_url || 'N/A'}`);
        console.log(`    Contact: ${vendor.email || 'N/A'}${vendor.phone ? `, ${vendor.phone}` : ''}`);
        console.log(`    Created: ${new Date(vendor.created_at).toLocaleString()}`);
        console.log('');
      });
      
      // Display summary
      console.log(`Displaying ${data.length} of ${data.length} vendors.`);
    }
    
    // Display usage instructions
    console.log('\nUsage:');
    console.log('  node scripts/data-collection/view-instagram-vendors.js [category] [limit]');
    console.log('  - category: Optional. Filter by vendor category.');
    console.log(`    Available categories: ${CATEGORIES.join(', ')}`);
    console.log('  - limit: Optional. Maximum number of vendors to display. Default: 10');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
