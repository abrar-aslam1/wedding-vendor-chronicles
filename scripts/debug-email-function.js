#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugEmailFunction() {
  console.log('🔍 Debug Email Function');
  console.log('=======================\n');

  try {
    console.log('📡 Testing function connectivity...');
    
    const response = await fetch('https://wpbdveyuuudhmwflrmqw.supabase.co/functions/v1/send-admin-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        type: 'business_submission',
        data: {
          business_name: 'Test Business',
          category: 'carts',
          city: 'Test City',
          state: 'Test State',
          description: 'Test description',
          contact_info: { email: 'test@test.com', phone: '123-456-7890' },
          created_at: new Date().toISOString()
        }
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response body:', responseText);

    if (response.status === 500) {
      console.log('\n❌ Function returned 500 error - likely configuration issue');
      console.log('\n💡 Most common causes:');
      console.log('   1. RESEND_API_KEY not set in Supabase environment variables');
      console.log('   2. Function deployment issue');
      console.log('   3. Code error in the function');
    } else {
      console.log('\n✅ Function responded successfully');
    }

    // Check if we can parse the response
    try {
      const data = JSON.parse(responseText);
      console.log('📋 Parsed response:', data);
    } catch (e) {
      console.log('⚠️  Could not parse response as JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n🔧 Next steps:');
  console.log('1. Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/settings/functions');
  console.log('2. Click "Environment Variables"');
  console.log('3. Add: RESEND_API_KEY = your_resend_api_key_here');
  console.log('4. Save and retry the test');
}

debugEmailFunction();