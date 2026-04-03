'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  FormControlLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/contexts/AuthContext';
import { useMetadata } from '@/contexts/MetadataContext';
import type { Venue, VenueStatus, VenueContact } from '@/types/venue';
import VenueContactsManager from './VenueContactsManager';
import VenueSocialMediaManager, { type SocialMediaLink } from './VenueSocialMediaManager';
import { StyledTextField, StyledCheckbox } from '@/components/common/form';
import styles from './EditVenueDialog.module.css';

interface EditVenueDialogProps {
  open: boolean;
  venue: Venue;
  onClose: () => void;
  onSave: (updatedVenue: Venue) => void;
}

export default function EditVenueDialog({ open, venue, onClose, onSave }: EditVenueDialogProps) {
  const { token } = useAuth();
  const { countries } = useMetadata();

  // Form state
  const [formData, setFormData] = useState({
    venue: venue.venue,
    country_id: venue.country_id,
    state_id: venue.state_id || '',
    city_id: venue.city_id || null,
    city: venue.city,
    zip: venue.zip || '',
    address1: venue.address1 || '',
    address2: venue.address2 || '',
    lat: venue.lat || '',
    long: venue.long || '',
    url: venue.url || '',
    text: venue.text || '',
    status: venue.status || 'active',
    status_reason: venue.status_reason || '',
    reopening_date: venue.reopening_date || '',
    approved: venue.approved,
  });

  // Name variations state
  const [variations, setVariations] = useState<string[]>(venue.name_variations || []);
  const [newVariation, setNewVariation] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState<string | null>(null);

  // Contacts and social media state
  const [contacts, setContacts] = useState<VenueContact[]>([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);

  // Track original address fields to detect changes
  const [originalAddress, setOriginalAddress] = useState({
    country_id: venue.country_id,
    city: venue.city,
    zip: venue.zip || '',
    address1: venue.address1 || '',
    address2: venue.address2 || '',
  });

  // Reset form when venue changes
  useEffect(() => {
    const addressFields = {
      country_id: venue.country_id,
      city: venue.city,
      zip: venue.zip || '',
      address1: venue.address1 || '',
      address2: venue.address2 || '',
    };

    setFormData({
      venue: venue.venue,
      country_id: venue.country_id,
      state_id: venue.state_id || '',
      city_id: venue.city_id || null,
      city: venue.city,
      zip: venue.zip || '',
      address1: venue.address1 || '',
      address2: venue.address2 || '',
      lat: venue.lat || '',
      long: venue.long || '',
      url: venue.url || '',
      text: venue.text || '',
      status: venue.status || 'active',
      status_reason: venue.status_reason || '',
      reopening_date: venue.reopening_date || '',
      approved: venue.approved,
    });

    setVariations(venue.name_variations || []);
    setNewVariation('');
    setOriginalAddress(addressFields);
    setError(null);
    setGeocodeSuccess(null);

    // Load contacts and social media when dialog opens
    if (open) {
      loadExtras();
    }
  }, [venue, open]);

  const loadExtras = async () => {
    setIsLoadingExtras(true);
    try {
      // Load contacts
      const contactsResponse = await fetch(`/api/admin/venues/${venue.id}/contacts`);
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts || []);
      }

      // Load social media links
      const socialResponse = await fetch(`/api/admin/venues/${venue.id}/social-media`);
      if (socialResponse.ok) {
        const socialData = await socialResponse.json();
        setSocialMediaLinks(socialData.social_media || []);
      }
    } catch (err) {
      console.error('Failed to load contacts/social media:', err);
    } finally {
      setIsLoadingExtras(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Variation handlers
  const handleAddVariation = () => {
    const trimmed = newVariation.trim();
    if (trimmed && !variations.includes(trimmed)) {
      setVariations([...variations, trimmed]);
      setNewVariation('');
    }
  };

  const handleRemoveVariation = (variation: string) => {
    setVariations(variations.filter((v) => v !== variation));
  };

  const handleVariationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariation();
    }
  };

  // Check if address has changed from original
  const addressHasChanged = () => {
    return (
      formData.country_id !== originalAddress.country_id ||
      formData.city !== originalAddress.city ||
      formData.zip !== originalAddress.zip ||
      formData.address1 !== originalAddress.address1 ||
      formData.address2 !== originalAddress.address2
    );
  };

  // Determine if geocode button should be visible
  const showGeocodeButton = !formData.lat || !formData.long || addressHasChanged();

  // Clear coordinates
  const handleClearCoordinates = () => {
    setFormData((prev) => ({ ...prev, lat: '', long: '' }));
  };

  const handleGeocode = async () => {
    // Validation
    if (!formData.city.trim()) {
      setError('City is required for geocoding');
      return;
    }

    setIsGeocoding(true);
    setError(null);
    setGeocodeSuccess(null);

    try {
      // Get country name from countries list
      const country = countries.find((c) => String(c.id) === formData.country_id);
      const countryName = country?.name || '';

      const response = await fetch('/api/admin/venues/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address1: formData.address1,
          city: formData.city,
          zip: formData.zip,
          country: countryName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Failed to geocode address');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Update lat/long fields
        setFormData((prev) => ({
          ...prev,
          lat: result.data.latitude,
          long: result.data.longitude,
        }));

        setGeocodeSuccess(
          `Coordinates found! ${result.data.formatted_address || 'Location verified'} (Confidence: ${result.data.confidence}/10)`,
        );

        // Clear success message after 5 seconds
        setTimeout(() => setGeocodeSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to geocode address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.venue.trim()) {
      setError('Venue name is required');
      return;
    }
    if (!formData.country_id) {
      setError('Country is required');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Prepare payload - convert empty strings to null for date fields only
      // Keep text as empty string (TEXT field can handle it, unlike DATE fields)
      const payload = {
        ...formData,
        name_variations: variations,
        status_reason: formData.status_reason || null,
        reopening_date: formData.reopening_date || null,
      };

      const response = await fetch(`/api/admin/venues/${venue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update venue');
      }

      const result = await response.json();

      // Call onSave with the updated venue
      if (result.venue) {
        onSave(result.venue);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update venue');
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
      <DialogTitle className={styles.dialogTitle}>Edit Venue: {venue.venue}</DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {error && <div className={styles.error}>{error}</div>}

        {geocodeSuccess && <div className={styles.success}>{geocodeSuccess}</div>}

        <div className={styles.formGrid}>
          {/* Venue Name */}
          <div className={styles.formGroup}>
            <label htmlFor="venue-name" className={styles.label}>
              Venue Name *
            </label>
            <StyledTextField
              id="venue-name"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              fullWidth
              disabled={isSaving}
            />
          </div>

          {/* Name Variations */}
          <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="new-variation" className={styles.label}>
              Name Variations
            </label>
            <p className={styles.hint}>
              Add alternative spellings or common variations (e.g., "SO36" vs "SO 36")
            </p>

            <div className={styles.variationInput}>
              <StyledTextField
                id="new-variation"
                value={newVariation}
                onChange={(e) => setNewVariation(e.target.value)}
                onKeyPress={handleVariationKeyPress}
                placeholder="Enter variation and press Enter"
                fullWidth
                disabled={isSaving}
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

          {/* Venue Data Accordion */}
          <Accordion className={styles.accordion} style={{ gridColumn: '1 / -1' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
              <div className={styles.accordionTitle}>Venue Data</div>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionDetails}>
              <div className={styles.formGrid}>
                {/* Country */}
                <div className={styles.formGroup}>
                  <label htmlFor="country" className={styles.label}>
                    Country *
                  </label>
                  <StyledTextField
                    id="country"
                    select
                    value={formData.country_id}
                    onChange={(e) => handleChange('country_id', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          className: styles.selectMenu,
                        },
                      },
                    }}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={String(country.id)}>
                        {country.print_name || country.name}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </div>

                {/* City */}
                <div className={styles.formGroup}>
                  <label htmlFor="city" className={styles.label}>
                    City *
                  </label>
                  <StyledTextField
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                  />
                </div>

                {/* ZIP Code */}
                <div className={styles.formGroup}>
                  <label htmlFor="zip" className={styles.label}>
                    ZIP Code
                  </label>
                  <StyledTextField
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleChange('zip', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                  />
                </div>

                {/* Address 1 */}
                <div className={styles.formGroup}>
                  <label htmlFor="address1" className={styles.label}>
                    Address Line 1
                  </label>
                  <StyledTextField
                    id="address1"
                    value={formData.address1}
                    onChange={(e) => handleChange('address1', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                  />
                </div>

                {/* Address 2 */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="address2" className={styles.label}>
                    Address Line 2
                  </label>
                  <StyledTextField
                    id="address2"
                    value={formData.address2}
                    onChange={(e) => handleChange('address2', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                  />
                </div>

                {/* Geocode Button - only show if coordinates are empty or address changed */}
                {showGeocodeButton && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <Button
                      variant="contained"
                      onClick={handleGeocode}
                      disabled={isSaving || isGeocoding || !formData.city}
                      className={styles.geocodeButton}
                    >
                      {isGeocoding ? '🌍 Geocoding...' : '🌍 Get Coordinates from Address'}
                    </Button>
                    <p className={styles.geocodeHint}>
                      {!formData.lat || !formData.long
                        ? 'Click to automatically fetch latitude and longitude based on the address above.'
                        : 'Address has changed. Click to update coordinates.'}
                    </p>
                  </div>
                )}

                {/* Coordinates Row - separate from other fields */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <div className={styles.coordinatesRow}>
                    {/* Latitude - readonly */}
                    <div className={styles.coordinateField}>
                      <label htmlFor="latitude" className={styles.label}>
                        Latitude
                      </label>
                      <StyledTextField
                        id="latitude"
                        value={formData.lat}
                        fullWidth
                        placeholder="e.g., 52.5200"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </div>

                    {/* Longitude - readonly */}
                    <div className={styles.coordinateField}>
                      <label htmlFor="longitude" className={styles.label}>
                        Longitude
                      </label>
                      <StyledTextField
                        id="longitude"
                        value={formData.long}
                        fullWidth
                        placeholder="e.g., 13.4050"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </div>
                  </div>

                  {/* Clear Coordinates Button */}
                  {(formData.lat || formData.long) && (
                    <Button
                      variant="outlined"
                      onClick={handleClearCoordinates}
                      disabled={isSaving}
                      size="small"
                      className={styles.clearCoordsButton}
                    >
                      Clear Coordinates
                    </Button>
                  )}
                </div>

                {/* Website URL */}
                <div className={styles.formGroup}>
                  <label htmlFor="url" className={styles.label}>
                    Website URL
                  </label>
                  <StyledTextField
                    id="url"
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    fullWidth
                    disabled={isSaving}
                    placeholder="https://example.com"
                  />
                </div>

                {/* Status */}
                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.label}>
                    Status *
                  </label>
                  <StyledTextField
                    id="status"
                    select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as VenueStatus)}
                    fullWidth
                    disabled={isSaving}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          className: styles.selectMenu,
                        },
                      },
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="temporarily_closed">Temporarily Closed</MenuItem>
                    <MenuItem value="permanently_closed">Permanently Closed</MenuItem>
                  </StyledTextField>
                </div>

                {formData.status !== 'active' && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="status-reason" className={styles.label}>
                      Status Reason
                    </label>
                    <StyledTextField
                      id="status-reason"
                      value={formData.status_reason}
                      onChange={(e) => handleChange('status_reason', e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={isSaving}
                      placeholder="Reason for closure..."
                    />
                  </div>
                )}

                {formData.status === 'temporarily_closed' && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="reopening-date" className={styles.label}>
                      Expected Reopening Date
                    </label>
                    <StyledTextField
                      id="reopening-date"
                      type="date"
                      value={formData.reopening_date}
                      onChange={(e) => handleChange('reopening_date', e.target.value)}
                      fullWidth
                      disabled={isSaving}
                      InputLabelProps={{ shrink: true }}
                    />
                  </div>
                )}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="text" className={styles.label}>
                    Description
                  </label>
                  <StyledTextField
                    id="text"
                    value={formData.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={isSaving}
                    placeholder="Additional information about this venue..."
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <FormControlLabel
                    control={
                      <StyledCheckbox
                        checked={formData.approved}
                        onChange={(e) => handleChange('approved', e.target.checked)}
                        disabled={isSaving}
                      />
                    }
                    label="Approved"
                  />
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Contacts and Social Media Sections */}
        <div>
          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
              <div className={styles.accordionTitle}>
                Social Media Links
                <span className={styles.badge}>{socialMediaLinks.length}</span>
              </div>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionDetails}>
              {isLoadingExtras ? (
                <div className={styles.loading}>Loading links...</div>
              ) : (
                <VenueSocialMediaManager
                  entityType="venue"
                  entityId={venue.id}
                  initialLinks={socialMediaLinks}
                  onLinksChange={setSocialMediaLinks}
                />
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.accordionSummary}>
              <div className={styles.accordionTitle}>
                Contacts
                <span className={styles.badge}>{contacts.length}</span>
              </div>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionDetails}>
              {isLoadingExtras ? (
                <div className={styles.loading}>Loading contacts...</div>
              ) : (
                <VenueContactsManager
                  venueId={venue.id}
                  initialContacts={contacts}
                  onContactsChange={setContacts}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={isSaving} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          className={styles.saveButton}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
