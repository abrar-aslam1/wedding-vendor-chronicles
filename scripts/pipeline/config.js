/**
 * Pipeline Configuration
 * Central config for the Instagram vendor discovery pipeline.
 */

import { config } from 'dotenv';
config();

export const CATEGORIES = {
  photographer: {
    label: 'Wedding Photographer',
    dbCategory: 'wedding-photographers',
    hashtags: [
      '#weddingphotographer', '#weddingphotography', '#bridalphotographer',
      '#engagementphotographer', '#weddingphoto'
    ],
    searchTerms: ['wedding photographer', 'bridal photographer'],
    minFollowers: 500
  },
  planner: {
    label: 'Wedding Planner',
    dbCategory: 'wedding-planners',
    hashtags: [
      '#weddingplanner', '#weddingcoordinator', '#eventplanner',
      '#weddingplanning', '#dayofcoordinator'
    ],
    searchTerms: ['wedding planner', 'wedding coordinator'],
    minFollowers: 1000
  },
  venue: {
    label: 'Wedding Venue',
    dbCategory: 'venues',
    hashtags: [
      '#weddingvenue', '#eventvenue', '#receptionvenue',
      '#weddingvenues', '#ceremonyvenue'
    ],
    searchTerms: ['wedding venue', 'event venue'],
    minFollowers: 500
  },
  florist: {
    label: 'Wedding Florist',
    dbCategory: 'florists',
    hashtags: [
      '#weddingflorist', '#weddingflowers', '#bridalflowers',
      '#floraldesigner', '#weddingflorals'
    ],
    searchTerms: ['wedding florist', 'bridal florist'],
    minFollowers: 300
  },
  makeup_artist: {
    label: 'Makeup Artist',
    dbCategory: 'makeup-artists',
    hashtags: [
      '#bridalmakeup', '#weddingmakeup', '#makeupartist',
      '#bridalmua', '#weddingmua'
    ],
    searchTerms: ['bridal makeup artist', 'wedding makeup'],
    minFollowers: 500
  },
  videographer: {
    label: 'Wedding Videographer',
    dbCategory: 'videographers',
    hashtags: [
      '#weddingvideographer', '#weddingvideo', '#weddingfilm',
      '#weddingcinematography', '#weddingfilmmaker'
    ],
    searchTerms: ['wedding videographer', 'wedding filmmaker'],
    minFollowers: 300
  }
};

// General wedding hashtags for broad discovery
export const GENERAL_HASHTAGS = [
  '#weddingvendor', '#weddingvendors', '#bride2026', '#bride2027',
  '#weddinginspo', '#weddingday', '#bridetobe'
];

export const TIER_1_CITIES = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Miami', state: 'FL' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Boston', state: 'MA' },
  { city: 'San Francisco', state: 'CA' }
];

export const TIER_2_CITIES = [
  { city: 'Austin', state: 'TX' },
  { city: 'Denver', state: 'CO' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Portland', state: 'OR' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Tampa', state: 'FL' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Washington', state: 'DC' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Raleigh', state: 'NC' }
];

export const ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE,
  APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
  INGEST_KEY: process.env.INGEST_SHARED_KEY,
  APP_URL: process.env.APP_URL || 'http://localhost:3000'
};

// Apify actor IDs (use ~ separator for the REST API)
export const APIFY_ACTORS = {
  HASHTAG_SCRAPER: 'apify~instagram-hashtag-scraper',
  PROFILE_SCRAPER: 'apify~instagram-profile-scraper',
  POST_SCRAPER: 'apify~instagram-post-scraper',
  GENERAL_SCRAPER: 'apify~instagram-scraper'
};

// Pipeline defaults
export const DEFAULTS = {
  MAX_PROFILES_PER_HASHTAG: 50,
  MAX_PROFILES_PER_SEARCH: 30,
  ENRICHMENT_BATCH_SIZE: 25,
  INGEST_BATCH_SIZE: 25,
  MIN_FOLLOWERS_FILTER: 200,
  MIN_POSTS_FILTER: 10
};
