#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://wpbdveyuuudhmwflrmqw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzg0MzI2NiwiZXhwIjoyMDUzNDE5MjY2fQ.pSd3_JelUGL-hO-gdLM7FWW1br71EOIcOizLqi61svM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createVendorsGoogleTable() {
  console.log('📋 Creating vendors_google table...\n');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250102000000_create_vendors_google_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔧 Executing SQL migration...');
    
    // Note: Supabase JS client doesn't support raw SQL execution
    // We'll need to check if the table exists and provide instructions
    
    const { data, error } = await supabase
      .from('vendors_google')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('\n❌ The vendors_google table does not exist.');
      console.log('\n📝 To create it, please run the following in the Supabase SQL editor:');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/wpbdveyuuudhmwflrmqw/sql');
      console.log('2. Paste and run the SQL from: supabase/migrations/20250102000000_create_vendors_google_table.sql');
      console.log('\nAlternatively, if you have the database password, run:');
      console.log('npx supabase db push');
    } else if (error) {
      console.error('❌ Error checking table:', error);
    } else {
      console.log('✅ The vendors_google table already exists!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the check
createVendorsGoogleTable();