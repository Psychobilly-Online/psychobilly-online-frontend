'use client';

import type { MouseEvent, JSX } from 'react';
import { Chip, IconButton, Popover, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isSameDay } from 'date-fns';
import styles from './EventFilters.module.css';
import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';

interface EventFiltersDateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  dateOpen: boolean;
  dateAnchor: HTMLElement | null;
  onOpen: (event: MouseEvent<any>) => void;
  onClose: () => void;
  onUpdateDateRange: (start: Date | null, end: Date | null) => void;
  onCalendarChange: (date: Date | null) => void;
  onPresetChange: (
    preset: 'any' | 'today' | 'next-month' | 'next-3-months' | 'specific' | 'range',
  ) => void;
  selectedPreset: 'any' | 'today' | 'next-month' | 'next-3-months' | 'specific' | 'range' | null;
  calendarView: 'day' | 'month' | 'year';
  onViewChange: (view: 'day' | 'month' | 'year') => void;
  rangeDay: (props: PickersDayProps) => JSX.Element;
  formatDateLabel: (date: Date) => string;
  popoverPaperSx: object;
  popoverContainer?: HTMLElement | null;
  eventDates?: Set<number>;
}

export function EventFiltersDateRange({
  startDate,
  endDate,
  dateOpen,
  dateAnchor,
  onOpen,
  onClose,
  onUpdateDateRange,
  onCalendarChange,
  onPresetChange,
  selectedPreset,
  calendarView,
  onViewChange,
  rangeDay,
  formatDateLabel,
  popoverPaperSx,
  popoverContainer,
}: EventFiltersDateRangeProps) {
  // Determine display label
  const getDateLabel = () => {
    if (!startDate && !endDate) return 'From today';
    if (startDate && !endDate) {
      if (isSameDay(startDate, new Date(1950, 0, 1))) return 'Any date';
      if (isSameDay(startDate, new Date())) return 'From today';
      return `From ${formatDateLabel(startDate)}`;
    }
    if (startDate && endDate && isSameDay(startDate, endDate)) {
      return formatDateLabel(startDate);
    }
    return `${formatDateLabel(startDate!)} - ${formatDateLabel(endDate!)}`;
  };
  return (
    <div className={`${styles.formGroup} ${styles.dateRangeGroup}`}>
      <div className={styles.chipTriggerWrapper}>
        <Chip
          label={getDateLabel()}
          onClick={onOpen}
          onDelete={
            startDate || endDate
              ? (e) => {
                  e.stopPropagation();
                  onUpdateDateRange(null, null);
                }
              : undefined
          }
          variant="outlined"
        />
      </div>
      <Popover
        open={dateOpen}
        anchorEl={dateAnchor}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        container={popoverContainer ?? undefined}
        marginThreshold={16}
        disablePortal
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
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
            Date range
          </Typography>
          <IconButton
            size="small"
            className={styles.popoverCloseButton}
            onClick={onClose}
            aria-label="Close date range"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
          <Chip
            label="Any date"
            variant={selectedPreset === 'any' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('any')}
          />
          <Chip
            label="From today"
            variant={selectedPreset === 'today' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('today')}
          />
          <Chip
            label="Next month"
            variant={selectedPreset === 'next-month' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('next-month')}
          />
          <Chip
            label="Next 3 months"
            variant={selectedPreset === 'next-3-months' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('next-3-months')}
          />
          <Chip
            label="Specific date"
            variant={selectedPreset === 'specific' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('specific')}
          />
          <Chip
            label="Date range"
            variant={selectedPreset === 'range' ? 'filled' : 'outlined'}
            onClick={() => onPresetChange('range')}
          />
        </Stack>
        {(selectedPreset === 'specific' || selectedPreset === 'range') && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className={styles.dateRangeCalendar}>
              <DateCalendar
                value={endDate ?? startDate}
                onChange={onCalendarChange}
                view={calendarView}
                onViewChange={onViewChange}
                views={['year', 'month', 'day']}
                minDate={new Date(2009, 0, 1)}
                maxDate={new Date(new Date().getFullYear() + 2, 11, 31)}
                slots={{ day: rangeDay }}
              />
            </div>
          </LocalizationProvider>
        )}
      </Popover>
    </div>
  );
}
