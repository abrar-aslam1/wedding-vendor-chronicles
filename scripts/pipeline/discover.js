/**
 * Discovery Module
 * Finds Instagram wedding vendor profiles via hashtag search, location search,
 * and competitor follower scraping using Apify.
 */

import { ApifyDirectClient } from '../apify-direct-client.js';
import { CATEGORIES, GENERAL_HASHTAGS, APIFY_ACTORS, DEFAULTS, ENV } from './config.js';

export class VendorDiscovery {
  constructor(logger) {
    this.logger = logger;
    this.apify = new ApifyDirectClient(ENV.APIFY_API_TOKEN);
    this.discovered = new Map(); // username -> profile stub
  }

  /**
   * Discover vendors by hashtag for a specific category + city
   */
  async discoverByHashtag(category, city, state, options = {}) {
    const catConfig = CATEGORIES[category];
    if (!catConfig) throw new Error(`Unknown category: ${category}`);

    const limit = options.limit || DEFAULTS.MAX_PROFILES_PER_HASHTAG;
    const citySlug = city.toLowerCase().replace(/\s+/g, '');

    // Build city-specific hashtags
    const cityHashtags = catConfig.hashtags.map(h => {
      const base = h.replace('#', '');
      return `#${citySlug}${base.replace('wedding', '')}`;
    });

    // Combine with generic category hashtags, strip # prefix (Apify requirement)
    const allHashtags = [...catConfig.hashtags, ...cityHashtags]
      .slice(0, 5)
      .map(h => h.replace(/^#/, ''));

    this.logger.info(`Discovering ${catConfig.label} in ${city}, ${state} via hashtags`, {
      hashtags: allHashtags,
      limit
    });

    try {
      const results = await this.apify.startActorRun(APIFY_ACTORS.HASHTAG_SCRAPER, {
        hashtags: allHashtags,
        resultsLimit: limit
      });

      if (!results?.data?.id) {
        this.logger.warn('Hashtag scraper returned no run ID');
        return [];
      }

      const runData = await this.apify.waitForRunCompletion(results.data.id);
      const posts = await this.apify.getRunResults(runData.defaultDatasetId);

      // Extract unique usernames from posts
      const profiles = [];
      for (const post of posts) {
        const username = post.ownerUsername || post.owner?.username;
        if (!username || this.discovered.has(username.toLowerCase())) continue;

        const stub = {
          username: username.toLowerCase(),
          category,
          dbCategory: catConfig.dbCategory,
          city,
          state,
          country: 'US',
          source: 'hashtag_discovery',
          discoveredFrom: post.hashtags?.[0] || allHashtags[0]
        };

        this.discovered.set(username.toLowerCase(), stub);
        profiles.push(stub);
      }

      this.logger.success(`Found ${profiles.length} unique profiles from hashtags in ${city}`, {
        category,
        total_discovered: this.discovered.size
      });

      return profiles;
    } catch (err) {
      this.logger.error(`Hashtag discovery failed for ${category} in ${city}`, {
        error: err.message
      });
      return [];
    }
  }

  /**
   * Discover vendors via location-specific hashtags
   * (Apify's profile-scraper takes usernames, not search queries — so we use
   *  city-prefixed hashtags as our location discovery channel.)
   */
  async discoverByLocation(category, city, state, options = {}) {
    const catConfig = CATEGORIES[category];
    if (!catConfig) throw new Error(`Unknown category: ${category}`);

    const limit = options.limit || DEFAULTS.MAX_PROFILES_PER_SEARCH;
    const citySlug = city.toLowerCase().replace(/\s+/g, '');
    const stateSlug = state.toLowerCase();

    // Strong location-targeting hashtags
    const locationHashtags = [
      `${citySlug}wedding`,
      `${citySlug}weddings`,
      `${citySlug}bride`,
      `${stateSlug}wedding`,
      `${citySlug}${catConfig.dbCategory.replace('wedding-', '').replace('s', '')}`
    ].slice(0, 5);

    this.logger.info(`Discovering via location hashtags for ${city}`, {
      hashtags: locationHashtags,
      limit
    });

    try {
      const results = await this.apify.startActorRun(APIFY_ACTORS.HASHTAG_SCRAPER, {
        hashtags: locationHashtags,
        resultsLimit: limit
      });

      if (!results?.data?.id) {
        this.logger.warn('Location hashtag scrape returned no run ID');
        return [];
      }

      const runData = await this.apify.waitForRunCompletion(results.data.id);
      const posts = await this.apify.getRunResults(runData.defaultDatasetId);

      const profiles = [];
      for (const post of posts) {
        const username = (post.ownerUsername || post.owner?.username || '').toLowerCase();
        if (!username || this.discovered.has(username)) continue;

        const stub = {
          username,
          category,
          dbCategory: catConfig.dbCategory,
          city,
          state,
          country: 'US',
          source: 'location_hashtag',
          discoveredFrom: locationHashtags[0]
        };

        this.discovered.set(username, stub);
        profiles.push(stub);
      }

      this.logger.success(`Found ${profiles.length} profiles from location hashtags`, {
        total_discovered: this.discovered.size
      });

      return profiles;
    } catch (err) {
      this.logger.error(`Location discovery failed for ${category} in ${city}`, {
        error: err.message
      });
      return [];
    }
  }

  /**
   * Discover vendors by scraping followers of known competitor accounts
   */
  async discoverFromCompetitors(competitorHandles, category, city, state, options = {}) {
    const catConfig = CATEGORIES[category];
    const limit = options.limit || 50;

    this.logger.info(`Scraping followers from ${competitorHandles.length} competitor accounts`, {
      competitors: competitorHandles,
      limit
    });

    try {
      const results = await this.apify.startActorRun(APIFY_ACTORS.PROFILE_SCRAPER, {
        directUrls: competitorHandles.map(h => `https://www.instagram.com/${h}/followers/`),
        resultsLimit: limit
      });

      if (!results?.data?.id) {
        this.logger.warn('Competitor follower scrape returned no run ID');
        return [];
      }

      const runData = await this.apify.waitForRunCompletion(results.data.id);
      const followers = await this.apify.getRunResults(runData.defaultDatasetId);

      const profiles = [];
      for (const follower of followers) {
        const username = (follower.username || '').toLowerCase();
        if (!username || this.discovered.has(username)) continue;

        // Only keep profiles that look like businesses
        if (follower.isBusinessAccount || (follower.followerCount && follower.followerCount > 500)) {
          const stub = {
            username,
            category,
            dbCategory: catConfig?.dbCategory || category,
            city,
            state,
            country: 'US',
            source: 'competitor_followers',
            discoveredFrom: competitorHandles[0]
          };

          this.discovered.set(username, stub);
          profiles.push(stub);
        }
      }

      this.logger.success(`Found ${profiles.length} potential vendors from competitor followers`);
      return profiles;
    } catch (err) {
      this.logger.error('Competitor follower discovery failed', { error: err.message });
      return [];
    }
  }

  /**
   * Run full discovery for a city + category combination
   */
  async discoverAll(category, city, state, options = {}) {
    this.logger.info(`=== Full discovery: ${category} in ${city}, ${state} ===`);

    const hashtagProfiles = await this.discoverByHashtag(category, city, state, options);
    const locationProfiles = await this.discoverByLocation(category, city, state, options);

    // Competitor discovery is optional — only if handles are provided
    let competitorProfiles = [];
    if (options.competitorHandles?.length) {
      competitorProfiles = await this.discoverFromCompetitors(
        options.competitorHandles, category, city, state, options
      );
    }

    const allProfiles = [...hashtagProfiles, ...locationProfiles, ...competitorProfiles];

    this.logger.success(`Discovery complete: ${allProfiles.length} profiles for ${category} in ${city}`, {
      hashtag: hashtagProfiles.length,
      location: locationProfiles.length,
      competitor: competitorProfiles.length
    });

    return allProfiles;
  }

  /** Get all discovered profiles */
  getAllDiscovered() {
    return Array.from(this.discovered.values());
  }

  /** Get count */
  get count() {
    return this.discovered.size;
  }
}
