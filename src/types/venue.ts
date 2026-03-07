/**
 * Venue Contact Interface
 * Contact information for venues - modern, flexible structure
 */
export interface VenueContact {
  id: number;
  venue_id: number;
  contact_name: string;
  role?: string | null;
  phpbb_user_id?: number | null;
  is_primary: boolean;

  // Contact methods
  phone_mobile?: string | null;
  phone_landline?: string | null;
  phone_other?: string | null;
  email?: string | null;
  website_url?: string | null;

  // Social/Messaging platforms
  whatsapp?: string | null;
  telegram?: string | null;
  signal?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter_x?: string | null;

  // Legacy
  fax?: string | null;

  // Additional
  notes?: string | null;
  language_preference?: string | null;

  // Validity period
  valid_from?: number | null;
  valid_to?: number | null;

  // Metadata
  is_public: boolean;
  is_verified: boolean;
  created_by_user_id?: number | null;
  created_at: string;
  updated_at: string;
}

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
  lat: string; // Backend returns 'lat' not 'latitude'
  long: string; // Backend returns 'long' not 'longitude'
  url: string;
  text?: string | null;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  added?: string; // Alternative to created_at from backend
  edited?: string; // Alternative to updated_at from backend
  approved: boolean;
  status?: VenueStatus;
  status_updated_at?: string | null;
  status_reason?: string | null;
  reopening_date?: string | null;
  contacts: VenueContact[]; // Contact information in relational table
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
  venue: string;
  country_id: string;
  state_id: string;
  city_id?: number;
  city: string;
  zip: string;
  address1: string;
  address2?: string;
  lat?: string;
  long?: string;
  url?: string;
  text?: string;
  status: VenueStatus;
  status_reason?: string;
  reopening_date?: string;
  approved?: boolean;
}

/**
 * Venue Contact Create/Update Request
 */
export interface VenueContactRequest {
  contact_name: string;
  role?: string;
  phpbb_user_id?: number;
  is_primary?: boolean;

  // Contact methods
  phone_mobile?: string;
  phone_landline?: string;
  phone_other?: string;
  email?: string;
  website_url?: string;

  // Social/Messaging platforms
  whatsapp?: string;
  telegram?: string;
  signal?: string;
  instagram?: string;
  facebook?: string;
  twitter_x?: string;

  // Legacy
  fax?: string;

  // Additional
  notes?: string;
  language_preference?: string;

  // Validity period
  valid_from?: number;
  valid_to?: number;

  // Metadata
  is_public?: boolean;
  is_verified?: boolean;
}

/**
 * Venue Contact Response
 */
export interface VenueContactResponse {
  success: boolean;
  contact: VenueContact;
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
