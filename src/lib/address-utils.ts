/**
 * Address formatting utilities for different countries
 */

export interface VenueAddress {
  name?: string;
  street?: string;
  zip?: string;
  city?: string;
  state?: string;
  country_id?: string;
  country?: string;
}

/**
 * Format a venue address based on country conventions
 * Returns an array of address lines
 */
export function formatVenueAddress(venue: VenueAddress): string[] {
  const lines: string[] = [];

  // Venue name
  if (venue.name) {
    lines.push(venue.name);
  }

  // Street address
  if (venue.street) {
    // US format: number first (e.g., "123 Main Street")
    // European format: street first (e.g., "Main Street 123")
    // We'll assume the data is already in the correct format from the database
    lines.push(venue.street);
  }

  // City, State, Zip - format depends on country
  // country_id = ISO2 code (e.g., "US"), country = print_name (e.g., "United States")
  const isUSA = venue.country_id === 'US' || venue.country === 'United States';

  if (isUSA) {
    // US Format: City, State Zip
    const cityLine: string[] = [];
    if (venue.city) cityLine.push(venue.city);
    if (venue.state) cityLine.push(venue.state);

    const cityStatePart = cityLine.join(', ');
    if (cityStatePart && venue.zip) {
      lines.push(`${cityStatePart} ${venue.zip}`);
    } else if (cityStatePart) {
      lines.push(cityStatePart);
    } else if (venue.zip) {
      lines.push(venue.zip);
    }
  } else {
    // European/Default Format: Zip City (no comma)
    const cityLine: string[] = [];
    if (venue.zip) cityLine.push(venue.zip);
    if (venue.city) cityLine.push(venue.city);

    if (cityLine.length > 0) {
      lines.push(cityLine.join(' '));
    }
  }

  // Country (always last)
  if (venue.country) {
    lines.push(venue.country);
  }

  return lines;
}

/**
 * Format a venue address as a single-line string (for compact display)
 */
export function formatVenueAddressInline(venue: VenueAddress): string {
  const parts: string[] = [];

  if (venue.street) parts.push(venue.street);

  const isUSA = venue.country_id === 'US' || venue.country === 'United States';

  if (isUSA) {
    const cityState: string[] = [];
    if (venue.city) cityState.push(venue.city);
    if (venue.state) cityState.push(venue.state);
    if (cityState.length > 0) parts.push(cityState.join(', '));
    // country_id = ISO2 code (e.g., "US"), country = print_name (e.g., "United States")
    if (venue.zip) parts.push(venue.zip);
  } else {
    if (venue.zip && venue.city) {
      parts.push(`${venue.zip} ${venue.city}`);
    } else if (venue.city) {
      parts.push(venue.city);
    }
  }

  if (venue.country) parts.push(venue.country);

  return parts.join(', ');
}
