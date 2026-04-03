'use client';

import ActionButton from '@/components/common/ActionButton';
import styles from './VenueSelectionActionBar.module.css';

interface VenueSelectionActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  onEditVenue?: () => void;
  onViewEvents?: () => void;
  onMergeVenues?: () => void;
  onDeleteVenue?: () => void;
}

/**
 * Context-aware action bar for venue selection
 * - Single venue: Show Edit, View Events, Delete
 * - Multiple venues: Show Merge
 */
export default function VenueSelectionActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onEditVenue,
  onViewEvents,
  onMergeVenues,
  onDeleteVenue,
}: VenueSelectionActionBarProps) {
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
          {selectedCount} {selectedCount === 1 ? 'venue' : 'venues'} selected
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
        {/* Single Venue Actions */}
        {isSingleSelection && (
          <>
            {onEditVenue && (
              <ActionButton onClick={onEditVenue} variant="primary" size="small">
                ✏️ Edit Venue
              </ActionButton>
            )}
            {onViewEvents && (
              <ActionButton onClick={onViewEvents} variant="secondary" size="small">
                📅 View Events
              </ActionButton>
            )}
            {onDeleteVenue && (
              <ActionButton onClick={onDeleteVenue} variant="danger" size="small">
                🗑️ Delete Venue
              </ActionButton>
            )}
          </>
        )}

        {/* Multiple Venue Actions */}
        {isMultipleSelection && (
          <>
            {onMergeVenues && (
              <ActionButton onClick={onMergeVenues} variant="primary" size="small">
                🔗 Merge Venues ({selectedCount})
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
