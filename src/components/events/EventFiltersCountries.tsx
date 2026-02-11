'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Chip, IconButton, Popover, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './EventFilters.module.css';
import type { Country } from './EventFilters.types';

interface EventFiltersCountriesProps {
  countries: Country[];
  selectedCountryIds: string[];
  selectedRegion?: string;
  countryLookup: Map<string, Country>;
  countryOpen: boolean;
  countryAnchor: HTMLElement | null;
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  onToggleCountry: (id: string) => void;
  onApplyCountries: (ids: string[]) => void;
  onFetchRegion: (region: string) => void;
  loadingRegion: string | null;
  showAllCountries: boolean;
  onShowAll: () => void;
  renderCountryLabel: (country: Country) => ReactNode;
  popoverPaperSx: object;
  popoverContainer?: HTMLElement | null;
}

export function EventFiltersCountries({
  countries,
  selectedCountryIds,
  selectedRegion,
  countryLookup,
  countryOpen,
  countryAnchor,
  onOpen,
  onClose,
  onToggleCountry,
  onApplyCountries,
  onFetchRegion,
  loadingRegion,
  showAllCountries,
  onShowAll,
  renderCountryLabel,
  popoverPaperSx,
  popoverContainer,
}: EventFiltersCountriesProps) {
  return (
    <div className={`${styles.formGroup} ${styles.countryGroup}`}>
      <button
        type="button"
        className={styles.countryTrigger}
        onClick={onOpen}
        aria-expanded={countryOpen}
        aria-haspopup="dialog"
      >
        <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
          {selectedCountryIds.length === 0 && <Chip label="All countries" variant="outlined" />}
          {selectedCountryIds.length > 0 && selectedRegion && (
            <Chip label={selectedRegion} onDelete={() => onApplyCountries([])} variant="outlined" />
          )}
          {selectedCountryIds.length > 0 &&
            !selectedRegion &&
            selectedCountryIds.map((id) => {
              const country = countryLookup.get(id);
              if (!country) return null;
              return (
                <Chip
                  key={id}
                  label={renderCountryLabel(country)}
                  onDelete={() => onToggleCountry(id)}
                  variant="outlined"
                />
              );
            })}
        </Stack>
      </button>
      <Popover
        open={countryOpen}
        anchorEl={countryAnchor}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        container={popoverContainer ?? undefined}
        marginThreshold={16}
        disablePortal
        PaperProps={{ sx: popoverPaperSx }}
      >
        <div className={styles.countryPopover}>
          <div className={styles.popoverHeader}>
            <Typography className={styles.sectionTitle}>Countries</Typography>
            <IconButton
              size="small"
              className={styles.popoverCloseButton}
              onClick={onClose}
              aria-label="Close countries"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
            <Chip
              label="All countries"
              variant={selectedCountryIds.length === 0 ? 'filled' : 'outlined'}
              onClick={() => onApplyCountries([])}
            />
            <Chip
              label="Europe"
              variant={loadingRegion === 'europe' ? 'filled' : 'outlined'}
              onClick={async () => {
                await onFetchRegion('europe');
                onClose();
              }}
            />
            <Chip
              label="North America"
              variant={loadingRegion === 'north-america' ? 'filled' : 'outlined'}
              onClick={async () => {
                await onFetchRegion('north-america');
                onClose();
              }}
            />
            <Chip
              label="South America"
              variant={loadingRegion === 'south-america' ? 'filled' : 'outlined'}
              onClick={async () => {
                await onFetchRegion('south-america');
                onClose();
              }}
            />
            <Chip
              label="Asia"
              variant={loadingRegion === 'asia' ? 'filled' : 'outlined'}
              onClick={async () => {
                await onFetchRegion('asia');
                onClose();
              }}
            />
          </Stack>

          <div className={styles.countryListSection}>
            <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
              {countries.slice(0, showAllCountries ? undefined : 10).map((country) => {
                const id = String(country.id);
                const isSelected = selectedCountryIds.includes(id);
                return (
                  <Chip
                    key={country.id}
                    label={renderCountryLabel(country)}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => onToggleCountry(id)}
                  />
                );
              })}
            </Stack>
            {!showAllCountries && (
              <button type="button" className={styles.showAllButton} onClick={onShowAll}>
                Show all countries
              </button>
            )}
          </div>
        </div>
      </Popover>
    </div>
  );
}
