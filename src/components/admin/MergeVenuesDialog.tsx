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
  Checkbox,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/contexts/AuthContext';
import VenueListItem from '@/components/common/VenueListItem';
import type { Venue } from '@/types/venue';
import styles from './MergeVenuesDialog.module.css';

interface HistoricalName {
  venue_id: number;
  from_year: number | null;
  to_year: number | null;
  notes: string | null;
}

interface HistoricalAddress {
  venue_id: number;
  from_year: number | null;
  to_year: number | null;
  notes: string | null;
}

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

  // Historical tracking state
  const [historicalNames, setHistoricalNames] = useState<Map<number, HistoricalName>>(new Map());
  const [historicalAddresses, setHistoricalAddresses] = useState<Map<number, HistoricalAddress>>(
    new Map(),
  );

  // Calculate total events
  const totalEvents = venues.reduce((sum, venue) => sum + (venue.event_count || 0), 0);
  const primaryVenue = venues.find((v) => v.id === primaryVenueId);
  const mergeVenues = venues.filter((v) => v.id !== primaryVenueId);

    const toggleHistoricalName = (venueId: number, checked: boolean) => {
    const newMap = new Map(historicalNames);
    if (checked) {
      newMap.set(venueId, {
        venue_id: venueId,
        from_year: null,
        to_year: null,
        notes: null,
      });
    } else {
      newMap.delete(venueId);
    }
    setHistoricalNames(newMap);
  };

  const updateHistoricalName = (
    venueId: number,
    field: keyof HistoricalName,
    value: number | string | null,
  ) => {
    const newMap = new Map(historicalNames);
    const existing = newMap.get(venueId);
    if (existing) {
      newMap.set(venueId, {
        ...existing,
        [field]: value === '' ? null : value,
      });
      setHistoricalNames(newMap);
    }
  };

  const toggleHistoricalAddress = (venueId: number, checked: boolean) => {
    const newMap = new Map(historicalAddresses);
    if (checked) {
      newMap.set(venueId, {
        venue_id: venueId,
        from_year: null,
        to_year: null,
        notes: null,
      });
    } else {
      newMap.delete(venueId);
    }
    setHistoricalAddresses(newMap);
  };

  const updateHistoricalAddress = (
    venueId: number,
    field: keyof HistoricalAddress,
    value: number | string | null,
  ) => {
    const newMap = new Map(historicalAddresses);
    const existing = newMap.get(venueId);
    if (existing) {
      newMap.set(venueId, {
        ...existing,
        [field]: value === '' ? null : value,
      });
      setHistoricalAddresses(newMap);
    }
  };

  const handleMerge = async () => {
    if (!primaryVenueId) {
      setError('Please select a primary venue');
      return;
    }

    if (venues.length < 2) {
      setError('At least 2 venues are required for merging');
      return;
    }

    const histNamesCount = historicalNames.size;
    const histAddrsCount = historicalAddresses.size;
    const histInfo =
      histNamesCount > 0 || histAddrsCount > 0
        ? `\n• Save ${histNamesCount} historical name(s) and ${histAddrsCount} historical address(es)`
        : '';

    const confirmMessage =
      `Are you sure you want to merge ${venues.length} venues?\n\n` +
      `Primary Venue: ${primaryVenue?.venue}\n` +
      `Venues to merge: ${mergeVenues.map((v) => v.venue).join(', ')}\n\n` +
      `This will:\n` +
      `• Transfer all ${totalEvents} event(s) to "${primaryVenue?.venue}"\n` +
      `• Delete ${mergeVenues.length} venue(s)${histInfo}\n` +
      `• This action cannot be undone`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const body: {
        primary_venue_id: number;
        merge_venue_ids: number[];
        historical_names?: HistoricalName[];
        historical_addresses?: HistoricalAddress[];
      } = {
        primary_venue_id: primaryVenueId,
        merge_venue_ids: mergeVenues.map((v) => v.id),
      };

      // Add historical data if provided
      if (historicalNames.size > 0) {
        body.historical_names = Array.from(historicalNames.values());
      }
      if (historicalAddresses.size > 0) {
        body.historical_addresses = Array.from(historicalAddresses.values());
      }

      const response = await fetch('/api/admin/venues/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to merge venues');
      }

      const result = await response.json();

      // Show success message
      alert(
        result.message ||
          `Successfully merged ${result.venues_deleted} venue(s). ${result.events_updated} event(s) updated.`,
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

        <div className={styles.warning}>
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
                      <div>
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
                        {venue.address1 && (
                          <div className={styles.venueAddress}>
                            {venue.address1}
                            {venue.address2 && `, ${venue.address2}`}
                          </div>
                        )}
                      </div>
                    }
                    className={styles.radioLabel}
                  />
                ))}
              </div>
            </RadioGroup>
          </FormControl>
        </div>

        {/* Historical Tracking */}
        {mergeVenues.length > 0 && (
          <div className={styles.section}>
            <Accordion className={styles.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
                <div className={styles.accordionTitle}>
                  📜 Historical Names (Optional)
                  {historicalNames.size > 0 && (
                    <span className={styles.badge}>{historicalNames.size}</span>
                  )}
                </div>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <p className={styles.hint}>
                  Mark venues whose names are historical (e.g., venue was renamed). These names will
                  be saved to venue history with time periods.
                </p>
                {mergeVenues.map((venue) => (
                  <div key={venue.id} className={styles.historicalItem}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={historicalNames.has(venue.id)}
                          onChange={(e) => toggleHistoricalName(venue.id, e.target.checked)}
                        />
                      }
                      label={
                        <span className={styles.historicalLabel}>
                          <strong>{venue.venue}</strong> (ID: {venue.id})
                        </span>
                      }
                    />
                    {historicalNames.has(venue.id) && (
                      <div className={styles.historicalFields}>
                        <TextField
                          label="From Year"
                          type="number"
                          size="small"
                          placeholder="e.g., 1995"
                          value={historicalNames.get(venue.id)?.from_year || ''}
                          onChange={(e) =>
                            updateHistoricalName(
                              venue.id,
                              'from_year',
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          className={styles.yearField}
                        />
                        <TextField
                          label="To Year"
                          type="number"
                          size="small"
                          placeholder="e.g., 2010"
                          value={historicalNames.get(venue.id)?.to_year || ''}
                          onChange={(e) =>
                            updateHistoricalName(
                              venue.id,
                              'to_year',
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          className={styles.yearField}
                        />
                        <TextField
                          label="Notes"
                          size="small"
                          fullWidth
                          placeholder="e.g., Original name when venue opened"
                          value={historicalNames.get(venue.id)?.notes || ''}
                          onChange={(e) =>
                            updateHistoricalName(venue.id, 'notes', e.target.value || null)
                          }
                          className={styles.notesField}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          </div>
        )}

        {mergeVenues.length > 0 && (
          <div className={styles.section}>
            <Accordion className={styles.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
                <div className={styles.accordionTitle}>
                  📍 Historical Addresses (Optional)
                  {historicalAddresses.size > 0 && (
                    <span className={styles.badge}>{historicalAddresses.size}</span>
                  )}
                </div>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <p className={styles.hint}>
                  Mark venues whose addresses are historical (e.g., venue moved locations). These
                  addresses will be saved to venue history with time periods.
                </p>
                {mergeVenues.map((venue) => (
                  <div key={venue.id} className={styles.historicalItem}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={historicalAddresses.has(venue.id)}
                          onChange={(e) => toggleHistoricalAddress(venue.id, e.target.checked)}
                        />
                      }
                      label={
                        <span className={styles.historicalLabel}>
                          <strong>{venue.venue}</strong> - {venue.address1}, {venue.city} (ID:{' '}
                          {venue.id})
                        </span>
                      }
                    />
                    {historicalAddresses.has(venue.id) && (
                      <div className={styles.historicalFields}>
                        <TextField
                          label="From Year"
                          type="number"
                          size="small"
                          placeholder="e.g., 1995"
                          value={historicalAddresses.get(venue.id)?.from_year || ''}
                          onChange={(e) =>
                            updateHistoricalAddress(
                              venue.id,
                              'from_year',
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          className={styles.yearField}
                        />
                        <TextField
                          label="To Year"
                          type="number"
                          size="small"
                          placeholder="e.g., 2015"
                          value={historicalAddresses.get(venue.id)?.to_year || ''}
                          onChange={(e) =>
                            updateHistoricalAddress(
                              venue.id,
                              'to_year',
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                          className={styles.yearField}
                        />
                        <TextField
                          label="Notes"
                          size="small"
                          fullWidth
                          placeholder="e.g., Original location before moving to current address"
                          value={historicalAddresses.get(venue.id)?.notes || ''}
                          onChange={(e) =>
                            updateHistoricalAddress(venue.id, 'notes', e.target.value || null)
                          }
                          className={styles.notesField}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </AccordionDetails>
            </Accordion>
          </div>
        )}

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
              {historicalNames.size > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Historical Names:</span>
                  <span className={styles.summaryValue}>
                    {historicalNames.size} name{historicalNames.size !== 1 ? 's' : ''} will be saved
                    to history
                  </span>
                </div>
              )}
              {historicalAddresses.size > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Historical Addresses:</span>
                  <span className={styles.summaryValue}>
                    {historicalAddresses.size} address{historicalAddresses.size !== 1 ? 'es' : ''}{' '}
                    will be saved to history
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isMerging} className={styles.cancelButton}>
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
