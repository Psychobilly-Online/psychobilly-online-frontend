'use client';

import { useState, useEffect } from 'react';
import { Typography, Alert } from '@mui/material';
import ActionButton from '@/components/common/ActionButton';
import { type CreateEventFormData } from '../types';
import styles from './steps.module.css';

interface DuplicateEvent {
  id: number;
  headline: string;
  date_start: string;
  venue?: { name?: string };
}

interface ReviewStepProps {
  formData: CreateEventFormData;
  token: string | null;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
  onSuccess: (eventId: number) => void;
  onPending: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ReviewStep({
  formData,
  token,
  submitting,
  setSubmitting,
  onSuccess,
  onPending,
}: ReviewStepProps) {
  const [duplicates, setDuplicates] = useState<DuplicateEvent[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Run duplicate check when component mounts (or venue/date changes)
  useEffect(() => {
    const venueId = formData.venueId;
    if (!venueId || !formData.dateStart) return;

    setCheckingDuplicates(true);
    const allBands = formData.days.flatMap((d) => d.bands.map((b) => b.name)).join(', ');
    fetch('/api/events/check-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_start: formData.dateStart,
        venue_id: venueId,
        headline: formData.headline || undefined,
        bands: allBands || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setDuplicates(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => setDuplicates([]))
      .finally(() => setCheckingDuplicates(false));
  }, [formData.venueId, formData.dateStart, formData.headline, formData.days]);

  const buildAutoHeadline = (): string => {
    const allBands = [
      ...new Set(formData.days.flatMap((d) => d.bands.map((b) => b.name)).filter(Boolean)),
    ];
    return allBands.slice(0, 5).join(', ') + (allBands.length > 5 ? ' + more' : '');
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setValidationErrors({});
    setSubmitting(true);

    try {
      let venueId = formData.venueId;

      // Step 1: Create venue if needed
      if (formData.isNewVenue && formData.newVenue) {
        const venueBody = {
          name: formData.newVenue.name,
          address1: formData.newVenue.address1 || undefined,
          zip: formData.newVenue.zip || undefined,
          city: formData.newVenue.city,
          country_id: formData.newVenue.countryId,
        };
        const venueRes = await fetch('/api/venues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(venueBody),
        });
        const venueData = await venueRes.json();
        if (!venueRes.ok) {
          setSubmitError(venueData.message || 'Failed to create venue');
          return;
        }
        venueId = venueData.data?.id ?? venueData.id;
      }

      // Step 2: Build headline (auto-generate if empty)
      const headline = formData.headline.trim() || buildAutoHeadline();
      if (!headline) {
        setSubmitError('Please enter an event title or add at least one band.');
        return;
      }

      // Collect genre IDs: event-level selection + genres selected for new bands
      const bandGenreIds = formData.days
        .flatMap((d) => d.bands)
        .filter((b) => b.genreId !== undefined)
        .map((b) => b.genreId as number);
      const allGenreIds = [...new Set([...formData.genreIds, ...bandGenreIds])];

      // Step 3: Create event
      const eventBody = {
        headline,
        date_start: formData.dateStart,
        date_end: formData.dateEnd !== formData.dateStart ? formData.dateEnd : undefined,
        venue_id: venueId,
        category_id: formData.categoryId,
        text: formData.text || undefined,
        url: formData.url || undefined,
        ticket_price: formData.ticketPrice || undefined,
        ticket_url: formData.ticketUrl || undefined,
        image: formData.image || undefined,
        genre_ids: allGenreIds.length > 0 ? allGenreIds : undefined,
        days: formData.days.map((day) => ({
          ...day,
          bands: day.bands.map((b) => b.name),
        })),
      };

      const eventRes = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventBody),
      });

      const eventData = await eventRes.json();

      if (!eventRes.ok) {
        if (eventData.validation_errors) {
          setValidationErrors(eventData.validation_errors);
        }
        setSubmitError(eventData.message || 'Failed to create event');
        return;
      }

      const createdEvent = eventData.data ?? eventData;
      const approved = createdEvent.approved;
      const newId = createdEvent.id;

      if (approved) {
        onSuccess(newId);
      } else {
        onPending();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const allBands = [...new Set(formData.days.flatMap((d) => d.bands.map((b) => b.name)))];
  const effectiveHeadline = formData.headline.trim() || (allBands.length > 0 ? buildAutoHeadline() : null);

  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Review &amp; Submit
      </Typography>

      <div className={styles.reviewSection}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Location</span>
          <span className={styles.reviewValue}>
            {formData.city}, {formData.countryName}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Venue</span>
          <span className={styles.reviewValue}>
            {formData.isNewVenue ? `${formData.newVenue?.name} (new)` : formData.venueName || '—'}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Date</span>
          <span className={styles.reviewValue}>
            {formatDate(formData.dateStart)}
            {formData.isMultiDay && formData.dateEnd !== formData.dateStart
              ? ` – ${formatDate(formData.dateEnd)}`
              : ''}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Title</span>
          <span className={styles.reviewValue}>
            {effectiveHeadline ?? (
              <em style={{ opacity: 0.6 }}>Auto-generated from bands</em>
            )}
          </span>
        </div>
        {formData.days.map((day) => (
          <div key={day.date} className={styles.reviewRow}>
            <span className={styles.reviewKey}>{day.label}</span>
            <span className={styles.reviewValue}>
              {day.bands.length > 0 ? day.bands.map((b) => b.name).join(', ') : <em style={{ opacity: 0.5 }}>No bands listed</em>}
            </span>
          </div>
        ))}
        {formData.text && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewKey}>Description</span>
            <span className={styles.reviewValue}>{formData.text}</span>
          </div>
        )}
        {formData.ticketPrice && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewKey}>Ticket price</span>
            <span className={styles.reviewValue}>{formData.ticketPrice}</span>
          </div>
        )}
      </div>

      {!checkingDuplicates && duplicates.length > 0 && (
        <div className={styles.duplicateWarning}>
          <strong>Possible duplicate detected:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
            {duplicates.map((d) => (
              <li key={d.id}>
                {d.headline} — {d.date_start} @ {d.venue?.name ?? 'unknown venue'}
              </li>
            ))}
          </ul>
          Please make sure this event is not already listed before submitting.
        </div>
      )}

      {submitError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {submitError}
          {Object.keys(validationErrors).length > 0 && (
            <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
              {Object.entries(validationErrors).map(([field, msg]) => (
                <li key={field}>
                  <strong>{field}:</strong> {msg}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <ActionButton
        variant="primary"
        size="large"
        onClick={handleSubmit}
        disabled={submitting || checkingDuplicates}
        loading={submitting}
      >
        {submitting ? 'Submitting…' : 'Submit Event'}
      </ActionButton>
    </div>
  );
}
