/**
 * Form state types for the event creation wizard.
 * These are internal wizard state types, separate from the API Event type.
 */

export interface NewVenueData {
  name: string;
  address1: string;
  zip: string;
  city: string;
  countryId: number | null;
}

export interface WizardBand {
  name: string;
  bandId?: number; // set when selected from the existing database
  genreId?: number; // required for new (unrecognised) bands
}

export interface WizardDay {
  date: string; // YYYY-MM-DD
  label: string; // "Day 1", "Day 2", ...
  bands: WizardBand[];
}

export interface CreateEventFormData {
  // Step 1 — Location
  countryId: number | null;
  countryName: string;
  city: string;
  cityId: number | null;

  // Step 2 — Venue
  venueId: number | null;
  venueName: string;
  isNewVenue: boolean;
  newVenue: NewVenueData | null;

  // Step 3 — Event Details
  categoryId: number | null;
  dateStart: string; // YYYY-MM-DD
  dateEnd: string; // YYYY-MM-DD (equals dateStart for single-day)
  isMultiDay: boolean;
  headline: string;

  // Step 3 — Event genres (manual selection, merged on submit with explicit genreId values chosen for new bands)
  genreIds: number[];

  // Step 4 — Bands (per day)
  days: WizardDay[];

  // Step 5 — Additional Info
  text: string;
  url: string;
  ticketPrice: string;
  ticketUrl: string;
}

export const INITIAL_FORM_DATA: CreateEventFormData = {
  countryId: null,
  countryName: '',
  city: '',
  cityId: null,
  venueId: null,
  venueName: '',
  isNewVenue: false,
  newVenue: null,
  categoryId: null,
  dateStart: '',
  dateEnd: '',
  isMultiDay: false,
  headline: '',
  genreIds: [],
  days: [],
  text: '',
  url: '',
  ticketPrice: '',
  ticketUrl: '',
};

export const WIZARD_STEPS = [
  'Location',
  'Venue',
  'Event Details',
  'Bands',
  'Additional Info',
  'Review & Submit',
] as const;

export type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5;
