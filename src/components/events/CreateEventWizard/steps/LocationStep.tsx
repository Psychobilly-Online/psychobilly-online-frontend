'use client';

import { useEffect, useRef, useState } from 'react';
import { Typography, Chip, CircularProgress, Box } from '@mui/material';
import { StyledTextField, StyledAutocomplete } from '@/components/common/form';
import { useMetadata } from '@/contexts/MetadataContext';
import { type CreateEventFormData } from '../types';
import styles from './steps.module.css';

interface City {
  name: string;
  label: string;
  variation: string;
  country_id: string;
}

interface Country {
  id: number;
  name: string;
  print_name?: string;
  iso?: string;
}



interface LocationStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function LocationStep({ formData, onChange }: LocationStepProps) {
  // Countries that already have events — used for the quick-select chips
  const { countries: eventCountries } = useMetadata();
  // All countries — fetched separately so users can create events anywhere
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityInputValue, setCityInputValue] = useState(formData.city);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch all countries (not just active ones) so users can create events anywhere
  useEffect(() => {
    fetch('/api/countries/all')
      .then((r) => r.json())
      .then((data) => setCountries(Array.isArray(data.data) ? data.data : []))
      .catch(() => setCountries([]));
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (!formData.countryId || formData.countryId === -1) {
      setCities([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingCities(true);
    fetch(`/api/cities?country_id=${formData.countryId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (abortRef.current !== controller) return;
        setCities(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setCities([]);
      })
      .finally(() => {
        if (abortRef.current === controller) setLoadingCities(false);
      });

    return () => {
      controller.abort();
    };
  }, [formData.countryId]);

  const handleCountrySelect = (country: Country) => {
    // Reset city and all venue-dependent fields when country changes
    onChange({
      countryId: country.id,
      countryName: country.print_name ?? country.name,
      city: '',
      cityId: null,
      venueId: null,
      venueName: '',
      isNewVenue: false,
      newVenue: null,
    });
    setCityInputValue('');
  };

  // Autocomplete searches all countries (chips are a convenience shortcut, not a filter)
  const otherCountries = countries;
  const showOtherAutocomplete =
    formData.countryId !== null && !eventCountries.some((c) => c.id === formData.countryId);

  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Where is the event?
      </Typography>

      <div className={styles.field}>
        <Typography variant="body2" className={styles.label}>
          Country
        </Typography>
        <div className={styles.chipGroup}>
          {eventCountries.map((country) => (
            <Chip
              key={country.id}
              label={country.print_name ?? country.name}
              onClick={() => handleCountrySelect(country)}
              variant={formData.countryId === country.id ? 'filled' : 'outlined'}
              className={formData.countryId === country.id ? styles.chipActive : styles.chip}
            />
          ))}
          {/* "Other" chip — always visible; filled when the current selection is not in the chip list */}
          <Chip
            label="Other…"
            onClick={() => onChange({ countryId: -1, countryName: '', city: '', cityId: null })}
            variant={showOtherAutocomplete ? 'filled' : 'outlined'}
            className={showOtherAutocomplete ? styles.chipActive : styles.chip}
          />
        </div>

        {/* Full autocomplete for "other" country selection */}
        {(formData.countryId === -1 || showOtherAutocomplete) && (
          <Box mt={1}>
            <StyledAutocomplete<Country>
              options={otherCountries}
              getOptionLabel={(o) => o.print_name ?? o.name}
              value={
                showOtherAutocomplete
                  ? (countries.find((c) => c.id === formData.countryId) ?? null)
                  : null
              }
              onChange={(_, country) => {
                if (country) handleCountrySelect(country);
              }}
              renderInput={(params) => (
                <StyledTextField {...params} placeholder="Search country…" size="small" />
              )}
            />
          </Box>
        )}
      </div>

      {formData.countryId && formData.countryId !== -1 && (
        <div className={styles.field}>
          <StyledAutocomplete<City, false, false, true>
            freeSolo
            openOnFocus
            options={cities}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.label || o.name)}
            isOptionEqualToValue={(a, b) => a.name === b.name}
            loading={loadingCities}
            inputValue={cityInputValue}
            onInputChange={(_, value, reason) => {
              setCityInputValue(value);
              // 'input': user typed — update city and reset venue (city changed).
              // 'clear': user clicked the × button — clear city and venue.
              // 'reset': MUI repopulates after option selected — onChange already wrote the canonical value.
              if (reason === 'input') {
                onChange({
                  city: value,
                  cityId: null,
                  venueId: null,
                  venueName: '',
                  isNewVenue: false,
                });
              } else if (reason === 'clear') {
                onChange({
                  city: '',
                  cityId: null,
                  venueId: null,
                  venueName: '',
                  isNewVenue: false,
                });
              }
            }}
            onChange={(_, value) => {
              if (value && typeof value !== 'string') {
                onChange({
                  city: value.name,
                  cityId: null,
                  venueId: null,
                  venueName: '',
                  isNewVenue: false,
                });
                setCityInputValue(value.label || value.name);
              }
            }}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="City"
                placeholder="Search or type city name…"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCities && <CircularProgress color="inherit" size={14} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Typography variant="caption" className={styles.hint}>
            If the city is not in the list, just type it in.
          </Typography>
        </div>
      )}
    </div>
  );
}
