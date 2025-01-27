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
  value?: number;
  rating_max?: number | null;
  rating_type?: string;
  votes_count?: number;
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
}

export interface DataForSEOResponse {
  tasks?: Array<{
    result?: Array<{
      items?: SearchResult[];
    }>;
  }>;
}