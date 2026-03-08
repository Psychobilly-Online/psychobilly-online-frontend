'use client';

import { useState, useEffect } from 'react';
import { Button, IconButton, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { StyledTextField } from '@/components/common/form';
import styles from './VenueSocialMediaManager.module.css';

interface SocialMediaLink {
  id: number;
  social_media_id: number;
  platform_name: string;
  platform_icon?: string;
  url: string;
  is_verified: boolean;
}

interface Platform {
  id: number;
  name: string;
  base_url: string;
  icon: string;
  display_order: number;
}

interface VenueSocialMediaManagerProps {
  entityType: 'venue' | 'contact';
  entityId: number;
  initialLinks: SocialMediaLink[];
  onLinksChange?: (links: SocialMediaLink[]) => void;
}

export default function VenueSocialMediaManager({
  entityType,
  entityId,
  initialLinks,
  onLinksChange,
}: VenueSocialMediaManagerProps) {
  // Map entity type to API path
  const apiPath = entityType === 'venue' ? 'venues' : 'contacts';
  const { token } = useAuth();
  const [links, setLinks] = useState<SocialMediaLink[]>(initialLinks);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<SocialMediaLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<number | ''>('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setIsLoadingPlatforms(true);
    try {
      const response = await fetch('/api/social-media/platforms');
      if (!response.ok) throw new Error('Failed to load platforms');
      const data = await response.json();
      setPlatforms(data.platforms || []);
    } catch (err) {
      console.error('Failed to load platforms:', err);
      setError('Failed to load social media platforms');
    } finally {
      setIsLoadingPlatforms(false);
    }
  };

  const resetForm = () => {
    setSelectedPlatform('');
    setLinkUrl('');
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!selectedPlatform || !linkUrl.trim()) {
      setError('Platform and URL are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/${apiPath}/${entityId}/social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          social_media_id: selectedPlatform,
          url: linkUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to add link');
      }

      const result = await response.json();

      // Add platform info to the result
      const platform = platforms.find((p) => p.id === selectedPlatform);
      const newLink: SocialMediaLink = {
        ...result,
        platform_name: platform?.name || '',
        platform_icon: platform?.icon || '',
      };

      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      onLinksChange?.(updatedLinks);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (link: SocialMediaLink) => {
    setLinkToDelete(link);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/${apiPath}/${entityId}/social-media/${linkToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete link');
      }

      const updatedLinks = links.filter((l) => l.id !== linkToDelete.id);
      setLinks(updatedLinks);
      onLinksChange?.(updatedLinks);
      setDeleteConfirmOpen(false);
      setLinkToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailablePlatforms = () => {
    const usedPlatformIds = links.map((l) => l.social_media_id);
    return platforms.filter((p) => !usedPlatformIds.includes(p.id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Social Media Links</h3>
        {!isAdding && getAvailablePlatforms().length > 0 && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outlined"
            size="small"
            className={styles.addButton}
            disabled={isLoadingPlatforms}
          >
            + Add Link
          </Button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Links List */}
      {links.length > 0 && !isAdding && (
        <div className={styles.linksList}>
          {links.map((link) => (
            <div key={link.id} className={styles.linkItem}>
              <div className={styles.linkInfo}>
                <span className={styles.platformName}>{link.platform_name}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkUrl}
                >
                  {link.url}
                </a>
              </div>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(link)}
                className={styles.deleteButton}
                disabled={isSaving}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Form */}
      {isAdding && (
        <div className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Platform *</label>
              <StyledTextField
                select
                value={selectedPlatform}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPlatform(val === '' ? '' : Number(val));
                }}
                fullWidth
                disabled={isSaving || isLoadingPlatforms}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      className: styles.selectMenu,
                    },
                  },
                }}
              >
                {getAvailablePlatforms().map((platform) => (
                  <MenuItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </MenuItem>
                ))}
              </StyledTextField>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>URL *</label>
              <StyledTextField
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                fullWidth
                disabled={isSaving}
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
              {isSaving ? 'Saving...' : 'Add Link'}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {linkToDelete && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setLinkToDelete(null);
            setError(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Social Media Link"
          message={
            <div>
              <p>Are you sure you want to delete the {linkToDelete.platform_name} link?</p>
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
