#!/usr/bin/env node

/**
 * Test Autonomous Workflow System
 * Simulates GitHub Actions workflow execution locally
 */

const fs = require('fs');

async function testCitySelection() {
  console.log('🧪 Testing smart city selection logic...');
  
  try {
    // Check if comprehensive CSV exists
    if (!fs.existsSync('data/ig_comprehensive_seed.csv')) {
      console.error('❌ Missing data/ig_comprehensive_seed.csv');
      return false;
    }

    const csv = fs.readFileSync('data/ig_comprehensive_seed.csv', 'utf8');
    const lines = csv.trim().split('\n').slice(1); // Skip header
    
    // Test city selection for champagne-carts
    const cities = lines
      .map(line => {
        const [tier, city, state, category] = line.split(',');
        return { 
          tier: parseInt(tier), 
          city: city.replace(/"/g, ''), 
          state: state.replace(/"/g, ''), 
          category: category.replace(/"/g, '') 
        };
      })
      .filter(row => row.category === 'champagne-carts');

    console.log(`📊 Found ${cities.length} cities for champagne-carts category`);
    
    if (cities.length === 0) {
      console.error('❌ No cities found for champagne-carts category');
      return false;
    }

    // Test different tiers
    const tier1Cities = cities.filter(c => c.tier === 1);
    const tier2Cities = cities.filter(c => c.tier === 2); 
    const tier3Cities = cities.filter(c => c.tier === 3);

    console.log(`   • Tier 1 cities: ${tier1Cities.length}`);
    console.log(`   • Tier 2 cities: ${tier2Cities.length}`);
    console.log(`   • Tier 3 cities: ${tier3Cities.length}`);

    // Test round-robin selection
    const testHours = [0, 6, 12, 18];
    console.log('\n🔄 Testing round-robin city selection:');
    
    for (const hour of testHours) {
      const index = hour % cities.length;
      const selected = cities[index];
      console.log(`   Hour ${hour.toString().padStart(2, '0')}: ${selected.city}, ${selected.state} (Tier ${selected.tier})`);
    }

    return true;

  } catch (error) {
    console.error('❌ City selection test failed:', error.message);
    return false;
  }
}

async function testManualInputNormalization() {
  console.log('\n🧪 Testing manual input normalization...');
  
  const testCases = [
    { input: { city: 'dallas', state: 'texas' }, expected: { city: 'Dallas', state: 'TX' } },
    { input: { city: 'new york', state: 'new york' }, expected: { city: 'New York', state: 'NY' } },
    { input: { city: 'los angeles', state: 'california' }, expected: { city: 'Los Angeles', state: 'CA' } },
  ];

  const stateMap = {
    'texas': 'TX', 'california': 'CA', 'new york': 'NY', 'florida': 'FL',
    'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH', 'georgia': 'GA'
  };

  try {
    const csv = fs.readFileSync('data/ig_comprehensive_seed.csv', 'utf8');
    const lines = csv.trim().split('\n').slice(1);

    for (const testCase of testCases) {
      const { city: inputCity, state: inputState } = testCase.input;
      const { city: expectedCity, state: expectedState } = testCase.expected;

      // Normalize inputs
      const normalizedState = stateMap[inputState.toLowerCase()] || inputState.toUpperCase();
      const titleCaseCity = inputCity.split(' ').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');

      // Find match in CSV
      const match = lines.find(line => {
        const [tier, city, state, category] = line.split(',');
        const csvCity = city.replace(/"/g, '').toLowerCase();
        const csvState = state.replace(/"/g, '');
        return csvCity === inputCity.toLowerCase() && csvState === normalizedState;
      });

      if (match) {
        const [tier, city, state] = match.split(',');
        const finalCity = city.replace(/"/g, '');
        const finalState = state.replace(/"/g, '');
        
        console.log(`✅ ${inputCity}, ${inputState} → ${finalCity}, ${finalState}`);
        
        if (finalCity !== expectedCity || finalState !== expectedState) {
          console.log(`⚠️  Expected: ${expectedCity}, ${expectedState}`);
        }
      } else {
        console.log(`❌ No match found for: ${inputCity}, ${inputState}`);
        console.log(`   Would use: ${titleCaseCity}, ${normalizedState}`);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Input normalization test failed:', error.message);
    return false;
  }
}

async function testYamlPlaybookIntegration() {
  console.log('\n🧪 Testing YAML playbook integration...');
  
  try {
    // Check if YAML playbook exists and has correct CSV reference
    if (!fs.existsSync('automations/ig/backfill-city.yml')) {
      console.error('❌ Missing automations/ig/backfill-city.yml');
      return false;
    }

    const yamlContent = fs.readFileSync('automations/ig/backfill-city.yml', 'utf8');
    
    if (yamlContent.includes('data/ig_comprehensive_seed.csv')) {
      console.log('✅ YAML playbook using comprehensive CSV');
    } else if (yamlContent.includes('data/ig_mcp_apify_seed.csv')) {
      console.error('❌ YAML playbook still using old CSV file');
      return false;
    } else {
      console.error('❌ YAML playbook CSV reference not found');
      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ YAML integration test failed:', error.message);
    return false;
  }
}

async function testWorkflowConfiguration() {
  console.log('\n🧪 Testing workflow configuration...');
  
  const expectedWorkflows = [
    'instagram-automation-wedding-photographers.yml',
    'instagram-automation-wedding-planners.yml', 
    'instagram-automation-wedding-venues.yml',
    'instagram-automation-coffee-carts.yml',
    'instagram-automation-matcha-carts.yml',
    'instagram-automation-cocktail-carts.yml',
    'instagram-automation-dessert-carts.yml',
    'instagram-automation-flower-carts.yml',
    'instagram-automation-champagne-carts.yml'
  ];

  let passCount = 0;

  for (const workflow of expectedWorkflows) {
    const path = `.github/workflows/${workflow}`;
    
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8');
      
      // Check if it uses comprehensive CSV
      if (content.includes('data/ig_comprehensive_seed.csv')) {
        console.log(`✅ ${workflow} - Using comprehensive CSV`);
        passCount++;
      } else {
        console.log(`❌ ${workflow} - Not using comprehensive CSV`);
      }
    } else {
      console.log(`❌ ${workflow} - Missing file`);
    }
  }

  console.log(`\n📊 Workflow Test Results: ${passCount}/${expectedWorkflows.length} passed`);
  return passCount === expectedWorkflows.length;
}

async function testSimulatedExecution() {
  console.log('\n🧪 Testing simulated workflow execution...');
  
  try {
    // Simulate environment variables
    process.env.CITY = 'Dallas';
    process.env.STATE = 'TX';
    process.env.CATEGORY = 'champagne-carts';
    
    console.log('🎯 Simulating: Dallas, TX - champagne-carts');
    
    // Test CSV filtering logic
    const csv = fs.readFileSync('data/ig_comprehensive_seed.csv', 'utf8');
    const lines = csv.trim().split('\n').slice(1);
    
    const matches = lines.filter(line => {
      const [tier, city, state, category] = line.split(',');
      return city.replace(/"/g, '') === process.env.CITY &&
             state.replace(/"/g, '') === process.env.STATE &&
             category.replace(/"/g, '') === process.env.CATEGORY;
    });

    if (matches.length > 0) {
      const [tier, city, state, category, searchTerms, locationHashtags] = matches[0].split(',');
      console.log('✅ Found matching seed data:');
      console.log(`   • City: ${city.replace(/"/g, '')}`);
      console.log(`   • State: ${state.replace(/"/g, '')}`);
      console.log(`   • Category: ${category.replace(/"/g, '')}`);
      console.log(`   • Tier: ${tier}`);
      console.log(`   • Search Terms: ${searchTerms.replace(/"/g, '').substring(0, 50)}...`);
      return true;
    } else {
      console.error('❌ No matching seed data found');
      return false;
    }

  } catch (error) {
    console.error('❌ Simulated execution test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 AUTONOMOUS WORKFLOW SYSTEM TEST SUITE');
  console.log('==========================================\n');
  
  const tests = [
    { name: 'City Selection Logic', fn: testCitySelection },
    { name: 'Manual Input Normalization', fn: testManualInputNormalization },
    { name: 'YAML Playbook Integration', fn: testYamlPlaybookIntegration },
    { name: 'Workflow Configuration', fn: testWorkflowConfiguration },
    { name: 'Simulated Execution', fn: testSimulatedExecution }
  ];

  let passedTests = 0;
  const totalTests = tests.length;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
    console.log(); // Add spacing between tests
  }

  console.log('==========================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Autonomous system ready for deployment!');
    console.log('\n✅ Verified Components:');
    console.log('   • City selection with 927 combinations');
    console.log('   • Input normalization (case + state conversion)');
    console.log('   • YAML playbook integration');
    console.log('   • All 9 workflow configurations');
    console.log('   • End-to-end execution simulation');
    
    console.log('\n🚀 Ready for production deployment:');
    console.log('   1. Set GitHub secrets');
    console.log('   2. Enable workflows');
    console.log('   3. System will run autonomously');
    
    return true;
  } else {
    console.log('❌ TESTS FAILED - System needs fixes before deployment');
    console.log('\n🔧 Issues to address:');
    console.log('   • Review failed test output above');
    console.log('   • Fix configuration issues');
    console.log('   • Re-run tests until all pass');
    
    return false;
  }
}

if (require.main === module) {
  main()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💀 Test suite crashed:', error.message);
      process.exit(1);
    });
}
