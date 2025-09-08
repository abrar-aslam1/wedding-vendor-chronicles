/**
 * MCP Instagram Collector
 * Safely integrates Bright Data MCP to fetch Instagram profile data
 * without disrupting the existing instagram-vendor-collection system.
 *
 * Usage:
 *   const mcpInstagramCollector = require('./mcpInstagramCollector');
 *   await mcpInstagramCollector.collectProfiles(['https://www.instagram.com/vendor_handle/']);
 *
 * Environment flags:
 *   USE_MCP_IG_COLLECTION=true|false
 *   MCP_PRIORITY_OVER_SCRAPER=true|false
 */

import dotenv from 'dotenv';
dotenv.config();

// Import use_mcp_tool from the MCP runtime if available in Cline environment
// In Node.js outside Cline, this will throw unless replaced/mocked
let use_mcp_tool;
try {
  ({ use_mcp_tool } = await import('@modelcontextprotocol/client'));
} catch {
  console.warn('⚠️ MCP runtime not available, use_mcp_tool will be undefined');
}

const USE_MCP = process.env.USE_MCP_IG_COLLECTION === 'true';
const MCP_PRIORITY = process.env.MCP_PRIORITY_OVER_SCRAPER === 'true';

/**
 * Fetch structured Instagram profile data using Bright Data MCP.
 * @param {string[]} profileUrls - Array of Instagram profile URLs.
 * @returns {Promise<Object[]>} - Array of profile data objects.
 */
async function fetchInstagramProfiles(profileUrls) {
  const results = [];

  for (const url of profileUrls) {
    try {
      if (typeof use_mcp_tool !== 'function') {
        console.warn(`⚠️ MCP tool function not available, skipping MCP fetch for ${url}`);
        continue;
      }
      const response = await use_mcp_tool({
        server_name: 'github.com/luminati-io/brightdata-mcp',
        tool_name: 'web_data_instagram_profiles',
        arguments: { url }
      });
      if (response && response.success) {
        results.push({ url, data: response });
      } else {
        console.warn(`MCP Bright Data did not return profile data for: ${url}`);
      }
    } catch (err) {
      console.error(`Error fetching via MCP for ${url}:`, err.message);
    }
  }

  return results;
}

/**
 * Main collection logic.
 * @param {string[]} profileUrls
 * @param {Function} fallbackCollector - Optional fallback function (existing scraper) if MCP fails.
 */
async function collectProfiles(profileUrls, fallbackCollector) {
  if (!USE_MCP) {
    console.log('MCP Instagram collection disabled, falling back to legacy scraper.');
    if (fallbackCollector) return fallbackCollector(profileUrls);
    return [];
  }

  const mcpData = await fetchInstagramProfiles(profileUrls);

  // If MCP priority is off, use MCP only for missing fields
  if (!MCP_PRIORITY && fallbackCollector) {
    const missingProfiles = profileUrls.filter(
      url => !mcpData.find(p => p.url === url && p.data)
    );
    if (missingProfiles.length > 0) {
      console.log(`Collecting ${missingProfiles.length} profiles via fallback scraper...`);
      const fallbackData = await fallbackCollector(missingProfiles);
      return [...mcpData, ...fallbackData];
    }
  }

  return mcpData;
}

export { collectProfiles };
