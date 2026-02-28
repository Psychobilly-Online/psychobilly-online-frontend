'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Chip, Autocomplete } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import GenreTag from '@/components/common/GenreTag';
import styles from './EditBandDialog.module.css';

interface BandGenre {
  id: number;
  name: string;
  is_primary: boolean;
}

interface Genre {
  id: number;
  name: string;
  sub_genres?: string[];
}

interface Band {
  id: number;
  name: string;
  name_variations?: string[];
  genres?: BandGenre[];
}

interface EditBandDialogProps {
  open: boolean;
  band: Band;
  onClose: () => void;
  onSave: () => void;
}

export default function EditBandDialog({ open, band, onClose, onSave }: EditBandDialogProps) {
  const { token } = useAuth();
  const [name, setName] = useState(band.name);
  const [variations, setVariations] = useState<string[]>(band.name_variations || []);
  const [newVariation, setNewVariation] = useState('');
  const [genres, setGenres] = useState<BandGenre[]>(band.genres || []);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when band changes
    setName(band.name);
    setVariations(band.name_variations || []);
    setGenres(band.genres || []);
    setNewVariation('');
    setError(null);
  }, [band]);

  useEffect(() => {
    // Load available genres
    const loadGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const response = await fetch('/api/genres');
        if (response.ok) {
          const data = await response.json();
          setAvailableGenres(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      } finally {
        setIsLoadingGenres(false);
      }
    };
    
    if (open) {
      loadGenres();
    }
  }, [open]);

  const handleAddVariation = () => {
    const trimmed = newVariation.trim();
    if (trimmed && !variations.includes(trimmed)) {
      setVariations([...variations, trimmed]);
      setNewVariation('');
    }
  };

  const handleRemoveVariation = (variation: string) => {
    setVariations(variations.filter(v => v !== variation));
  };

  const handleAddGenre = (genre: Genre) => {
    if (!genres.find(g => g.id === genre.id)) {
      setGenres([...genres, { id: genre.id, name: genre.name, is_primary: genres.length === 0 }]);
    }
  };

  const handleRemoveGenre = (genreId: number) => {
    const removedGenre = genres.find(g => g.id === genreId);
    const newGenres = genres.filter(g => g.id !== genreId);
    
    // If we removed the primary genre and there are other genres, make the first one primary
    if (removedGenre?.is_primary && newGenres.length > 0) {
      newGenres[0].is_primary = true;
    }
    
    setGenres(newGenres);
  };

  const handleTogglePrimary = (genreId: number) => {
    setGenres(genres.map(g => ({
      ...g,
      is_primary: g.id === genreId
    })));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariation();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Band name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bands/${band.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          name_variations: variations,
          genres: genres.map(g => ({
            genre_id: g.id,
            is_primary: g.is_primary
          }))
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update band');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update band');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        Edit Band: {band.name}
      </DialogTitle>
      
      <DialogContent className={styles.dialogContent}>
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="band-name" className={styles.label}>Band Name *</label>
          <TextField
            id="band-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={isSaving}
            className={styles.textField}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="new-variation" className={styles.label}>Name Variations</label>
          <p className={styles.hint}>
            Add alternative spellings, abbreviations, or common misspellings
          </p>
          
          <div className={styles.variationInput}>
            <TextField
              id="new-variation"
              value={newVariation}
              onChange={(e) => setNewVariation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter variation and press Enter"
              fullWidth
              variant="outlined"
              disabled={isSaving}
              className={styles.textField}
            />
            <Button
              onClick={handleAddVariation}
              disabled={!newVariation.trim() || isSaving}
              variant="outlined"
              className={styles.addButton}
            >
              Add
            </Button>
          </div>

          {variations.length > 0 && (
            <div className={styles.variationsList}>
              {variations.map((variation) => (
                <Chip
                  key={variation}
                  label={variation}
                  onDelete={() => handleRemoveVariation(variation)}
                  disabled={isSaving}
                  className={styles.chip}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="genre-search" className={styles.label}>Genres</label>
          <p className={styles.hint}>
            Assign music genres to this band. Click a genre chip to toggle it as primary.
          </p>
          
          <Autocomplete
            id="genre-search"
            options={availableGenres.filter(g => !genres.find(bg => bg.id === g.id))}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search and add genres..."
                variant="outlined"
                className={styles.textField}
              />
            )}
            onChange={(_, value) => {
              if (value) {
                handleAddGenre(value);
              }
            }}
            disabled={isSaving || isLoadingGenres}
            loading={isLoadingGenres}
            value={null}
            clearOnBlur
          />

          {genres.length > 0 && (
            <div className={styles.genresList}>
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  onClick={() => handleTogglePrimary(genre.id)}
                  className={styles.genreChipWrapper}
                  title={genre.is_primary ? "Primary genre (click another to change)" : "Click to make primary"}
                >
                  <GenreTag name={genre.name} isPrimary={genre.is_primary} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveGenre(genre.id);
                    }}
                    disabled={isSaving}
                    className={styles.genreRemoveButton}
                    title="Remove genre"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          onClick={onClose}
          disabled={isSaving}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="contained"
          className={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
