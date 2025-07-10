#!/usr/bin/env tsx

import { testDallasVendors } from './testDallasVendors';
import { saveReports } from './generateReport';
import { BrokenLinkUpdater } from './updateBrokenLinks';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  console.log('🔍 Wedding Vendor Link Validator');
  console.log('================================\n');
  
  switch (command) {
    case 'test':
    case 'validate':
      console.log('Starting Dallas vendor validation...\n');
      
      try {
        const report = await testDallasVendors();
        
        console.log('\n📊 Generating comprehensive reports...');
        saveReports(report, './reports');
        
        console.log('\n✅ Validation complete!');
        console.log(`\nNext steps:`);
        console.log(`1. Review the reports in ./reports/`);
        console.log(`2. Generate update plan: tsx run.ts plan`);
        console.log(`3. Execute updates: tsx run.ts update`);
        
      } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
      }
      break;
      
    case 'plan':
      console.log('Generating update plan...\n');
      
      try {
        // Find latest validation report (not analysis)
        const reportFiles = fs.readdirSync('./reports')
          .filter(f => f.startsWith('dallas_validation_') && f.endsWith('.json') && !f.includes('analysis'))
          .sort()
          .reverse();
        
        if (reportFiles.length === 0) {
          console.error('No validation reports found. Run validation first.');
          process.exit(1);
        }
        
        const latestReport = reportFiles[0];
        console.log(`Using report: ${latestReport}`);
        
        const report = JSON.parse(fs.readFileSync(`./reports/${latestReport}`, 'utf-8'));
        const updater = new BrokenLinkUpdater(false); // Don't require database for planning
        const actions = await updater.generateUpdatePlan(report);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const planPath = `./reports/update_plan_${timestamp}.json`;
        fs.writeFileSync(planPath, JSON.stringify(actions, null, 2));
        
        console.log(`\n📋 Generated ${actions.length} update actions`);
        console.log(`Plan saved to: ${planPath}`);
        
        // Show summary
        const actionSummary = actions.reduce((acc, action) => {
          acc[action.action] = (acc[action.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('\nAction Summary:');
        Object.entries(actionSummary).forEach(([action, count]) => {
          console.log(`  ${action}: ${count}`);
        });
        
        console.log(`\nNext: tsx run.ts update ${planPath}`);
        
      } catch (error) {
        console.error('❌ Plan generation failed:', error);
        process.exit(1);
      }
      break;
      
    case 'update':
      const planFile = args[1];
      
      if (!planFile) {
        console.error('Please provide path to update plan file');
        console.log('Usage: tsx run.ts update <plan-file>');
        process.exit(1);
      }
      
      console.log(`Executing update plan: ${planFile}\n`);
      
      try {
        const actions = JSON.parse(fs.readFileSync(planFile, 'utf-8'));
        const updater = new BrokenLinkUpdater(true); // Require database for updates
        
        console.log('⚠️  WARNING: This will modify your database!');
        console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const results = await updater.batchExecute(actions);
        
        const reportContent = updater.generateUpdateReport(actions, results);
        const timestamp = new Date().toISOString().split('T')[0];
        const reportPath = `./reports/update_results_${timestamp}.txt`;
        fs.writeFileSync(reportPath, reportContent);
        
        console.log('\n' + reportContent);
        console.log(`Full report saved to: ${reportPath}`);
        
      } catch (error) {
        console.error('❌ Update execution failed:', error);
        process.exit(1);
      }
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log('Usage: tsx run.ts <command> [options]\n');
      console.log('Commands:');
      console.log('  test, validate    Run Dallas vendor validation');
      console.log('  plan             Generate update plan from latest report');
      console.log('  update <file>    Execute update plan');
      console.log('  help             Show this help message');
      console.log('\nExamples:');
      console.log('  tsx run.ts test');
      console.log('  tsx run.ts plan');
      console.log('  tsx run.ts update ./reports/update_plan_2025-07-10.json');
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Use "tsx run.ts help" for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}