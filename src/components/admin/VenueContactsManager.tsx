'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '@/contexts/AuthContext';
import type { VenueContact } from '@/types/venue';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import VenueSocialMediaManager from './VenueSocialMediaManager';
import { StyledTextField, StyledCheckbox } from '@/components/common/form';
import styles from './VenueContactsManager.module.css';

interface SocialMediaLink {
  id: number;
  social_media_id: number;
  platform_name: string;
  platform_icon?: string;
  url: string;
  is_verified: boolean;
}

interface VenueContactsManagerProps {
  venueId: number;
  initialContacts: VenueContact[];
  onContactsChange?: (contacts: VenueContact[]) => void;
}

export default function VenueContactsManager({
  venueId,
  initialContacts,
  onContactsChange,
}: VenueContactsManagerProps) {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<VenueContact[]>(initialContacts);
  const [editingContact, setEditingContact] = useState<VenueContact | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<VenueContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contactSocialMedia, setContactSocialMedia] = useState<Record<number, SocialMediaLink[]>>(
    {},
  );

  // Form state
  const [formData, setFormData] = useState({
    contact_name: '',
    role: '',
    is_primary: false,
    phone_mobile: '',
    phone_landline: '',
    email: '',
    website_url: '',
    notes: '',
  });

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const resetForm = () => {
    setFormData({
      contact_name: '',
      role: '',
      is_primary: false,
      phone_mobile: '',
      phone_landline: '',
      email: '',
      website_url: '',
      notes: '',
    });
    setEditingContact(null);
    setIsAdding(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const loadContactSocialMedia = async (contactId: number) => {
    if (contactSocialMedia[contactId]) {
      return; // Already loaded
    }

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/social-media`);
      if (!response.ok) throw new Error('Failed to load social media');
      const data = await response.json();
      setContactSocialMedia((prev) => ({
        ...prev,
        [contactId]: data.social_media || [],
      }));
    } catch (err) {
      console.error('Failed to load contact social media:', err);
    }
  };
  const handleEdit = (contact: VenueContact) => {
    setFormData({
      contact_name: contact.contact_name,
      role: contact.role || '',
      is_primary: contact.is_primary,
      phone_mobile: contact.phone_mobile || '',
      phone_landline: contact.phone_landline || '',
      email: contact.email || '',
      website_url: contact.website_url || '',
      notes: contact.notes || '',
    });
    setEditingContact(contact);
    setIsAdding(false);
    // Load social media for editing
    loadContactSocialMedia(contact.id);
  };

  const handleSave = async () => {
    if (!formData.contact_name.trim()) {
      setError('Contact name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        // Convert empty strings to null for optional fields (but keep empty string for notes to allow clearing)
        role: formData.role || null,
        phone_mobile: formData.phone_mobile || null,
        phone_landline: formData.phone_landline || null,
        email: formData.email || null,
        website_url: formData.website_url || null,
        // notes: keep as empty string to allow clearing
      };

      const url = editingContact
        ? `/api/admin/venues/${venueId}/contacts/${editingContact.id}`
        : `/api/admin/venues/${venueId}/contacts`;

      const method = editingContact ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to save contact');
      }

      const result = await response.json();

      // Update local state
      const updatedContacts = editingContact
        ? contacts.map((c) => (c.id === result.id ? result : c))
        : [...contacts, result];

      setContacts(updatedContacts);
      onContactsChange?.(updatedContacts);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (contact: VenueContact) => {
    setContactToDelete(contact);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/venues/${venueId}/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete contact');
      }

      // Update local state
      const updatedContacts = contacts.filter((c) => c.id !== contactToDelete.id);
      setContacts(updatedContacts);
      onContactsChange?.(updatedContacts);
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Venue Contacts</h3>
        {!isAdding && !editingContact && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outlined"
            size="small"
            className={styles.addButton}
          >
            + Add Contact
          </Button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Contact List */}
      {contacts.length > 0 && !isAdding && !editingContact && (
        <div className={styles.contactsList}>
          {contacts.map((contact) => (
            <Accordion
              key={contact.id}
              className={styles.contactItem}
              onChange={(_, expanded) => {
                if (expanded) {
                  loadContactSocialMedia(contact.id);
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.summary}>
                <div className={styles.summaryContent}>
                  <span className={styles.contactName}>
                    {contact.contact_name}
                    {contact.is_primary && <span className={styles.primaryBadge}>PRIMARY</span>}
                  </span>
                  {contact.role && <span className={styles.role}>{contact.role}</span>}
                </div>
                <div className={styles.actions}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(contact);
                    }}
                    className={styles.iconButton}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(contact);
                    }}
                    className={styles.iconButton}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </AccordionSummary>
              <AccordionDetails className={styles.details}>
                {contact.email && (
                  <div className={styles.contactDetail}>
                    <strong>Email:</strong> {contact.email}
                  </div>
                )}
                {contact.phone_mobile && (
                  <div className={styles.contactDetail}>
                    <strong>Mobile:</strong> {contact.phone_mobile}
                  </div>
                )}
                {contact.phone_landline && (
                  <div className={styles.contactDetail}>
                    <strong>Landline:</strong> {contact.phone_landline}
                  </div>
                )}
                {contact.website_url && (
                  <div className={styles.contactDetail}>
                    <strong>Website:</strong> {contact.website_url}
                  </div>
                )}
                {contact.notes && (
                  <div className={styles.contactDetail}>
                    <strong>Notes:</strong> {contact.notes}
                  </div>
                )}

                {/* Social Media Section */}
                <div className={styles.socialMediaSection}>
                  <h4>Social Media</h4>
                  <VenueSocialMediaManager
                    entityType="contact"
                    entityId={contact.id}
                    initialLinks={contactSocialMedia[contact.id] || []}
                    onLinksChange={(links) => {
                      setContactSocialMedia((prev) => ({
                        ...prev,
                        [contact.id]: links,
                      }));
                    }}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}

      {/* Contact Form */}
      {(isAdding || editingContact) && (
        <div className={styles.form}>
          <h4 className={styles.formTitle}>
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </h4>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Name *</label>
              <StyledTextField
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Role</label>
              <StyledTextField
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="e.g., Manager, Booking Agent"
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <StyledTextField
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mobile Phone</label>
              <StyledTextField
                value={formData.phone_mobile}
                onChange={(e) => handleChange('phone_mobile', e.target.value)}
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Landline Phone</label>
              <StyledTextField
                value={formData.phone_landline}
                onChange={(e) => handleChange('phone_landline', e.target.value)}
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Website URL</label>
              <StyledTextField
                value={formData.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                fullWidth
                disabled={isSaving}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Notes</label>
              <StyledTextField
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={isSaving}
              />
            </div>

            {/* Social Media Section - Only show when editing existing contact */}
            {editingContact && (
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <div className={styles.socialMediaSection}>
                  <h4>Social Media</h4>
                  <VenueSocialMediaManager
                    entityType="contact"
                    entityId={editingContact.id}
                    initialLinks={contactSocialMedia[editingContact.id] || []}
                    onLinksChange={(links) => {
                      setContactSocialMedia((prev) => ({
                        ...prev,
                        [editingContact.id]: links,
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={formData.is_primary}
                    onChange={(e) => handleChange('is_primary', e.target.checked)}
                    disabled={isSaving}
                  />
                }
                label="Primary Contact"
                className={styles.checkbox}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              onClick={resetForm}
              disabled={isSaving}
              variant="outlined"
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
              {isSaving ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {contactToDelete && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setContactToDelete(null);
            setError(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Contact"
          message={
            <div>
              <p>Are you sure you want to delete {contactToDelete.contact_name}?</p>
              {error && (
                <p style={{ marginTop: '12px', color: 'var(--color-error)', fontSize: '14px' }}>
                  Error: {error}
                </p>
              )}
            </div>
          }
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
