'use client';

import type { RefObject } from 'react';
import { IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styles from './EventFilters.module.css';

interface EventFiltersSearchProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  inputSx: object;
}

export function EventFiltersSearch({
  value,
  onChange,
  inputRef,
  inputSx,
}: EventFiltersSearchProps) {
  return (
    <div className={styles.headerSearch}>
      <TextField
        placeholder="Event title, bands, city..."
        aria-label="Search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputRef={inputRef}
        fullWidth
        size="small"
        variant="outlined"
        sx={inputSx}
      />
      <IconButton
        className={styles.searchIconButton}
        onClick={() => inputRef.current?.focus()}
        aria-label="Search"
      >
        <SearchIcon />
      </IconButton>
    </div>
  );
}
