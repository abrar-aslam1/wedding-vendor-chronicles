#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notification System');
  console.log('===================================\n');

  try {
    // Test 1: Add a test business submission notification to queue
    console.log('📝 Test 1: Adding test business submission to notification queue...');
    
    const testBusinessData = {
      business_name: 'Test Coffee Cart Co.',
      category: 'carts',
      city: 'Los Angeles',
      state: 'California',
      description: 'A test mobile coffee cart for weddings and events. Serving premium espresso and specialty drinks.',
      contact_info: {
        email: 'test@testcoffeecart.com',
        phone: '(555) 123-4567',
        website: 'https://testcoffeecart.com'
      },
      created_at: new Date().toISOString()
    };

    const { error: queueError } = await supabase
      .from('admin_notification_queue')
      .insert({
        notification_type: 'business_submission',
        data: testBusinessData
      });

    if (queueError) {
      console.error('❌ Error adding to queue:', queueError);
      return;
    }

    console.log('✅ Test business notification added to queue');

    // Test 2: Add a test user registration notification
    console.log('\n📝 Test 2: Adding test user registration to notification queue...');
    
    const testUserData = {
      email: 'testuser@example.com',
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: 'email'
      }
    };

    const { error: userQueueError } = await supabase
      .from('admin_notification_queue')
      .insert({
        notification_type: 'user_registration',
        data: testUserData
      });

    if (userQueueError) {
      console.error('❌ Error adding user registration to queue:', userQueueError);
      return;
    }

    console.log('✅ Test user registration notification added to queue');

    // Test 3: Process the notification queue
    console.log('\n📝 Test 3: Processing notification queue...');
    
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-notification-queue', {
      body: {}
    });

    if (processError) {
      console.error('❌ Error processing queue:', processError);
      return;
    }

    console.log('✅ Queue processing result:', processResult);

    // Test 4: Check queue status
    console.log('\n📝 Test 4: Checking queue status...');
    
    const { data: queueItems, error: queueCheckError } = await supabase
      .from('admin_notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (queueCheckError) {
      console.error('❌ Error checking queue:', queueCheckError);
      return;
    }

    console.log('\n📊 Recent queue items:');
    queueItems?.forEach(item => {
      const status = item.processed ? '✅ Processed' : '⏳ Pending';
      console.log(`  ${status} - ${item.notification_type} (${new Date(item.created_at).toLocaleString()})`);
    });

    // Test 5: Direct email test
    console.log('\n📝 Test 5: Testing direct email send...');
    
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
      body: {
        type: 'business_submission',
        data: testBusinessData
      }
    });

    if (emailError) {
      console.error('❌ Error sending email:', emailError);
      return;
    }

    console.log('✅ Direct email test result:', emailResult);

    console.log('\n🎉 Email notification test completed!');
    console.log('📧 Check your email (abrar@amarosystems.com) for test notifications.');
    console.log('\n💡 If you didn\'t receive emails, check:');
    console.log('   1. RESEND_API_KEY is set correctly in Supabase');
    console.log('   2. Your spam folder');
    console.log('   3. Resend dashboard for delivery status');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailNotifications();