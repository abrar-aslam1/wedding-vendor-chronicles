#!/usr/bin/env node

/**
 * Update Stripe Keys Script
 * This script updates the Stripe MCP server with your own API keys
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const mcpEnvPath = '/Users/abraraslam/Documents/Cline/MCP/stripe-agent-toolkit/.env';

console.log('🔑 Update Stripe MCP Server with YOUR API keys\n');
console.log('⚠️  Currently using someone else\'s Stripe account!');
console.log('You need to replace these with your own keys from:');
console.log('https://dashboard.stripe.com/apikeys\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateStripeKeys() {
  try {
    console.log('📋 Enter your Stripe API keys:');
    const publishableKey = await askQuestion('Your Stripe Publishable Key (pk_test_... or pk_live_...): ');
    const secretKey = await askQuestion('Your Stripe Secret Key (sk_test_... or sk_live_...): ');
    
    if (!publishableKey.startsWith('pk_')) {
      throw new Error('Invalid publishable key format. Should start with pk_test_ or pk_live_');
    }
    
    if (!secretKey.startsWith('sk_')) {
      throw new Error('Invalid secret key format. Should start with sk_test_ or sk_live_');
    }
    
    // Update MCP server .env file
    const envContent = `STRIPE_SECRET_KEY=${secretKey}
STRIPE_PUBLISHABLE_KEY=${publishableKey}
`;
    
    fs.writeFileSync(mcpEnvPath, envContent);
    
    // Update project .env file
    const projectEnvPath = '.env';
    let projectEnvContent = '';
    
    if (fs.existsSync(projectEnvPath)) {
      projectEnvContent = fs.readFileSync(projectEnvPath, 'utf8');
    } else {
      // Copy from .env.example
      if (fs.existsSync('.env.example')) {
        projectEnvContent = fs.readFileSync('.env.example', 'utf8');
      }
    }
    
    // Update or add Stripe keys in project
    const lines = projectEnvContent.split('\n');
    let updatedLines = [];
    let foundPublishable = false;
    let foundSecret = false;
    
    for (const line of lines) {
      if (line.startsWith('VITE_STRIPE_PUBLISHABLE_KEY=')) {
        updatedLines.push(`VITE_STRIPE_PUBLISHABLE_KEY=${publishableKey}`);
        foundPublishable = true;
      } else if (line.startsWith('VITE_STRIPE_SECRET_KEY=')) {
        updatedLines.push(`VITE_STRIPE_SECRET_KEY=${secretKey}`);
        foundSecret = true;
      } else {
        updatedLines.push(line);
      }
    }
    
    // Add keys if not found
    if (!foundPublishable) {
      updatedLines.push(`VITE_STRIPE_PUBLISHABLE_KEY=${publishableKey}`);
    }
    if (!foundSecret) {
      updatedLines.push(`VITE_STRIPE_SECRET_KEY=${secretKey}`);
    }
    
    fs.writeFileSync(projectEnvPath, updatedLines.join('\n'));
    
    console.log('\n✅ Stripe keys updated successfully!');
    console.log('📁 MCP server .env updated:', mcpEnvPath);
    console.log('📁 Project .env updated:', path.resolve(projectEnvPath));
    
    console.log('\n🚀 Now you can start the MCP server:');
    console.log('cd /Users/abraraslam/Documents/Cline/MCP/stripe-agent-toolkit && node start-server.js');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Start the MCP server (command above)');
    console.log('2. Run: node cleanup-old-stripe-data.js');
    console.log('3. Create products in YOUR Stripe dashboard');
    console.log('4. Update database with your new product IDs');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

updateStripeKeys();
