console.log('Starting simple search test...');

try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase client imported successfully');
  
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created');
  
  // Test a simple search
  console.log('🔍 Testing search function...');
  
  supabase.functions.invoke('search-vendors', {
    body: {
      keyword: 'photographer',
      location: 'Dallas, Texas'
    }
  }).then(({ data, error }) => {
    if (error) {
      console.error('❌ Search error:', error);
      return;
    }
    
    console.log('✅ Search completed successfully');
    console.log('📊 Results:', {
      totalResults: data?.length || 0,
      isArray: Array.isArray(data),
      sampleResult: data?.[0] ? {
        title: data[0].title,
        vendor_source: data[0].vendor_source
      } : null
    });
    
    if (data && Array.isArray(data)) {
      const sourceBreakdown = data.reduce((acc, result) => {
        const source = result.vendor_source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 Results by source:', sourceBreakdown);
    }
  }).catch(error => {
    console.error('❌ Promise error:', error);
  });
  
} catch (error) {
  console.error('❌ Script error:', error);
}
