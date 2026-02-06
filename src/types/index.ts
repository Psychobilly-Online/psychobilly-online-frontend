// Event Types
export interface Event {
  id: number;
  headline: string;
  date: string; // ISO date string
  time?: string;
  venue_id?: number;
  venue_name?: string;
  city?: string;
  state?: string;
  country?: string;
  country_iso?: string;
  description?: string;
  ticket_link?: string;
  event_link?: string;
  flyer_link?: string;
  image?: string; // Image ID for image service
  category_id?: number;
  category_name?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  approved?: boolean;
}

// Venue Types
export interface Venue {
  id: number;
  name: string;
  street?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  country_iso?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Filter/Query Types
export interface EventFilters {
  page?: number;
  limit?: number;
  country?: string;
  category?: number;
  from?: string; // ISO date
  to?: string; // ISO date
  search?: string;
  approved?: boolean;
}
