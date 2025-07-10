import { createClient } from '@supabase/supabase-js';
import { LinkValidator } from './linkValidator';
import { ValidationReport } from './testDallasVendors';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

interface UpdateAction {
  vendorId?: string;
  businessName: string;
  category: string;
  oldHandle: string;
  newHandle?: string;
  newUrl?: string;
  action: 'remove' | 'update' | 'verify' | 'mark_private';
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface UpdateResult {
  success: boolean;
  action: UpdateAction;
  error?: string;
  validationResult?: any;
}

export class BrokenLinkUpdater {
  private supabase: any;
  private validator: LinkValidator;
  
  constructor(requireDatabase: boolean = false) {
    if (requireDatabase && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY)) {
      throw new Error('Supabase credentials required for updates');
    }
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      this.validator = new LinkValidator(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
    } else {
      this.validator = new LinkValidator();
    }
  }
  
  async generateUpdatePlan(validationReport: ValidationReport): Promise<UpdateAction[]> {
    const actions: UpdateAction[] = [];
    
    // Process invalid vendors
    console.log(`\nProcessing ${validationReport.invalidVendors.length} invalid vendors...\n`);
    
    for (let i = 0; i < validationReport.invalidVendors.length; i++) {
      const vendor = validationReport.invalidVendors[i];
      console.log(`[${i + 1}/${validationReport.invalidVendors.length}] ${vendor.businessName}`);
      
      const suggestions = await this.suggestFixes(vendor);
      actions.push(...suggestions);
    }
    
    // Process private accounts (mark as private, don't remove)
    for (const vendor of validationReport.privateAccounts) {
      actions.push({
        businessName: vendor.businessName,
        category: vendor.category,
        oldHandle: vendor.instagramHandle,
        action: 'mark_private',
        reason: 'Account is private but exists',
        confidence: 'high'
      });
    }
    
    return actions;
  }
  
  private async suggestFixes(vendor: any): Promise<UpdateAction[]> {
    const actions: UpdateAction[] = [];
    const handle = vendor.instagramHandle.replace('@', '');
    
    console.log(`  Checking variations for ${vendor.businessName}...`);
    
    // Try a limited set of common variations
    const variations = [
      handle.toLowerCase(),
      handle.replace(/[._]/g, ''),
      handle + 'official',
      handle + '_official',
      // Try first word of business name if different
      vendor.businessName.toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '')
    ].filter(v => v.length >= 3 && v.length <= 30 && v !== handle);
    
    // Limit to first 3 variations to avoid timeout
    const limitedVariations = variations.slice(0, 3);
    
    // Test variations
    for (const variation of limitedVariations) {
      try {
        console.log(`    Testing @${variation}...`);
        const result = await this.validator.validateInstagramProfile(variation);
        
        if (result.status === 'valid' && result.profileExists) {
          console.log(`    ✅ Found valid account: @${variation}`);
          actions.push({
            businessName: vendor.businessName,
            category: vendor.category,
            oldHandle: vendor.instagramHandle,
            newHandle: variation,
            newUrl: `https://www.instagram.com/${variation}/`,
            action: 'update',
            reason: `Found valid account: @${variation}`,
            confidence: 'medium'
          });
          
          // Only suggest first valid match
          break;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`    Error checking ${variation}:`, error);
      }
    }
    
    // If no variations found, suggest removal
    if (actions.length === 0) {
      actions.push({
        businessName: vendor.businessName,
        category: vendor.category,
        oldHandle: vendor.instagramHandle,
        action: 'remove',
        reason: 'No valid Instagram account found after checking variations',
        confidence: 'high'
      });
    }
    
    return actions;
  }
  
  private generateBusinessNameVariations(businessName: string): string[] {
    const variations: string[] = [];
    const clean = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
    
    // Add common variations
    variations.push(clean);
    variations.push(clean.substring(0, 15)); // Truncated
    
    // Split on common words and recombine
    const words = businessName.toLowerCase().split(/\s+/);
    if (words.length > 1) {
      // First word only
      variations.push(words[0].replace(/[^a-z0-9]/g, ''));
      // Last word only  
      variations.push(words[words.length - 1].replace(/[^a-z0-9]/g, ''));
      // First + last
      variations.push(words[0].replace(/[^a-z0-9]/g, '') + words[words.length - 1].replace(/[^a-z0-9]/g, ''));
    }
    
    return variations.filter(v => v.length >= 3 && v.length <= 30);
  }
  
  async executeUpdate(action: UpdateAction): Promise<UpdateResult> {
    try {
      switch (action.action) {
        case 'update':
          return await this.updateVendorInstagram(action);
        case 'remove':
          return await this.removeVendorInstagram(action);
        case 'mark_private':
          return await this.markAsPrivate(action);
        case 'verify':
          return await this.verifyAndUpdate(action);
        default:
          throw new Error(`Unknown action: ${action.action}`);
      }
    } catch (error: any) {
      return {
        success: false,
        action,
        error: error.message
      };
    }
  }
  
  private async updateVendorInstagram(action: UpdateAction): Promise<UpdateResult> {
    // First, verify the new handle works
    if (action.newHandle) {
      const validation = await this.validator.validateInstagramProfile(action.newHandle);
      
      if (!validation.profileExists || validation.status !== 'valid') {
        return {
          success: false,
          action,
          error: 'New handle validation failed'
        };
      }
    }
    
    // Update in database
    const { data, error } = await this.supabase
      .from('instagram_vendors')
      .update({
        instagram_handle: action.newHandle,
        instagram_url: action.newUrl,
        updated_at: new Date().toISOString(),
        verification_status: 'verified',
        last_verified: new Date().toISOString()
      })
      .eq('instagram_handle', action.oldHandle.replace('@', ''))
      .select();
    
    if (error) {
      return {
        success: false,
        action,
        error: error.message
      };
    }
    
    return {
      success: true,
      action,
      validationResult: data
    };
  }
  
  private async removeVendorInstagram(action: UpdateAction): Promise<UpdateResult> {
    // Instead of deleting, mark as invalid
    const { data, error } = await this.supabase
      .from('instagram_vendors')
      .update({
        verification_status: 'invalid',
        last_verified: new Date().toISOString(),
        notes: action.reason
      })
      .eq('instagram_handle', action.oldHandle.replace('@', ''))
      .select();
    
    if (error) {
      return {
        success: false,
        action,
        error: error.message
      };
    }
    
    return {
      success: true,
      action
    };
  }
  
  private async markAsPrivate(action: UpdateAction): Promise<UpdateResult> {
    const { data, error } = await this.supabase
      .from('instagram_vendors')
      .update({
        verification_status: 'private',
        last_verified: new Date().toISOString(),
        notes: 'Account is private but exists'
      })
      .eq('instagram_handle', action.oldHandle.replace('@', ''))
      .select();
    
    if (error) {
      return {
        success: false,
        action,
        error: error.message
      };
    }
    
    return {
      success: true,
      action
    };
  }
  
  private async verifyAndUpdate(action: UpdateAction): Promise<UpdateResult> {
    // Re-verify the current handle
    const validation = await this.validator.validateInstagramProfile(action.oldHandle);
    
    if (validation.profileExists && validation.status === 'valid') {
      // Update verification status
      const { data, error } = await this.supabase
        .from('instagram_vendors')
        .update({
          verification_status: 'verified',
          last_verified: new Date().toISOString()
        })
        .eq('instagram_handle', action.oldHandle.replace('@', ''))
        .select();
      
      if (error) {
        return {
          success: false,
          action,
          error: error.message
        };
      }
      
      return {
        success: true,
        action,
        validationResult: validation
      };
    }
    
    return {
      success: false,
      action,
      error: 'Verification failed - profile still invalid'
    };
  }
  
  async batchExecute(actions: UpdateAction[]): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];
    
    console.log(`\nExecuting ${actions.length} update actions...\n`);
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      process.stdout.write(`[${i + 1}/${actions.length}] ${action.businessName} (${action.action})... `);
      
      try {
        const result = await this.executeUpdate(action);
        results.push(result);
        
        if (result.success) {
          process.stdout.write('✅ SUCCESS\n');
        } else {
          process.stdout.write(`❌ FAILED: ${result.error}\n`);
        }
        
        // Add delay between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        process.stdout.write(`⚠️ ERROR: ${error}\n`);
        results.push({
          success: false,
          action,
          error: String(error)
        });
      }
    }
    
    return results;
  }
  
  generateUpdateReport(actions: UpdateAction[], results: UpdateResult[]): string {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    let report = `Update Execution Report\n`;
    report += `======================\n\n`;
    report += `Total Actions: ${actions.length}\n`;
    report += `Successful: ${successful}\n`;
    report += `Failed: ${failed}\n`;
    report += `Success Rate: ${((successful / actions.length) * 100).toFixed(1)}%\n\n`;
    
    // Group by action type
    const byAction = results.reduce((acc, result) => {
      const action = result.action.action;
      if (!acc[action]) {
        acc[action] = { success: 0, failed: 0 };
      }
      if (result.success) {
        acc[action].success++;
      } else {
        acc[action].failed++;
      }
      return acc;
    }, {} as Record<string, { success: number; failed: number }>);
    
    report += `Actions by Type:\n`;
    for (const [action, counts] of Object.entries(byAction)) {
      report += `- ${action}: ${counts.success} success, ${counts.failed} failed\n`;
    }
    
    // List failed actions
    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      report += `\nFailed Actions:\n`;
      report += `---------------\n`;
      failedResults.forEach(result => {
        report += `- ${result.action.businessName} (${result.action.action}): ${result.error}\n`;
      });
    }
    
    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Usage: tsx updateBrokenLinks.ts <command> [options]');
    console.log('Commands:');
    console.log('  plan <report-file>     Generate update plan from validation report');
    console.log('  execute <plan-file>    Execute update plan');
    console.log('  interactive <report>   Interactive update mode');
    return;
  }
  
  const updater = new BrokenLinkUpdater();
  
  switch (command) {
    case 'plan':
      if (!args[1]) {
        console.error('Please provide path to validation report');
        return;
      }
      
      const reportPath = args[1];
      const report: ValidationReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      const actions = await updater.generateUpdatePlan(report);
      
      const planPath = `update_plan_${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(planPath, JSON.stringify(actions, null, 2));
      
      console.log(`Generated ${actions.length} update actions`);
      console.log(`Plan saved to: ${planPath}`);
      break;
      
    case 'execute':
      if (!args[1]) {
        console.error('Please provide path to update plan');
        return;
      }
      
      const planFilePath = args[1];
      const plan: UpdateAction[] = JSON.parse(fs.readFileSync(planFilePath, 'utf-8'));
      const results = await updater.batchExecute(plan);
      
      const reportContent = updater.generateUpdateReport(plan, results);
      const reportFilePath = `update_results_${new Date().toISOString().split('T')[0]}.txt`;
      fs.writeFileSync(reportFilePath, reportContent);
      
      console.log('\n' + reportContent);
      console.log(`Full report saved to: ${reportFilePath}`);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export type { UpdateAction, UpdateResult };