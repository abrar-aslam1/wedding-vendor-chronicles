#!/usr/bin/env node

/**
 * Fix City/State Matching Issues in YAML Playbook
 * Handles case sensitivity and state format conversion (TX vs texas)
 */

const fs = require('fs');

// State name mapping (full name to abbreviation)
const STATE_MAPPING = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
};

function updateYamlPlaybook() {
  const yamlPath = 'automations/ig/backfill-city.yml';
  
  try {
    console.log('📝 Updating YAML playbook to handle case-insensitive city/state matching...');
    
    // Read the current YAML file
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    
    // Create the updated YAML with better city/state matching
    const updatedYaml = yamlContent.replace(
      /- name: "Load seed data for city\/state\/category"\s*\n\s*action: read_csv\s*\n\s*params:\s*\n\s*file: "data\/ig_comprehensive_seed\.csv"\s*\n\s*filter:\s*\n\s*CITY: "\${env\.CITY}"\s*\n\s*STATE: "\${env\.STATE}"\s*\n\s*CATEGORY: "\${env\.CATEGORY}"/,
      `- name: "Load seed data for city/state/category"
    action: read_csv
    params:
      file: "data/ig_comprehensive_seed.csv"
      filter:
        CITY: "\${env.CITY}"
        STATE: "\${env.STATE}"
        CATEGORY: "\${env.CATEGORY}"
      case_insensitive: true
      state_mapping:
        texas: "TX"
        california: "CA"
        florida: "FL"
        new york: "NY"
        illinois: "IL"
        pennsylvania: "PA"
        ohio: "OH"
        georgia: "GA"
        north carolina: "NC"
        michigan: "MI"
        virginia: "VA"
        washington: "WA"
        arizona: "AZ"
        massachusetts: "MA"
        tennessee: "TN"
        indiana: "IN"
        missouri: "MO"
        maryland: "MD"
        wisconsin: "WI"
        colorado: "CO"
        minnesota: "MN"
        south carolina: "SC"
        alabama: "AL"
        louisiana: "LA"
        kentucky: "KY"
        oregon: "OR"
        oklahoma: "OK"
        connecticut: "CT"
        utah: "UT"
        iowa: "IA"
        nevada: "NV"
        arkansas: "AR"
        mississippi: "MS"
        kansas: "KS"
        new mexico: "NM"
        nebraska: "NE"
        west virginia: "WV"
        idaho: "ID"
        hawaii: "HI"
        new hampshire: "NH"
        maine: "ME"
        montana: "MT"
        rhode island: "RI"
        delaware: "DE"
        south dakota: "SD"
        north dakota: "ND"
        alaska: "AK"
        district of columbia: "DC"
        vermont: "VT"
        wyoming: "WY"`
    );
    
    // Also add a preprocessing step to normalize city/state before filtering
    const finalYaml = updatedYaml.replace(
      /- name: "Validate required parameters"/,
      `- name: "Normalize city and state parameters"
    action: transform_data
    params:
      source: "env"
      transforms:
        normalized_city: "\${env.CITY.toLowerCase().replace(/\\s+/g, ' ').trim()}"
        normalized_state: "\${env.STATE.toLowerCase().trim()}"
        state_abbrev: "\${STATE_MAPPING[env.STATE.toLowerCase()] || env.STATE.toUpperCase()}"
    register: normalized_params
    when: "env.CITY && env.STATE && env.CATEGORY"

  - name: "Validate required parameters"`
    );

    // Write the updated YAML
    fs.writeFileSync(yamlPath, finalYaml);
    
    console.log('✅ Updated YAML playbook with improved city/state matching');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating YAML playbook:', error.message);
    return false;
  }
}

function createFallbackScript() {
  // Create a simpler solution by creating a preprocessing script
  const preprocessorScript = `#!/usr/bin/env node

/**
 * Preprocess City/State parameters for YAML playbook
 * Converts full state names to abbreviations and normalizes case
 */

const STATE_MAPPING = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
};

// Get input parameters
const city = process.env.CITY || process.argv[2];
const state = process.env.STATE || process.argv[3];
const category = process.env.CATEGORY || process.argv[4];

if (!city || !state || !category) {
  console.error('Usage: node preprocess-params.js <city> <state> <category>');
  process.exit(1);
}

// Normalize city (title case)
const normalizedCity = city.toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// Normalize state (convert full name to abbreviation)
const stateKey = state.toLowerCase().trim();
const normalizedState = STATE_MAPPING[stateKey] || state.toUpperCase();

// Output normalized values as environment variables
console.log(\`NORMALIZED_CITY="\${normalizedCity}"\`);
console.log(\`NORMALIZED_STATE="\${normalizedState}"\`);
console.log(\`NORMALIZED_CATEGORY="\${category}"\`);

module.exports = { normalizedCity, normalizedState, category };
`;

  fs.writeFileSync('scripts/preprocess-city-state.cjs', preprocessorScript);
  console.log('✅ Created city/state preprocessing script');
}

async function main() {
  console.log('🔧 Fixing city/state matching issues...');
  
  // Try to update the YAML file
  const yamlUpdated = updateYamlPlaybook();
  
  // Create fallback preprocessing script
  createFallbackScript();
  
  if (yamlUpdated) {
    console.log('\n✅ City/state matching fixes applied');
    console.log('📋 Changes made:');
    console.log('   • Added case-insensitive city matching');
    console.log('   • Added state name to abbreviation conversion');
    console.log('   • Created preprocessing script for normalization');
    console.log('\n🧪 Test the fix with:');
    console.log('   CITY="dallas" STATE="texas" CATEGORY="champagne-carts" npm run play:backfill:city');
  } else {
    console.log('\n⚠️ Could not automatically update YAML file');
    console.log('📋 Manual fix required:');
    console.log('   • Update city/state matching in backfill-city.yml');
    console.log('   • Use case-insensitive comparison');
    console.log('   • Convert state names to abbreviations');
  }
}

if (require.main === module) {
  main();
}
