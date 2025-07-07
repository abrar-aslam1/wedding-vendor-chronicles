// Check the very latest entries to see if vintage was created
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkLatestEntries() {
  console.log('🔍 Checking latest entries for NewTestCity and vintage subcategory...');
  
  try {
    // Get the 10 most recent entries
    const { data: recentEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    console.log(`📊 Found ${recentEntries?.length || 0} recent entries:`);
    
    if (recentEntries && recentEntries.length > 0) {
      recentEntries.forEach((entry, i) => {
        const timeAgo = Math.round((Date.now() - new Date(entry.created_at).getTime()) / 1000 / 60);
        console.log(`\n${i+1}. ${entry.category} in ${entry.city}, ${entry.state}`);
        console.log(`   Subcategory: "${entry.subcategory || 'null'}"`);
        console.log(`   Results: ${entry.search_results?.length || 0}`);
        console.log(`   Created: ${timeAgo} minutes ago`);
        console.log(`   Sample result: ${entry.search_results?.[0]?.title || 'N/A'}`);
        
        // Check for NewTestCity entries
        if (entry.city === 'NewTestCity') {
          console.log(`   🏙️ NEWTESTCITY ENTRY!`);
          
          if (entry.subcategory === 'modern') {
            console.log(`   ✅ MODERN SUBCATEGORY CONFIRMED`);
          } else if (entry.subcategory === 'vintage') {
            console.log(`   ✅ VINTAGE SUBCATEGORY FOUND!`);
          }
        }
      });
      
      // Look specifically for NewTestCity entries
      const newTestCityEntries = recentEntries.filter(e => 
        e.city === 'NewTestCity' && e.state === 'TX'
      );
      
      console.log(`\n🏙️ NewTestCity entries found: ${newTestCityEntries.length}`);
      
      if (newTestCityEntries.length > 0) {
        newTestCityEntries.forEach((entry, i) => {
          console.log(`   ${i+1}. Subcategory: "${entry.subcategory || 'null'}" (${entry.search_results?.length || 0} results)`);
        });
        
        const subcategories = newTestCityEntries.map(e => e.subcategory || 'null');
        const uniqueSubcategories = [...new Set(subcategories)];
        
        console.log(`\n📈 Unique NewTestCity subcategories: ${uniqueSubcategories.join(', ')}`);
        
        if (uniqueSubcategories.includes('vintage')) {
          console.log('🎉 SUCCESS: Vintage subcategory was created!');
          console.log('   The issue was with the test query, not the Edge Function');
        } else {
          console.log('❌ ISSUE: Vintage subcategory was not created');
          console.log('   The Edge Function is not storing the second subcategory');
        }
      } else {
        console.log('❌ No NewTestCity entries found in recent entries');
      }
      
    } else {
      console.log('❌ No recent entries found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkLatestEntries();
