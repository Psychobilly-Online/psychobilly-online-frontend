'use client';

import { useEffect, useRef, useState } from 'react';
import { Typography, Chip, Switch } from '@mui/material';
import Link from 'next/link';
import { useMetadata } from '@/contexts/MetadataContext';
import { DatePickerField, StyledTextField } from '@/components/common/form';
import { type CreateEventFormData, type WizardDay } from '../types';
import styles from './steps.module.css';

interface EventDetailsStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

interface ExistingEvent {
  id: number;
  headline: string;
  date_start: string;
  date_end?: string;
  venue?: { city?: string };
  category?: string;
}

function SameDayEvents({ date, city }: { date: string; city: string }) {
  const [events, setEvents] = useState<ExistingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!date) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams({ from_date: date, to_date: date, limit: '20' });
    if (city) params.set('city', city);
    fetch(`/api/events?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (abortRef.current !== controller) return;
        setEvents(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setEvents([]);
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [date, city]);

  if (loading) return <p className={styles.hint}>Checking for existing events…</p>;
  if (!events.length) return null;

  return (
    <div className={styles.sameDayEvents}>
      <p className={styles.sameDayWarning}>
        {events.length} event{events.length !== 1 ? 's' : ''} already listed for this date
        {city ? ` in ${city}` : ''}. Make sure yours is not a duplicate.
      </p>
      <ul className={styles.sameDayList}>
        {events.map((e) => (
          <li key={e.id} className={styles.sameDayItem}>
            <Link
              href={`/events/${e.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sameDayLink}
            >
              <span className={styles.sameDayHeadline}>{e.headline}</span>
              {e.category && <span className={styles.sameDayMeta}>{e.category}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MAX_EVENT_DAYS = 14;

function generateDays(dateStart: string, dateEnd: string): WizardDay[] {
  const days: WizardDay[] = [];
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  let current = new Date(start);
  let i = 1;
  while (current <= end && i <= MAX_EVENT_DAYS) {
    const dateStr = current.toISOString().split('T')[0];
    days.push({ date: dateStr, label: `Day ${i}`, bands: [] });
    current.setDate(current.getDate() + 1);
    i++;
  }
  return days;
}

/** Returns an end date capped at MAX_EVENT_DAYS - 1 days after start. */
function clampDateEnd(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const diffDays = Math.round((e.getTime() - s.getTime()) / 86400000);
  if (diffDays >= MAX_EVENT_DAYS) {
    const capped = new Date(s);
    capped.setDate(capped.getDate() + MAX_EVENT_DAYS - 1);
    return capped.toISOString().split('T')[0];
  }
  return end;
}

export default function EventDetailsStep({ formData, onChange }: EventDetailsStepProps) {
  const { categories, genres } = useMetadata();

  const handleDateStartChange = (value: string) => {
    const rawEnd = formData.isMultiDay && formData.dateEnd >= value ? formData.dateEnd : value;
    const dateEnd = clampDateEnd(value, rawEnd);
    const days = generateDays(value, dateEnd);
    onChange({ dateStart: value, dateEnd, days, wasClamped: dateEnd !== rawEnd });
  };

  const handleMultiDayToggle = (checked: boolean) => {
    if (!checked) {
      // Revert to single day
      const days = formData.dateStart ? generateDays(formData.dateStart, formData.dateStart) : [];
      onChange({ isMultiDay: false, dateEnd: formData.dateStart, days, wasClamped: false });
    } else {
      onChange({ isMultiDay: true, wasClamped: false });
    }
  };

  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Event details
      </Typography>

      {/* Category */}
      <div className={styles.field}>
        <label className={styles.label}>Event type *</label>
        <div className={styles.chipGroup}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              onClick={() => onChange({ categoryId: cat.id })}
              variant={formData.categoryId === cat.id ? 'filled' : 'outlined'}
              className={formData.categoryId === cat.id ? styles.chipActive : styles.chip}
            />
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className={styles.field}>
        <label className={styles.label}>Genres</label>
        <div className={styles.chipGroup}>
          {genres.map((g) => {
            const active = formData.genreIds.includes(g.id);
            return (
              <Chip
                key={g.id}
                label={g.name}
                onClick={() => {
                  const next = active
                    ? formData.genreIds.filter((id) => id !== g.id)
                    : [...formData.genreIds, g.id];
                  onChange({ genreIds: next });
                }}
                variant={active ? 'filled' : 'outlined'}
                className={active ? styles.chipActive : styles.chip}
              />
            );
          })}
        </div>
        <p className={styles.hint}>
          Genres from bands added in the next step will be merged automatically.
        </p>
      </div>

      {/* Multi-day toggle */}
      <div className={styles.field}>
        <label className={styles.label}>Event duration</label>
        <div className={styles.switchRow}>
          <Switch
            checked={formData.isMultiDay}
            onChange={(e) => handleMultiDayToggle(e.target.checked)}
            size="small"
            inputProps={{ 'aria-label': 'Multi-day event' }}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-accent-primary)' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--color-accent-primary)',
              },
            }}
          />
          <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
            Multi-day event
          </span>
        </div>
      </div>

      {/* Date(s) */}
      <div className={styles.field}>
        <label htmlFor={formData.isMultiDay ? 'date-range' : 'date-start'} className={styles.label}>
          {formData.isMultiDay ? 'Date range *' : 'Date *'}
        </label>
        {formData.isMultiDay ? (
          <>
            <DatePickerField
              mode="range"
              id="date-range"
              startValue={formData.dateStart}
              endValue={formData.dateEnd}
              onRangeChange={(start, end) => {
                const clampedEnd = clampDateEnd(start, end);
                const days = generateDays(start, clampedEnd);
                onChange({
                  dateStart: start,
                  dateEnd: clampedEnd,
                  days,
                  wasClamped: clampedEnd !== end,
                });
              }}
            />
            {formData.days.length > 1 && (
              <p className={styles.hint}>
                {formData.days.length} days — you can assign bands per day in the next step.
              </p>
            )}
            {formData.dateStart && formData.dateEnd && formData.wasClamped && (
              <p className={styles.hint} style={{ color: 'var(--color-warning, #f59e0b)' }}>
                Events are limited to {MAX_EVENT_DAYS} days. End date has been adjusted.
              </p>
            )}
          </>
        ) : (
          <DatePickerField
            id="date-start"
            value={formData.dateStart}
            onChange={handleDateStartChange}
          />
        )}
      </div>

      {/* Existing events on same date */}
      {formData.dateStart && <SameDayEvents date={formData.dateStart} city={formData.city} />}

      {/* Headline */}
      <div className={styles.field}>
        <label htmlFor="event-title" className={styles.label}>
          Event title
        </label>
        <StyledTextField
          id="event-title"
          value={formData.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="e.g. Psychobilly Rumble 2026"
          size="small"
          fullWidth
          inputProps={{ maxLength: 255 }}
        />
        <p className={styles.hint}>
          {formData.headline.length}/255 — leave blank to auto-generate from bands
        </p>
      </div>
    </div>
  );
}
