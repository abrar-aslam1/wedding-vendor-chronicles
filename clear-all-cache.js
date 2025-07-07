// Clear all cache entries for testing
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearAllCache() {
  console.log('🧹 Clearing ALL cache entries...');
  
  try {
    // Clear all cache entries
    const { data: deletedData, error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
      console.error('❌ Error clearing cache:', deleteError);
      return;
    }
    
    console.log('✅ All cache cleared successfully');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify cache is cleared
    const { data: remainingCache } = await supabase
      .from('vendor_cache')
      .select('*');
    
    console.log(`📊 Remaining cache entries: ${remainingCache?.length || 0}`);
    
    if (remainingCache && remainingCache.length > 0) {
      console.log('📋 Remaining entries:');
      remainingCache.forEach((entry, i) => {
        console.log(`   ${i+1}. ${entry.category} in ${entry.city}, ${entry.state} - subcategory: ${entry.subcategory || 'null'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Clear failed:', error);
  }
}

clearAllCache();
