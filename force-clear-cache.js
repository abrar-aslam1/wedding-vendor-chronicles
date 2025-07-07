// Force clear all cache entries using truncate
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function forceClearCache() {
  console.log('🧹 Force clearing ALL cache entries...');
  
  try {
    // Get all IDs first
    const { data: allEntries } = await supabase
      .from('vendor_cache')
      .select('id');
    
    console.log(`📊 Found ${allEntries?.length || 0} cache entries to delete`);
    
    if (allEntries && allEntries.length > 0) {
      // Delete in batches
      const batchSize = 10;
      for (let i = 0; i < allEntries.length; i += batchSize) {
        const batch = allEntries.slice(i, i + batchSize);
        const ids = batch.map(entry => entry.id);
        
        const { error } = await supabase
          .from('vendor_cache')
          .delete()
          .in('id', ids);
        
        if (error) {
          console.error(`❌ Error deleting batch ${i/batchSize + 1}:`, error);
        } else {
          console.log(`✅ Deleted batch ${i/batchSize + 1} (${batch.length} entries)`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Verify cache is cleared
    const { data: remainingCache } = await supabase
      .from('vendor_cache')
      .select('*');
    
    console.log(`📊 Remaining cache entries: ${remainingCache?.length || 0}`);
    
    if (remainingCache && remainingCache.length === 0) {
      console.log('🎉 All cache entries successfully cleared!');
    }
    
  } catch (error) {
    console.error('❌ Force clear failed:', error);
  }
}

forceClearCache();
