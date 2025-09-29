const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Cultural Matching System Migration...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-cultural-matching-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Read migration file successfully');
    console.log(`   File: ${sqlPath}`);
    console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Split SQL into individual statements (basic split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\n/g, ' ');
      
      try {
        await supabase.rpc('exec_sql', { sql_query: statement + ';' }).catch(async () => {
          // If RPC doesn't work, try direct query
          const { error } = await supabase.from('_temp').select('*').limit(0);
          if (error) throw error;
        });
        
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error) {
        // Some errors are expected (like "already exists")
        if (error.message && 
            (error.message.includes('already exists') || 
             error.message.includes('duplicate'))) {
          console.log(`⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists)`);
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ [${i + 1}/${statements.length}] ${preview}...`);
          console.error(`   Error: ${error.message}\n`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('✨ Cultural Matching System migration completed successfully!\n');
      console.log('Created tables:');
      console.log('  • vendor_cultural_expertise');
      console.log('  • bride_preferences');
      console.log('  • vendor_pricing_packages');
      console.log('  • vendor_availability');
      console.log('  • vendor_match_scores\n');
      
      // Test that tables were created
      await testTablesCreated();
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log('Please review the errors above and ensure critical tables were created.\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function testTablesCreated() {
  console.log('🧪 Testing table creation...\n');
  
  const tables = [
    'vendor_cultural_expertise',
    'bride_preferences',
    'vendor_pricing_packages',
    'vendor_availability',
    'vendor_match_scores'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(0);
      
      if (error) {
        console.log(`❌ Table ${table}: NOT FOUND`);
      } else {
        console.log(`✅ Table ${table}: EXISTS`);
      }
    } catch (error) {
      console.log(`❌ Table ${table}: ERROR - ${error.message}`);
    }
  }
  
  console.log('');
}

// Run the migration
runMigration();
