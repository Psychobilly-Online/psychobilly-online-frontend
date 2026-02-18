'use client';

import type { MouseEvent } from 'react';
import { Chip, Popover, Stack, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './EventFilters.module.css';
import type { Category } from './EventFilters.types';

interface EventFiltersCategoriesProps {
  categories: Category[];
  selectedCategoryIds: string[];
  categoryCounts?: Record<number, number>;
  categoryOpen: boolean;
  categoryAnchor: HTMLElement | null;
  onOpen: (event: MouseEvent<any>) => void;
  onClose: () => void;
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  popoverPaperClassName: string;
  popoverContainer?: HTMLElement | null;
}

export function EventFiltersCategories({
  categories,
  selectedCategoryIds,
  categoryCounts,
  categoryOpen,
  categoryAnchor,
  onOpen,
  onClose,
  onToggleCategory,
  onClearCategories,
  popoverPaperClassName,
  popoverContainer,
}: EventFiltersCategoriesProps) {
  return (
    <div className={styles.chipSection}>
      <div className={`${styles.formGroup} ${styles.categoryGroup}`}>
        <div className={styles.chipTriggerWrapper}>
          <Stack className={styles.chipGroup} direction="row" flexWrap="wrap" onClick={onOpen}>
            {selectedCategoryIds.length === 0 && (
              <Chip label="All categories" variant="outlined" onClick={onOpen} />
            )}
            {selectedCategoryIds.length > 0 &&
              selectedCategoryIds.map((id) => {
                const category = categories.find((item) => String(item.id) === id);
                if (!category) return null;
                return (
                  <Chip
                    key={id}
                    label={category.name}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onToggleCategory(id);
                    }}
                    onClick={onOpen}
                    variant="outlined"
                  />
                );
              })}
          </Stack>
        </div>
        <Popover
          open={categoryOpen}
          anchorEl={categoryAnchor}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          container={popoverContainer ?? undefined}
          marginThreshold={16}
          disablePortal
          slotProps={{ paper: { className: popoverPaperClassName } }}
        >
          <div className={styles.refinePopover}>
            <div className={styles.popoverHeader}>
              <Typography
                className={styles.sectionTitle}
                onClick={onClose}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClose();
                  }
                }}
              >
                Categories
              </Typography>
              <IconButton
                size="small"
                className={styles.popoverCloseButton}
                onClick={onClose}
                aria-label="Close categories"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
              <Chip
                label="All categories"
                variant={selectedCategoryIds.length === 0 ? 'filled' : 'outlined'}
                onClick={onClearCategories}
              />
              {categories.map((category) => {
                const categoryId = String(category.id);
                const isSelected = selectedCategoryIds.includes(categoryId);
                const count = categoryCounts ? categoryCounts[category.id] || 0 : 0;
                const isDisabled = !!categoryCounts && count === 0 && !isSelected;
                return (
                  <Chip
                    key={category.id}
                    label={category.name}
                    variant={isSelected ? 'filled' : 'outlined'}
                    disabled={isDisabled}
                    onClick={() => onToggleCategory(categoryId)}
                  />
                );
              })}
            </Stack>
          </div>
        </Popover>
      </div>
    </div>
  );
}
