/**
 * Clear Vendor Cache
 * 
 * This script clears cached vendor results to force fresh API calls
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wpbdveyuuudhmwflrmqw.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Clear all vendor cache entries
 */
async function clearVendorCache() {
  try {
    console.log('🗑️ Clearing vendor cache...');
    
    // First, let's see what's in the cache
    const { data: cacheEntries, error: fetchError } = await supabase
      .from('vendor_cache')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching cache entries:', fetchError);
      return;
    }
    
    console.log(`Found ${cacheEntries?.length || 0} cache entries:`);
    if (cacheEntries && cacheEntries.length > 0) {
      cacheEntries.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.category} in ${entry.city}, ${entry.state} - ${entry.search_results?.length || 0} results`);
      });
    }
    
    // Clear all cache entries
    const { error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all entries (using neq with impossible UUID)
    
    if (deleteError) {
      console.error('Error clearing cache:', deleteError);
      return;
    }
    
    console.log('✅ Cache cleared successfully!');
    
    // Verify cache is empty
    const { data: remainingEntries, error: verifyError } = await supabase
      .from('vendor_cache')
      .select('*');
    
    if (verifyError) {
      console.error('Error verifying cache clear:', verifyError);
      return;
    }
    
    console.log(`Cache verification: ${remainingEntries?.length || 0} entries remaining`);
    
  } catch (error) {
    console.error('Error in clearVendorCache:', error);
  }
}

// Run the cache clear
clearVendorCache().catch(console.error);
