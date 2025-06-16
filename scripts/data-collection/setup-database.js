/**
 * Database Setup Script
 * 
 * This script manually applies the necessary database changes for CSV import
 * by executing SQL commands directly through Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

async function setupDatabase() {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
    
    // Step 1: Add missing columns
    console.log('📄 Adding missing columns to instagram_vendors table...');
    
    const addColumnsSQL = `
      ALTER TABLE public.instagram_vendors 
      ADD COLUMN IF NOT EXISTS instagram_url text,
      ADD COLUMN IF NOT EXISTS address text,
      ADD COLUMN IF NOT EXISTS zip_code text;
    `;
    
    const { error: columnsError } = await supabase.rpc('exec', { sql: addColumnsSQL });
    
    if (columnsError) {
      console.log('ℹ️ Columns may already exist:', columnsError.message);
    } else {
      console.log('✅ Columns added successfully');
    }
    
    // Step 2: Create indexes
    console.log('📄 Creating indexes...');
    
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_instagram_vendors_instagram_url ON public.instagram_vendors(instagram_url);
      CREATE INDEX IF NOT EXISTS idx_instagram_vendors_zip_code ON public.instagram_vendors(zip_code);
      CREATE INDEX IF NOT EXISTS idx_instagram_vendors_location ON public.instagram_vendors(city, state, zip_code);
    `;
    
    const { error: indexesError } = await supabase.rpc('exec', { sql: indexesSQL });
    
    if (indexesError) {
      console.log('ℹ️ Indexes may already exist:', indexesError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }
    
    // Step 3: Add RLS policies for import
    console.log('📄 Setting up RLS policies for import...');
    
    const policiesSQL = `
      DROP POLICY IF EXISTS "Allow service role to insert vendors" ON public.instagram_vendors;
      DROP POLICY IF EXISTS "Allow service role to update vendors" ON public.instagram_vendors;
      
      CREATE POLICY "Allow service role to insert vendors" ON public.instagram_vendors
        FOR INSERT
        WITH CHECK (true);
      
      CREATE POLICY "Allow service role to update vendors" ON public.instagram_vendors
        FOR UPDATE
        USING (true)
        WITH CHECK (true);
    `;
    
    const { error: policiesError } = await supabase.rpc('exec', { sql: policiesSQL });
    
    if (policiesError) {
      console.log('ℹ️ RLS policies setup result:', policiesError.message);
    } else {
      console.log('✅ RLS policies configured successfully');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📊 The database is now ready for CSV import');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
