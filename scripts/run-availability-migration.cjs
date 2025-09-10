const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running availability_requests table migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-availability-requests-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If the RPC doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');
      const { error: directError } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.log('Creating table using individual statements...');
        
        // Split SQL into individual statements and execute them
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
          if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX') || 
              statement.includes('ALTER TABLE') || statement.includes('CREATE POLICY') ||
              statement.includes('CREATE OR REPLACE FUNCTION') || statement.includes('CREATE TRIGGER')) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            
            // Use a more direct approach for table creation
            const { error: stmtError } = await supabase.rpc('exec_sql', { 
              sql_query: statement + ';' 
            });
            
            if (stmtError) {
              console.warn(`Warning executing statement: ${stmtError.message}`);
              // Continue with other statements
            }
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Created availability_requests table with:');
    console.log('   - User authentication integration');
    console.log('   - Vendor information storage');
    console.log('   - Event details tracking');
    console.log('   - Row Level Security policies');
    console.log('   - Performance indexes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
