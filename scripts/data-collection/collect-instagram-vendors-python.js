#!/usr/bin/env node

/**
 * Node.js wrapper for Python Instagram vendor collection
 * This integrates the Python scraper with the existing JavaScript infrastructure
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PYTHON_SCRIPT_DIR = path.join(__dirname, '../python/instagram_scraper');

/**
 * Run Python Instagram collection
 */
async function runPythonCollection(command = 'all') {
  console.log(`🐍 Starting Python Instagram collection: ${command}`);
  
  try {
    // Check if Python environment is set up
    const checkCmd = `cd ${PYTHON_SCRIPT_DIR} && [ -f ".env" ] && echo "ready" || echo "not ready"`;
    const { stdout: status } = await execAsync(checkCmd);
    
    if (status.trim() !== 'ready') {
      console.error('❌ Python environment not configured. Please set up .env file in scripts/python/instagram_scraper/');
      console.log('Run: cp scripts/python/instagram_scraper/.env.example scripts/python/instagram_scraper/.env');
      console.log('Then add your Apify token and Supabase credentials');
      process.exit(1);
    }
    
    // Run the collection script
    const runCmd = `cd ${PYTHON_SCRIPT_DIR} && ./run_collection.sh ${command}`;
    
    console.log('📊 Collection in progress...');
    const { stdout, stderr } = await execAsync(runCmd, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      timeout: 3600000 // 1 hour timeout
    });
    
    if (stderr) {
      console.error('⚠️  Warnings:', stderr);
    }
    
    console.log(stdout);
    
    // Get collection stats
    await getCollectionStats();
    
  } catch (error) {
    console.error('❌ Error running Python collection:', error.message);
    process.exit(1);
  }
}

/**
 * Get collection statistics from database
 */
async function getCollectionStats() {
  try {
    // Get total counts by category
    const { data: stats, error } = await supabase
      .from('instagram_vendors')
      .select('category', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // Get recent additions
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('instagram_vendors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);
    
    console.log('\n📈 Collection Statistics:');
    console.log(`   Total Instagram vendors: ${stats || 0}`);
    console.log(`   New in last hour: ${recentCount || 0}`);
    
    // Get breakdown by category
    try {
      const { data: categoryStats } = await supabase
        .from('instagram_vendors')
        .select('category')
        .groupBy('category');
      
      if (categoryStats) {
        console.log('\n   By Category:');
        // Simple count by category
        const categoryCount = {};
        categoryStats.forEach(item => {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
        
        Object.entries(categoryCount).forEach(([category, count]) => {
          console.log(`   - ${category}: ${count} vendors`);
        });
      }
    } catch (error) {
      console.log('   (Category breakdown not available)');
    }
    
  } catch (error) {
    console.error('Error fetching stats:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  const validCommands = ['all', 'makeup', 'hair', 'test'];
  
  if (!validCommands.includes(command)) {
    console.log('Usage: node collect-instagram-vendors-python.js [command]');
    console.log('\nCommands:');
    console.log('  all     - Collect all categories');
    console.log('  makeup  - Collect makeup artists only');
    console.log('  hair    - Collect hair stylists only');
    console.log('  test    - Run test collection');
    process.exit(1);
  }
  
  await runPythonCollection(command);
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runPythonCollection };