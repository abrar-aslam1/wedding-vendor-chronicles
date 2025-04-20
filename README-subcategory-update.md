# Vendor Subcategories Update

This document outlines the subcategories that have been added for each vendor type in the Wedding Vendor Chronicles application.

## Implementation Details

Subcategories have been implemented for all vendor categories to allow users to filter vendors by specific specialties or services. The subcategories are currently hardcoded in the `src/config/subcategories.ts` file, which can be easily updated or extended as needed.

The implementation includes:
- A new configuration file with hardcoded subcategories for each vendor type
- Updated SearchForm component to display appropriate subcategories based on the selected vendor category
- Proper slug conversion to ensure category names match between the UI and the data structure

## Subcategories by Vendor Type

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

### Caterers
- American
- Italian
- Mexican
- Indian
- Chinese
- Mediterranean
- Japanese
- Thai
- French
- Spanish
- Middle Eastern

## Future Enhancements

In the future, these hardcoded subcategories can be replaced with data from the database. The current implementation includes commented-out code that attempts to fetch subcategories from the database tables:

- `cuisine_types` for Caterers
- `planner_types` for Wedding Planners
- `photographer_types` for Photographers
- `florist_types` for Florists
- `venue_types` for Venues
- `entertainment_types` for DJs & Bands

To transition to database-driven subcategories:
1. Create the necessary database tables (a migration file has been created for cuisine types)
2. Populate the tables with the subcategory data
3. Uncomment and update the database fetch code in the SearchForm component
4. Test to ensure the subcategories are being fetched correctly

## User Experience

The subcategories appear as buttons after a user selects a vendor category. The user must select a subcategory before they can search for vendors, ensuring more targeted and relevant search results.

The subcategory selection UI includes:
- A clear heading indicating what type of subcategory to select
- A brief description explaining the purpose of the subcategory selection
- Buttons for each subcategory that highlight when selected
