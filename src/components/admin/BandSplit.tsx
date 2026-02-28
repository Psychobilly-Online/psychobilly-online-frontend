'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ActionButton from '@/components/common/ActionButton';
import Tag from '@/components/common/Tag';
import type { Band } from '@/hooks/useBandList';
import styles from './BandSplit.module.css';

interface BandSplitProps {
  band: Band;
  onCancel: () => void;
  onSplitComplete: () => void;
}

interface SplitSummary {
  original_band: string;
  created_bands: Array<{
    id: number;
    name: string;
  }>;
  updated_tables: Record<string, number>;
  deleted_band_id: number;
}

const COMMON_SEPARATORS = [
  { label: '&', value: '&', description: 'Ampersand (most common)' },
  { label: 'and', value: 'and', description: 'Word "and"' },
  { label: '+', value: '+', description: 'Plus sign' },
  { label: '/', value: '/', description: 'Forward slash' },
  { label: ',', value: ',', description: 'Comma' },
];

export default function BandSplit({ band, onCancel, onSplitComplete }: BandSplitProps) {
  const [separator, setSeparator] = useState('&');
  const [customSeparator, setCustomSeparator] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splitSummary, setSplitSummary] = useState<SplitSummary | null>(null);
  const { token } = useAuth();

  const effectiveSeparator = separator === 'custom' ? customSeparator : separator;

  // Preview the split result
  const previewSplit = (): string[] => {
    if (!effectiveSeparator.trim()) return [band.name];

    const parts = band.name
      .split(
        new RegExp(`\\s*${effectiveSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'),
      )
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    return parts.length > 1 ? parts : [band.name];
  };

  const splitParts = previewSplit();
  const canSplit = splitParts.length >= 2;

  const handleSplitClick = () => {
    if (!canSplit) {
      setError('No valid split detected. Please check the separator.');
      return;
    }

    if (splitParts.length > 5) {
      setError('Too many parts detected (max 5). Please verify the separator.');
      return;
    }

    setShowConfirm(true);
  };

  const handleSplit = async () => {
    if (!token || !canSplit) return;

    setShowConfirm(false);
    setIsSplitting(true);
    setError(null);
    setSplitSummary(null);

    try {
      const response = await fetch('/api/bands/split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          band_id: band.id,
          separator: effectiveSeparator,
          band_names: splitParts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Split failed');
      }

      setSplitSummary(data);

      // Clear and refresh after 5 seconds
      setTimeout(() => {
        onSplitComplete();
        setSplitSummary(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed');
    } finally {
      setIsSplitting(false);
    }
  };

  if (splitSummary) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <h3>✅ Band Split Successful!</h3>
          <p>
            <strong>Original Band:</strong> {splitSummary.original_band} (ID:{' '}
            {splitSummary.deleted_band_id})
          </p>
          <p>
            <strong>Created {splitSummary.created_bands.length} New Bands:</strong>
          </p>
          <ul className={styles.createdBands}>
            {splitSummary.created_bands.map((newBand) => (
              <li key={newBand.id}>
                {newBand.name} (ID: {newBand.id})
              </li>
            ))}
          </ul>
          <p>
            <strong>Updated Tables:</strong>
          </p>
          <ul>
            {Object.entries(splitSummary.updated_tables).map(([table, count]) => (
              <li key={table}>
                {table}: {count} {count === 1 ? 'row' : 'rows'} updated
              </li>
            ))}
          </ul>
          <p className={styles.autoClose}>
            This dialog will close automatically in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Split Band</h2>
        <p className={styles.subtitle}>Split "{band.name}" into separate band entries</p>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className={styles.bandInfo}>
        <strong>Band to Split:</strong> {band.name} (ID: {band.id})
      </div>

      {/* Separator Selection */}
      <div className={styles.separatorSection}>
        <h3 className={styles.sectionTitle}>1. Choose Separator</h3>
        <div className={styles.separatorOptions}>
          {COMMON_SEPARATORS.map((sep) => (
            <label key={sep.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="separator"
                value={sep.value}
                checked={separator === sep.value}
                onChange={(e) => setSeparator(e.target.value)}
                disabled={isSplitting}
              />
              <span className={styles.radioText}>
                <strong>{sep.label}</strong> - {sep.description}
              </span>
            </label>
          ))}
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="separator"
              value="custom"
              checked={separator === 'custom'}
              onChange={(e) => setSeparator(e.target.value)}
              disabled={isSplitting}
            />
            <span className={styles.radioText}>
              <strong>Custom:</strong>
              <input
                type="text"
                className={styles.customInput}
                value={customSeparator}
                onChange={(e) => setCustomSeparator(e.target.value)}
                placeholder="Enter custom separator"
                disabled={separator !== 'custom' || isSplitting}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>2. Preview Split Result</h3>
        {splitParts.length === 1 ? (
          <div className={styles.previewWarning}>
            ⚠️ No split detected with "{effectiveSeparator}". Try a different separator.
          </div>
        ) : (
          <div className={styles.previewList}>
            <p className={styles.previewInfo}>
              Will create <strong>{splitParts.length} new bands:</strong>
            </p>
            {splitParts.map((part, index) => (
              <div key={index} className={styles.previewItem}>
                <Tag variant="primary">{index + 1}</Tag>
                <span className={styles.previewBandName}>{part}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className={styles.warningBox}>
        <p>
          <strong>⚠️ Important:</strong>
        </p>
        <ul>
          <li>The original band "{band.name}" will be deleted</li>
          <li>All event references will be updated to point to the new bands</li>
          <li>Genres will be copied to all new bands</li>
          <li>This action cannot be undone</li>
        </ul>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <ActionButton onClick={onCancel} variant="ghost" disabled={isSplitting}>
          Cancel
        </ActionButton>
        <ActionButton
          onClick={handleSplitClick}
          disabled={!canSplit || isSplitting}
          variant="primary"
          loading={isSplitting}
        >
          {isSplitting ? 'Splitting...' : `Split into ${splitParts.length} Bands`}
        </ActionButton>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSplit}
        title="Confirm Band Split"
        confirmText="Split Band"
        confirmColor="warning"
        isLoading={isSplitting}
        message={
          <div>
            <p>
              Are you sure you want to split <strong>"{band.name}"</strong> into{' '}
              <strong>{splitParts.length} bands</strong>?
            </p>
            <p>
              <strong>This action cannot be undone.</strong>
            </p>
            <p>The following bands will be created:</p>
            <ul>
              {splitParts.map((part, index) => (
                <li key={index}>{part}</li>
              ))}
            </ul>
          </div>
        }
      />
    </div>
  );
}
