export interface LocationCode {
  code: number;
  cities: {
    [key: string]: number;
  };
}

export interface LocationCodes {
  [state: string]: LocationCode;
}

export interface Rating {
  value: number;
  rating_max?: number | null;
  rating_type?: string;
  votes_count?: number;
  count?: number; // Added for compatibility with RatingDisplay component
}

export interface BusinessHours {
  day: string;
  opens: string;
  closes: string;
}

export interface Review {
  author: string;
  text: string;
  rating: number;
  date?: string;
}

export interface SearchResult {
  [key: string]: any;
  title: string;
  description: string;
  rating?: Rating;
  phone?: string;
  address?: string;
  url?: string;
  place_id?: string;
  main_image?: string;
  images?: string[];
  // New fields to enhance schema markup
  latitude?: number;
  longitude?: number;
  business_hours?: BusinessHours[];
  price_range?: string;
  payment_methods?: string[];
  service_area?: string[];
  categories?: string[];
  reviews?: Review[];
  year_established?: string;
  email?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  snippet?: string;
  // Instagram vendor specific fields
  instagram_handle?: string;
  follower_count?: number;
  post_count?: number;
  is_verified?: boolean;
  is_business_account?: boolean;
  bio?: string;
  profile_image_url?: string;
  vendor_source?: 'google' | 'instagram' | 'database';
}

export interface DataForSEOResponse {
  tasks?: Array<{
    result?: Array<{
      items?: SearchResult[];
    }>;
  }>;
}
