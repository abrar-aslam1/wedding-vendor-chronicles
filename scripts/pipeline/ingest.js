/**
 * Ingest Module
 * Stores scored vendor data into Supabase, either directly or via the ingest edge function.
 */

import { createClient } from '@supabase/supabase-js';
import { DEFAULTS, ENV } from './config.js';

export class VendorIngestor {
  constructor(logger) {
    this.logger = logger;
    this.supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_KEY);
    this.stats = { inserted: 0, updated: 0, skipped: 0, errors: 0 };
  }

  /**
   * Ingest a batch of scored vendors into Supabase
   * Uses direct DB access via service role for maximum control.
   */
  async ingest(vendors, runId) {
    this.logger.info(`Ingesting ${vendors.length} vendors into Supabase`);
    const batchSize = DEFAULTS.INGEST_BATCH_SIZE;

    for (let i = 0; i < vendors.length; i += batchSize) {
      const batch = vendors.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      this.logger.info(`Processing ingest batch ${batchNum} (${batch.length} vendors)`);

      for (const vendor of batch) {
        try {
          await this._upsertVendor(vendor, runId);
        } catch (err) {
          this.stats.errors++;
          this.logger.error(`Failed to ingest ${vendor.instagram_handle}`, {
            error: err.message
          });
        }
      }
    }

    this.logger.success('Ingest complete', this.stats);
    return this.stats;
  }

  async _upsertVendor(vendor, runId) {
    const handle = vendor.instagram_handle;

    // Check for existing record
    const { data: existing, error: checkErr } = await this.supabase
      .from('instagram_vendors')
      .select('id, instagram_handle, follower_count, quality_score')
      .eq('instagram_handle', handle)
      .eq('category', vendor.category)
      .maybeSingle();

    if (checkErr) {
      throw new Error(`DB check failed for ${handle}: ${checkErr.message}`);
    }

    const record = {
      instagram_handle: handle,
      business_name: vendor.business_name,
      bio: vendor.bio,
      category: vendor.category,
      subcategory: vendor.subcategory || null,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country || 'US',
      email: vendor.email,
      phone: vendor.phone,
      website_url: vendor.website_url,
      follower_count: vendor.follower_count,
      post_count: vendor.post_count,
      profile_image_url: vendor.profile_image_url,
      is_verified: vendor.is_verified,
      is_business_account: vendor.is_business_account,
      is_business: vendor.is_business,
      images: vendor.images || [],
      hashtags: vendor.hashtags || [],
      engagement_score: vendor.engagement_score,
      quality_score: vendor.quality_score,
      vendor_tier: vendor.vendor_tier,
      slug: vendor.slug,
      source: vendor.source || 'instagram',
      claimed: vendor.claimed || false,
      discovery_run_id: runId,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update only if new data is richer (higher follower count or quality score)
      const shouldUpdate =
        !existing.quality_score ||
        vendor.quality_score > (existing.quality_score || 0) ||
        vendor.follower_count > (existing.follower_count || 0);

      if (!shouldUpdate) {
        this.stats.skipped++;
        return;
      }

      const { error: updateErr } = await this.supabase
        .from('instagram_vendors')
        .update(record)
        .eq('id', existing.id);

      if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);
      this.stats.updated++;
    } else {
      const { error: insertErr } = await this.supabase
        .from('instagram_vendors')
        .insert(record);

      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`);
      this.stats.inserted++;
    }
  }

  /**
   * Record a pipeline run in the pipeline_runs table
   */
  async recordRun(runId, status, config, stats, log) {
    try {
      await this.supabase
        .from('pipeline_runs')
        .upsert({
          id: runId,
          status,
          config,
          stats,
          log: log?.slice(0, 10000), // Truncate log to 10k chars
          ...(status === 'completed' || status === 'failed'
            ? { completed_at: new Date().toISOString() }
            : {})
        }, { onConflict: 'id' });
    } catch (err) {
      this.logger.warn(`Failed to record pipeline run: ${err.message}`);
    }
  }
}
