'use client';

import { useState, useCallback } from 'react';
import { Typography, CircularProgress, Chip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@/components/common/IconButton';
import { StyledTextField, StyledAutocomplete } from '@/components/common/form';
import { useMetadata } from '@/contexts/MetadataContext';
import { type CreateEventFormData, type WizardDay, type WizardBand } from '../types';
import styles from './steps.module.css';

interface BandOption {
  id?: number;
  name: string;
  isNew?: boolean;
}

interface BandsStepProps {
  formData: CreateEventFormData;
  onChange: (patch: Partial<CreateEventFormData>) => void;
  token: string | null;
}

interface DayBandInputProps {
  day: WizardDay;
  dayIndex: number;
  token: string | null;
  onAddBand: (dayIndex: number, band: WizardBand) => void;
  onRemoveBand: (dayIndex: number, bandIndex: number) => void;
  onReorderBand: (dayIndex: number, fromIndex: number, toIndex: number) => void;
  onLabelChange: (dayIndex: number, label: string) => void;
}

function DayBandInput({
  day,
  dayIndex,
  token,
  onAddBand,
  onRemoveBand,
  onReorderBand,
  onLabelChange,
}: DayBandInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<BandOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pendingBand, setPendingBand] = useState<{ name: string } | null>(null);
  const [pendingGenreId, setPendingGenreId] = useState<number | null>(null);
  const { genres } = useMetadata();

  const searchBands = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/bands/search?q=${encodeURIComponent(q)}&limit=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          setOptions([]);
          return;
        }
        const data = await res.json();
        const found: BandOption[] = (Array.isArray(data.results) ? data.results : []).map(
          (b: { id: number; name: string }) => ({ id: b.id, name: b.name }),
        );
        // If the exact input isn't in results, offer "Add new band"
        const exactMatch = found.some(
          (b) => b.name.toLowerCase() === q.trim().toLowerCase(),
        );
        if (!exactMatch && q.trim()) {
          found.push({ name: q.trim(), isNew: true });
        }
        setOptions(found);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const handleSelect = (_: unknown, value: BandOption | string | null) => {
    if (!value) return;
    const opt: BandOption =
      typeof value === 'string' ? { name: value.trim(), isNew: true } : value;
    const name = opt.name.trim();
    if (!name) return;
    if (day.bands.some((b) => b.name.toLowerCase() === name.toLowerCase())) return;

    if (opt.id !== undefined) {
      // Existing band — add immediately
      onAddBand(dayIndex, { name, bandId: opt.id });
      setInputValue('');
      setOptions([]);
    } else {
      // New band — require genre selection before adding
      setPendingBand({ name });
      setPendingGenreId(null);
      setInputValue('');
      setOptions([]);
    }
  };

  const confirmPendingBand = () => {
    if (!pendingBand || pendingGenreId === null) return;
    onAddBand(dayIndex, { name: pendingBand.name, genreId: pendingGenreId });
    setPendingBand(null);
    setPendingGenreId(null);
  };

  return (
    <div className={styles.daySection}>
      <div className={styles.dayHeader}>
        <StyledTextField
          value={day.label}
          onChange={(e) => onLabelChange(dayIndex, e.target.value)}
          size="small"
          variant="standard"
          inputProps={{ style: { fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' } }}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: 'var(--color-border-default)' },
            '& .MuiInput-underline:hover:before': { borderBottomColor: 'var(--color-accent-primary)' },
            '& .MuiInput-underline:after': { borderBottomColor: 'var(--color-accent-primary)' },
          }}
        />
        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
          {day.date}
        </Typography>
      </div>
      <div className={styles.dayBody}>
        {day.bands.length > 0 && (
          <div className={styles.bandList}>
            {day.bands.map((band, bi) => (
              <div
                key={band.bandId != null ? `id-${band.bandId}` : `name-${band.name}`}
                className={[
                  styles.bandRow,
                  dragIndex === bi ? styles.bandRowDragging : '',
                  dragOverIndex === bi && dragIndex !== bi ? styles.bandRowDropTarget : '',
                ].filter(Boolean).join(' ')}
                draggable
                onDragStart={(e) => {
                  setDragIndex(bi);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== bi) setDragOverIndex(bi);
                }}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dragIndex !== bi) {
                    onReorderBand(dayIndex, dragIndex, bi);
                  }
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
              >
                <span className={styles.bandRowDragHandle}>
                  <DragIndicatorIcon fontSize="inherit" />
                </span>
                <span className={styles.bandRowName}>{band.name}</span>
                <div className={styles.bandRowActions}>
                  <IconButton
                    icon={<DeleteIcon fontSize="inherit" />}
                    ariaLabel="Remove band"
                    size="small"
                    onClick={() => onRemoveBand(dayIndex, bi)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {pendingBand && (
          <div className={styles.pendingBand}>
            <p className={styles.pendingBandLabel}>
              Select a genre for <strong>{pendingBand.name}</strong> (required for new bands):
            </p>
            <div className={styles.chipGroup}>
              {genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  size="small"
                  onClick={() => setPendingGenreId(g.id)}
                  variant={pendingGenreId === g.id ? 'filled' : 'outlined'}
                  className={pendingGenreId === g.id ? styles.chipActive : styles.chip}
                />
              ))}
            </div>
            <div className={styles.pendingBandActions}>
              <button
                className={styles.pendingBandConfirm}
                onClick={confirmPendingBand}
                disabled={pendingGenreId === null}
              >
                Add band
              </button>
              <button
                className={styles.pendingBandCancel}
                onClick={() => { setPendingBand(null); setPendingGenreId(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {!pendingBand && (
          <StyledAutocomplete<BandOption, false, false, true>
            freeSolo
          options={options}
          getOptionLabel={(o) =>
            typeof o === 'string' ? o : o.isNew ? `Add new: "${o.name}"` : o.name
          }
          inputValue={inputValue}
          onInputChange={(_, v, reason) => {
            if (reason === 'reset') return;
            setInputValue(v);
            searchBands(v);
          }}
          onChange={handleSelect}
          filterOptions={(x) => x}
          loading={loading}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              placeholder="Search or add a band…"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color="inherit" size={14} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        )}
      </div>
    </div>
  );
}

export default function BandsStep({ formData, onChange, token }: BandsStepProps) {
  const updateDays = (updater: (days: WizardDay[]) => WizardDay[]) => {
    onChange({ days: updater([...formData.days]) });
  };

  const handleAddBand = (dayIndex: number, band: WizardBand) => {
    updateDays((days) => {
      days[dayIndex] = { ...days[dayIndex], bands: [...days[dayIndex].bands, band] };
      return days;
    });
  };

  const handleRemoveBand = (dayIndex: number, bandIndex: number) => {
    updateDays((days) => {
      const bands = [...days[dayIndex].bands];
      bands.splice(bandIndex, 1);
      days[dayIndex] = { ...days[dayIndex], bands };
      return days;
    });
  };

  const handleReorderBand = (dayIndex: number, fromIndex: number, toIndex: number) => {
    updateDays((days) => {
      const bands = [...days[dayIndex].bands];
      const [moved] = bands.splice(fromIndex, 1);
      bands.splice(toIndex, 0, moved);
      days[dayIndex] = { ...days[dayIndex], bands };
      return days;
    });
  };

  const handleLabelChange = (dayIndex: number, label: string) => {
    updateDays((days) => {
      days[dayIndex] = { ...days[dayIndex], label };
      return days;
    });
  };

  if (formData.days.length === 0) {
    return (
      <div className={styles.step}>
        <Typography variant="h6" className={styles.stepTitle}>
          Bands
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
          Please set the event dates in the previous step first.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.step}>
      <Typography variant="h6" className={styles.stepTitle}>
        Bands
      </Typography>
      <Typography variant="body2" className={styles.hint}>
        Search the database or type a new band name. Drag to reorder.
      </Typography>
      {formData.days.map((day, i) => (
        <DayBandInput
          key={day.date + i}
          day={day}
          dayIndex={i}
          token={token}
          onAddBand={handleAddBand}
          onRemoveBand={handleRemoveBand}
          onReorderBand={handleReorderBand}
          onLabelChange={handleLabelChange}
        />
      ))}
    </div>
  );
}
