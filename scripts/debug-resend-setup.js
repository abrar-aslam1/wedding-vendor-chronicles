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

async function debugResendSetup() {
  console.log('🔍 Debugging Resend setup in Supabase...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('📧 Testing notification function directly...');
    
    // Test with a simple notification first
    const { data: testResult, error: testError } = await supabase.functions.invoke('send-admin-notification', {
      body: {
        type: 'user_registration',
        data: {
          email: 'test@example.com',
          created_at: new Date().toISOString()
        }
      }
    });
    
    if (testError) {
      console.error('❌ Function error:', testError);
      
      // Check if it's a RESEND_API_KEY issue
      if (testError.message.includes('RESEND_API_KEY')) {
        console.log('\n🔧 RESEND_API_KEY Issue Detected:');
        console.log('1. Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions');
        console.log('2. Click "Environment Variables"');
        console.log('3. Verify RESEND_API_KEY is set');
        console.log('4. Make sure it starts with "re_"');
      }
      
      return;
    }
    
    console.log('✅ Function called successfully:', testResult);
    
    // Now test the weekly report
    console.log('\n📊 Testing weekly report...');
    
    const { data: weeklyResult, error: weeklyError } = await supabase.functions.invoke('send-admin-notification', {
      body: {
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
      }
    });
    
    if (weeklyError) {
      console.error('❌ Weekly report error:', weeklyError);
      return;
    }
    
    console.log('✅ Weekly report sent successfully!');
    console.log('📧 Check your email at abrar@amarosystems.com');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugResendSetup();