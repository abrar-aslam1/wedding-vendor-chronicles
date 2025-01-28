export interface LocationCodes {
  [state: string]: {
    code: number;
    cities: {
      [city: string]: number;
    };
  };
}

export interface Rating {
  value: number;
  rating_max: number | null;
  rating_type?: string;
  votes_count?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  rating?: Rating;
  url?: string;
  address?: string;
  phone?: string;
  category?: string;
  images?: string[];
}