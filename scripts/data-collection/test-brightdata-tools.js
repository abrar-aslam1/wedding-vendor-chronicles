/**
 * Test Script for Bright Data MCP Tools
 * 
 * This script provides instructions for testing the Bright Data MCP tools
 * used for Instagram vendor collection. Since these tools need to be run
 * in the Cline environment, this script provides code snippets that can
 * be copied and pasted into the Cline console.
 */

console.log(`
=======================================================
  BRIGHT DATA MCP TOOLS TEST INSTRUCTIONS
=======================================================

This script provides instructions for testing the Bright Data MCP tools
used for Instagram vendor collection. These tools need to be run in the
Cline environment, so you'll need to copy and paste the code snippets
below into the Cline console.

1. Make sure the Bright Data MCP server is running:
   \`\`\`
   npx @brightdata/mcp
   \`\`\`

2. Test the search_engine tool:
   \`\`\`javascript
   const searchResults = await use_mcp_tool(
     'github.com/luminati-io/brightdata-mcp',
     'search_engine',
     {
       query: "dallas wedding photographer instagram",
       engine: 'google'
     }
   );
   console.log(JSON.stringify(searchResults, null, 2));
   \`\`\`

3. Extract an Instagram URL from the search results:
   \`\`\`javascript
   let instagramUrl = null;
   if (searchResults && Array.isArray(searchResults)) {
     for (const result of searchResults) {
       const url = result.url || '';
       if (url.includes('instagram.com/') && !url.includes('/p/')) {
         instagramUrl = url;
         break;
       }
     }
   }
   console.log("Instagram URL:", instagramUrl);
   \`\`\`

4. Test the web_data_instagram_profiles tool:
   \`\`\`javascript
   const profileData = await use_mcp_tool(
     'github.com/luminati-io/brightdata-mcp',
     'web_data_instagram_profiles',
     {
       url: instagramUrl // Use the URL from step 3
     }
   );
   console.log(JSON.stringify(profileData, null, 2));
   \`\`\`

5. Test the web_data_instagram_posts tool:
   \`\`\`javascript
   const postsData = await use_mcp_tool(
     'github.com/luminati-io/brightdata-mcp',
     'web_data_instagram_posts',
     {
       url: profileData.profile_url || \`https://www.instagram.com/\${profileData.username}/\`
     }
   );
   console.log(JSON.stringify(postsData, null, 2));
   \`\`\`

These tests will verify that the Bright Data MCP tools are working correctly
and provide examples of the data structure returned by each tool.

=======================================================
`);
