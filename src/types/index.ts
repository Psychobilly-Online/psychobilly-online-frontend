// Event Types
export interface Event {
  id: number;
  headline: string;
  date_start: string; // ISO date string
  date_end?: string;
  bands?: string;
  text?: string; // Description
  venue_id?: number;
  venue?: {
    name?: string;
    url?: string;
    street?: string;
    zip?: string;
    city?: string;
    city_variation?: string;
    state?: string;
    country_id?: string; // ISO2 country code (e.g., "DE", "US")
    country?: string; // Full country name
    latitude?: string;
    longitude?: string;
  };
  city?: string;
  state_id?: string;
  country_id?: string;
  link?: string; // Event link
  image?: string; // Image ID for image service
  legacy_image?: string; // Legacy image path
  category_id?: number;
  category?: string; // Category name
  genres?: string; // Comma-separated genre names
  user_id?: number;
  contact_id?: number;
  create_date?: string;
  edit_date?: string;
  approved?: boolean;
  ticket_price?: string;
  ticket_url?: string;
  url?: string; // Event website URL
  // Multi-day event data (only in detail response)
  days?: EventDay[];
}

// Event Day for multi-day events
export interface EventDay {
  id: number;
  date: string; // YYYY-MM-DD
  label?: string; // e.g., "Friday", "Day 1"
  bands: string[]; // Array of band names for this day
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
  search?: string;
  country_id?: string[];
  city?: string;
  category_id?: string[];
  genre_id?: string[];
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  sort_by?: string;
  sort_order?: string;
  status?: string; // 'approved', 'pending', 'rejected'
}
