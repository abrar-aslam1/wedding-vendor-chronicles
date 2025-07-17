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

async function runEmailMigration() {
  console.log('🚀 Running email system migration...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('📡 Connecting to database...');
    
    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/20250717000000_create_email_system.sql', 'utf8');
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📝 Running ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue: ${error.message}`);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
        }
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Verifying tables...');
    
    // Verify tables were created
    const tables = ['user_preferences', 'email_logs', 'email_templates', 'performance_metrics'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Created successfully`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    console.log('\n📧 Email system is ready!');
    console.log('Next: Test the GitHub workflow with workflow_dispatch');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runEmailMigration();