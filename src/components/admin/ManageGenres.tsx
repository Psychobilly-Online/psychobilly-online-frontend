'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ManageGenres.module.css';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Pagination from '@/components/common/Pagination';
import InfoBar from '@/components/common/InfoBar';
import Card from '@/components/common/Card';
import ActionButton from '@/components/common/ActionButton';
import Tag from '@/components/common/Tag';
import GenreDialog from './GenreDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Genre {
  id: number;
  name: string;
  sub_genres: string[];
  active: number;
  band_count: number;
  event_count: number;
}

interface GenresResponse {
  genres: Genre[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export default function ManageGenres() {
  const { token } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showInactive, setShowInactive] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  const [genreToDelete, setGenreToDelete] = useState<Genre | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGenres = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const includeInactiveParam = showInactive ? '&include_inactive=true' : '';
        const response = await fetch(
          `/api/admin/genres?page=${page}&per_page=50${includeInactiveParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }

        const data: GenresResponse = await response.json();
        setGenres(data.genres);
        setTotalPages(data.total_pages);
        setTotalCount(data.total);
        setCurrentPage(data.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [token, showInactive],
  );

  useEffect(() => {
    fetchGenres(currentPage);
  }, [currentPage, fetchGenres]);

  const handleAddClick = () => {
    setEditingGenre(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (genre: Genre) => {
    setEditingGenre(genre);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingGenre(null);
  };

  const handleDialogSave = () => {
    setIsDialogOpen(false);
    setEditingGenre(null);
    fetchGenres(currentPage);
  };

  const handleDeleteClick = (genre: Genre) => {
    setGenreToDelete(genre);
  };

  const handleDeleteConfirm = async () => {
    if (!genreToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/genres/${genreToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete genre');
      }

      // Remove from state
      setGenres(genres.filter((g) => g.id !== genreToDelete.id));

      // Adjust pagination if this was the last item on the page
      if (genres.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchGenres(currentPage);
      }

      setGenreToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete genre');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (genre: Genre) => {
    const newActiveStatus = genre.active === 1 ? 0 : 1;

    try {
      const response = await fetch(`/api/admin/genres/${genre.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: genre.name,
          sub_genres: genre.sub_genres.length > 0 ? genre.sub_genres : null,
          active: newActiveStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update genre');
      }

      // Update in state
      setGenres(genres.map((g) => (g.id === genre.id ? { ...g, active: newActiveStatus } : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update genre');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => fetchGenres(currentPage)} />;
  }

  return (
    <div className={styles.container}>
      <InfoBar>
        <InfoBar.Count label="Total Genres" value={totalCount} />
        <InfoBar.Action>
          <div className={styles.infoBarActions}>
            <label className={styles.filterToggle}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <span>Show inactive</span>
            </label>
            <ActionButton onClick={handleAddClick} variant="primary" size="small">
              + Add Genre
            </ActionButton>
          </div>
        </InfoBar.Action>
      </InfoBar>
      {genres.length === 0 ? (
        <p className={styles.empty}>No genres found.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {genres.map((genre) => (
              <Card key={genre.id} variant={genre.active === 0 ? 'disabled' : 'default'}>
                <Card.Header>
                  <Tag variant={genre.active === 1 ? 'success' : 'warning'}>
                    {genre.active === 1 ? 'Active' : 'Inactive'}
                  </Tag>
                </Card.Header>

                <Card.Title>{genre.name}</Card.Title>

                {genre.sub_genres && genre.sub_genres.length > 0 && (
                  <Card.Meta>Subgenres: {genre.sub_genres.join(', ')}</Card.Meta>
                )}

                <Card.Content>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{genre.band_count}</div>
                      <div className={styles.statLabel}>Bands</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{genre.event_count}</div>
                      <div className={styles.statLabel}>Events</div>
                    </div>
                  </div>
                </Card.Content>

                <Card.Actions>
                  <label className={styles.activeToggle}>
                    <input
                      type="checkbox"
                      checked={genre.active === 1}
                      onChange={() => handleToggleActive(genre)}
                      className={styles.toggleCheckbox}
                    />
                    <span className={styles.toggleLabel}>
                      {genre.active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                  <ActionButton
                    onClick={() => handleEditClick(genre)}
                    variant="secondary"
                    size="small"
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDeleteClick(genre)}
                    variant="danger"
                    size="small"
                  >
                    Delete
                  </ActionButton>
                </Card.Actions>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {isDialogOpen && (
        <GenreDialog genre={editingGenre} onClose={handleDialogClose} onSave={handleDialogSave} />
      )}

      {genreToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Genre"
          message={
            <>
              Are you sure you want to delete <strong>{genreToDelete.name}</strong>?
              {(genreToDelete.band_count > 0 || genreToDelete.event_count > 0) && (
                <div className={styles.deleteWarning}>
                  This will remove the genre from {genreToDelete.band_count} band(s) and{' '}
                  {genreToDelete.event_count} event(s).
                </div>
              )}
            </>
          }
          confirmText="Delete"
          onConfirm={handleDeleteConfirm}
          onClose={() => setGenreToDelete(null)}
          isLoading={isDeleting}
          confirmColor="error"
        />
      )}
    </div>
  );
}
