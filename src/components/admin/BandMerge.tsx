'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { Band } from './BandManagement';
import styles from './BandMerge.module.css';

interface BandMergeProps {
  bands: Band[];
  onRemoveBand: (bandId: number) => void;
  onClearSelection: () => void;
  onMergeComplete: () => void;
}

interface MergeSummary {
  target_band: string;
  merged_count: number;
  updated_tables: Record<string, number>;
  deleted_bands: number[];
  name_variations_added: string[];
}

export default function BandMerge({ bands, onRemoveBand, onClearSelection, onMergeComplete }: BandMergeProps) {
  const [targetId, setTargetId] = useState<number | null>(null);
  const [addToVariations, setAddToVariations] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergeSummary, setMergeSummary] = useState<MergeSummary | null>(null);
  const { token } = useAuth();

  const handleMergeClick = () => {
    if (!targetId) return;

    const sourceIds = bands.filter(b => b.id !== targetId).map(b => b.id);

    if (sourceIds.length === 0) {
      setError('Please select at least 2 bands to merge');
      return;
    }

    setShowConfirm(true);
  };

  const handleMerge = async () => {
    if (!targetId || !token) return;

    const sourceIds = bands.filter(b => b.id !== targetId).map(b => b.id);

    setShowConfirm(false);
    setIsMerging(true);
    setError(null);
    setMergeSummary(null);

    try {
      const response = await fetch('/api/bands/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_id: targetId,
          source_ids: sourceIds,
          add_to_variations: addToVariations
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Merge failed');
      }

      setMergeSummary(data);
      
      // Clear selection after 5 seconds to give time to read summary
      setTimeout(() => {
        onMergeComplete();
        setMergeSummary(null);
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Merge Bands</h2>
        <button 
          className={styles.clearButton}
          onClick={onClearSelection}
          disabled={isMerging}
        >
          Clear Selection
        </button>
      </div>

      <div className={styles.bandsList}>
        <p className={styles.instruction}>
          Select the <strong>target band</strong> (the one to keep) and merge the others into it:
        </p>

        {bands.map((band) => (
          <div key={band.id} className={styles.bandItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="targetBand"
                value={band.id}
                checked={targetId === band.id}
                onChange={() => setTargetId(band.id)}
                disabled={isMerging}
              />
              <div className={styles.bandDetails}>
                <div className={styles.bandName}>
                  {band.name}
                  <span className={styles.bandId}>ID: {band.id}</span>
                  {targetId === band.id && <span className={styles.targetBadge}>TARGET</span>}
                </div>
                
                {band.name_variations && band.name_variations.length > 0 && (
                  <div className={styles.variations}>
                    Variations: {band.name_variations.join(', ')}
                  </div>
                )}
              </div>
            </label>

            <button
              className={styles.removeButton}
              onClick={() => onRemoveBand(band.id)}
              disabled={isMerging}
              title="Remove from selection"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className={styles.options}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={addToVariations}
            onChange={(e) => setAddToVariations(e.target.checked)}
            disabled={isMerging}
          />
          Add merged band names to target's name variations
        </label>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {mergeSummary && (
        <div className={styles.success}>
          <h3>✓ Merge Successful</h3>
          <div className={styles.summaryDetails}>
            <p>
              <strong>Merged {mergeSummary.merged_count} band(s) into:</strong> {mergeSummary.target_band}
            </p>
            
            <div className={styles.summarySection}>
              <strong>Updated Records:</strong>
              <ul className={styles.summaryList}>
                {mergeSummary.updated_tables && Object.entries(mergeSummary.updated_tables).map(([table, count]) => (
                  <li key={table}>
                    <code>{table}</code>: {count} {count === 1 ? 'record' : 'records'}
                  </li>
                ))}
              </ul>
            </div>

            {mergeSummary.name_variations_added && mergeSummary.name_variations_added.length > 0 && (
              <div className={styles.summarySection}>
                <strong>Added to name variations:</strong>
                <ul className={styles.summaryList}>
                  {mergeSummary.name_variations_added.map((variation, idx) => (
                    <li key={idx}>{variation}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.summarySection}>
              <strong>Deleted band IDs:</strong> {mergeSummary.deleted_bands?.join(', ') || 'None'}
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.mergeButton}
          onClick={handleMergeClick}
          disabled={!targetId || bands.length < 2 || isMerging}
        >
          {isMerging ? 'Merging...' : `Merge ${bands.filter(b => b.id !== targetId).length} band(s) into selected`}
        </button>
      </div>

      {targetId && (
        <div className={styles.preview}>
          <h3>Merge Preview:</h3>
          <ul>
            <li><strong>Target:</strong> {bands.find(b => b.id === targetId)?.name} (ID: {targetId})</li>
            <li><strong>Will be deleted:</strong> {bands.filter(b => b.id !== targetId).map(b => `${b.name} (ID: ${b.id})`).join(', ')}</li>
            <li><strong>All references will be updated</strong> to point to the target band</li>
            {addToVariations && (
              <li>
                <strong>Name variations will include:</strong>{' '}
                {bands.filter(b => b.id !== targetId).map(b => b.name).join(', ')}
              </li>
            )}
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleMerge}
        title="Confirm Band Merge"
        confirmText="Merge Bands"
        confirmColor="warning"
        isLoading={isMerging}
        message={
          <div>
            <p>
              Are you sure you want to merge <strong>{bands.filter(b => b.id !== targetId).length} band(s)</strong>{' '}
              into <strong>"{bands.find(b => b.id === targetId)?.name}"</strong>?
            </p>
            <p>
              <strong>This action cannot be undone.</strong>
            </p>
            <p>The following bands will be deleted:</p>
            <ul>
              {bands.filter(b => b.id !== targetId).map(b => (
                <li key={b.id}>{b.name} (ID: {b.id})</li>
              ))}
            </ul>
          </div>
        }
      />
    </div>
  );
}
