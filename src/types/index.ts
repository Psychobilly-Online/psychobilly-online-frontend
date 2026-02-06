// Event Types
export interface Event {
  id: number;
  headline: string;
  date_start: string; // ISO date string
  date_end?: string;
  bands?: string;
  text?: string; // Description
  venue_id?: number;
  city?: string;
  state_id?: string;
  country_id?: string;
  link?: string; // Event link
  image?: string; // Image ID for image service
  category_id?: number;
  user_id?: number;
  contact_id?: number;
  create_date?: string;
  edit_date?: string;
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
  status?: string; // 'approved', 'pending', 'rejected'
}
