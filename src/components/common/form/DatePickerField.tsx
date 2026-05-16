'use client';

import { useState, useRef } from 'react';
import { Popover, Typography } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, isValid, format, isSameDay, isWithinInterval } from 'date-fns';
import StyledTextField from './StyledTextField';

/** Single-date mode */
interface SingleDatePickerFieldProps {
  mode?: 'single';
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  sx?: object;
}

/** Range mode — two dates, single calendar */
interface RangeDatePickerFieldProps {
  mode: 'range';
  id?: string;
  startValue: string; // YYYY-MM-DD
  endValue: string; // YYYY-MM-DD
  onRangeChange: (start: string, end: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  sx?: object;
}

type DatePickerFieldProps = SingleDatePickerFieldProps | RangeDatePickerFieldProps;

const calendarSx = {
  backgroundColor: 'var(--color-bg-elevated)',
  color: 'var(--color-text-primary)',
  '& .MuiPickersCalendarHeader-root': { color: 'var(--color-text-primary)' },
  '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
    color: 'var(--color-text-primary)',
  },
  '& .MuiDayCalendar-weekDayLabel': { color: 'var(--color-text-muted)' },
  '& .MuiPickersDay-root': {
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'var(--color-bg-hover)' },
    '&.Mui-selected': { backgroundColor: 'var(--color-accent-primary) !important', color: '#fff' },
    '&.MuiPickersDay-today': { borderColor: 'var(--color-accent-primary)' },
  },
  '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
    color: 'var(--color-text-primary)',
    '&:hover': { backgroundColor: 'var(--color-bg-hover)' },
    '&.Mui-selected': { backgroundColor: 'var(--color-accent-primary) !important', color: '#fff' },
  },
};

const popoverPaperSx = {
  backgroundColor: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
  marginTop: 'var(--spacing-2)',
  borderRadius: 'var(--spacing-3)',
  padding: '8px',
};

// Range day highlight styles (inline — avoids needing a CSS module here)
const rangeDayStyle: Record<string, React.CSSProperties> = {
  inRange: {
    borderRadius: 0,
    backgroundColor: 'var(--color-bg-elevated-alt)',
    color: 'var(--color-text-primary)',
  },
  preview: {
    borderRadius: 0,
    backgroundColor: 'var(--color-accent-overlay)',
    color: 'var(--color-text-primary)',
  },
  endpoint: { borderRadius: '50%', backgroundColor: 'var(--color-accent-primary)', color: '#fff' },
};

export default function DatePickerField(props: DatePickerFieldProps) {
  const isRange = props.mode === 'range';
  const {
    id,
    placeholder = 'Select date',
    minDate,
    maxDate,
    size = 'small',
    disabled = false,
    sx,
  } = props;

  const [open, setOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  // For range: track whether we've set the start and are waiting for end
  const [rangePending, setRangePending] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const muiMinDate = minDate ? parseISO(minDate) : new Date(2009, 0, 1);
  const muiMaxDate = maxDate ? parseISO(maxDate) : new Date(new Date().getFullYear() + 2, 11, 31);

  // ── Single mode ──────────────────────────────────────────────────────────────
  if (!isRange) {
    const { value, onChange } = props as SingleDatePickerFieldProps;
    const dateValue = value ? parseISO(value) : null;
    const displayValue = dateValue && isValid(dateValue) ? format(dateValue, 'dd MMM yyyy') : '';
    const popoverId = id ? `${id}-popover` : undefined;

    return (
      <>
        <div ref={anchorRef} style={{ display: 'inline-block' }}>
          <StyledTextField
            id={id}
            value={displayValue}
            placeholder={placeholder}
            size={size}
            disabled={disabled}
            onClick={() => !disabled && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            }}
            inputProps={{
              readOnly: true,
              style: { cursor: 'pointer' },
              'aria-haspopup': 'dialog',
              'aria-expanded': open,
              'aria-controls': open ? popoverId : undefined,
            }}
            sx={{ minWidth: 160, cursor: 'pointer', ...sx }}
          />
        </div>
        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorRef.current}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          marginThreshold={16}
          slotProps={{ paper: { sx: popoverPaperSx } }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={dateValue}
              onChange={(newDate) => {
                if (newDate && isValid(newDate)) {
                  onChange(format(newDate, 'yyyy-MM-dd'));
                  setOpen(false);
                }
              }}
              views={['year', 'month', 'day']}
              minDate={muiMinDate}
              maxDate={muiMaxDate}
              sx={calendarSx}
            />
          </LocalizationProvider>
        </Popover>
      </>
    );
  }

  // ── Range mode ───────────────────────────────────────────────────────────────
  const { startValue, endValue, onRangeChange } = props as RangeDatePickerFieldProps;
  const startDate = startValue ? parseISO(startValue) : null;
  const endDate = endValue ? parseISO(endValue) : null;

  const formatRange = () => {
    if (!startDate || !isValid(startDate)) return '';
    const s = format(startDate, 'dd MMM yyyy');
    if (!endDate || !isValid(endDate) || isSameDay(startDate, endDate)) return s;
    return `${s} – ${format(endDate, 'dd MMM yyyy')}`;
  };

  const handleRangeChange = (newDate: Date | null) => {
    if (!newDate || !isValid(newDate)) return;
    if (!rangePending || !startDate || newDate < startDate) {
      // First click — set start, clear end
      onRangeChange(format(newDate, 'yyyy-MM-dd'), format(newDate, 'yyyy-MM-dd'));
      setRangePending(true);
    } else {
      // Second click — set end and close
      onRangeChange(startValue, format(newDate, 'yyyy-MM-dd'));
      setRangePending(false);
      setOpen(false);
    }
  };

  const RangeDay = (dayProps: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = dayProps;
    const isStart = !!startDate && isSameDay(day, startDate);
    const isEnd = !!endDate && !isSameDay(startDate!, endDate) && isSameDay(day, endDate);
    const isInRange =
      !!startDate &&
      !!endDate &&
      !isSameDay(startDate, endDate) &&
      isWithinInterval(day, { start: startDate, end: endDate });
    const isPreview =
      rangePending &&
      !!startDate &&
      !!hoveredDate &&
      hoveredDate >= startDate &&
      isWithinInterval(day, { start: startDate, end: hoveredDate });

    const style: React.CSSProperties =
      isStart || isEnd
        ? rangeDayStyle.endpoint
        : isInRange
          ? rangeDayStyle.inRange
          : isPreview
            ? rangeDayStyle.preview
            : {};

    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        style={style}
        onPointerEnter={() => setHoveredDate(day)}
        onPointerLeave={() => setHoveredDate(null)}
      />
    );
  };

  // Calendar value: show end if complete, else start (for nav position)
  const calendarValue = (rangePending ? startDate : endDate) ?? startDate;
  const popoverId = id ? `${id}-popover` : undefined;

  return (
    <>
      <div ref={anchorRef} style={{ display: 'inline-block' }}>
        <StyledTextField
          id={id}
          value={formatRange()}
          placeholder={placeholder ?? 'Select date range'}
          size={size}
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          inputProps={{
            readOnly: true,
            style: { cursor: 'pointer' },
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-controls': open ? popoverId : undefined,
          }}
          sx={{ minWidth: 220, cursor: 'pointer', ...sx }}
        />
      </div>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => {
          setOpen(false);
          setRangePending(false);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        marginThreshold={16}
        slotProps={{ paper: { sx: popoverPaperSx } }}
      >
        <Typography
          sx={{ fontSize: '12px', color: 'var(--color-text-muted)', px: 2, pt: 1.5, pb: 0 }}
        >
          {rangePending ? 'Now select the end date' : 'Select start date'}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={calendarValue}
            onChange={handleRangeChange}
            views={['year', 'month', 'day']}
            minDate={muiMinDate}
            maxDate={muiMaxDate}
            slots={{ day: RangeDay }}
            sx={calendarSx}
          />
        </LocalizationProvider>
      </Popover>
    </>
  );
}
