'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import styles from './GenreSelector.module.css';

export interface BandWithGenres {
  id: number;
  name: string;
  name_variations?: string[];
  genres?: Array<{
    id: number;
    name: string;
    is_primary: boolean;
  }>;
}

export interface Genre {
  id: number;
  name: string;
  sub_genres?: string[];
}

interface GenreSelectorProps {
  selectedBands: BandWithGenres[];
  selectedGenres: Genre[];
  onGenresSelected: (genres: Genre[]) => void;
  onClearSelection: () => void;
  onAssignmentComplete?: () => void;
}

interface AssignmentSummary {
  bands_processed: number;
  genres_assigned: number;
  skipped_duplicates: number;
  details: Array<{
    band_id: number;
    band_name: string;
    genres_added: number;
    genres_skipped: number;
    status: string;
  }>;
}

export default function GenreSelector({
  selectedBands,
  selectedGenres,
  onGenresSelected,
  onClearSelection,
  onAssignmentComplete,
}: GenreSelectorProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [setPrimary, setSetPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AssignmentSummary | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { token } = useAuth();

  const loadGenres = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/genres');
      if (!response.ok) {
        throw new Error('Failed to load genres');
      }

      const data = await response.json();
      // Filter to only main genres (not subgenres)
      setGenres(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load genres');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  const isGenreSelected = (genreId: number) => {
    return selectedGenres.some((g) => g.id === genreId);
  };

  const toggleGenre = (genre: Genre) => {
    if (isGenreSelected(genre.id)) {
      onGenresSelected(selectedGenres.filter((g) => g.id !== genre.id));
    } else {
      onGenresSelected([...selectedGenres, genre]);
    }
  };

  const handleAssignClick = () => {
    if (selectedBands.length === 0 || selectedGenres.length === 0 || !token) {
      return;
    }

    setShowConfirm(true);
  };

  const handleAssign = async () => {
    setShowConfirm(false);
    setIsAssigning(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/admin/bands/assign-genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          band_ids: selectedBands.map((b) => b.id),
          genre_ids: selectedGenres.map((g) => g.id),
          set_primary: setPrimary,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Assignment failed');
      }

      const data = await response.json();
      setSummary(data);

      // Trigger refresh of band list to update genre counts
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }

      // Clear selection after 5 seconds
      setTimeout(() => {
        onClearSelection();
        setSummary(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Select Genres</h2>
        {selectedBands.length > 0 && (
          <div className={styles.selectedInfo}>{selectedBands.length} band(s) selected</div>
        )}
      </div>

      {selectedBands.length === 0 ? (
        <div className={styles.placeholder}>Select bands from the left to assign genres</div>
      ) : (
        <>
          {isLoading ? (
            <LoadingSpinner message="Loading genres..." size="small" />
          ) : (
            <>
              <div className={styles.genreList}>
                {genres.map((genre) => (
                  <label key={genre.id} className={styles.genreItem}>
                    <input
                      type="checkbox"
                      checked={isGenreSelected(genre.id)}
                      onChange={() => toggleGenre(genre)}
                    />
                    <span className={styles.genreName}>{genre.name}</span>
                  </label>
                ))}
              </div>

              <div className={styles.options}>
                <label className={styles.optionLabel}>
                  <input
                    type="checkbox"
                    checked={setPrimary}
                    onChange={(e) => setSetPrimary(e.target.checked)}
                  />
                  Set first genre as primary (if band has no primary genre)
                </label>
              </div>

              {error && <ErrorMessage error={error} onRetry={loadGenres} />}

              {summary && (
                <div className={styles.success}>
                  <h3>✓ Assignment Successful</h3>
                  <div className={styles.summaryDetails}>
                    <p>Processed {summary.bands_processed} band(s)</p>
                    <p>Added {summary.genres_assigned} genre assignment(s)</p>
                    <p>Skipped {summary.skipped_duplicates} duplicate(s)</p>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.assignButton}
                  onClick={handleAssignClick}
                  disabled={selectedGenres.length === 0 || isAssigning}
                >
                  {isAssigning
                    ? 'Assigning...'
                    : `Assign ${selectedGenres.length} genre(s) to ${selectedBands.length} band(s)`}
                </button>
              </div>

              {selectedGenres.length > 0 && (
                <div className={styles.preview}>
                  <h3>Selected Genres:</h3>
                  <div className={styles.selectedGenres}>
                    {selectedGenres.map((g) => (
                      <span key={g.id} className={styles.selectedGenreTag}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleAssign}
        title="Confirm Genre Assignment"
        message={`Assign ${selectedGenres.length} genre(s) to ${selectedBands.length} band(s)?`}
        confirmText="Assign"
        confirmColor="primary"
        isLoading={isAssigning}
      />
    </div>
  );
}
