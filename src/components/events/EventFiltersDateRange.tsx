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
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  onUpdateDateRange: (start: Date | null, end: Date | null) => void;
  onCalendarChange: (date: Date | null) => void;
  calendarView: 'day' | 'month' | 'year';
  onViewChange: (view: 'day' | 'month' | 'year') => void;
  rangeDay: (props: PickersDayProps) => JSX.Element;
  formatDateLabel: (date: Date) => string;
  popoverPaperSx: object;
  popoverContainer?: HTMLElement | null;
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
  calendarView,
  onViewChange,
  rangeDay,
  formatDateLabel,
  popoverPaperSx,
  popoverContainer,
}: EventFiltersDateRangeProps) {
  return (
    <div className={`${styles.formGroup} ${styles.dateRangeGroup}`}>
      <button
        type="button"
        onClick={onOpen}
        className={styles.dateRangeTrigger}
        aria-expanded={dateOpen}
        aria-haspopup="dialog"
      >
        <Stack className={styles.chipGroup} direction="row" flexWrap="wrap">
          {startDate ? (
            <Chip
              label={
                endDate || !isSameDay(startDate, new Date())
                  ? `From ${formatDateLabel(startDate)}`
                  : 'From today'
              }
              onDelete={() => onUpdateDateRange(null, null)}
              variant="outlined"
            />
          ) : (
            <Chip label="Any date" variant="outlined" />
          )}
          {endDate && (
            <Chip
              label={`To ${formatDateLabel(endDate)}`}
              onDelete={() => onUpdateDateRange(startDate, null)}
              variant="outlined"
            />
          )}
        </Stack>
      </button>
      <Popover
        open={dateOpen}
        anchorEl={dateAnchor}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        container={popoverContainer ?? undefined}
        marginThreshold={16}
        disablePortal
        PaperProps={{ sx: popoverPaperSx }}
      >
        <div className={styles.popoverHeader}>
          <Typography className={styles.sectionTitle}>Date range</Typography>
          <IconButton
            size="small"
            className={styles.popoverCloseButton}
            onClick={onClose}
            aria-label="Close date range"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
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
      </Popover>
    </div>
  );
}
