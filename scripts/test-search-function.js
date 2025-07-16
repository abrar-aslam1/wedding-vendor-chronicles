#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSearchFunction() {
  console.log('Testing search-vendors function...\n');
  
  try {
    // Test with a simple search
    console.log('Test 1: Simple photographer search in Dallas');
    const { data: test1, error: error1 } = await supabase.functions.invoke('search-vendors', {
      body: {
        keyword: 'photographers',
        location: 'Dallas, TX'
      }
    });
    
    if (error1) {
      console.error('❌ Test 1 failed:', error1);
    } else {
      console.log('✅ Test 1 passed. Found', test1?.length || 0, 'results\n');
    }
    
    // Test with cart search
    console.log('Test 2: Cart search in Los Angeles');
    const { data: test2, error: error2 } = await supabase.functions.invoke('search-vendors', {
      body: {
        keyword: 'carts',
        location: 'Los Angeles, CA'
      }
    });
    
    if (error2) {
      console.error('❌ Test 2 failed:', error2);
    } else {
      console.log('✅ Test 2 passed. Found', test2?.length || 0, 'results\n');
    }
    
    // Test with specific cart type
    console.log('Test 3: Coffee cart search');
    const { data: test3, error: error3 } = await supabase.functions.invoke('search-vendors', {
      body: {
        keyword: 'coffee cart',
        location: 'San Francisco, CA'
      }
    });
    
    if (error3) {
      console.error('❌ Test 3 failed:', error3);
    } else {
      console.log('✅ Test 3 passed. Found', test3?.length || 0, 'results');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testSearchFunction();