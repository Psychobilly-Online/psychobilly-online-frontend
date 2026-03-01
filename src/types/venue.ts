/**
 * Venue Status Types
 * Represents the operational status of a venue
 */
export type VenueStatus = 'active' | 'closed' | 'temp_closed';

/**
 * Venue Interface
 * Complete venue data structure from API
 */
export interface Venue {
  id: number;
  name: string;
  street?: string | null;
  zip?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  website?: string | null;
  status: VenueStatus;
  latitude?: number | null;
  longitude?: number | null;
  event_count?: number; // Included in list responses
  created_at?: string;
  updated_at?: string;
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
 */
export interface VenueUpdateRequest {
  name: string;
  street?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  status: VenueStatus;
  latitude?: number;
  longitude?: number;
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
