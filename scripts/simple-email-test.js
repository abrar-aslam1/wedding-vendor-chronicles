#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailDirect() {
  console.log('📧 Simple Email Test - Direct Send');
  console.log('==================================\n');

  // Test data for a business submission
  const testBusinessData = {
    business_name: 'Bella Rosa Mobile Coffee Cart',
    category: 'carts',
    city: 'Los Angeles',
    state: 'California',
    description: 'Premium mobile coffee cart specializing in artisanal espresso drinks and specialty beverages for weddings and events.',
    contact_info: {
      email: 'hello@bellarosacoffee.com',
      phone: '(555) 123-4567',
      website: 'https://bellarosacoffee.com'
    },
    created_at: new Date().toISOString()
  };

  console.log('📝 Test business data:');
  console.log(`   Business: ${testBusinessData.business_name}`);
  console.log(`   Category: ${testBusinessData.category}`);
  console.log(`   Location: ${testBusinessData.city}, ${testBusinessData.state}`);
  console.log(`   Contact: ${testBusinessData.contact_info.email}\n`);

  console.log('🚀 Sending test email notification...');

  try {
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: {
        type: 'business_submission',
        data: testBusinessData
      }
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      
      if (error.message.includes('RESEND_API_KEY')) {
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure RESEND_API_KEY is set in Supabase');
        console.log('   2. Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions');
        console.log('   3. Click "Environment Variables"');
        console.log('   4. Add RESEND_API_KEY with your Resend API key');
      }
      
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📊 Response:', data);
    
    console.log('\n🎉 SUCCESS! Check your email inbox:');
    console.log('   📧 Email: abrar@amarosystems.com');
    console.log('   📂 Check spam folder if not in inbox');
    console.log('   ⏰ Email should arrive within 1-2 minutes');

    console.log('\n📋 What to expect in the email:');
    console.log('   • Subject: "🏢 New Business Submission - Find My Wedding Vendor"');
    console.log('   • Beautiful HTML formatting');
    console.log('   • Complete business details');
    console.log('   • Contact information');
    console.log('   • Link to admin panel');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    console.log('\n💡 Common issues:');
    console.log('   1. RESEND_API_KEY not set in Supabase environment variables');
    console.log('   2. Invalid Resend API key');
    console.log('   3. Network connectivity issues');
  }
}

testEmailDirect();