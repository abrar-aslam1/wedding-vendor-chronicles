#!/usr/bin/env node

/**
 * Fix Search Function Deployment Issues
 * Deploy a working search-vendors function
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);

async function fixSearchFunction() {
  console.log('🔧 FIXING SEARCH FUNCTION DEPLOYMENT');
  console.log('='.repeat(50));

  try {
    // 1. Check if Supabase CLI is installed
    console.log('🔍 Checking Supabase CLI...');
    try {
      const { stdout } = await execAsync('supabase --version');
      console.log(`✅ Supabase CLI installed: ${stdout.trim()}`);
    } catch (error) {
      console.log('❌ Supabase CLI not found. Installing...');
      
      try {
        // Try to install Supabase CLI
        await execAsync('npm install -g supabase');
        console.log('✅ Supabase CLI installed successfully');
      } catch (installError) {
        console.error('❌ Failed to install Supabase CLI:', installError.message);
        console.log('\n🛠️ MANUAL INSTALLATION REQUIRED:');
        console.log('Run: npm install -g supabase');
        console.log('Or visit: https://supabase.com/docs/guides/cli');
        return;
      }
    }

    // 2. Check if project is linked
    console.log('\n🔗 Checking Supabase project link...');
    try {
      const { stdout } = await execAsync('supabase status');
      if (stdout.includes('Local development setup is running')) {
        console.log('✅ Supabase project is linked');
      }
    } catch (error) {
      console.log('⚠️ Project might not be linked. Attempting to link...');
      
      // Try to link the project
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0];
      if (projectRef) {
        try {
          await execAsync(`supabase link --project-ref ${projectRef}`);
          console.log('✅ Project linked successfully');
        } catch (linkError) {
          console.log('⚠️ Auto-link failed. You may need to link manually:');
          console.log(`supabase link --project-ref ${projectRef}`);
        }
      }
    }

    // 3. Deploy the search-vendors function
    console.log('\n🚀 Deploying search-vendors function...');
    try {
      const { stdout, stderr } = await execAsync('supabase functions deploy search-vendors');
      console.log('✅ Function deployment output:');
      console.log(stdout);
      if (stderr) {
        console.log('Warnings:', stderr);
      }
      
      console.log('\n🎉 Search function deployed successfully!');
      console.log('Instagram vendors should now be visible on your website.');
      
    } catch (deployError) {
      console.error('❌ Function deployment failed:', deployError.message);
      console.log('\n🛠️ ALTERNATIVE DEPLOYMENT METHOD:');
      console.log('1. Go to: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to Edge Functions');
      console.log('4. Deploy or redeploy "search-vendors" function');
      console.log('5. Check function logs for any errors');
      
      return;
    }

    // 4. Test the deployed function
    console.log('\n🧪 Testing deployed function...');
    await testDeployedFunction();

  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
    console.log('\n🛠️ MANUAL TROUBLESHOOTING STEPS:');
    console.log('1. Check Supabase Dashboard → Edge Functions');
    console.log('2. Look for "search-vendors" function');
    console.log('3. Check function logs for errors');
    console.log('4. Redeploy if necessary');
  }
}

async function testDeployedFunction() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

    const testResponse = await fetch(`${supabaseUrl}/functions/v1/search-vendors`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword: 'coffee cart',
        location: 'New York, NY'
      })
    });

    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log(`✅ Function test successful! Found ${result.totalResults || result.results?.length || 0} results`);
      
      // Check for Instagram results specifically
      if (result.results) {
        const instagramResults = result.results.filter(r => r.vendor_source === 'instagram');
        if (instagramResults.length > 0) {
          console.log(`🎉 SUCCESS: ${instagramResults.length} Instagram vendors returned!`);
          console.log('Your website should now display Instagram vendors.');
        } else {
          console.log('⚠️ Function working but no Instagram results. Check database queries.');
        }
      }
    } else {
      const errorText = await testResponse.text();
      console.log(`❌ Function test failed: ${testResponse.status}`);
      console.log(`Error: ${errorText}`);
    }
  } catch (testError) {
    console.log(`⚠️ Function test error: ${testError.message}`);
  }
}

fixSearchFunction().catch(console.error);
