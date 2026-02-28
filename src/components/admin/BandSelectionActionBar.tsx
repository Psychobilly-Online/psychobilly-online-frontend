'use client';

import ActionButton from '@/components/common/ActionButton';
import styles from './BandSelectionActionBar.module.css';

interface BandSelectionActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  onEditBand?: () => void;
  onViewEvents?: () => void;
  onSplitBand?: () => void;
  onMergeBands?: () => void;
  onAssignGenres?: () => void;
}

/**
 * Context-aware action bar for band selection
 * - Single band: Show Edit, View Events, Split Name
 * - Multiple bands: Show Merge, Assign Genres
 */
export default function BandSelectionActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onEditBand,
  onViewEvents,
  onSplitBand,
  onMergeBands,
  onAssignGenres,
}: BandSelectionActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const isSingleSelection = selectedCount === 1;
  const isMultipleSelection = selectedCount > 1;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span className={styles.count}>
          {selectedCount} {selectedCount === 1 ? 'band' : 'bands'} selected
        </span>
        {onSelectAll && (
          <ActionButton 
            onClick={allSelected ? onClearSelection : onSelectAll} 
            variant="ghost" 
            size="small"
          >
            {allSelected ? '☐ Deselect All' : '☑ Select All on Page'}
          </ActionButton>
        )}
      </div>

      <div className={styles.actions}>
        {/* Single Band Actions */}
        {isSingleSelection && (
          <>
            {onEditBand && (
              <ActionButton onClick={onEditBand} variant="primary" size="small">
                ✏️ Edit Band
              </ActionButton>
            )}
            {onViewEvents && (
              <ActionButton onClick={onViewEvents} variant="secondary" size="small">
                📅 View Events
              </ActionButton>
            )}
            {onSplitBand && (
              <ActionButton onClick={onSplitBand} variant="secondary" size="small">
                ✂️ Split Name
              </ActionButton>
            )}
          </>
        )}

        {/* Multiple Band Actions */}
        {isMultipleSelection && (
          <>
            {onMergeBands && (
              <ActionButton onClick={onMergeBands} variant="primary" size="small">
                🔗 Merge Bands ({selectedCount})
              </ActionButton>
            )}
            {onAssignGenres && (
              <ActionButton onClick={onAssignGenres} variant="secondary" size="small">
                🏷️ Assign Genres
              </ActionButton>
            )}
          </>
        )}

        {/* Clear Selection - Always Available */}
        <ActionButton onClick={onClearSelection} variant="ghost" size="small">
          ✕ Clear Selection
        </ActionButton>
      </div>
    </div>
  );
}
