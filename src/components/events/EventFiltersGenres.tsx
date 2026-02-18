'use client';

import type { MouseEvent } from 'react';
import { Chip, Popover, Stack, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './EventFilters.module.css';

interface Genre {
  id: number;
  name: string;
  slug?: string;
}

interface EventFiltersGenresProps {
  genres: Genre[];
  selectedGenreIds: string[];
  genreCounts?: Record<number, number>;
  genreOpen: boolean;
  genreAnchor: HTMLElement | null;
  onOpen: (event: MouseEvent<any>) => void;
  onClose: () => void;
  onToggleGenre: (genreId: string) => void;
  onClearGenres: () => void;
  popoverPaperClassName: string;
  popoverContainer?: HTMLElement | null;
}

export function EventFiltersGenres({
  genres,
  selectedGenreIds,
  genreCounts,
  genreOpen,
  genreAnchor,
  onOpen,
  onClose,
  onToggleGenre,
  onClearGenres,
  popoverPaperClassName,
  popoverContainer,
}: EventFiltersGenresProps) {
  return (
    <div className={styles.chipSection}>
      <div className={`${styles.formGroup} ${styles.categoryGroup}`}>
        <div className={styles.chipTriggerWrapper}>
          <Stack className={styles.chipGroup} direction="row" flexWrap="wrap" onClick={onOpen}>
            {selectedGenreIds.length === 0 && (
              <Chip label="All genres" variant="outlined" onClick={onOpen} />
            )}
            {selectedGenreIds.length > 0 &&
              selectedGenreIds.map((id) => {
                const genre = genres.find((item) => String(item.id) === id);
                if (!genre) return null;
                return (
                  <Chip
                    key={id}
                    label={genre.name}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onToggleGenre(id);
                    }}
                    onClick={onOpen}
                    variant="outlined"
                  />
                );
              })}
          </Stack>
        </div>
        <Popover
          open={genreOpen}
          anchorEl={genreAnchor}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          container={popoverContainer ?? undefined}
          marginThreshold={16}
          disablePortal
          slotProps={{ paper: { className: popoverPaperClassName } }}
        >
          <div className={styles.countryPopover}>
            <div className={styles.popoverHeader}>
              <Typography
                className={styles.sectionTitle}
                onClick={onClose}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClose();
                  }
                }}
              >
                Genres
              </Typography>
              <IconButton
                size="small"
                className={styles.popoverCloseButton}
                onClick={onClose}
                aria-label="Close genres"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
              <Chip
                label="All genres"
                variant={selectedGenreIds.length === 0 ? 'filled' : 'outlined'}
                onClick={onClearGenres}
              />
              {genres.map((genre) => {
                const genreId = String(genre.id);
                const isSelected = selectedGenreIds.includes(genreId);
                const count = genreCounts ? genreCounts[genre.id] || 0 : 0;
                const isDisabled = !!genreCounts && count === 0 && !isSelected;
                return (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    variant={isSelected ? 'filled' : 'outlined'}
                    disabled={isDisabled}
                    onClick={() => onToggleGenre(genreId)}
                  />
                );
              })}
            </Stack>
          </div>
        </Popover>
      </div>
    </div>
  );
}
