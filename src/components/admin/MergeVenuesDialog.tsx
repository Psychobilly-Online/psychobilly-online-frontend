'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import VenueListItem from '@/components/common/VenueListItem';
import type { Venue } from '@/types/venue';
import styles from './MergeVenuesDialog.module.css';

interface MergeVenuesDialogProps {
  open: boolean;
  venues: Venue[];
  onClose: () => void;
  onMerge: () => void;
}

export default function MergeVenuesDialog({
  open,
  venues,
  onClose,
  onMerge,
}: MergeVenuesDialogProps) {
  const { token } = useAuth();
  const [primaryVenueId, setPrimaryVenueId] = useState<number>(venues[0]?.id || 0);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total events
  const totalEvents = venues.reduce((sum, venue) => sum + (venue.event_count || 0), 0);
  const primaryVenue = venues.find((v) => v.id === primaryVenueId);
  const mergeVenues = venues.filter((v) => v.id !== primaryVenueId);

  const handleMerge = async () => {
    if (!primaryVenueId) {
      setError('Please select a primary venue');
      return;
    }

    if (venues.length < 2) {
      setError('At least 2 venues are required for merging');
      return;
    }

    const confirmMessage = `Are you sure you want to merge ${venues.length} venues?\n\n` +
      `Primary Venue: ${primaryVenue?.venue}\n` +
      `Venues to merge: ${mergeVenues.map(v => v.venue).join(', ')}\n\n` +
      `This will:\n` +
      `• Transfer all ${totalEvents} event(s) to "${primaryVenue?.venue}"\n` +
      `• Delete ${mergeVenues.length} venue(s)\n` +
      `• This action cannot be undone`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/venues/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          primary_venue_id: primaryVenueId,
          merge_venue_ids: mergeVenues.map((v) => v.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to merge venues');
      }

      const result = await response.json();
      
      // Show success message
      alert(
        result.message ||
          `Successfully merged ${result.venues_deleted} venue(s). ${result.events_updated} event(s) updated.`
      );

      // Trigger refresh
      onMerge();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge venues');
    } finally {
      setIsMerging(false);
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
      <DialogTitle className={styles.dialogTitle}>Merge Venues</DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.section}>
          <div className={styles.info}>
            <strong>⚠️ Warning:</strong> This action will merge {venues.length} venues and cannot be
            undone.
          </div>
        </div>

        <div className={styles.section}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" className={styles.sectionTitle}>
              Select Primary Venue
            </FormLabel>
            <p className={styles.hint}>
              The primary venue will be kept. All events from other venues will be transferred to
              it, and the other venues will be deleted.
            </p>

            <RadioGroup
              value={primaryVenueId}
              onChange={(e) => setPrimaryVenueId(Number(e.target.value))}
            >
              <div className={styles.venueList}>
                {venues.map((venue) => (
                  <FormControlLabel
                    key={venue.id}
                    value={venue.id}
                    control={<Radio />}
                    label={
                      <VenueListItem
                        id={venue.id}
                        venue={venue.venue}
                        city={venue.city}
                        country_name={venue.country_name}
                        status={venue.status}
                        event_count={venue.event_count}
                        mode="radio"
                        selected={primaryVenueId === venue.id}
                        onClick={() => setPrimaryVenueId(venue.id)}
                        showId={true}
                        className={styles.venueItem}
                      />
                    }
                    className={styles.radioLabel}
                  />
                ))}
              </div>
            </RadioGroup>
          </FormControl>
        </div>

        {primaryVenue && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Merge Summary</div>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Primary Venue:</span>
                <span className={styles.summaryValue}>
                  {primaryVenue.venue} (ID: {primaryVenue.id})
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Venues to Delete:</span>
                <span className={styles.summaryValue}>
                  {mergeVenues.map((v) => `${v.venue} (ID: ${v.id})`).join(', ')}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Total Events:</span>
                <span className={styles.summaryValue}>
                  {totalEvents} event{totalEvents !== 1 ? 's' : ''} will be transferred to "
                  {primaryVenue.venue}"
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isMerging}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleMerge}
          disabled={isMerging || venues.length < 2}
          className={styles.mergeButton}
        >
          {isMerging ? 'Merging...' : `Merge ${venues.length} Venues`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
