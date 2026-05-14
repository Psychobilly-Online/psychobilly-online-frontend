import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CreateEventWizard from '../CreateEventWizard/CreateEventWizard';
import type { CreateEventFormData } from '../CreateEventWizard/types';

// ---------------------------------------------------------------------------
// Infrastructure mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useAuthorization', () => ({
  useAuthorization: () => ({ token: 'test-token', user: { username: 'tester' } }),
}));

// WizardStepper is purely visual — stub it out
vi.mock('@/components/events/WizardStepper', () => ({
  default: ({ activeStep }: { activeStep: number }) => (
    <div data-testid="stepper">Step {activeStep + 1}</div>
  ),
}));

// ---------------------------------------------------------------------------
// Step component stubs
// Each stub renders a "fill" button that calls onChange with valid data for
// that step, letting tests drive wizard state without real API calls.
// ---------------------------------------------------------------------------

vi.mock('@/components/events/CreateEventWizard/steps/LocationStep', () => ({
  default: ({ onChange }: { onChange: (p: Partial<CreateEventFormData>) => void }) => (
    <div data-testid="location-step">
      <button
        onClick={() =>
          onChange({ countryId: 1, countryName: 'Germany', city: 'Berlin', cityId: null })
        }
      >
        Fill Location
      </button>
    </div>
  ),
}));

vi.mock('@/components/events/CreateEventWizard/steps/VenueStep', () => ({
  default: ({ onChange }: { onChange: (p: Partial<CreateEventFormData>) => void }) => (
    <div data-testid="venue-step">
      <button onClick={() => onChange({ venueId: 5, venueName: 'Punk Cave', isNewVenue: false })}>
        Select Existing Venue
      </button>
      <button
        onClick={() =>
          onChange({
            venueId: null,
            isNewVenue: true,
            newVenue: { name: 'New Venue', city: 'Berlin', address1: '', zip: '', countryId: 1 },
            venueName: 'New Venue',
          })
        }
      >
        Fill New Venue
      </button>
      <button
        onClick={() =>
          onChange({ venueId: null, isNewVenue: true, newVenue: null, venueName: '' })
        }
      >
        Start New Venue Empty
      </button>
    </div>
  ),
}));

vi.mock('@/components/events/CreateEventWizard/steps/EventDetailsStep', () => ({
  default: ({ onChange }: { onChange: (p: Partial<CreateEventFormData>) => void }) => (
    <div data-testid="event-details-step">
      <button onClick={() => onChange({ categoryId: 2, dateStart: '2026-08-01', dateEnd: '2026-08-01', days: [{ date: '2026-08-01', label: 'Day 1', bands: [] }] })}>
        Fill Single Day
      </button>
      <button
        onClick={() =>
          onChange({
            categoryId: 2,
            dateStart: '2026-08-01',
            dateEnd: '2026-08-03',
            isMultiDay: true,
            days: [
              { date: '2026-08-01', label: 'Day 1', bands: [] },
              { date: '2026-08-02', label: 'Day 2', bands: [] },
              { date: '2026-08-03', label: 'Day 3', bands: [] },
            ],
          })
        }
      >
        Fill Multi Day
      </button>
    </div>
  ),
}));

vi.mock('@/components/events/CreateEventWizard/steps/BandsStep', () => ({
  default: () => <div data-testid="bands-step" />,
}));

vi.mock('@/components/events/CreateEventWizard/steps/AdditionalInfoStep', () => ({
  default: () => <div data-testid="additional-info-step" />,
}));

// ReviewStep stub — exposes buttons to trigger onSuccess / onPending callbacks
vi.mock('@/components/events/CreateEventWizard/steps/ReviewStep', () => ({
  default: ({
    formData,
    onSuccess,
    onPending,
    setSubmitting,
  }: {
    formData: CreateEventFormData;
    onSuccess: (id: number) => void;
    onPending: () => void;
    setSubmitting: (v: boolean) => void;
  }) => (
    <div data-testid="review-step">
      <span data-testid="review-days">{formData.days.length}</span>
      <span data-testid="review-new-venue">{formData.isNewVenue ? 'new' : 'existing'}</span>
      <span data-testid="review-venue-name">{formData.venueName}</span>
      <button
        onClick={() => {
          setSubmitting(true);
          onSuccess(99);
        }}
      >
        Submit Approved
      </button>
      <button
        onClick={() => {
          setSubmitting(true);
          onPending();
        }}
      >
        Submit Pending
      </button>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Advance through wizard steps using visible button labels. */
const clickNext = () => userEvent.click(screen.getByRole('button', { name: 'Next' }));
const clickReview = () => userEvent.click(screen.getByRole('button', { name: 'Review' }));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreateEventWizard', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  // -------------------------------------------------------------------------
  // Step gating — canProceed
  // -------------------------------------------------------------------------

  describe('Step 0 (Location) — canProceed gating', () => {
    it('Next is disabled when location is empty', () => {
      render(<CreateEventWizard />);
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('Next is enabled after filling country and city', async () => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });
  });

  describe('Step 1 (Venue) — canProceed gating', () => {
    const advanceToVenueStep = async () => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
    };

    it('Next is disabled when no venue is selected and isNewVenue is false', async () => {
      await advanceToVenueStep();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('Next is enabled when an existing venue is selected', async () => {
      await advanceToVenueStep();
      await userEvent.click(screen.getByRole('button', { name: 'Select Existing Venue' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    it('Next is disabled when isNewVenue is true but form is empty', async () => {
      await advanceToVenueStep();
      await userEvent.click(screen.getByRole('button', { name: 'Start New Venue Empty' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('Next is enabled when isNewVenue is true and name + city are filled', async () => {
      await advanceToVenueStep();
      await userEvent.click(screen.getByRole('button', { name: 'Fill New Venue' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });
  });

  describe('Step 2 (Event Details) — canProceed gating', () => {
    const advanceToDetailsStep = async () => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Select Existing Venue' }));
      await clickNext();
    };

    it('Next is disabled when category and date are missing', async () => {
      await advanceToDetailsStep();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('Next is enabled after filling category and date', async () => {
      await advanceToDetailsStep();
      await userEvent.click(screen.getByRole('button', { name: 'Fill Single Day' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });
  });

  describe('Steps 3 & 4 — always passthrough', () => {
    const advanceToBandsStep = async () => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Select Existing Venue' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Fill Single Day' }));
      await clickNext();
    };

    it('Next is enabled on Bands step without any bands added', async () => {
      await advanceToBandsStep();
      expect(screen.getByTestId('bands-step')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    it('Review button is enabled on Additional Info step', async () => {
      await advanceToBandsStep();
      await clickNext();
      expect(screen.getByTestId('additional-info-step')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Review' })).toBeEnabled();
    });
  });

  // -------------------------------------------------------------------------
  // Date range → days forwarded to ReviewStep
  // -------------------------------------------------------------------------

  describe('Date range generates correct days array', () => {
    const advanceToReview = async (fillDetails: string) => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Select Existing Venue' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: fillDetails }));
      await clickNext();
      await clickNext();
      await clickReview();
    };

    it('passes a single-day entry to ReviewStep for single-day events', async () => {
      await advanceToReview('Fill Single Day');
      expect(screen.getByTestId('review-days').textContent).toBe('1');
    });

    it('passes three day entries to ReviewStep for a 3-day event', async () => {
      await advanceToReview('Fill Multi Day');
      expect(screen.getByTestId('review-days').textContent).toBe('3');
    });
  });

  // -------------------------------------------------------------------------
  // New venue path vs existing venue path
  // -------------------------------------------------------------------------

  describe('Venue path forwarded to ReviewStep', () => {
    const advanceToReviewWithVenue = async (venueButton: string) => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: venueButton }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Fill Single Day' }));
      await clickNext();
      await clickNext();
      await clickReview();
    };

    it('forwards isNewVenue=false and venue name when existing venue is selected', async () => {
      await advanceToReviewWithVenue('Select Existing Venue');
      expect(screen.getByTestId('review-new-venue').textContent).toBe('existing');
      expect(screen.getByTestId('review-venue-name').textContent).toBe('Punk Cave');
    });

    it('forwards isNewVenue=true and venue name when new venue is filled', async () => {
      await advanceToReviewWithVenue('Fill New Venue');
      expect(screen.getByTestId('review-new-venue').textContent).toBe('new');
      expect(screen.getByTestId('review-venue-name').textContent).toBe('New Venue');
    });
  });

  // -------------------------------------------------------------------------
  // Successful submit redirects
  // -------------------------------------------------------------------------

  describe('Submit redirects', () => {
    const advanceToReview = async () => {
      render(<CreateEventWizard />);
      await userEvent.click(screen.getByRole('button', { name: 'Fill Location' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Select Existing Venue' }));
      await clickNext();
      await userEvent.click(screen.getByRole('button', { name: 'Fill Single Day' }));
      await clickNext();
      await clickNext();
      await clickReview();
    };

    it('redirects to /events/:id when event is auto-approved', async () => {
      await advanceToReview();
      await userEvent.click(screen.getByRole('button', { name: 'Submit Approved' }));
      expect(mockPush).toHaveBeenCalledWith('/events/99');
    });

    it('redirects to /events/pending when event awaits approval', async () => {
      await advanceToReview();
      await userEvent.click(screen.getByRole('button', { name: 'Submit Pending' }));
      expect(mockPush).toHaveBeenCalledWith('/events/pending');
    });
  });
});
