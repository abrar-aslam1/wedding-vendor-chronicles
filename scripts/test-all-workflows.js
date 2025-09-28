#!/usr/bin/env node

/**
 * Test All GitHub Action Workflows
 * Tests each workflow locally to identify and diagnose failures
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// List of all npm workflow commands
const WORKFLOWS = [
  {
    name: 'Daily QC Report',
    command: 'npm run play:qc:daily',
    description: 'Tests the daily Instagram vendor quality control report',
    critical: false
  },
  {
    name: 'Tier Backfill',
    command: 'npm run play:backfill:tier',
    description: 'Tests Instagram vendor discovery by tier',
    critical: true,
    env: { TIER: 'tier1', LIMIT_PER_ROW: '5', MAX_ENRICH: '10' }
  },
  {
    name: 'City Backfill',
    command: 'npm run play:backfill:city',
    description: 'Tests Instagram vendor discovery by city',
    critical: true,
    env: { CITY: 'Dallas', STATE: 'TX', LIMIT_PER_ROW: '5' }
  },
  {
    name: 'Maintenance Due',
    command: 'npm run play:maintain:due',
    description: 'Tests maintenance scheduler for vendor data refresh',
    critical: false
  }
];

/**
 * Run a single workflow test
 */
async function testWorkflow(workflow) {
  console.log(`\n🧪 TESTING WORKFLOW: ${workflow.name}`);
  console.log(`📝 Description: ${workflow.description}`);
  console.log(`⚡ Command: ${workflow.command}`);
  console.log('=' .repeat(80));

  try {
    // Set environment variables if specified
    const env = { ...process.env, ...(workflow.env || {}) };
    
    // Run the workflow command
    const output = execSync(workflow.command, { 
      encoding: 'utf8', 
      env: env,
      timeout: 120000 // 2 minute timeout
    });
    
    console.log(output);
    console.log(`✅ WORKFLOW PASSED: ${workflow.name}`);
    
    return {
      name: workflow.name,
      status: 'PASSED',
      output: output,
      error: null,
      critical: workflow.critical
    };
    
  } catch (error) {
    console.log(`❌ WORKFLOW FAILED: ${workflow.name}`);
    console.log(`💥 Error: ${error.message}`);
    
    if (error.stdout) {
      console.log(`📤 Stdout:\n${error.stdout}`);
    }
    
    if (error.stderr) {
      console.log(`📥 Stderr:\n${error.stderr}`);
    }
    
    return {
      name: workflow.name,
      status: 'FAILED',
      output: error.stdout || '',
      error: error.message,
      stderr: error.stderr || '',
      critical: workflow.critical
    };
  }
}

/**
 * Generate detailed report
 */
function generateReport(results) {
  console.log('\n' + '=' .repeat(80));
  console.log('🏁 WORKFLOW TEST RESULTS SUMMARY');
  console.log('=' .repeat(80));
  
  const passed = results.filter(r => r.status === 'PASSED');
  const failed = results.filter(r => r.status === 'FAILED');
  const criticalFailed = failed.filter(r => r.critical);
  
  console.log(`📊 Total Workflows: ${results.length}`);
  console.log(`✅ Passed: ${passed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`🚨 Critical Failures: ${criticalFailed.length}`);
  
  if (failed.length > 0) {
    console.log('\n🔍 FAILURE ANALYSIS:');
    console.log('-' .repeat(50));
    
    failed.forEach(result => {
      console.log(`\n❌ ${result.name} ${result.critical ? '🚨 CRITICAL' : '⚠️ NON-CRITICAL'}`);
      console.log(`   Error: ${result.error}`);
      
      // Extract key error patterns
      if (result.error.includes('Source must be an array')) {
        console.log(`   🔧 Issue: Collection data type mismatch`);
        console.log(`   💡 Fix: Update step executor collection handling`);
      } else if (result.error.includes('ENOENT') || result.error.includes('file not found')) {
        console.log(`   🔧 Issue: Missing file dependency`);
        console.log(`   💡 Fix: Check file paths and data dependencies`);
      } else if (result.error.includes('timeout') || result.error.includes('ETIMEDOUT')) {
        console.log(`   🔧 Issue: Operation timeout`);
        console.log(`   💡 Fix: Increase timeouts or improve performance`);
      } else if (result.error.includes('undefined')) {
        console.log(`   🔧 Issue: Variable resolution problem`);
        console.log(`   💡 Fix: Check template variable resolution in YAML`);
      }
    });
  }
  
  if (passed.length > 0) {
    console.log('\n✅ SUCCESSFUL WORKFLOWS:');
    console.log('-' .repeat(50));
    passed.forEach(result => {
      console.log(`✅ ${result.name}`);
    });
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  console.log('-' .repeat(50));
  
  if (criticalFailed.length > 0) {
    console.log('🚨 IMMEDIATE ACTION REQUIRED:');
    console.log('  • Fix critical workflow failures before deploying');
    console.log('  • Critical workflows are essential for vendor data collection');
  }
  
  if (failed.length > passed.length) {
    console.log('⚠️ WORKFLOW SYSTEM NEEDS ATTENTION:');
    console.log('  • More workflows failing than passing');
    console.log('  • Review step executor logic and YAML configurations');
  }
  
  if (failed.length === 0) {
    console.log('🎉 ALL WORKFLOWS PASSING:');
    console.log('  • GitHub Actions should run successfully');
    console.log('  • Automation system is working correctly');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('  1. Fix identified issues in failing workflows');
  console.log('  2. Re-run this test to verify fixes');
  console.log('  3. Test workflows in GitHub Actions environment');
  console.log('  4. Monitor production workflow runs');
}

/**
 * Main test runner
 */
async function runAllWorkflowTests() {
  console.log('🚀 STARTING COMPREHENSIVE WORKFLOW TESTING');
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`📁 Working Directory: ${process.cwd()}`);
  console.log(`🔢 Total Workflows: ${WORKFLOWS.length}`);
  
  const results = [];
  
  for (const workflow of WORKFLOWS) {
    const result = await testWorkflow(workflow);
    results.push(result);
    
    // Add small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate comprehensive report
  generateReport(results);
  
  // Save results to file for analysis
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'PASSED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      critical_failures: results.filter(r => r.status === 'FAILED' && r.critical).length
    },
    results: results
  };
  
  fs.writeFileSync('workflow-test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed results saved to: workflow-test-results.json');
  
  // Exit with error code if critical workflows failed
  const criticalFailures = results.filter(r => r.status === 'FAILED' && r.critical);
  if (criticalFailures.length > 0) {
    console.log(`\n❌ Exiting with error due to ${criticalFailures.length} critical workflow failures`);
    process.exit(1);
  }
  
  console.log('\n✅ Workflow testing completed successfully');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllWorkflowTests().catch(error => {
    console.error('❌ Workflow testing failed:', error);
    process.exit(1);
  });
}

export { runAllWorkflowTests, testWorkflow, WORKFLOWS };
