export interface LocationCode {
  code: number;
  cities: {
    [key: string]: number;
  };
}

export interface LocationCodes {
  [state: string]: LocationCode;
}

export interface SearchResult {
  [key: string]: any; // Add index signature to satisfy Json type
  title: string;
  description: string;
  rating?: {
    rating_value?: number;
    rating_count?: number;
  };
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