#!/usr/bin/env node

/**
 * Stripe MCP Server Setup Script
 * This script helps you configure the Stripe MCP server with your own Stripe account
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

console.log('🔧 Setting up Stripe MCP Server with your account...\n');

// Check if Stripe MCP server exists
const mcpDir = path.join(process.env.HOME, 'Documents', 'Cline', 'MCP');
const stripeMcpDir = path.join(mcpDir, 'stripe-agent-toolkit');

console.log('📁 Checking for existing Stripe MCP server...');

if (!fs.existsSync(stripeMcpDir)) {
  console.log('📦 Installing Stripe Agent Toolkit MCP server...');
  
  try {
    // Create MCP directory if it doesn't exist
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }
    
    // Clone the Stripe Agent Toolkit
    process.chdir(mcpDir);
    execSync('git clone https://github.com/stripe/agent-toolkit.git stripe-agent-toolkit', { stdio: 'inherit' });
    
    // Install dependencies
    process.chdir(stripeMcpDir);
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('✅ Stripe MCP server installed successfully!');
  } catch (error) {
    console.error('❌ Error installing Stripe MCP server:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Stripe MCP server already exists');
}

// Prompt for Stripe API keys
console.log('\n🔑 Please provide your Stripe API keys:');
console.log('You can find these in your Stripe Dashboard → Developers → API keys');
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

async function setupStripeKeys() {
  try {
    const publishableKey = await askQuestion('Enter your Stripe Publishable Key (pk_test_... or pk_live_...): ');
    const secretKey = await askQuestion('Enter your Stripe Secret Key (sk_test_... or sk_live_...): ');
    
    if (!publishableKey.startsWith('pk_')) {
      throw new Error('Invalid publishable key format');
    }
    
    if (!secretKey.startsWith('sk_')) {
      throw new Error('Invalid secret key format');
    }
    
    // Create environment file for Stripe MCP server
    const envContent = `STRIPE_SECRET_KEY=${secretKey}
STRIPE_PUBLISHABLE_KEY=${publishableKey}
`;
    
    const envPath = path.join(stripeMcpDir, '.env');
    fs.writeFileSync(envPath, envContent);
    
    // Update the project's .env file
    const projectEnvPath = path.join(process.cwd(), '.env');
    let projectEnvContent = '';
    
    if (fs.existsSync(projectEnvPath)) {
      projectEnvContent = fs.readFileSync(projectEnvPath, 'utf8');
    } else {
      // Copy from .env.example
      const exampleEnvPath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(exampleEnvPath)) {
        projectEnvContent = fs.readFileSync(exampleEnvPath, 'utf8');
      }
    }
    
    // Update or add Stripe keys
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
    
    console.log('\n✅ Stripe keys configured successfully!');
    console.log('📁 MCP server environment file created at:', envPath);
    console.log('📁 Project environment file updated at:', projectEnvPath);
    
    // Create server start script (CommonJS version)
    const serverScript = `#!/usr/bin/env node

require('dotenv').config();
const { createServer } = require('./server');

const server = createServer({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY
});

server.listen(3001, () => {
  console.log('Stripe MCP Server running on port 3001');
});
`;
    
    const serverPath = path.join(stripeMcpDir, 'start-server.cjs');
    fs.writeFileSync(serverPath, serverScript);
    fs.chmodSync(serverPath, '755');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Start the Stripe MCP server:');
    console.log(`   cd ${stripeMcpDir} && node start-server.cjs`);
    console.log('\n2. Configure Cline to use your Stripe MCP server');
    console.log('3. Create products and prices in your Stripe account');
    console.log('\n📖 For detailed setup instructions, see: STRIPE-SETUP-GUIDE.md');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setupStripeKeys();
