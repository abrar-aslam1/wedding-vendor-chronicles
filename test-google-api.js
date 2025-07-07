// Test script to verify the search-google-vendors API is working
const testGoogleSearchAPI = async () => {
  const supabaseUrl = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';
  
  const testPayload = {
    keyword: 'photographer',
    location: 'Dallas, TX',
    subcategory: 'Engagement Specialists'
  };
  
  console.log('🧪 Testing search-google-vendors API...');
  console.log('📦 Test payload:', testPayload);
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/search-google-vendors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log('📊 Results count:', data.results?.length || 0);
      console.log('📊 Total results:', data.totalResults);
      console.log('📊 Source:', data.source);
      
      if (data.results && data.results.length > 0) {
        console.log('📊 First result:', {
          title: data.results[0].title,
          vendor_source: data.results[0].vendor_source,
          hasRating: !!data.results[0].rating,
          description: data.results[0].description?.substring(0, 100) + '...'
        });
        
        // Show breakdown by vendor source
        const sourceBreakdown = data.results.reduce((acc, result) => {
          const source = result.vendor_source || 'unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Results by source:', sourceBreakdown);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API call failed');
      console.error('📊 Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Run the test
testGoogleSearchAPI();
