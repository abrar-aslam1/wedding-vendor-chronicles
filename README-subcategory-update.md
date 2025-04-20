# Vendor Subcategory Feature Update

This update adds subcategories to multiple vendor types, improving the user experience by allowing users to filter vendors by specific specialties and styles.

## Subcategories Added

### Wedding Planners
- Full-Service Planning
- Day-of Coordination
- Partial Planning
- Destination Wedding Planning
- Cultural Wedding Specialists

### Photographers
- Traditional Photography
- Photojournalistic
- Fine Art
- Aerial Photography
- Engagement Specialists

### Florists
- Modern Arrangements
- Classic/Traditional
- Rustic/Bohemian
- Minimalist
- Luxury/Extravagant

### Venues
- Ballrooms
- Barns & Farms
- Beach/Waterfront
- Gardens & Parks
- Historic Buildings
- Hotels & Resorts
- Wineries & Vineyards
- Industrial Spaces

### DJs & Bands
- DJs
- Live Bands
- Solo Musicians
- Orchestras
- Cultural Music Specialists

## Database Changes

This update:
1. Creates new tables for each category's subcategories (planner_types, photographer_types, florist_types, venue_types, entertainment_types)
2. Populates these tables with the appropriate subcategories
3. Sets up proper foreign key relationships to the vendor_subcategories table
4. Enables Row Level Security with appropriate policies

## Frontend Changes

The SearchForm component has been updated to:
1. Fetch subcategories from the appropriate tables based on the selected category
2. Display subcategories with appropriate labels and descriptions
3. Enable selection of subcategories for filtering search results
4. Require subcategory selection when subcategories are available for a category

## Applying the Database Migration

To add the new subcategories to your database, you need to apply the migration file. There are two ways to do this:

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI set up and connected to your project:

```bash
npx supabase migration up
```

### Option 2: Manual SQL Execution

If you don't have the CLI set up or prefer to run the SQL directly:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the SQL from `supabase/migrations/20250421000000_add_vendor_subcategory_types.sql` and execute it

## Testing the Changes

After applying the migration, you should:

1. Navigate to the search page
2. Select each category that has subcategories (Wedding Planners, Photographers, Florists, Venues, DJs & Bands)
3. Verify that the appropriate subcategories appear for each category
4. Select a subcategory and verify that the search results are filtered correctly
5. Check that the subcategory is displayed on the vendor cards and in the search results header
