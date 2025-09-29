/**
 * Test Cultural Quiz Database Save
 * 
 * This script tests that bride preferences are being saved correctly
 * to the database when the quiz is completed.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Sample quiz data (mimics what a bride would select)
const sampleQuizData = {
  cultural_background: ['south_asian_indian', 'muslim'],
  religious_tradition: ['hindu', 'muslim'],
  ceremony_types: ['mehndi', 'sangeet', 'nikah', 'walima'],
  preferred_languages: ['hindi', 'urdu', 'english'],
  requires_bilingual: true,
  wedding_style: ['traditional', 'elegant'],
  dietary_restrictions: ['halal', 'vegetarian'],
  modesty_preferences: 'modest_photography',
  budget_range: '5k_10k',
  wedding_date: new Date('2026-06-15').toISOString(),
  guest_count: 300,
  location: 'Dallas, Texas',
  importance_cultural_knowledge: 5,
  importance_language: 5,
  importance_style_match: 4,
  importance_price: 4,
  must_have_cultural_experience: true,
  quiz_completed: true,
  completed_at: new Date().toISOString()
};

async function testQuizSave() {
  console.log('🧪 Testing Cultural Quiz Database Save...\n');

  try {
    // Step 1: Insert test bride preference
    console.log('📝 Inserting test bride preference...');
    const { data: insertedData, error: insertError } = await supabase
      .from('bride_preferences')
      .insert(sampleQuizData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }

    console.log('✅ Preference saved with ID:', insertedData.id);
    console.log('\n📊 Saved Data:');
    console.log('  Cultural Background:', insertedData.cultural_background);
    console.log('  Religious Tradition:', insertedData.religious_tradition);
    console.log('  Ceremony Types:', insertedData.ceremony_types);
    console.log('  Languages:', insertedData.preferred_languages);
    console.log('  Requires Bilingual:', insertedData.requires_bilingual);
    console.log('  Budget Range:', insertedData.budget_range);
    console.log('  Location:', insertedData.location);
    console.log('  Guest Count:', insertedData.guest_count);
    console.log('\n  Importance Ratings:');
    console.log('    - Cultural Knowledge:', insertedData.importance_cultural_knowledge, '/5');
    console.log('    - Language Match:', insertedData.importance_language, '/5');
    console.log('    - Style Match:', insertedData.importance_style_match, '/5');
    console.log('    - Price Fit:', insertedData.importance_price, '/5');

    // Step 2: Verify we can retrieve it
    console.log('\n🔍 Verifying retrieval...');
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('bride_preferences')
      .select('*')
      .eq('id', insertedData.id)
      .single();

    if (retrieveError) {
      console.error('❌ Retrieval failed:', retrieveError);
      return;
    }

    console.log('✅ Successfully retrieved preference');

    // Step 3: Check recent preferences count
    console.log('\n📈 Checking all recent preferences...');
    const { data: allPreferences, error: countError } = await supabase
      .from('bride_preferences')
      .select('id, created_at, cultural_background, location')
      .order('created_at', { ascending: false })
      .limit(10);

    if (countError) {
      console.error('❌ Count query failed:', countError);
      return;
    }

    console.log(`✅ Found ${allPreferences.length} recent preference(s):`);
    allPreferences.forEach((pref, index) => {
      console.log(`\n  ${index + 1}. ID: ${pref.id.substring(0, 8)}...`);
      console.log(`     Created: ${new Date(pref.created_at).toLocaleString()}`);
      console.log(`     Cultures: ${pref.cultural_background.join(', ')}`);
      console.log(`     Location: ${pref.location || 'Not specified'}`);
    });

    // Step 4: Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('bride_preferences')
      .delete()
      .eq('id', insertedData.id);

    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError);
      console.log('⚠️  You may need to manually delete test record:', insertedData.id);
      return;
    }

    console.log('✅ Test data cleaned up');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✨ Phase 2 is working correctly!');
    console.log('📊 Bride preferences are being saved to the database');
    console.log('🚀 Ready for Phase 3: Matching Edge Function\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

// Run the test
testQuizSave();
