export interface SearchResult {
  id: string;
  title: string;
  place_id: string;
  main_image?: string;
  snippet?: string;
  rating?: Rating;
  phone?: string;
  address?: string;
  url?: string;
}

export interface Rating {
  value: number;
  votes_count: number;
  rating_type: string;
  rating_max?: number;
}