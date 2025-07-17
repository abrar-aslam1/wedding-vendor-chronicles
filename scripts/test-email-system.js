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

// Test the email system
async function testEmailSystem() {
  console.log('🧪 Testing email system...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    console.log('Found VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
    console.log('Found SUPABASE_URL:', !!process.env.SUPABASE_URL);
    console.log('Found SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const { data, error } = await supabase
      .from('vendors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test notification function with weekly report
    console.log('📧 Testing weekly report notification...');
    
    const testReportData = {
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
          { name: 'Test Vendor 1', average_rating: 4.8, review_count: 23 },
          { name: 'Test Vendor 2', average_rating: 4.6, review_count: 18 }
        ]
      },
      recipients: ['abrar@amarosystems.com']
    };
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
      body: testReportData
    });
    
    if (emailError) {
      console.error('❌ Email test failed:', emailError.message);
      console.log('ℹ️  Make sure RESEND_API_KEY is configured in Supabase project settings');
    } else {
      console.log('✅ Email test successful!');
      console.log('📧 Test weekly report sent to abrar@amarosystems.com');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailSystem();