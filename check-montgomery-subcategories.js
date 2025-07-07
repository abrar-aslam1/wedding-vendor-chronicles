// Check Montgomery subcategories from the collection script
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkMontgomerySubcategories() {
  console.log('🔍 Checking Montgomery subcategories from collection script...');
  
  try {
    // Check all Montgomery entries
    const { data: allEntries } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('city', 'Montgomery')
      .eq('state', 'AL')
      .order('created_at', { ascending: false });
    
    console.log(`📊 Found ${allEntries?.length || 0} Montgomery entries:`);
    
    if (allEntries && allEntries.length > 0) {
      // Group by category and subcategory
      const grouped = {};
      
      allEntries.forEach((entry) => {
        const category = entry.category;
        const subcategory = entry.subcategory || 'none';
        
        if (!grouped[category]) {
          grouped[category] = {};
        }
        
        if (!grouped[category][subcategory]) {
          grouped[category][subcategory] = [];
        }
        
        grouped[category][subcategory].push({
          id: entry.id,
          created: entry.created_at,
          results: entry.search_results?.length || 0
        });
      });
      
      // Display results
      Object.keys(grouped).forEach(category => {
        console.log(`\n📂 ${category.toUpperCase()}:`);
        Object.keys(grouped[category]).forEach(subcategory => {
          const entries = grouped[category][subcategory];
          console.log(`   ${subcategory}: ${entries.length} entries`);
          entries.forEach((entry, i) => {
            console.log(`      ${i+1}. ${entry.results} results (${entry.created.substring(0, 19)})`);
          });
        });
      });
      
      // Check for the specific subcategories we saw in the collection script
      const hairStylistVintage = allEntries.find(e => 
        e.category === 'hair stylist' && e.subcategory === 'vintage'
      );
      
      const bridalShopDesigner = allEntries.find(e => 
        e.category === 'bridal shop' && e.subcategory === 'designer'
      );
      
      console.log('\n🎯 Specific Subcategory Check:');
      if (hairStylistVintage) {
        console.log('✅ hair stylist (vintage) found!');
        console.log(`   Results: ${hairStylistVintage.search_results?.length || 0}`);
        console.log(`   Created: ${hairStylistVintage.created_at}`);
      } else {
        console.log('❌ hair stylist (vintage) not found');
      }
      
      if (bridalShopDesigner) {
        console.log('✅ bridal shop (designer) found!');
        console.log(`   Results: ${bridalShopDesigner.search_results?.length || 0}`);
        console.log(`   Created: ${bridalShopDesigner.created_at}`);
      } else {
        console.log('❌ bridal shop (designer) not found');
      }
      
      // Count unique subcategories
      const uniqueSubcategories = [...new Set(allEntries.map(e => e.subcategory || 'none'))];
      console.log(`\n📈 Total unique subcategories: ${uniqueSubcategories.length}`);
      console.log(`   Subcategories: ${uniqueSubcategories.join(', ')}`);
      
      if (uniqueSubcategories.length > 5) {
        console.log('🎉 SUCCESS: Multiple subcategories are being stored!');
      } else {
        console.log('⚠️ Limited subcategory variety detected');
      }
      
    } else {
      console.log('❌ No Montgomery entries found');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkMontgomerySubcategories();
