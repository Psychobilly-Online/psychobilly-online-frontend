'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { BandWithGenres } from './GenreAssignment';
import styles from './BandList.module.css';

interface BandListProps {
  selectedBands: BandWithGenres[];
  onBandsSelected: (bands: BandWithGenres[]) => void;
}

export default function BandList({ selectedBands, onBandsSelected }: BandListProps) {
  const [bands, setBands] = useState<BandWithGenres[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadBands();
  }, [page, debouncedSearch]);

  const loadBands = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Support multiple search terms separated by semicolon
      const searchTerms = debouncedSearch
        .split(';')
        .map(term => term.trim())
        .filter(term => term.length > 0);

      if (searchTerms.length === 0) {
        // No search - load paginated results
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '50'
        });

        const response = await fetch(`/api/admin/bands?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load bands');
        }

        const data = await response.json();
        setBands(data.bands || []);
        setTotalPages(data.pages || 1);
      } else {
        // Multi-search - fetch results for each term and combine
        const allResults: BandWithGenres[] = [];
        const seenIds = new Set<number>();

        for (const term of searchTerms) {
          const params = new URLSearchParams({
            page: '1',
            limit: '50',
            search: term
          });

          const response = await fetch(`/api/admin/bands?${params}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to search bands');
          }

          const data = await response.json();
          
          // Add results, avoiding duplicates
          (data.bands || []).forEach((band: BandWithGenres) => {
            if (!seenIds.has(band.id)) {
              seenIds.add(band.id);
              allResults.push(band);
            }
          });
        }

        setBands(allResults);
        setTotalPages(1); // Disable pagination for multi-search
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bands');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const isBandSelected = (bandId: number) => {
    return selectedBands.some(b => b.id === bandId);
  };

  const toggleBand = (band: BandWithGenres) => {
    if (isBandSelected(band.id)) {
      onBandsSelected(selectedBands.filter(b => b.id !== band.id));
    } else {
      onBandsSelected([...selectedBands, band]);
    }
  };

  const selectAll = () => {
    const unselectedBands = bands.filter(b => !isBandSelected(b.id));
    onBandsSelected([...selectedBands, ...unselectedBands]);
  };

  const deselectAll = () => {
    onBandsSelected([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Select Bands</h2>
        <div className={styles.selectedCount}>
          {selectedBands.length} selected
        </div>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search bands (separate multiple with ;)..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={selectAll}>
          Select All on Page
        </button>
        <button className={styles.actionButton} onClick={deselectAll}>
          Deselect All
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isLoading ? (
        <div className={styles.loading}>Loading bands...</div>
      ) : (
        <div className={styles.bandList}>
          {bands.map(band => (
            <label key={band.id} className={styles.bandItem}>
              <input
                type="checkbox"
                checked={isBandSelected(band.id)}
                onChange={() => toggleBand(band)}
              />
              <div className={styles.bandInfo}>
                <div className={styles.bandName}>{band.name}</div>
                {band.genres.length > 0 && (
                  <div className={styles.currentGenres}>
                    {band.genres.map(g => (
                      <span key={g.id} className={styles.genreTag}>
                        {g.name}{g.is_primary && ' ★'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
