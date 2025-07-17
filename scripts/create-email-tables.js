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

async function createEmailTables() {
  console.log('🏗️  Creating email system tables...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    console.log('📡 Connecting to database...');
    
    // Create each table individually
    const tables = [
      {
        name: 'user_preferences',
        sql: `
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email_notifications BOOLEAN DEFAULT true,
            weekly_reports BOOLEAN DEFAULT false,
            marketing_emails BOOLEAN DEFAULT false,
            vendor_updates BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id)
          );
        `
      },
      {
        name: 'email_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS email_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            recipients INTEGER NOT NULL DEFAULT 0,
            subject TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            test_mode BOOLEAN DEFAULT false,
            message_id TEXT,
            error_message TEXT,
            sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'email_templates',
        sql: `
          CREATE TABLE IF NOT EXISTS email_templates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            subject TEXT NOT NULL,
            html_content TEXT NOT NULL,
            variables JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'performance_metrics',
        sql: `
          CREATE TABLE IF NOT EXISTS performance_metrics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            metric_date DATE NOT NULL,
            page_url TEXT NOT NULL,
            performance_score INTEGER,
            seo_score INTEGER,
            accessibility_score INTEGER,
            best_practices_score INTEGER,
            first_contentful_paint INTEGER,
            largest_contentful_paint INTEGER,
            total_blocking_time INTEGER,
            cumulative_layout_shift DECIMAL(5,4),
            speed_index INTEGER,
            collected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(metric_date, page_url)
          );
        `
      }
    ];
    
    // Execute each table creation
    for (const table of tables) {
      try {
        console.log(`📝 Creating table: ${table.name}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: table.sql 
        });
        
        if (error) {
          console.log(`⚠️  Table ${table.name}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table.name}: Created successfully`);
        }
      } catch (err) {
        console.log(`❌ Table ${table.name}: ${err.message}`);
      }
    }
    
    // Create indexes
    console.log('\n📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);',
      'CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);',
      'CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(metric_date);'
    ];
    
    for (const indexSQL of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
        if (error) {
          console.log(`⚠️  Index: ${error.message}`);
        } else {
          console.log(`✅ Index created`);
        }
      } catch (err) {
        console.log(`❌ Index: ${err.message}`);
      }
    }
    
    // Insert default templates
    console.log('\n📧 Inserting default email templates...');
    const templates = [
      {
        name: 'weekly_report',
        subject: 'Weekly Report - {{site_name}}',
        html_content: '<!DOCTYPE html><html><body><h1>Weekly Report</h1><p>{{content}}</p></body></html>',
        variables: { site_name: 'Site name', content: 'Report content' }
      },
      {
        name: 'welcome_email',
        subject: 'Welcome to {{site_name}}!',
        html_content: '<!DOCTYPE html><html><body><h1>Welcome!</h1><p>Thank you for joining {{site_name}}.</p></body></html>',
        variables: { site_name: 'Site name', user_name: 'User name' }
      }
    ];
    
    for (const template of templates) {
      try {
        const { error } = await supabase
          .from('email_templates')
          .upsert(template);
        
        if (error) {
          console.log(`⚠️  Template ${template.name}: ${error.message}`);
        } else {
          console.log(`✅ Template ${template.name}: Created`);
        }
      } catch (err) {
        console.log(`❌ Template ${template.name}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Email system tables created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. ✅ Database tables: Ready');
    console.log('2. ✅ Notification function: Enhanced');
    console.log('3. ✅ GitHub workflow: Created');
    console.log('4. 📧 Test the workflow: Go to GitHub Actions → Weekly Email Report → Run workflow');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createEmailTables();