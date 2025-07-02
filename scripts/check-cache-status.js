// Script to check vendor cache status
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCacheStatus() {
  try {
    console.log('🔍 Checking vendor cache status...\n');
    
    // Get all cache entries
    const { data: cacheEntries, error } = await supabase
      .from('vendor_cache')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching cache:', error);
      return;
    }
    
    if (!cacheEntries || cacheEntries.length === 0) {
      console.log('📭 No cache entries found');
      return;
    }
    
    console.log(`📊 Found ${cacheEntries.length} cache entries:\n`);
    
    cacheEntries.forEach((entry, index) => {
      const createdAt = new Date(entry.created_at);
      const expiresAt = new Date(entry.expires_at);
      const now = new Date();
      const isExpired = now > expiresAt;
      const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. 🔑 Key: ${entry.search_key}`);
      console.log(`   📅 Created: ${createdAt.toLocaleString()}`);
      console.log(`   ⏰ Expires: ${expiresAt.toLocaleString()}`);
      console.log(`   📈 Results: ${entry.result_count} vendors`);
      console.log(`   💰 API Cost: $${entry.api_cost || 0}`);
      console.log(`   ${isExpired ? '❌ EXPIRED' : `✅ Valid (${daysUntilExpiry} days remaining)`}`);
      console.log('');
    });
    
    // Calculate total API costs saved
    const totalCost = cacheEntries.reduce((sum, entry) => sum + (entry.api_cost || 0), 0);
    console.log(`💰 Total API costs tracked: $${totalCost.toFixed(6)}`);
    
    // Show active vs expired
    const activeCaches = cacheEntries.filter(entry => new Date() <= new Date(entry.expires_at));
    const expiredCaches = cacheEntries.filter(entry => new Date() > new Date(entry.expires_at));
    
    console.log(`✅ Active caches: ${activeCaches.length}`);
    console.log(`❌ Expired caches: ${expiredCaches.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCacheStatus();
