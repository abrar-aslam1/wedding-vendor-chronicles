// Direct test of DataForSEO API
const dataForSeoLogin = 'abrar@amarosystems.com';
const dataForSeoPassword = '69084d8c8dcf81cd';

async function testDataForSeoAPI() {
  try {
    console.log('Testing DataForSEO API directly...');
    
    const auth = Buffer.from(`${dataForSeoLogin}:${dataForSeoPassword}`).toString('base64');
    
    const requestBody = [{
      keyword: "caterers Dallas TX",
      location_code: 2840, // United States
      language_code: "en",
      device: "desktop",
      os: "windows",
      depth: 5,
      search_places: true
    }];
    
    console.log('Making API request...');
    
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/maps/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.tasks && data.tasks[0] && data.tasks[0].result) {
      console.log(`Found ${data.tasks[0].result.length} results`);
      data.tasks[0].result.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title} - ${result.address}`);
      });
    } else {
      console.log('No results found or API error');
    }
    
  } catch (error) {
    console.error('Error testing DataForSEO API:', error);
  }
}

testDataForSeoAPI();
