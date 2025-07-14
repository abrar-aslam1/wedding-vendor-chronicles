#!/usr/bin/env tsx

import { LinkValidator, InstagramValidationResult } from './linkValidator';
import * as readline from 'readline';
import { config } from 'dotenv';

config();

interface TestResult {
  handle: string;
  result: InstagramValidationResult;
  timestamp: string;
  manualVerification?: 'correct' | 'incorrect' | 'partial';
  notes?: string;
}

class LiveTestTool {
  private validator: LinkValidator;
  private results: TestResult[] = [];
  private rl: readline.Interface;

  constructor() {
    this.validator = new LinkValidator();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private formatResult(result: InstagramValidationResult): string {
    const status = result.profileExists ? '✅ EXISTS' : '❌ NOT FOUND';
    let details = `Status: ${status}`;
    
    if (result.profileExists) {
      if (result.isPrivate) details += ' (🔒 PRIVATE)';
      if (result.followerCount) details += ` | 👥 ${this.formatFollowerCount(result.followerCount)}`;
      if (result.bio) details += ` | Bio: "${result.bio.substring(0, 50)}..."`;
    }
    
    details += ` | ⏱️ ${result.responseTime}ms`;
    return details;
  }

  private formatFollowerCount(count: number): string {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  private async promptUser(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async testHandle(handle: string): Promise<void> {
    const cleanHandle = handle.replace('@', '');
    console.log(`\n🔍 Testing: @${cleanHandle}`);
    console.log('━'.repeat(50));
    
    try {
      const result = await this.validator.validateInstagramProfile(cleanHandle);
      
      console.log(this.formatResult(result));
      console.log(`📱 Instagram URL: https://www.instagram.com/${cleanHandle}/`);
      
      // Save result
      const testResult: TestResult = {
        handle: cleanHandle,
        result,
        timestamp: new Date().toISOString()
      };
      
      // Ask for manual verification
      console.log('\n🤔 Manual Verification:');
      const verification = await this.promptUser(
        'Is this result correct? (c)orrect / (i)ncorrect / (p)artial / (s)kip: '
      );
      
      switch (verification.toLowerCase()) {
        case 'c':
        case 'correct':
          testResult.manualVerification = 'correct';
          break;
        case 'i':
        case 'incorrect':
          testResult.manualVerification = 'incorrect';
          const notes = await this.promptUser('What did you observe? ');
          testResult.notes = notes;
          break;
        case 'p':
        case 'partial':
          testResult.manualVerification = 'partial';
          const partialNotes = await this.promptUser('What was partially correct? ');
          testResult.notes = partialNotes;
          break;
        default:
          // Skip verification
          break;
      }
      
      this.results.push(testResult);
      
    } catch (error) {
      console.log(`❌ Error testing @${cleanHandle}: ${error}`);
    }
  }

  private displayStats(): void {
    console.log('\n📊 SESSION STATISTICS');
    console.log('═'.repeat(50));
    
    const total = this.results.length;
    const verified = this.results.filter(r => r.manualVerification).length;
    const correct = this.results.filter(r => r.manualVerification === 'correct').length;
    const incorrect = this.results.filter(r => r.manualVerification === 'incorrect').length;
    const partial = this.results.filter(r => r.manualVerification === 'partial').length;
    
    const profilesFound = this.results.filter(r => r.result.profileExists).length;
    const profilesNotFound = this.results.filter(r => !r.result.profileExists).length;
    const privateProfiles = this.results.filter(r => r.result.isPrivate).length;
    
    console.log(`📈 Total Tests: ${total}`);
    console.log(`✅ Manually Verified: ${verified}/${total}`);
    
    if (verified > 0) {
      console.log(`   └─ Correct: ${correct} (${((correct/verified)*100).toFixed(1)}%)`);
      console.log(`   └─ Incorrect: ${incorrect} (${((incorrect/verified)*100).toFixed(1)}%)`);
      console.log(`   └─ Partial: ${partial} (${((partial/verified)*100).toFixed(1)}%)`);
    }
    
    console.log(`\n🔍 Profile Detection:`);
    console.log(`   └─ Found: ${profilesFound} (${((profilesFound/total)*100).toFixed(1)}%)`);
    console.log(`   └─ Not Found: ${profilesNotFound} (${((profilesNotFound/total)*100).toFixed(1)}%)`);
    console.log(`   └─ Private: ${privateProfiles} (${((privateProfiles/total)*100).toFixed(1)}%)`);
    
    // Show accuracy if we have manual verifications
    if (verified > 0) {
      const accuracy = (correct / verified) * 100;
      console.log(`\n🎯 Tool Accuracy: ${accuracy.toFixed(1)}%`);
    }
  }

  private displayRecentResults(count: number = 5): void {
    console.log(`\n📝 RECENT RESULTS (Last ${count})`);
    console.log('─'.repeat(50));
    
    const recent = this.results.slice(-count).reverse();
    
    recent.forEach((result, index) => {
      const status = result.result.profileExists ? '✅' : '❌';
      const verification = result.manualVerification 
        ? `[${result.manualVerification.toUpperCase()}]` 
        : '[UNVERIFIED]';
      
      console.log(`${recent.length - index}. @${result.handle} ${status} ${verification}`);
      
      if (result.notes) {
        console.log(`   Notes: ${result.notes}`);
      }
    });
  }

  private async runBatchTest(): Promise<void> {
    console.log('\n🔥 BATCH TEST MODE');
    console.log('Enter Instagram handles separated by commas or spaces');
    console.log('Example: amy_photography, dallas_venue, @flowers_by_jane\n');
    
    const input = await this.promptUser('Enter handles: ');
    const handles = input.split(/[,\s]+/).filter(h => h.length > 0);
    
    console.log(`\nTesting ${handles.length} handles...`);
    
    for (let i = 0; i < handles.length; i++) {
      console.log(`\n[${i + 1}/${handles.length}]`);
      await this.testHandle(handles[i]);
      
      if (i < handles.length - 1) {
        console.log('\nPress Enter to continue to next handle...');
        await this.promptUser('');
      }
    }
  }

  private showHelp(): void {
    console.log('\n📚 LIVE TEST TOOL COMMANDS');
    console.log('═'.repeat(50));
    console.log('🔍 test <handle>     Test a single Instagram handle');
    console.log('🔥 batch             Test multiple handles at once');
    console.log('📊 stats             Show session statistics');
    console.log('📝 results [n]       Show recent results (default: 5)');
    console.log('💾 export            Export results to JSON file');
    console.log('🧹 clear             Clear session results');
    console.log('❓ help              Show this help message');
    console.log('🚪 exit              Exit the tool');
    console.log('\nExamples:');
    console.log('  test dallasarboretum');
    console.log('  test @amy_photography');
    console.log('  results 10');
  }

  private async exportResults(): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `live_test_results_${timestamp}.json`;
    const fs = await import('fs');
    
    const exportData = {
      sessionStart: this.results[0]?.timestamp || new Date().toISOString(),
      sessionEnd: new Date().toISOString(),
      totalTests: this.results.length,
      results: this.results,
      stats: {
        totalTests: this.results.length,
        verified: this.results.filter(r => r.manualVerification).length,
        correct: this.results.filter(r => r.manualVerification === 'correct').length,
        incorrect: this.results.filter(r => r.manualVerification === 'incorrect').length,
        profilesFound: this.results.filter(r => r.result.profileExists).length,
        privateProfiles: this.results.filter(r => r.result.isPrivate).length,
      }
    };
    
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`📁 Results exported to: ${filename}`);
  }

  async start(): Promise<void> {
    console.log('🚀 INSTAGRAM LINK VALIDATION - LIVE TEST TOOL');
    console.log('═'.repeat(50));
    console.log('Welcome! Test Instagram handles and verify results manually.');
    console.log('Type "help" for commands or "test <handle>" to start.');
    console.log('');

    while (true) {
      const input = await this.promptUser('🔍 > ');
      const [command, ...args] = input.split(' ');

      switch (command.toLowerCase()) {
        case 'test':
          if (args.length === 0) {
            console.log('❌ Usage: test <instagram_handle>');
            break;
          }
          await this.testHandle(args[0]);
          break;

        case 'batch':
          await this.runBatchTest();
          break;

        case 'stats':
          this.displayStats();
          break;

        case 'results':
          const count = args[0] ? parseInt(args[0]) : 5;
          this.displayRecentResults(count);
          break;

        case 'export':
          if (this.results.length === 0) {
            console.log('❌ No results to export');
            break;
          }
          await this.exportResults();
          break;

        case 'clear':
          this.results = [];
          console.log('🧹 Results cleared');
          break;

        case 'help':
        case '?':
          this.showHelp();
          break;

        case 'exit':
        case 'quit':
        case 'q':
          console.log('\n👋 Thanks for testing! Results saved to session.');
          if (this.results.length > 0) {
            this.displayStats();
          }
          this.rl.close();
          return;

        case '':
          // Empty input, continue
          break;

        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands');
          break;
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tool = new LiveTestTool();
  tool.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { LiveTestTool };