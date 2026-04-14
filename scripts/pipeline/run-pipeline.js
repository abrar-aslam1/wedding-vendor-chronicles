#!/usr/bin/env node

/**
 * Instagram Vendor Discovery Pipeline — Orchestrator
 *
 * Usage:
 *   node scripts/pipeline/run-pipeline.js                          # All tier-1 cities, all categories
 *   node scripts/pipeline/run-pipeline.js --city Dallas --state TX  # Single city
 *   node scripts/pipeline/run-pipeline.js --category photographer   # Single category, all tier-1
 *   node scripts/pipeline/run-pipeline.js --tier 2                  # All tier-2 cities
 *   node scripts/pipeline/run-pipeline.js --dry-run                 # Discover only, no DB writes
 */

import { config } from 'dotenv';
config();

import { VendorDiscovery } from './discover.js';
import { VendorEnricher } from './enrich.js';
import { VendorNormalizer } from './normalize.js';
import { VendorScorer } from './score.js';
import { VendorIngestor } from './ingest.js';
import { PipelineLogger } from './logger.js';
import { CATEGORIES, TIER_1_CITIES, TIER_2_CITIES } from './config.js';

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    city: null,
    state: null,
    category: null,
    tier: 1,
    dryRun: false,
    limit: null,
    competitors: []
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--city': opts.city = args[++i]; break;
      case '--state': opts.state = args[++i]; break;
      case '--category': opts.category = args[++i]; break;
      case '--tier': opts.tier = parseInt(args[++i], 10); break;
      case '--dry-run': opts.dryRun = true; break;
      case '--limit': opts.limit = parseInt(args[++i], 10); break;
      case '--competitors': opts.competitors = args[++i].split(','); break;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();
  const runId = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const logger = new PipelineLogger(runId);
  const ingestor = new VendorIngestor(logger);

  logger.info('=== Instagram Vendor Discovery Pipeline ===');
  logger.info(`Run ID: ${runId}`);
  logger.info('Options:', opts);

  // Record run start
  await ingestor.recordRun(runId, 'running', opts, {});

  try {
    // Determine cities to process
    let cities;
    if (opts.city && opts.state) {
      cities = [{ city: opts.city, state: opts.state }];
    } else if (opts.tier === 2) {
      cities = TIER_2_CITIES;
    } else {
      cities = TIER_1_CITIES;
    }

    // Determine categories to process
    let categories;
    if (opts.category) {
      if (!CATEGORIES[opts.category]) {
        logger.error(`Unknown category: ${opts.category}. Valid: ${Object.keys(CATEGORIES).join(', ')}`);
        process.exit(1);
      }
      categories = [opts.category];
    } else {
      categories = Object.keys(CATEGORIES);
    }

    logger.info(`Processing ${cities.length} cities x ${categories.length} categories = ${cities.length * categories.length} combinations`);

    // Phase 1: Discovery
    logger.info('\n=== PHASE 1: DISCOVERY ===');
    const discovery = new VendorDiscovery(logger);

    for (const { city, state } of cities) {
      for (const category of categories) {
        await discovery.discoverAll(category, city, state, {
          limit: opts.limit,
          competitorHandles: opts.competitors
        });

        // Brief pause between discovery runs to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const allDiscovered = discovery.getAllDiscovered();
    logger.info(`\nTotal unique profiles discovered: ${allDiscovered.length}`);

    if (allDiscovered.length === 0) {
      logger.warn('No profiles discovered. Exiting.');
      await ingestor.recordRun(runId, 'completed', opts, { discovered: 0 }, logger.getFullLog());
      return;
    }

    // Phase 2: Enrichment
    logger.info('\n=== PHASE 2: ENRICHMENT ===');
    const enricher = new VendorEnricher(logger);
    const enriched = await enricher.enrichBatch(allDiscovered);

    logger.info(`Enriched ${enriched.length} of ${allDiscovered.length} profiles`);

    // Phase 3: Normalization
    logger.info('\n=== PHASE 3: NORMALIZATION ===');
    const normalizer = new VendorNormalizer(logger);
    const normalized = normalizer.normalize(enriched);

    logger.info(`Normalized: ${normalized.length} vendors passed filters`);

    // Phase 4: Scoring
    logger.info('\n=== PHASE 4: SCORING ===');
    const scorer = new VendorScorer(logger);
    const scored = scorer.scoreAll(normalized);

    // Phase 5: Ingest (skip if dry run)
    if (opts.dryRun) {
      logger.info('\n=== DRY RUN — Skipping database writes ===');
      logger.info('Sample output (first 3 vendors):');
      for (const v of scored.slice(0, 3)) {
        console.log(JSON.stringify({
          handle: v.instagram_handle,
          name: v.business_name,
          category: v.category,
          city: v.city,
          state: v.state,
          followers: v.follower_count,
          engagement: v.engagement_score,
          quality: v.quality_score,
          tier: v.vendor_tier,
          slug: v.slug
        }, null, 2));
      }
    } else {
      logger.info('\n=== PHASE 5: INGEST ===');
      const ingestStats = await ingestor.ingest(scored, runId);
      logger.success('Ingest stats:', ingestStats);
    }

    // Record run completion
    const finalStats = {
      discovered: allDiscovered.length,
      enriched: enriched.length,
      normalized: normalized.length,
      scored: scored.length,
      tiers: scored.reduce((acc, v) => {
        acc[v.vendor_tier] = (acc[v.vendor_tier] || 0) + 1;
        return acc;
      }, {}),
      ...(opts.dryRun ? {} : ingestor?.stats || {})
    };

    await ingestor.recordRun(runId, 'completed', opts, finalStats, logger.getFullLog());

    logger.info('\n=== PIPELINE COMPLETE ===');
    logger.info('Final stats:', finalStats);
    logger.info(`Summary: ${logger.getSummary().duration} elapsed, ${logger.getSummary().errors} errors`);

  } catch (err) {
    logger.error(`Pipeline failed: ${err.message}`, { stack: err.stack });
    await ingestor.recordRun(runId, 'failed', opts, {}, logger.getFullLog());
    process.exit(1);
  }
}

main();
