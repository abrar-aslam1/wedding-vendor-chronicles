#!/usr/bin/env node

/**
 * Match Me Feature - Database Migration Runner
 * 
 * Executes the match_* table creation SQL against Supabase
 * 
 * Usage: node scripts/match/run-match-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting Match Me feature migration...\n');

    // Read the SQL file
    const sqlPath = join(__dirname, 'create-match-tables.sql');
    console.log(`📄 Reading SQL from: ${sqlPath}`);
    
    const sql = readFileSync(sqlPath, 'utf8');
    
    if (!sql || sql.trim().length === 0) {
      throw new Error('SQL file is empty');
    }

    console.log(`✅ SQL file loaded (${sql.length} characters)\n`);

    // Split SQL into individual statements (simple approach)
    // Note: This handles most cases but might need refinement for complex queries
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementPreview = statement.substring(0, 80).replace(/\s+/g, ' ');
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${statementPreview}... `);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Check if error is benign (e.g., "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log('⏭️  (skipped)');
            skipCount++;
          } else {
            console.log('❌');
            errors.push({
              statement: statementPreview,
              error: error.message
            });
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err) {
        console.log('❌');
        errors.push({
          statement: statementPreview,
          error: err.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped:    ${skipCount}`);
    console.log(`❌ Failed:     ${errors.length}`);
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0) {
      console.log('❌ Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. Statement: ${err.statement}`);
        console.log(`   Error: ${err.error}`);
      });
      console.log('\n⚠️  Migration completed with errors. Please review above.\n');
      process.exit(1);
    }

    // Verify tables were created
    console.log('🔍 Verifying table creation...\n');
    
    const tables = [
      'match_requests',
      'match_vendor_projection',
      'match_results',
      'match_rate_limits',
      'match_analytics_events'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ Table '${table}' verification failed: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    }

    console.log('\n✨ Match Me feature migration completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Run projection sync: node scripts/match/sync-vendor-projection.js');
    console.log('  2. Add NEXT_PUBLIC_ENABLE_MATCHING=true to .env');
    console.log('  3. Test the matching flow\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution using Supabase SQL editor
async function runDirectSQL() {
  try {
    console.log('🚀 Attempting direct SQL execution...\n');

    const sqlPath = join(__dirname, 'create-match-tables.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Try to execute entire SQL at once using Supabase's query builder
    const { error } = await supabase.rpc('exec', { query: sql });

    if (error) {
      throw error;
    }

    console.log('✅ SQL executed successfully!\n');
  } catch (error) {
    console.error('❌ Direct SQL execution failed:', error.message);
    console.log('\n💡 Fallback: Please run the SQL manually in Supabase SQL Editor');
    console.log(`   SQL file: ${join(__dirname, 'create-match-tables.sql')}\n`);
    throw error;
  }
}

// Main execution
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     Match Me Feature - Database Migration                   ║');
console.log('║     Creating match_* tables in Supabase                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

runMigration().catch(err => {
  console.error('\n💡 Note: If statement-by-statement execution fails, you can:');
  console.error('   1. Run the SQL file directly in Supabase SQL Editor');
  console.error(`   2. File location: ${join(__dirname, 'create-match-tables.sql')}`);
  console.error('   3. Or use Supabase CLI: supabase db push\n');
  process.exit(1);
});
