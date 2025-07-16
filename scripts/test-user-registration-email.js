#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testUserRegistrationEmail() {
  console.log('📧 Testing User Registration Email Notification');
  console.log('==============================================\n');

  // Test data for a new user registration
  const testUserData = {
    email: 'newuser@example.com',
    created_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: 'google',
      providers: ['google']
    }
  };

  console.log('👤 Test user data:');
  console.log(`   Email: ${testUserData.email}`);
  console.log(`   Provider: ${testUserData.app_metadata.provider}`);
  console.log(`   Registration: ${new Date(testUserData.created_at).toLocaleString()}\n`);

  console.log('🚀 Sending test user registration email...');

  try {
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: {
        type: 'user_registration',
        data: testUserData
      }
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📊 Response:', data);
    
    console.log('\n🎉 SUCCESS! Check your email inbox:');
    console.log('   📧 Email: abrar@amarosystems.com');
    console.log('   📂 Check spam folder if not in inbox');
    console.log('   ⏰ Email should arrive within 1-2 minutes');

    console.log('\n📋 What to expect in the email:');
    console.log('   • Subject: "👤 New User Registration - Find My Wedding Vendor"');
    console.log('   • User email and registration details');
    console.log('   • Authentication method (Google OAuth)');
    console.log('   • Registration timestamp');
    console.log('   • No approval needed - just for your awareness');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserRegistrationEmail();