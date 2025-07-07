// Clear Austin cache specifically for testing
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearAustinCache() {
  console.log('🧹 Clearing Austin photographer cache...');
  
  try {
    // Clear all Austin photographer cache entries
    const { data: deletedData, error: deleteError } = await supabase
      .from('vendor_cache')
      .delete()
      .eq('category', 'photographer')
      .eq('city', 'Austin')
      .eq('state', 'TX');
    
    if (deleteError) {
      console.error('❌ Error clearing cache:', deleteError);
      return;
    }
    
    console.log('✅ Austin photographer cache cleared successfully');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify cache is cleared
    const { data: remainingCache } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Austin')
      .eq('state', 'TX');
    
    console.log(`📊 Remaining cache entries: ${remainingCache?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Clear failed:', error);
  }
}

clearAustinCache();
