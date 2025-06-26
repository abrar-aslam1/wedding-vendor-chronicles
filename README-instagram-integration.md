# Instagram Vendors Integration

This document describes the integration of Instagram vendors into the photography category search results.

## Overview

Instagram vendors are now displayed alongside Google Maps results when users search for photographers. This provides a more comprehensive view of wedding photographers, including those who primarily operate through Instagram.

## Changes Made

### 1. Updated Search Types (`src/types/search.ts`)
- Added Instagram-specific fields to `SearchResult` interface:
  - `instagram_handle`: The vendor's Instagram handle
  - `follower_count`: Number of Instagram followers
  - `post_count`: Number of Instagram posts
  - `is_verified`: Whether the Instagram account is verified
  - `is_business_account`: Whether it's a business account
  - `bio`: Instagram bio text
  - `profile_image_url`: Instagram profile image URL
  - `vendor_source`: Identifies if vendor is from 'google_maps' or 'instagram'

### 2. Enhanced Search Function (`supabase/functions/search-vendors/index.ts`)
- Added Supabase client integration to query Instagram vendors
- Instagram vendors are fetched when searching for photographers
- Location and subcategory filtering applied to Instagram vendors
- Instagram results are prioritized (shown first) as they're more wedding-focused
- Combined results from both Google Maps and Instagram sources

### 3. Updated VendorCard Component (`src/components/search/VendorCard.tsx`)
- Added Instagram badge for Instagram vendors
- Display Instagram-specific information:
  - Instagram handle with @ symbol
  - Follower count with user-friendly formatting
  - Verification status with checkmark icon
- Enhanced contact info to include Instagram handle links

### 4. VendorContactInfo Component
- Already supported Instagram links properly
- Updated to use `instagram_handle` field from Instagram vendors

## Features

### Instagram Vendor Display
- **Instagram Badge**: Pink/purple gradient badge indicating Instagram source
- **Follower Count**: Displayed with user icon and formatted numbers
- **Verification Status**: Blue checkmark for verified accounts
- **Instagram Handle**: Clickable @handle that opens Instagram profile
- **Profile Images**: Uses Instagram profile images when available

### Search Integration
- **Automatic Detection**: Instagram vendors automatically included for photographer searches
- **Location Filtering**: Instagram vendors filtered by city/state
- **Subcategory Support**: Instagram vendors can be filtered by photography style
- **Priority Display**: Instagram vendors shown first in results

### Data Sources
- **Google Maps**: Traditional business listings with ratings and reviews
- **Instagram**: Social media focused photographers with follower metrics

## Database Schema

The integration uses the existing `instagram_vendors` table with the following relevant fields:
- `instagram_handle`: Unique Instagram username
- `business_name`: Display name for the vendor
- `category`: Set to 'photographers' for photography vendors
- `subcategory`: Photography style/specialization
- `follower_count`: Number of Instagram followers
- `is_verified`: Verification status
- `bio`: Instagram bio description
- `profile_image_url`: Profile picture URL
- `location`, `city`, `state`: Geographic information

## User Experience

### For Users
1. **Comprehensive Results**: See both traditional businesses and Instagram photographers
2. **Social Proof**: View follower counts and verification status
3. **Direct Access**: Click to visit Instagram profiles
4. **Visual Distinction**: Clear badges identify Instagram vendors

### For Vendors
1. **Increased Visibility**: Instagram photographers now appear in search results
2. **Social Metrics**: Follower counts displayed as credibility indicators
3. **Direct Traffic**: Users can easily visit Instagram profiles
4. **Wedding Focus**: Prioritized display for wedding-specific searches

## Technical Implementation

### Search Flow
1. User searches for photographers in a location
2. System queries both DataForSEO API and Instagram vendors table
3. Results are combined with Instagram vendors prioritized
4. Subcategory filtering applied to both sources
5. Combined results displayed with appropriate badges and information

### Error Handling
- Instagram vendor queries are wrapped in try-catch blocks
- If Instagram integration fails, Google Maps results still display
- Graceful degradation ensures search functionality remains intact

## Future Enhancements

### Potential Improvements
1. **Expand to Other Categories**: Add Instagram integration for other vendor types
2. **Real-time Sync**: Periodic updates of Instagram vendor data
3. **Enhanced Filtering**: More sophisticated Instagram-specific filters
4. **Analytics**: Track user engagement with Instagram vs Google Maps vendors
5. **Reviews Integration**: Combine Instagram comments with Google reviews

### Additional Features
1. **Instagram Portfolio**: Display recent Instagram posts in vendor details
2. **Hashtag Analysis**: Use Instagram hashtags for better categorization
3. **Engagement Metrics**: Show likes, comments, and engagement rates
4. **Story Highlights**: Display Instagram story highlights for portfolios

## Testing

To test the Instagram integration:

1. **Search for Photographers**: Navigate to photography category
2. **Check for Instagram Badge**: Look for pink/purple Instagram badges
3. **Verify Information**: Confirm follower counts and handles display
4. **Test Links**: Click Instagram handles to verify they open correctly
5. **Location Filtering**: Test searches in different cities
6. **Subcategory Filtering**: Test with different photography styles

## Deployment Notes

- Ensure Supabase environment variables are configured in Edge Functions
- Instagram vendors table should be populated with photography data
- Test in staging environment before production deployment
- Monitor search performance with combined data sources

## Conclusion

The Instagram vendors integration significantly enhances the photography search experience by providing access to a broader range of wedding photographers, particularly those who primarily operate through social media platforms. This creates a more comprehensive and modern vendor discovery experience for users planning their weddings.
