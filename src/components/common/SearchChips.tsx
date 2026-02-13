'use client';

import { Chip, Stack } from '@mui/material';
import { useSearchContext } from '@/contexts/SearchContext';
import styles from './SearchChips.module.css';

export function SearchChips() {
  const { searchTerms, removeSearchTerm } = useSearchContext();

  if (searchTerms.length === 0) {
    return null;
  }

  return (
    <div className={styles.searchRow}>
      <div className={styles.chipsContainer}>
        <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
          {searchTerms.map((term) => (
            <Chip
              key={term}
              label={term}
              onDelete={() => removeSearchTerm(term)}
              variant="outlined"
            />
          ))}
        </Stack>
      </div>
    </div>
  );
}
