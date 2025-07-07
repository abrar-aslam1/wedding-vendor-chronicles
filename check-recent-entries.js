// Check the most recent cache entries to see if subcategories are being stored
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRecentEntries() {
  console.log('🔍 Checking most recent cache entries...');
  
  try {
    // Get the 20 most recent entries
    const { data: recentEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    console.log(`📊 Found ${recentEntries?.length || 0} recent entries:`);
    
    if (recentEntries && recentEntries.length > 0) {
      recentEntries.forEach((entry, i) => {
        const timeAgo = Math.round((Date.now() - new Date(entry.created_at).getTime()) / 1000 / 60);
        console.log(`\n${i+1}. ${entry.category} in ${entry.city}, ${entry.state}`);
        console.log(`   Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   Results: ${entry.search_results?.length || 0}`);
        console.log(`   Created: ${timeAgo} minutes ago`);
        
        // Check if this looks like a collection script entry
        if (timeAgo < 10) { // Created in last 10 minutes
          console.log(`   🕐 RECENT ENTRY (from collection script)`);
          
          if (entry.subcategory && entry.subcategory !== 'null') {
            console.log(`   ✅ HAS SUBCATEGORY: "${entry.subcategory}"`);
          } else {
            console.log(`   ❌ NO SUBCATEGORY STORED`);
          }
        }
      });
      
      // Check for specific subcategories we expect from the collection script
      const recentWithSubcategories = recentEntries.filter(e => 
        e.subcategory && e.subcategory !== 'null'
      );
      
      console.log(`\n📈 Recent entries with subcategories: ${recentWithSubcategories.length}/${recentEntries.length}`);
      
      if (recentWithSubcategories.length > 0) {
        console.log('✅ Subcategories found in recent entries:');
        recentWithSubcategories.forEach(entry => {
          console.log(`   - ${entry.category} (${entry.subcategory}) in ${entry.city}`);
        });
      } else {
        console.log('❌ No subcategories found in recent entries');
        console.log('   This confirms the Edge Function is not storing subcategories');
      }
      
      // Look for Mobile entries (which should have subcategories from the collection script)
      const mobileEntries = recentEntries.filter(e => 
        e.city === 'Mobile' && e.state === 'AL'
      );
      
      if (mobileEntries.length > 0) {
        console.log(`\n🏙️ Mobile, AL entries (should have subcategories):`);
        mobileEntries.forEach(entry => {
          console.log(`   - ${entry.category}: subcategory="${entry.subcategory || 'null'}"`);
        });
      }
      
    } else {
      console.log('❌ No recent entries found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkRecentEntries();
