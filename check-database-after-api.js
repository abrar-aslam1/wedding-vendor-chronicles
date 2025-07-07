// Check what's actually in the database after API call
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabaseAfterAPI() {
  console.log('🔍 Checking database after API call...');
  
  try {
    // Check all Orlando photographer entries
    const { data: allEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Orlando')
      .eq('state', 'FL')
      .order('created_at', { ascending: false });
    
    console.log(`📊 Found ${allEntries?.length || 0} Orlando photographer entries:`);
    
    if (allEntries && allEntries.length > 0) {
      allEntries.forEach((entry, i) => {
        console.log(`\n${i+1}. Entry Details:`);
        console.log(`   - ID: ${entry.id}`);
        console.log(`   - Category: ${entry.category}`);
        console.log(`   - City: ${entry.city}`);
        console.log(`   - State: ${entry.state}`);
        console.log(`   - Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   - Results: ${entry.search_results?.length || 0}`);
        console.log(`   - Created: ${entry.created_at}`);
        console.log(`   - Expires: ${entry.expires_at}`);
        
        // Check if this is the portrait entry
        if (entry.subcategory === 'portrait') {
          console.log(`   ✅ This is the PORTRAIT entry!`);
        } else if (entry.subcategory === 'wedding') {
          console.log(`   ✅ This is the WEDDING entry!`);
        } else if (!entry.subcategory) {
          console.log(`   ⚠️ This entry has NO subcategory`);
        }
      });
      
      // Check for portrait specifically
      const portraitEntry = allEntries.find(e => e.subcategory === 'portrait');
      if (portraitEntry) {
        console.log('\n✅ PORTRAIT ENTRY FOUND IN DATABASE!');
        console.log('   The issue might be with the cache checking logic');
      } else {
        console.log('\n❌ NO PORTRAIT ENTRY FOUND IN DATABASE');
        console.log('   The Edge Function is not storing the subcategory properly');
      }
    } else {
      console.log('❌ No Orlando photographer entries found at all');
    }
    
    // Also check the most recent entry regardless of filters
    console.log('\n🕐 Most recent cache entry (any category/city):');
    const { data: recentEntry } = await supabase
      .from('vendor_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (recentEntry && recentEntry.length > 0) {
      const entry = recentEntry[0];
      console.log(`   - Category: ${entry.category}`);
      console.log(`   - City: ${entry.city}, ${entry.state}`);
      console.log(`   - Subcategory: "${entry.subcategory || 'null'}"`);
      console.log(`   - Created: ${entry.created_at}`);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabaseAfterAPI();
