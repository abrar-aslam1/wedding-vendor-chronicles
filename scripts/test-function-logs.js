import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envFile = readFileSync('.env', 'utf8');
const envLines = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function testFunctionLogs() {
  console.log('🔍 Testing function with detailed error handling...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('📧 Testing weekly report with error details...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'weekly_report',
        data: {
          period: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          vendors: { total: 150, newThisWeek: 5 },
          reviews: { total: 342, newThisWeek: 12 },
          traffic: { pageViews: 1250, uniqueUsers: 680 },
          performance: { averageScore: 88 },
          topVendors: [
            { name: 'Test Vendor 1', average_rating: 4.8, review_count: 23 }
          ]
        },
        recipients: ['abrar@amarosystems.com']
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      console.error('❌ Function failed with status:', response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Raw error response:', responseText);
      }
    } else {
      console.log('✅ Function succeeded');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFunctionLogs();