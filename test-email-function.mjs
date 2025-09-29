
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailFunction() {
  console.log('🧪 Testing email function...');
  
  try {
    const testData = {
      type: 'user_registration',
      data: {
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        app_metadata: { provider: 'Email' },
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      },
      recipients: ['abrar@amarosystems.com']
    };
    
    console.log('📧 Sending test email via send-admin-notification function...');
    
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: testData
    });
    
    if (error) {
      console.error('❌ Email function test failed:');
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      
      if (error.message && error.message.includes('RESEND_API_KEY')) {
        console.error('\n🔑 ISSUE IDENTIFIED: Missing RESEND_API_KEY environment variable in Supabase');
        console.log('\n💡 SOLUTION: Add RESEND_API_KEY to Supabase project environment variables');
      }
      
      process.exit(1);
    } else {
      console.log('✅ Email function test successful!');
      console.log('📧 Response data:', data);
      console.log('✨ Email system is working properly');
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmailFunction().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
