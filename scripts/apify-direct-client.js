/**
 * Direct Apify API Client
 * 
 * This module provides direct REST API integration with Apify actors,
 * bypassing the need for MCP server configuration.
 * 
 * Usage:
 *   const client = new ApifyDirectClient(process.env.APIFY_API_TOKEN);
 *   const profiles = await client.enrichInstagramProfiles(['username1', 'username2']);
 */

// Node 18+ has built-in fetch, no import needed
// If using older Node, uncomment: import fetch from 'node-fetch';

export class ApifyDirectClient {
  constructor(apiToken) {
    if (!apiToken) {
      throw new Error('APIFY_API_TOKEN is required');
    }
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.apify.com/v2';
  }

  /**
   * Enrich Instagram profiles using Apify's instagram-profile-scraper
   * @param {string[]} usernames - Array of Instagram usernames to enrich
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Enriched profile data
   */
  async enrichInstagramProfiles(usernames, options = {}) {
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      console.warn('No usernames provided for enrichment');
      return [];
    }

    console.log(`🔍 Enriching ${usernames.length} Instagram profiles via Apify...`);

    try {
      // Step 1: Start the actor run
      const runResponse = await this.startActorRun('apify~instagram-scraper', {
        directUrls: usernames.map(u => `https://www.instagram.com/${u}/`),
        resultsLimit: usernames.length,
        ...options
      });

      if (!runResponse.data || !runResponse.data.id) {
        throw new Error('Failed to start Apify actor run');
      }

      const runId = runResponse.data.id;
      console.log(`✅ Actor run started: ${runId}`);

      // Step 2: Wait for the run to complete
      const runData = await this.waitForRunCompletion(runId);

      // Step 3: Get the results from the dataset
      const results = await this.getRunResults(runData.defaultDatasetId);

      console.log(`✅ Enriched ${results.length} profiles successfully`);
      return results;

    } catch (error) {
      console.error('❌ Error enriching Instagram profiles:', error.message);
      throw error;
    }
  }

  /**
   * Start an Apify actor run
   * @private
   */
  async startActorRun(actorId, input) {
    const url = `${this.baseUrl}/acts/${actorId}/runs`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Wait for an actor run to complete
   * @private
   */
  async waitForRunCompletion(runId, maxWaitTime = 300000) {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const runData = await this.getRunStatus(runId);
      
      if (runData.status === 'SUCCEEDED') {
        return runData;
      } else if (runData.status === 'FAILED' || runData.status === 'ABORTED') {
        throw new Error(`Actor run ${runData.status.toLowerCase()}`);
      }

      // Still running, wait and poll again
      console.log(`⏳ Run status: ${runData.status}... waiting ${pollInterval/1000}s`);
      await this.sleep(pollInterval);
    }

    throw new Error(`Actor run timed out after ${maxWaitTime/1000} seconds`);
  }

  /**
   * Get the current status of an actor run
   * @private
   */
  async getRunStatus(runId) {
    const url = `${this.baseUrl}/actor-runs/${runId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get run status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get results from a dataset
   * @private
   */
  async getRunResults(datasetId) {
    const url = `${this.baseUrl}/datasets/${datasetId}/items`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get dataset items: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Simple sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Search for Instagram profiles (using search actors)
   * Note: This is a placeholder - you may need to use a different actor
   * or implement Instagram hashtag search separately
   */
  async searchInstagramProfiles(searchTerms, limit = 40) {
    console.log(`🔍 Searching Instagram with terms: ${searchTerms}`);
    
    // For now, return empty array as this requires additional actor setup
    // You would typically use a search actor or hashtag scraper here
    console.warn('⚠️  Instagram search not yet implemented - using enrichment only');
    return [];
  }
}

// Export for CommonJS compatibility
export default ApifyDirectClient;
