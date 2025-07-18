import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables from .env file
const envFile = readFileSync('.env', 'utf8');
const envLines = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function testAllWorkflows() {
  console.log('🧪 Testing All GitHub Actions Workflows');
  console.log('=====================================');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const workflows = [
    {
      name: 'Vendor Data Collection',
      file: 'vendor-data-collection.yml',
      description: 'Collects vendor data from external sources',
      testable: true
    },
    {
      name: 'Database Maintenance', 
      file: 'database-maintenance.yml',
      description: 'Performs database cleanup and optimization',
      testable: true
    },
    {
      name: 'SEO and Link Validation',
      file: 'seo-link-validation.yml', 
      description: 'Validates SEO and checks for broken links',
      testable: true
    },
    {
      name: 'Performance Monitoring',
      file: 'performance-monitoring.yml',
      description: 'Monitors site performance and generates reports',
      testable: true
    },
    {
      name: 'Weekly Email Report',
      file: 'weekly-email-report.yml',
      description: 'Sends weekly reports via email',
      testable: true
    },
    {
      name: 'Test Weekly Email',
      file: 'test-weekly-email.yml',
      description: 'Tests the email system functionality',
      testable: true
    },
    {
      name: 'Process Notifications',
      file: 'process-notifications.yml',
      description: 'Processes notification queue (existing)',
      testable: false
    }
  ];
  
  const results = {
    total: workflows.length,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };
  
  for (const workflow of workflows) {
    console.log(`\\n🔍 Testing: ${workflow.name}`);
    console.log(`📄 File: ${workflow.file}`);
    console.log(`📝 Description: ${workflow.description}`);
    
    const workflowResult = {
      name: workflow.name,
      file: workflow.file,
      status: 'unknown',
      issues: [],
      recommendations: []
    };
    
    try {
      // 1. Check if workflow file exists
      const workflowPath = `.github/workflows/${workflow.file}`;
      if (!existsSync(workflowPath)) {
        workflowResult.status = 'failed';
        workflowResult.issues.push('Workflow file does not exist');
        results.failed++;
        results.details.push(workflowResult);
        console.log('❌ File not found');
        continue;
      }
      
      // 2. Read and validate workflow syntax
      const workflowContent = readFileSync(workflowPath, 'utf8');
      
      // Basic YAML structure checks
      const checks = [
        { test: workflowContent.includes('name:'), message: 'Missing workflow name' },
        { test: workflowContent.includes('on:'), message: 'Missing trigger configuration' },
        { test: workflowContent.includes('jobs:'), message: 'Missing jobs configuration' },
        { test: workflowContent.includes('runs-on:'), message: 'Missing runner configuration' },
        { test: workflowContent.includes('actions/checkout@v4'), message: 'Using outdated checkout action' }
      ];
      
      for (const check of checks) {
        if (!check.test) {
          workflowResult.issues.push(check.message);
        }
      }
      
      // 3. Check for ES module compatibility (for new workflows)
      if (workflowContent.includes('const { createClient } = require')) {
        workflowResult.issues.push('Uses CommonJS require instead of ES modules');
      }
      
      if (workflowContent.includes('scripts/') && workflowContent.includes('.js')) {
        if (!workflowContent.includes('.mjs')) {
          workflowResult.recommendations.push('Consider using .mjs extension for ES modules');
        }
      }
      
      // 4. Check for environment variables
      const envVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
      for (const envVar of envVars) {
        if (workflowContent.includes(envVar) && !workflowContent.includes(`secrets.${envVar}`)) {
          workflowResult.issues.push(`Missing secret reference for ${envVar}`);
        }
      }
      
      // 5. Test workflow-specific functionality
      if (workflow.testable) {
        await testWorkflowSpecificFunctionality(workflow, supabase, adminSupabase, workflowResult);
      }
      
      // 6. Determine overall status
      if (workflowResult.issues.length === 0) {
        workflowResult.status = 'passed';
        results.passed++;
        console.log('✅ Workflow validation passed');
      } else if (workflowResult.issues.some(issue => issue.includes('Missing') || issue.includes('not exist'))) {
        workflowResult.status = 'failed';
        results.failed++;
        console.log('❌ Workflow validation failed');
      } else {
        workflowResult.status = 'warning';
        results.warnings++;
        console.log('⚠️  Workflow has warnings');
      }
      
      if (workflowResult.issues.length > 0) {
        console.log('Issues found:');
        workflowResult.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      if (workflowResult.recommendations.length > 0) {
        console.log('Recommendations:');
        workflowResult.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
    } catch (error) {
      workflowResult.status = 'failed';
      workflowResult.issues.push(`Testing error: ${error.message}`);
      results.failed++;
      console.log(`❌ Testing failed: ${error.message}`);
    }
    
    results.details.push(workflowResult);
  }
  
  // Generate summary report
  console.log('\n📊 WORKFLOW TESTING SUMMARY');
  console.log('============================');
  console.log(`Total Workflows: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  results.details.forEach(result => {
    const statusEmoji = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${statusEmoji} ${result.name}: ${result.status.toUpperCase()}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`    - ${issue}`));
    }
  });
  
  console.log('\n🚀 NEXT STEPS:');
  if (results.failed > 0) {
    console.log('1. Fix the failed workflows listed above');
    console.log('2. Re-run this test script');
    console.log('3. Test workflows manually in GitHub Actions');
  } else {
    console.log('1. All workflows passed basic validation!');
    console.log('2. Test workflows manually in GitHub Actions');
    console.log('3. Monitor workflow execution logs');
    console.log('4. Set up monitoring for automatic execution');
  }
  
  return results;
}

async function testWorkflowSpecificFunctionality(workflow, supabase, adminSupabase, result) {
  console.log(`  🧪 Testing ${workflow.name} functionality...`);
  
  try {
    switch (workflow.file) {
      case 'vendor-data-collection.yml':
        // Test vendor table access
        const { data: vendorTest, error: vendorError } = await supabase
          .from('vendors')
          .select('count')
          .limit(1);
        if (vendorError) result.issues.push('Cannot access vendors table');
        break;
        
      case 'database-maintenance.yml':
        // Test database maintenance prerequisites
        const { data: maintenanceTest } = await adminSupabase
          .from('email_logs')
          .select('count')
          .limit(1);
        if (!maintenanceTest) result.recommendations.push('Email logs table not found - run migration');
        break;
        
      case 'weekly-email-report.yml':
      case 'test-weekly-email.yml':
        // Test email function
        const { data: emailTest, error: emailError } = await supabase.functions.invoke('send-admin-notification', {
          body: { type: 'user_registration', data: { email: 'test@example.com', created_at: new Date().toISOString() } }
        });
        if (emailError) result.issues.push(`Email function not accessible: ${emailError.message}`);
        break;
        
      case 'performance-monitoring.yml':
        // Check if build commands work
        result.recommendations.push('Requires npm run build to work properly');
        break;
        
      case 'seo-link-validation.yml':
        // Check if build and preview commands exist
        result.recommendations.push('Requires npm run build and npm run preview commands');
        break;
    }
  } catch (error) {
    result.issues.push(`Functionality test failed: ${error.message}`);
  }
}

testAllWorkflows().catch(console.error);