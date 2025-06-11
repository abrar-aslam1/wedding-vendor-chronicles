# Instagram Vendor Collection for Wedding Vendor Chronicles

This document outlines the process for collecting wedding vendor data from Instagram and storing it in the Supabase database.

## Overview

The Instagram vendor collection system searches for wedding vendors in Dallas, TX on Instagram, extracts their profile information, and stores it in a structured format in the Supabase database. The system uses the Bright Data MCP tools to search for and extract data from Instagram.

## Database Structure

The system creates a new table called `instagram_vendors` in the Supabase database with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| instagram_handle | Text | Instagram username |
| business_name | Text | Business name from Instagram profile |
| category | Text | Vendor category (e.g., photographers, wedding-planners) |
| subcategory | Text | Vendor subcategory (e.g., Traditional Photography, Full-Service Planning) |
| website_url | Text | Website URL from Instagram profile |
| email | Text | Email from Instagram profile |
| phone | Text | Phone number from Instagram profile |
| follower_count | Integer | Number of followers |
| post_count | Integer | Number of posts |
| bio | Text | Instagram bio text |
| profile_image_url | Text | URL of profile image |
| is_verified | Boolean | Whether the account is verified |
| is_business_account | Boolean | Whether it's a business account |
| location | Text | Default: 'Dallas, TX' |
| city | Text | Default: 'Dallas' |
| state | Text | Default: 'TX' |
| created_at | Timestamp | Creation timestamp |
| updated_at | Timestamp | Update timestamp |

## Files

The system consists of the following files:

1. `supabase/migrations/20250518000000_create_instagram_vendors_table.sql` - Database migration to create the `instagram_vendors` table
2. `scripts/data-collection/collect-instagram-vendors.js` - Main script for collecting Instagram vendor data
3. `scripts/data-collection/run-instagram-collection.sh` - Shell script to run the migration and data collection

## How It Works

The data collection process follows these steps:

1. **Search for Instagram Profiles**: For each vendor category (photographers, wedding planners, etc.), the system searches for Instagram profiles using the Bright Data `search_engine` tool.

2. **Extract Profile Data**: For each Instagram URL found, the system extracts profile data using the Bright Data `web_data_instagram_profiles` tool.

3. **Filter Wedding Vendors**: The system filters the profiles to ensure they're wedding-related by checking for wedding-related keywords in the bio.

4. **Analyze Network**: For top vendors (by search result order), the system analyzes their recent posts to find mentioned accounts, which might also be wedding vendors.

5. **Categorize Vendors**: The system determines the vendor category and subcategory based on bio text and profile data.

6. **Structure Data**: The system formats the vendor data according to the database schema.

7. **Insert into Database**: The system inserts the structured data into the Supabase database.

## Vendor Categories

The system collects data for the following vendor categories:

- Wedding Planners
- Photographers
- Videographers
- Florists
- Caterers
- Venues
- DJs & Bands
- Cake Designers
- Bridal Shops
- Makeup Artists
- Hair Stylists

## Usage

### Testing the Bright Data MCP Tools

Before running the full collection process, you can test that the Bright Data MCP tools are working correctly:

1. Make sure the Bright Data MCP server is running:
   ```
   npx @brightdata/mcp
   ```

2. Run the test script to get instructions:
   ```
   node scripts/data-collection/test-brightdata-tools.js
   ```

The test script provides instructions and code snippets for testing the three Bright Data tools used in the collection process:
- `search_engine` - Searches for Instagram profiles
- `web_data_instagram_profiles` - Extracts profile data
- `web_data_instagram_posts` - Extracts post data

Since these tools need to be run in the Cline environment, the script provides code snippets that can be copied and pasted into the Cline console. This will help you verify that the tools are working correctly and understand the data structure returned by each tool.

### Running the Collection Process

To run the full Instagram vendor collection process:

1. Make sure the Bright Data MCP server is running:
   ```
   npx @brightdata/mcp
   ```

2. Run the collection script:
   ```
   ./scripts/data-collection/run-instagram-collection.sh
   ```

This will:
- Apply the database migration to create the `instagram_vendors` table
- Run the data collection script to collect and store vendor data

### Viewing the Collected Data

To view the Instagram vendor data that has been collected:

```
node scripts/data-collection/view-instagram-vendors.js [category] [limit]
```

Parameters:
- `category` (optional): Filter by vendor category (e.g., photographers, wedding-planners)
- `limit` (optional): Maximum number of vendors to display (default: 10)

Examples:
```
# View all vendors (limited to 10)
node scripts/data-collection/view-instagram-vendors.js

# View photographers (limited to 10)
node scripts/data-collection/view-instagram-vendors.js photographers

# View 20 wedding planners
node scripts/data-collection/view-instagram-vendors.js wedding-planners 20
```

## Customization

To customize the data collection process:

- **Add/Remove Categories**: Edit the `VENDOR_CATEGORIES` array in `collect-instagram-vendors.js`
- **Modify Subcategories**: Edit the `VENDOR_SUBCATEGORIES` object in `collect-instagram-vendors.js`
- **Change Location**: Update the default city and state values in the `structureData` function

## Rate Limiting

The script includes delays between API calls to avoid rate limiting:
- 2 seconds between profile data extractions
- 3 seconds between post analyses
- 5 seconds between categories

## Error Handling

The script includes comprehensive error handling:
- Each API call is wrapped in a try/catch block
- Errors are logged but don't stop the entire process
- The script processes data in batches to prevent timeouts

## Dependencies

- Supabase client for database operations
- Bright Data MCP tools for Instagram data collection
- Supabase CLI for database migrations

## Prerequisites

Before running the collection process, make sure you have:

1. **Docker Desktop** installed and running:
   Docker Desktop is required for running Supabase locally. You can download it from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. Supabase local development server running:
   ```
   npx supabase start
   ```
   
   If you're using a remote Supabase instance, you'll need to update the connection settings in the scripts.

3. Bright Data MCP server running:
   ```
   npx @brightdata/mcp
   ```

### Alternative: Using Remote Supabase

If you prefer to use a remote Supabase instance instead of running it locally:

1. Update the Supabase connection settings in `src/integrations/supabase/client.js`
2. Modify the `run-instagram-collection.sh` script to skip the local Supabase check
3. Apply the migration manually through the Supabase dashboard or API

## Notes

- The script is designed to be run periodically to update the vendor database
- It uses upsert operations to avoid duplicates
- The script prioritizes vendors with wedding-related content in their bios
- The data collection script must be run in the Cline environment where the `use_mcp_tool` function is available
