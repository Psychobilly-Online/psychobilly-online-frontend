/**
 * Venue Status Types
 * Represents the operational status of a venue
 */
export type VenueStatus = 'active' | 'temporarily_closed' | 'permanently_closed';

/**
 * Venue Interface
 * Complete venue data structure from API
 * Matches database schema in venues table
 */
export interface Venue {
  id: number;
  venue: string; // Backend returns 'venue' not 'name'
  country_id: string;
  state_id: string;
  city_id?: number | null;
  city: string;
  zip: string;
  address1: string;
  address2: string;
  latitude: string;
  longitude: string;
  contact: string;
  phone1: string;
  phone2: string;
  fax: string;
  email: string;
  url: string;
  text?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  approved: boolean;
  status: VenueStatus;
  status_updated_at?: string | null;
  status_reason?: string | null;
  reopening_date?: string | null;
  event_count?: number; // Included in list responses
  country_name?: string; // Joined from countries table
  state_name?: string; // Joined from states table
}

/**
 * Venue List API Response
 */
export interface VenueListResponse {
  venues: Venue[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Single Venue API Response
 */
export interface VenueResponse {
  success: boolean;
  venue: Venue;
}

/**
 * Venue Update Request
 * Fields that can be updated via API
 */
export interface VenueUpdateRequest {
  name: string;
  country_id: string;
  state_id: string;
  city_id?: number;
  city: string;
  zip: string;
  address1: string;
  address2?: string;
  latitude?: string;
  longitude?: string;
  contact?: string;
  phone1?: string;
  phone2?: string;
  fax?: string;
  email?: string;
  url?: string;
  text?: string;
  status: VenueStatus;
  status_reason?: string;
  reopening_date?: string;
  approved?: boolean;
}

/**
 * Venue Merge Request
 */
export interface VenueMergeRequest {
  primary_venue_id: number;
  merge_venue_ids: number[];
}

/**
 * Venue Merge Response
 */
export interface VenueMergeResponse {
  success: boolean;
  message: string;
  events_updated: number;
  venues_deleted: number;
}

/**
 * Venue Delete Response
 */
export interface VenueDeleteResponse {
  success: boolean;
  message: string;
}
