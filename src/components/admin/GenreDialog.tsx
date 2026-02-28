'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './GenreDialog.module.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Button,
} from '@mui/material';

interface Genre {
  id: number;
  name: string;
  sub_genres: string[];
  active: number;
  band_count: number;
  event_count: number;
}

interface GenreDialogProps {
  genre: Genre | null;
  onClose: () => void;
  onSave: () => void;
}

export default function GenreDialog({ genre, onClose, onSave }: GenreDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [subGenres, setSubGenres] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [newSubGenre, setNewSubGenre] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (genre) {
      setName(genre.name);
      setSubGenres(genre.sub_genres || []);
      setActive(genre.active === 1);
    } else {
      setName('');
      setSubGenres([]);
      setActive(true);
    }
  }, [genre]);

  const handleAddSubGenre = () => {
    const trimmed = newSubGenre.trim();
    if (trimmed && !subGenres.includes(trimmed)) {
      setSubGenres([...subGenres, trimmed]);
      setNewSubGenre('');
    }
  };

  const handleRemoveSubGenre = (subGenre: string) => {
    setSubGenres(subGenres.filter((sg) => sg !== subGenre));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubGenre();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Genre name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = genre ? `/api/admin/genres/${genre.id}` : `/api/admin/genres`;

      const method = genre ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          sub_genres: subGenres.length > 0 ? subGenres : null,
          active: active ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save genre');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        {genre ? 'Edit Genre' : 'Add New Genre'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.dialogContent}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="genre-name" className={styles.label}>
              Genre Name *
            </label>
            <TextField
              id="genre-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
              disabled={isSaving}
              autoFocus
              className={styles.textField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="new-subgenre" className={styles.label}>
              Subgenres (optional)
            </label>
            <p className={styles.hint}>Add related sub-categories or style variations</p>

            <div className={styles.variationInput}>
              <TextField
                id="new-subgenre"
                value={newSubGenre}
                onChange={(e) => setNewSubGenre(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter subgenre and press Enter"
                fullWidth
                variant="outlined"
                disabled={isSaving}
                className={styles.textField}
              />
              <Button
                onClick={handleAddSubGenre}
                disabled={!newSubGenre.trim() || isSaving}
                variant="outlined"
                className={styles.addButton}
              >
                Add
              </Button>
            </div>

            {subGenres.length > 0 && (
              <div className={styles.variationsList}>
                {subGenres.map((subGenre) => (
                  <Chip
                    key={subGenre}
                    label={subGenre}
                    onDelete={() => handleRemoveSubGenre(subGenre)}
                    disabled={isSaving}
                    className={styles.chip}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={isSaving}
                className={styles.checkbox}
              />
              <span>Active (visible in filters and dropdowns)</span>
            </label>
          </div>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} disabled={isSaving} className={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            variant="contained"
            className={styles.saveButton}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
