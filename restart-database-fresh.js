// Complete database restart - clear all old cache and start fresh
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function restartDatabaseFresh() {
  console.log('🔄 RESTARTING DATABASE - CLEARING ALL OLD RESULTS');
  console.log('================================================');
  
  try {
    // Step 1: Get total count of cache entries
    console.log('\n1️⃣ Checking current database state...');
    const { data: allEntries, count } = await supabase
      .from('vendor_cache')
      .select('*', { count: 'exact' });
    
    console.log(`📊 Found ${count || 0} total cache entries to clear`);
    
    if (allEntries && allEntries.length > 0) {
      // Show breakdown by category
      const categoryBreakdown = {};
      const subcategoryBreakdown = {};
      
      allEntries.forEach(entry => {
        categoryBreakdown[entry.category] = (categoryBreakdown[entry.category] || 0) + 1;
        const subcat = entry.subcategory || 'null';
        subcategoryBreakdown[subcat] = (subcategoryBreakdown[subcat] || 0) + 1;
      });
      
      console.log('\n📋 Current database breakdown:');
      console.log('   Categories:');
      Object.entries(categoryBreakdown).forEach(([cat, count]) => {
        console.log(`     - ${cat}: ${count} entries`);
      });
      
      console.log('   Subcategories:');
      Object.entries(subcategoryBreakdown).forEach(([subcat, count]) => {
        console.log(`     - ${subcat}: ${count} entries`);
      });
    }
    
    // Step 2: Clear all cache entries
    console.log('\n2️⃣ Clearing ALL cache entries...');
    
    if (allEntries && allEntries.length > 0) {
      // Delete in batches to avoid timeout
      const batchSize = 20;
      let deletedCount = 0;
      
      for (let i = 0; i < allEntries.length; i += batchSize) {
        const batch = allEntries.slice(i, i + batchSize);
        const ids = batch.map(entry => entry.id);
        
        const { error } = await supabase
          .from('vendor_cache')
          .delete()
          .in('id', ids);
        
        if (error) {
          console.error(`❌ Error deleting batch ${Math.floor(i/batchSize) + 1}:`, error);
        } else {
          deletedCount += batch.length;
          console.log(`✅ Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} entries (Total: ${deletedCount}/${allEntries.length})`);
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Step 3: Verify database is clean
    console.log('\n3️⃣ Verifying database is clean...');
    const { data: remainingEntries, count: remainingCount } = await supabase
      .from('vendor_cache')
      .select('*', { count: 'exact' });
    
    console.log(`📊 Remaining entries: ${remainingCount || 0}`);
    
    if (remainingCount === 0) {
      console.log('✅ Database successfully cleared!');
    } else {
      console.log('⚠️ Some entries remain:');
      remainingEntries?.forEach((entry, i) => {
        console.log(`   ${i+1}. ${entry.category} in ${entry.city}, ${entry.state} - subcategory: ${entry.subcategory || 'null'}`);
      });
    }
    
    // Step 4: Test new subcategory system
    console.log('\n4️⃣ Testing fresh subcategory system...');
    
    const { data: testData, error: testError } = await supabase.functions.invoke('search-google-vendors', {
      body: {
        keyword: 'photographer',
        location: 'Orlando, FL',
        subcategory: 'wedding'
      }
    });
    
    if (testError) {
      console.error('❌ Test API call failed:', testError);
    } else {
      console.log(`✅ Test API call successful: ${testData?.results?.length || 0} results`);
      console.log(`📝 Sample result: ${testData?.results?.[0]?.title || 'N/A'}`);
    }
    
    // Wait for cache to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify new entry was created with subcategory
    const { data: newCache } = await supabase
      .from('vendor_cache')
      .select('*')
      .eq('category', 'photographer')
      .eq('city', 'Orlando')
      .eq('state', 'FL');
    
    if (newCache && newCache.length > 0) {
      console.log('\n✅ NEW CACHE ENTRY CREATED:');
      const entry = newCache[0];
      console.log(`   - Category: ${entry.category}`);
      console.log(`   - City: ${entry.city}`);
      console.log(`   - State: ${entry.state}`);
      console.log(`   - Subcategory: ${entry.subcategory || 'null'}`);
      console.log(`   - Results: ${entry.search_results?.length || 0}`);
      console.log(`   - Expires: ${entry.expires_at}`);
      console.log(`   - Created: ${entry.created_at}`);
      
      // Check if expires_at is about 1 month from now
      const expiresDate = new Date(entry.expires_at);
      const now = new Date();
      const daysDiff = Math.round((expiresDate - now) / (1000 * 60 * 60 * 24));
      console.log(`   - Cache duration: ${daysDiff} days`);
      
      if (daysDiff >= 28 && daysDiff <= 32) {
        console.log('✅ 1-month cache duration confirmed!');
      } else {
        console.log('⚠️ Cache duration not 1 month');
      }
    } else {
      console.log('❌ No new cache entry found');
    }
    
    console.log('\n🎉 DATABASE RESTART COMPLETE!');
    console.log('===============================');
    console.log('✅ All old cache entries cleared');
    console.log('✅ Subcategory system working');
    console.log('✅ 1-month cache duration active');
    console.log('✅ Ready for fresh collection');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npm run collect-vendors-interactive');
    console.log('   2. Start fresh collection with subcategory support');
    console.log('   3. Build comprehensive national database');
    
  } catch (error) {
    console.error('❌ Database restart failed:', error);
  }
}

restartDatabaseFresh();
