'use client';

import { useEffect, useState } from 'react';
import { Typography, Chip, CircularProgress, Box } from '@mui/material';
import { useMetadata } from '@/contexts/MetadataContext';
import { StyledTextField, StyledAutocomplete } from '@/components/common/form';
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

// How many countries to show as quick-select chips
const COMMON_COUNTRY_LIMIT = 10;

interface LocationStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
}

export default function LocationStep({ formData, onChange }: LocationStepProps) {
  const { countries } = useMetadata();
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityInputValue, setCityInputValue] = useState(formData.city);

  // Fetch cities when country changes
  useEffect(() => {
    if (!formData.countryId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    fetch(`/api/cities?country_id=${formData.countryId}`)
      .then((r) => r.json())
      .then((data) => {
        setCities(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [formData.countryId]);

  const handleCountrySelect = (country: Country) => {
    // Reset city when country changes
    onChange({
      countryId: country.id,
      countryName: country.print_name ?? country.name,
      city: '',
      cityId: null,
    });
    setCityInputValue('');
  };

  const popularCountries = countries.slice(0, COMMON_COUNTRY_LIMIT);
  const otherCountries = countries.slice(COMMON_COUNTRY_LIMIT);
  const showOtherAutocomplete =
    formData.countryId !== null && !popularCountries.some((c) => c.id === formData.countryId);

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
          {popularCountries.map((country) => (
            <Chip
              key={country.id}
              label={country.print_name ?? country.name}
              onClick={() => handleCountrySelect(country)}
              variant={formData.countryId === country.id ? 'filled' : 'outlined'}
              className={formData.countryId === country.id ? styles.chipActive : styles.chip}
            />
          ))}
          {/* "Other" option — only shown if current selection isn't in the chip list */}
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
          <Typography variant="body2" className={styles.label}>
            City
          </Typography>
          <StyledAutocomplete<City, false, false, true>
            freeSolo
            openOnFocus
            options={cities}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.label || o.name)}
            isOptionEqualToValue={(a, b) => a.name === b.name}
            loading={loadingCities}
            inputValue={cityInputValue}
            onInputChange={(_, value) => {
              setCityInputValue(value);
              onChange({ city: value, cityId: null });
            }}
            onChange={(_, value) => {
              if (value && typeof value !== 'string') {
                onChange({ city: value.name, cityId: null });
                setCityInputValue(value.label || value.name);
              }
            }}
            renderInput={(params) => (
              <StyledTextField
                {...params}
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
