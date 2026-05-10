'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { StyledTextField, StyledAutocomplete } from '@/components/common/form';
import ActionButton from '@/components/common/ActionButton';
import { type CreateEventFormData, type NewVenueData } from '../types';
import styles from './steps.module.css';

interface VenueResult {
  id: number;
  venue: string;   // API returns "venue", not "name"
  city?: string;
  address1?: string;
  zip?: string;
  isCreate?: true;
}

interface VenueStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function VenueStep({ formData, onChange }: VenueStepProps) {
  const [venues, setVenues] = useState<VenueResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(formData.venueName ?? '');
  const [showNewVenueForm, setShowNewVenueForm] = useState(formData.isNewVenue);
  const [newVenue, setNewVenue] = useState<NewVenueData>(
    formData.newVenue ?? {
      name: '',
      address1: '',
      zip: '',
      city: formData.city,
      countryId: formData.countryId,
    },
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchVenues = useCallback((search?: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.set('search', search);
    if (formData.countryId) params.set('country_id', String(formData.countryId));
    if (formData.city) params.set('city', formData.city);

    fetch(`/api/venues?${params}`, { signal })
      .then((r) => r.json())
      .then((data) => setVenues(Array.isArray(data.data) ? data.data : []))
      .catch((err) => { if (err.name !== 'AbortError') setVenues([]); })
      .finally(() => setLoading(false));
  }, [formData.countryId, formData.city]);

  // Cleanup debounce timer and in-flight request on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // Load initial venues when country/city is set
  useEffect(() => {
    if (!formData.countryId) return;
    fetchVenues();
  }, [formData.countryId, formData.city, fetchVenues]);

  const handleInputChange = (_: unknown, value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVenues(value || undefined), 350);
  };

  const selectedVenue = formData.venueId
    ? (venues.find((v) => v.id === formData.venueId) ?? null)
    : null;

  const handleNewVenueChange = (field: keyof NewVenueData, value: string | number | null) => {
    const updated = { ...newVenue, [field]: value };
    setNewVenue(updated);
    onChange({ newVenue: updated, venueId: null, venueName: updated.name });
  };

  const startNewVenue = (prefillName: string) => {
    const fresh: NewVenueData = {
      name: prefillName,
      address1: '',
      zip: '',
      city: formData.city,
      countryId: formData.countryId,
    };
    setNewVenue(fresh);
    setShowNewVenueForm(true);
    onChange({ isNewVenue: true, venueId: null, venueName: prefillName, newVenue: fresh });
    setInputValue('');
  };

  const cancelNewVenue = () => {
    setShowNewVenueForm(false);
    onChange({ isNewVenue: false, newVenue: null });
  };

  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Where is the venue?
      </Typography>

      {!showNewVenueForm && (
        <div className={styles.field}>
          <label className={styles.label}>
            Venue{formData.city ? ` in ${formData.city}` : ''}
          </label>
          <StyledAutocomplete<VenueResult>
            options={venues}
            getOptionLabel={(o) => (o.isCreate ? '' : o.venue)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            filterOptions={(options) => [...options, { id: -1, venue: '', isCreate: true }]}
            openOnFocus
            loading={loading}
            value={selectedVenue}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={(_, option) => {
              if (!option) {
                onChange({ venueId: null, venueName: '', isNewVenue: false, newVenue: null });
                setInputValue('');
              } else if (option.isCreate) {
                startNewVenue(inputValue);
              } else {
                onChange({ venueId: option.id, venueName: option.venue, isNewVenue: false, newVenue: null });
                setInputValue(option.venue);
              }
            }}
            renderOption={(props, option) => {
              if (option.isCreate) {
                return (
                  <li {...props} key="__create__">
                    <span style={{ color: 'var(--color-accent-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      + Add {inputValue ? `"${inputValue}"` : 'a new venue'}
                    </span>
                  </li>
                );
              }
              return (
                <li {...props} key={option.id}>
                  <div>
                    <div style={{ fontSize: '0.9rem' }}>{option.venue}</div>
                    {(option.address1 || option.city) && (
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                        {[option.address1, option.city].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </li>
              );
            }}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                placeholder="Search venues…"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && <CircularProgress color="inherit" size={14} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <p className={styles.hint}>
            Open air event? Add a new venue named &ldquo;Open Air&rdquo;.
          </p>
        </div>
      )}

      {showNewVenueForm && (
        <>
          <ActionButton variant="secondary" size="small" onClick={cancelNewVenue}>
            ← Search existing venues
          </ActionButton>
          <div className={styles.newVenueForm}>
            <div className={styles.field}>
              <label htmlFor="nv-name" className={styles.label}>Venue name *</label>
              <StyledTextField
                id="nv-name"
                value={newVenue.name}
                onChange={(e) => handleNewVenueChange('name', e.target.value)}
                placeholder="Venue name"
                size="small"
                fullWidth
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="nv-address" className={styles.label}>Street address</label>
              <StyledTextField
                id="nv-address"
                value={newVenue.address1}
                onChange={(e) => handleNewVenueChange('address1', e.target.value)}
                placeholder="Street address"
                size="small"
                fullWidth
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="nv-zip" className={styles.label}>ZIP / Postal code</label>
              <StyledTextField
                id="nv-zip"
                value={newVenue.zip}
                onChange={(e) => handleNewVenueChange('zip', e.target.value)}
                placeholder="ZIP / Postal code"
                size="small"
                fullWidth
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="nv-city" className={styles.label}>City *</label>
              <StyledTextField
                id="nv-city"
                value={newVenue.city}
                onChange={(e) => handleNewVenueChange('city', e.target.value)}
                placeholder="City"
                size="small"
                fullWidth
              />
            </div>
            <p className={styles.hint}>
              Country will be set to <strong>{formData.countryName}</strong>. You can add more details later in the venue admin.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
