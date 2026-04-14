/**
 * Enrichment Module
 * Takes discovered profile stubs and enriches them with full Instagram profile data via Apify.
 */

import { ApifyDirectClient } from '../apify-direct-client.js';
import { DEFAULTS, ENV, APIFY_ACTORS } from './config.js';

export class VendorEnricher {
  constructor(logger) {
    this.logger = logger;
    this.apify = new ApifyDirectClient(ENV.APIFY_API_TOKEN);
  }

  /**
   * Call apify/instagram-profile-scraper directly with the usernames input field.
   * Returns full profile details (followers, bio, posts, business contact info).
   */
  async _scrapeProfiles(usernames) {
    const run = await this.apify.startActorRun(APIFY_ACTORS.PROFILE_SCRAPER, {
      usernames
    });
    if (!run?.data?.id) throw new Error('Profile scraper did not return a run ID');
    const runData = await this.apify.waitForRunCompletion(run.data.id);
    return await this.apify.getRunResults(runData.defaultDatasetId);
  }

  /**
   * Enrich a batch of profile stubs with full Instagram data
   * @param {Array} profileStubs - Array of { username, category, city, state, ... }
   * @param {Object} options
   * @returns {Array} Enriched profiles with full IG data merged with stub metadata
   */
  async enrichBatch(profileStubs, options = {}) {
    const batchSize = options.batchSize || DEFAULTS.ENRICHMENT_BATCH_SIZE;
    const allEnriched = [];

    // Process in batches to avoid Apify rate limits
    for (let i = 0; i < profileStubs.length; i += batchSize) {
      const batch = profileStubs.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(profileStubs.length / batchSize);

      this.logger.info(`Enriching batch ${batchNum}/${totalBatches} (${batch.length} profiles)`);

      try {
        const usernames = batch.map(p => p.username);
        const enrichedData = await this._scrapeProfiles(usernames);

        // Merge enriched data with discovery stubs
        for (const enriched of enrichedData) {
          const username = (enriched.username || enriched.ownerUsername || '').toLowerCase();
          const stub = batch.find(p => p.username === username);

          if (!stub) {
            this.logger.debug(`No matching stub for enriched profile: ${username}`);
            continue;
          }

          allEnriched.push({
            // Discovery metadata
            ...stub,
            // Enriched Instagram data
            ig_user_id: enriched.id || enriched.pk || null,
            display_name: enriched.fullName || enriched.full_name || enriched.username || stub.username,
            bio: enriched.biography || enriched.bio || null,
            website_url: enriched.externalUrl || enriched.external_url || null,
            email: enriched.businessEmail || enriched.business_email || enriched.publicEmail || null,
            phone: enriched.businessPhoneNumber || enriched.business_phone_number || enriched.contactPhoneNumber || null,
            follower_count: enriched.followersCount || enriched.follower_count || enriched.followedByCount || 0,
            following_count: enriched.followsCount || enriched.following_count || 0,
            post_count: enriched.postsCount || enriched.media_count || enriched.mediaCount || 0,
            profile_pic_url: enriched.profilePicUrl || enriched.profile_pic_url || enriched.profilePicUrlHd || null,
            is_business_account: enriched.isBusinessAccount || enriched.is_business_account || false,
            is_verified: enriched.isVerified || enriched.is_verified || false,
            is_private: enriched.isPrivate || enriched.is_private || false,
            business_category: enriched.businessCategoryName || enriched.category_name || null,
            // Recent posts for sample images
            recent_posts: (enriched.latestPosts || enriched.edge_owner_to_timeline_media?.edges || [])
              .slice(0, 5)
              .map(post => ({
                url: post.displayUrl || post.url || post.node?.display_url || null,
                caption: post.caption || post.node?.edge_media_to_caption?.edges?.[0]?.node?.text || null,
                likes: post.likesCount || post.likes || post.node?.edge_liked_by?.count || 0,
                comments: post.commentsCount || post.comments || post.node?.edge_media_to_comment?.count || 0,
                timestamp: post.timestamp || post.taken_at || null
              })),
            // Raw hashtags from recent posts
            raw_hashtags: this._extractHashtags(enriched)
          });
        }

        this.logger.success(`Batch ${batchNum} enriched: ${enrichedData.length} profiles`);

        // Rate limit pause between batches
        if (i + batchSize < profileStubs.length) {
          this.logger.debug('Pausing 2s between batches...');
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err) {
        this.logger.error(`Batch ${batchNum} enrichment failed`, { error: err.message });
      }
    }

    this.logger.success(`Enrichment complete: ${allEnriched.length}/${profileStubs.length} profiles enriched`);
    return allEnriched;
  }

  /**
   * Extract hashtags from profile's recent posts
   */
  _extractHashtags(profile) {
    const hashtags = new Set();
    const posts = profile.latestPosts || profile.edge_owner_to_timeline_media?.edges || [];

    for (const post of posts.slice(0, 10)) {
      const caption = post.caption || post.node?.edge_media_to_caption?.edges?.[0]?.node?.text || '';
      const matches = caption.match(/#[\w]+/g);
      if (matches) {
        matches.forEach(h => hashtags.add(h.toLowerCase()));
      }
    }

    return Array.from(hashtags);
  }
}
