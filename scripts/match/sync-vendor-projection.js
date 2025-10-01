#!/usr/bin/env node

/**
 * Match Me Feature - Vendor Projection Sync
 * 
 * Reads from existing vendors table and creates/updates match_vendor_projection records
 * This is a READ-ONLY operation on vendors table - no writes to existing schema
 * 
 * Usage: node scripts/match/sync-vendor-projection.js [--limit=N] [--category=X]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

const LIMIT = args.limit ? parseInt(args.limit) : null;
const CATEGORY_FILTER = args.category || null;
const DRY_RUN = args.dryrun || args['dry-run'] || false;

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Extract style keywords from vendor description
 */
function extractStyleKeywords(description) {
  if (!description) return [];
  
  const stylePatterns = [
    'rustic', 'modern', 'vintage', 'bohemian', 'boho', 'classic', 'elegant',
    'romantic', 'industrial', 'minimalist', 'traditional', 'contemporary',
    'garden', 'barn', 'warehouse', 'outdoor', 'indoor', 'coastal', 'mountain',
    'luxury', 'intimate', 'grand', 'formal', 'casual', 'chic', 'artistic',
    'whimsical', 'glamorous', 'sophisticated', 'natural', 'urban'
  ];
  
  const lowerDesc = description.toLowerCase();
  return stylePatterns.filter(keyword => lowerDesc.includes(keyword));
}

/**
 * Determine price tier from contact_info or description
 */
function determinePriceTier(vendor) {
  const { contact_info, description } = vendor;
  
  // Try to extract price from contact_info JSON
  let priceIndicators = [];
  
  if (contact_info) {
    const info = typeof contact_info === 'string' ? JSON.parse(contact_info) : contact_info;
    
    if (info.starting_price) {
      priceIndicators.push(info.starting_price);
    }
    if (info.price_range) {
      priceIndicators.push(info.price_range);
    }
    if (info.pricing) {
      priceIndicators.push(info.pricing);
    }
  }
  
  // Check description for price keywords
  const descLower = (description || '').toLowerCase();
  if (descLower.includes('luxury') || descLower.includes('high-end')) {
    return 'luxury';
  }
  if (descLower.includes('premium') || descLower.includes('upscale')) {
    return 'premium';
  }
  if (descLower.includes('affordable') || descLower.includes('budget')) {
    return 'budget';
  }
  
  // Analyze price indicators
  const priceStr = priceIndicators.join(' ').toLowerCase();
  
  if (priceStr.includes('$$$$$') || priceStr.match(/\$\d{5,}/)) {
    return 'luxury';
  }
  if (priceStr.includes('$$$$') || priceStr.match(/\$[5-9]\d{3}/)) {
    return 'premium';
  }
  if (priceStr.includes('$$') || priceStr.match(/\$[1-4]\d{3}/)) {
    return 'moderate';
  }
  if (priceStr.includes('$') || priceStr.match(/\$\d{2,3}/)) {
    return 'budget';
  }
  
  return 'moderate'; // Default tier
}

/**
 * Extract verification badges
 */
function extractBadges(vendor) {
  const badges = [];
  
  if (vendor.verification_status === 'verified') {
    badges.push('verified');
  }
  if (vendor.is_featured) {
    badges.push('featured');
  }
  if (vendor.subscription_tier === 'premium' || vendor.subscription_tier === 'professional') {
    badges.push('premium_vendor');
  }
  
  return badges;
}

/**
 * Extract cultural specialties from description
 */
function extractCulturalSpecialties(description) {
  if (!description) return [];
  
  const culturalKeywords = [
    'halal', 'kosher', 'hindu', 'muslim', 'jewish', 'catholic', 'christian',
    'indian', 'south asian', 'asian', 'hispanic', 'latino', 'african',
    'middle eastern', 'mediterranean', 'multicultural', 'interfaith',
    'mandap', 'chuppah', 'mehndi', 'sangeet', 'baraat', 'nikah'
  ];
  
  const lowerDesc = description.toLowerCase();
  return culturalKeywords.filter(keyword => lowerDesc.includes(keyword));
}

/**
 * Extract contact information
 */
function extractContactInfo(vendor) {
  const { contact_info } = vendor;
  
  if (!contact_info) {
    return { email: null, phone: null, website: null };
  }
  
  const info = typeof contact_info === 'string' ? JSON.parse(contact_info) : contact_info;
  
  return {
    email: info.email || info.contact_email || null,
    phone: info.phone || info.contact_phone || null,
    website: info.website || info.website_url || null
  };
}

/**
 * Transform vendor record into projection record
 */
function transformVendorToProjection(vendor) {
  const contactInfo = extractContactInfo(vendor);
  
  return {
    vendor_id: vendor.id,
    category: vendor.category,
    city: vendor.city,
    state: vendor.state,
    business_name: vendor.business_name,
    
    // Pricing
    price_tier: determinePriceTier(vendor),
    starting_price: null, // TODO: Parse from contact_info if structured
    price_range_min: null,
    price_range_max: null,
    
    // Capacity (category-specific)
    typical_capacity_min: null,
    typical_capacity_max: null,
    books_months_advance: 12,
    
    // Style & features
    style_keywords: extractStyleKeywords(vendor.description),
    features: {}, // Can be enhanced with category-specific parsing
    description: vendor.description,
    
    // Social proof
    review_avg: null, // TODO: Calculate from reviews if available
    review_count: 0,
    verification_badges: extractBadges(vendor),
    response_time_hours: 24, // Default
    
    // Cultural/accessibility
    cultural_specialties: extractCulturalSpecialties(vendor.description),
    accessibility_features: [], // TODO: Parse from description
    languages_supported: [], // TODO: Parse from description
    
    // Contact info
    contact_email: contactInfo.email,
    contact_phone: contactInfo.phone,
    website_url: contactInfo.website,
    images: vendor.images || [],
    
    // Metadata
    active: vendor.verification_status !== 'rejected',
    last_synced: new Date().toISOString(),
    sync_source: 'vendors_table',
    sync_version: 1
  };
}

/**
 * Sync vendors to projection table
 */
async function syncVendorProjection() {
  try {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     Match Me Feature - Vendor Projection Sync               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No data will be written\n');
    }

    // Build query
    let query = supabase
      .from('vendors')
      .select('*');

    if (CATEGORY_FILTER) {
      query = query.eq('category', CATEGORY_FILTER);
      console.log(`🎯 Filtering by category: ${CATEGORY_FILTER}`);
    }

    if (LIMIT) {
      query = query.limit(LIMIT);
      console.log(`📊 Limiting to ${LIMIT} vendors`);
    }

    console.log('📥 Fetching vendors from database...\n');

    const { data: vendors, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch vendors: ${fetchError.message}`);
    }

    if (!vendors || vendors.length === 0) {
      console.log('⚠️  No vendors found matching criteria\n');
      return;
    }

    console.log(`✅ Found ${vendors.length} vendors to sync\n`);

    // Transform and upsert
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      const percentage = Math.round(((i + 1) / vendors.length) * 100);
      
      process.stdout.write(
        `\r[${i + 1}/${vendors.length}] ${percentage}% - ${vendor.business_name.substring(0, 40)}...`
      );

      try {
        const projection = transformVendorToProjection(vendor);

        if (!DRY_RUN) {
          const { error: upsertError } = await supabase
            .from('match_vendor_projection')
            .upsert(projection, {
              onConflict: 'vendor_id'
            });

          if (upsertError) {
            throw upsertError;
          }
        }

        successCount++;
      } catch (err) {
        errorCount++;
        errors.push({
          vendor_id: vendor.id,
          business_name: vendor.business_name,
          error: err.message
        });
      }
    }

    // Clear progress line
    process.stdout.write('\r' + ' '.repeat(80) + '\r');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed:     ${errorCount}`);
    console.log(`📈 Success Rate: ${((successCount / vendors.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0 && errors.length <= 10) {
      console.log('❌ Errors encountered:');
      errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. Vendor: ${err.business_name} (${err.vendor_id})`);
        console.log(`   Error: ${err.error}`);
      });
    } else if (errors.length > 10) {
      console.log(`❌ ${errors.length} errors encountered (showing first 10):`);
      errors.slice(0, 10).forEach((err, idx) => {
        console.log(`\n${idx + 1}. Vendor: ${err.business_name} (${err.vendor_id})`);
        console.log(`   Error: ${err.error}`);
      });
    }

    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN COMPLETED - No data was written');
      console.log('   Run without --dry-run to actually sync data\n');
    } else {
      console.log('\n✨ Vendor projection sync completed!\n');
      
      // Show stats
      const { count } = await supabase
        .from('match_vendor_projection')
        .select('*', { count: 'exact', head: true });

      console.log(`📊 Total projections in database: ${count || 0}`);
    }

    // Sample projection (first record)
    if (!DRY_RUN && vendors.length > 0) {
      console.log('\n📋 Sample projection record:');
      const { data: sample } = await supabase
        .from('match_vendor_projection')
        .select('*')
        .eq('vendor_id', vendors[0].id)
        .single();

      if (sample) {
        console.log(JSON.stringify({
          vendor_id: sample.vendor_id,
          business_name: sample.business_name,
          category: sample.category,
          location: `${sample.city}, ${sample.state}`,
          price_tier: sample.price_tier,
          style_keywords: sample.style_keywords,
          badges: sample.verification_badges
        }, null, 2));
      }
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Verify projections in Supabase table editor');
    console.log('   2. Add NEXT_PUBLIC_ENABLE_MATCHING=true to .env');
    console.log('   3. Test matching API endpoints\n');

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Show usage if help requested
if (args.help || args.h) {
  console.log(`
Usage: node scripts/match/sync-vendor-projection.js [options]

Options:
  --limit=N           Sync only N vendors (useful for testing)
  --category=X        Sync only vendors in category X
  --dry-run           Preview changes without writing to database
  --help              Show this help message

Examples:
  node scripts/match/sync-vendor-projection.js
  node scripts/match/sync-vendor-projection.js --limit=100
  node scripts/match/sync-vendor-projection.js --category=venue
  node scripts/match/sync-vendor-projection.js --dry-run --limit=10
`);
  process.exit(0);
}

// Run sync
syncVendorProjection();
