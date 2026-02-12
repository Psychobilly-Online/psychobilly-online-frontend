'use client';

import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { isSameDay, isWithinInterval } from 'date-fns';
import { EventFiltersSearch } from './EventFiltersSearch';
import { EventFiltersCountries } from './EventFiltersCountries';
import { EventFiltersDateRange } from './EventFiltersDateRange';
import { EventFiltersCategories } from './EventFiltersCategories';
import {
  countryPopoverSx,
  datePopoverSx,
  filterTheme,
  inputSx,
  settingsPopoverSx,
} from './EventFilters.styles';
import { REGION_ISO_MAP } from './EventFilters.constants';
import {
  formatDate,
  formatDateLabel,
  getCountryIso,
  normalizeFilterValue,
  parseDate,
} from './EventFilters.helpers';
import type { Category, Country } from './EventFilters.types';
import styles from './EventFilters.module.css';

export interface FilterValues {
  search?: string;
  country_id?: string[];
  from_date?: string;
  to_date?: string;
  category_id?: string[];
  sort_by?: string;
  sort_order?: string;
  limit?: number;
}

interface EventFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  totalCount?: number;
  categoryCounts?: Record<number, number>;
  eventDates?: Set<number>;
}

export function EventFilters({
  onFilterChange,
  initialFilters = {},
  totalCount,
  categoryCounts,
  eventDates,
}: EventFiltersProps) {
  useMemo(() => filterTheme, []);
  const normalizedInitialFilters: FilterValues = {
    ...initialFilters,
    category_id: Array.isArray(initialFilters.category_id)
      ? initialFilters.category_id.map(String)
      : initialFilters.category_id
        ? [String(initialFilters.category_id)]
        : [],
    country_id: Array.isArray(initialFilters.country_id)
      ? initialFilters.country_id.map(String)
      : initialFilters.country_id
        ? [String(initialFilters.country_id)]
        : [],
  };
  const [isExpanded, setIsExpanded] = useState(true);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
  const [countryAnchor, setCountryAnchor] = useState<HTMLElement | null>(null);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'day' | 'month' | 'year'>('day');
  const [datePreset, setDatePreset] = useState<
    'any' | 'today' | 'next-month' | 'next-3-months' | 'specific' | 'range' | null
  >(null);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    limit: 20,
    sort_by: 'date',
    sort_order: 'ASC',
    ...normalizedInitialFilters,
  });
  const settingsOpen = Boolean(settingsAnchor);
  const handleOpenSettings = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSettingsAnchor(event.currentTarget);
  };
  const handleCloseSettings = () => setSettingsAnchor(null);
  const dateOpen = Boolean(dateAnchor);
  const handleOpenDateRange = (event: MouseEvent<any>) => {
    setDateAnchor(event.currentTarget);
  };
  const handleCloseDateRange = () => {
    setDateAnchor(null);
  };

  const handleDatePresetChange = (
    preset: 'any' | 'today' | 'next-month' | 'next-3-months' | 'specific' | 'range',
  ) => {
    setDatePreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'any':
        // Any date - from 1950 to eternity
        updateDateRange(new Date(1950, 0, 1), null);
        handleCloseDateRange();
        break;
      case 'today':
        // From today (no dates sent, backend handles default)
        updateDateRange(null, null);
        handleCloseDateRange();
        break;
      case 'next-month': {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updateDateRange(today, nextMonth);
        handleCloseDateRange();
        break;
      }
      case 'next-3-months': {
        const next3Months = new Date(today);
        next3Months.setMonth(next3Months.getMonth() + 3);
        updateDateRange(today, next3Months);
        handleCloseDateRange();
        break;
      }
      case 'specific':
      case 'range':
        // Show calendar for custom date selection
        setDateRange([null, null]);
        break;
    }
  };

  const countryOpen = Boolean(countryAnchor);
  const handleOpenCountries = (event: MouseEvent<any>) => {
    setCountryAnchor(event.currentTarget);
  };
  const handleCloseCountries = () => setCountryAnchor(null);
  const categoryOpen = Boolean(categoryAnchor);
  const handleOpenCategories = (event: MouseEvent<any>) => {
    setCategoryAnchor(event.currentTarget);
  };
  const handleCloseCategories = () => setCategoryAnchor(null);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    parseDate(initialFilters.from_date) ?? null,
    parseDate(initialFilters.to_date) ?? null,
  ]);

  // Fetch countries and categories on mount
  useEffect(() => {
    // Fetch countries
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(data.data || []))
      .catch((err) => console.error('Failed to load countries:', err));

    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  const handleInputChange = (
    field: keyof FilterValues,
    value: string | number | string[] | undefined,
  ) => {
    const newFilters = {
      ...filters,
      [field]: normalizeFilterValue(value),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      limit: filters.limit ?? 20,
      sort_by: filters.sort_by ?? 'date',
      sort_order: filters.sort_order ?? 'ASC',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setDateRange([null, null]);
  };

  const [startDate, endDate] = dateRange;

  const selectedCategoryIds = Array.isArray(filters.category_id) ? filters.category_id : [];
  const selectedCountryIds = Array.isArray(filters.country_id) ? filters.country_id : [];

  const renderCountryLabel = (country: Country) => {
    const iso = getCountryIso(country);
    const flagUrl = iso ? `/images/flags/16x12/${iso.toLowerCase()}.png` : null;
    return (
      <span className={styles.countryChipLabel}>
        {flagUrl && <img src={flagUrl} alt="" aria-hidden="true" className={styles.flagIcon} />}
        {country.print_name}
      </span>
    );
  };

  const toggleCountry = (countryId: string) => {
    const nextSelected = selectedCountryIds.includes(countryId)
      ? selectedCountryIds.filter((id) => id !== countryId)
      : [...selectedCountryIds, countryId];
    handleInputChange('country_id', nextSelected);
  };

  const applyCountries = (ids: string[]) => {
    handleInputChange('country_id', ids);
  };

  const fetchRegionCountries = async (region: string) => {
    try {
      setLoadingRegion(region);
      const response = await fetch(`/api/countries/region/${region}`);
      const data = await response.json();
      const ids = (data.data || []).map((country: Country) => String(country.id));
      applyCountries(ids);
      handleCloseCountries();
    } catch (error) {
      console.error('Failed to load region countries:', error);
    } finally {
      setLoadingRegion(null);
    }
  };

  const updateDateRange = (start: Date | null, end: Date | null) => {
    const normalizedEnd = start && end && end < start ? null : end;
    const nextRange: [Date | null, Date | null] = [start, normalizedEnd];
    setDateRange(nextRange);

    const newFilters = {
      ...filters,
      from_date: start ? formatDate(start) : undefined,
      to_date: normalizedEnd ? formatDate(normalizedEnd) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCalendarChange = (date: Date | null) => {
    if (!date) return;
    if (calendarView !== 'day') return;

    const [currentStart, currentEnd] = dateRange;

    if (datePreset === 'specific') {
      // Specific date: set both start and end to the same date
      updateDateRange(date, date);
      handleCloseDateRange();
      return;
    }

    // Date range mode
    if (!currentStart || (currentStart && currentEnd)) {
      // First click or resetting range
      updateDateRange(date, null);
      setHoveredDate(null);
      return;
    }

    // Second click - complete the range
    if (date >= currentStart) {
      updateDateRange(currentStart, date);
      handleCloseDateRange();
    } else {
      updateDateRange(date, null);
    }
    setHoveredDate(null);
  };

  const RangeDay = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const isStart = !!startDate && isSameDay(day, startDate);
    const isEnd = !!endDate && isSameDay(day, endDate);
    const isInRange =
      !!startDate && !!endDate && isWithinInterval(day, { start: startDate, end: endDate });
    // Only show preview range when in range selection mode
    const isPreviewRange =
      datePreset === 'range' &&
      !!startDate &&
      !endDate &&
      !!hoveredDate &&
      hoveredDate >= startDate &&
      isWithinInterval(day, { start: startDate, end: hoveredDate });

    // Check if this day has events
    const dayTime = new Date(day).setHours(0, 0, 0, 0);
    const hasEvents = eventDates?.has(dayTime) ?? false;

    const classNames = [
      styles.rangeDay,
      isInRange ? styles.rangeDayInRange : '',
      isPreviewRange ? styles.rangeDayPreview : '',
      isStart ? styles.rangeDayStart : '',
      isEnd ? styles.rangeDayEnd : '',
      hasEvents ? styles.rangeDayHasEvents : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        className={classNames}
        onPointerEnter={() => datePreset === 'range' && setHoveredDate(day)}
        onPointerLeave={() => datePreset === 'range' && setHoveredDate(null)}
      />
    );
  };

  const countryLookup = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach((country) => {
      map.set(String(country.id), country);
    });
    return map;
  }, [countries]);

  const regionCountryIds = useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.entries(REGION_ISO_MAP).forEach(([region, isoList]) => {
      map[region] = countries
        .filter((country) => isoList.includes(getCountryIso(country).toUpperCase()))
        .map((country) => String(country.id));
    });
    return map;
  }, [countries]);

  const selectedRegion = useMemo(() => {
    const selectedSet = new Set(selectedCountryIds);
    return Object.entries(regionCountryIds).find(([, ids]) => {
      if (ids.length === 0) return false;
      if (ids.length !== selectedCountryIds.length) return false;
      return ids.every((id) => selectedSet.has(id));
    })?.[0];
  }, [regionCountryIds, selectedCountryIds]);
  const selectedRegionLabel = selectedRegion
    ? selectedRegion
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : undefined;

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (selectedCountryIds.length > 0 ? selectedCountryIds.length : 0) +
    (filters.from_date || filters.to_date ? 1 : 0) +
    (selectedCategoryIds.length > 0 ? selectedCategoryIds.length : 0);

  return (
    <ThemeProvider theme={filterTheme}>
      <div
        ref={filterContainerRef}
        className={`${styles.filterContainer} ${!isExpanded ? styles.collapsed : ''}`}
      >
        <div className={styles.filterHeader}>
          <div className={styles.headerMain}>
            <div className={styles.headerLeft}>
              <EventFiltersSearch
                value={filters.search || ''}
                onChange={(value) => handleInputChange('search', value)}
                inputRef={searchInputRef}
                inputSx={inputSx}
              />
              {typeof totalCount === 'number' && (
                <span className={styles.resultCount}>
                  {totalCount} event{totalCount > 1 && 's'} found
                </span>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <IconButton
              size="small"
              className={styles.settingsButton}
              onClick={handleOpenSettings}
              aria-label="Open search settings"
            >
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
            <button
              type="button"
              className={styles.toggleButton}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        <Popover
          open={settingsOpen}
          anchorEl={settingsAnchor}
          onClose={handleCloseSettings}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          container={filterContainerRef.current ?? undefined}
          marginThreshold={16}
          disablePortal
          PaperProps={{ sx: settingsPopoverSx }}
        >
          <div className={styles.settingsPopover}>
            <div className={styles.popoverHeader}>
              <Typography className={styles.sectionTitle}>Search settings</Typography>
              <IconButton
                size="small"
                className={styles.popoverCloseButton}
                onClick={handleCloseSettings}
                aria-label="Close settings"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <Stack spacing={2}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel id="sort-by-label">Sort by</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Sort by"
                  value={filters.sort_by || 'date'}
                  onChange={(e) => handleInputChange('sort_by', e.target.value)}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="headline">Headline</MenuItem>
                  <MenuItem value="city">City</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel id="sort-order-label">Order</InputLabel>
                <Select
                  labelId="sort-order-label"
                  label="Order"
                  value={filters.sort_order || 'ASC'}
                  onChange={(e) => handleInputChange('sort_order', e.target.value)}
                >
                  <MenuItem value="ASC">Ascending</MenuItem>
                  <MenuItem value="DESC">Descending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </div>
        </Popover>

        {isExpanded && (
          <form className={styles.filterForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.filterRows}>
              <div className={styles.filterRow}>
                <div className={styles.dateRow}>
                  <EventFiltersDateRange
                    startDate={startDate}
                    endDate={endDate}
                    dateOpen={dateOpen}
                    dateAnchor={dateAnchor}
                    onOpen={handleOpenDateRange}
                    onClose={handleCloseDateRange}
                    onUpdateDateRange={updateDateRange}
                    onCalendarChange={handleCalendarChange}
                    onPresetChange={handleDatePresetChange}
                    selectedPreset={datePreset}
                    calendarView={calendarView}
                    onViewChange={setCalendarView}
                    rangeDay={RangeDay}
                    formatDateLabel={formatDateLabel}
                    popoverPaperSx={datePopoverSx}
                    popoverContainer={filterContainerRef.current}
                    eventDates={eventDates}
                  />
                  {activeFilterCount > 0 && (
                    <button type="button" className={styles.clearLink} onClick={handleReset}>
                      <DeleteOutlineIcon fontSize="small" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.filterRow}>
                <EventFiltersCountries
                  countries={countries}
                  selectedCountryIds={selectedCountryIds}
                  selectedRegion={selectedRegionLabel}
                  countryLookup={countryLookup}
                  countryOpen={countryOpen}
                  countryAnchor={countryAnchor}
                  onOpen={handleOpenCountries}
                  onClose={handleCloseCountries}
                  onToggleCountry={toggleCountry}
                  onApplyCountries={applyCountries}
                  onFetchRegion={fetchRegionCountries}
                  loadingRegion={loadingRegion}
                  showAllCountries={showAllCountries}
                  onShowAll={() => setShowAllCountries(true)}
                  renderCountryLabel={renderCountryLabel}
                  popoverPaperSx={countryPopoverSx}
                  popoverContainer={filterContainerRef.current}
                />
              </div>

              <div className={styles.filterRow}>
                <EventFiltersCategories
                  categories={categories}
                  selectedCategoryIds={selectedCategoryIds}
                  categoryCounts={categoryCounts}
                  categoryOpen={categoryOpen}
                  categoryAnchor={categoryAnchor}
                  onOpen={handleOpenCategories}
                  onClose={handleCloseCategories}
                  onToggleCategory={(categoryId) => {
                    const isSelected = selectedCategoryIds.includes(categoryId);
                    const nextSelected = isSelected
                      ? selectedCategoryIds.filter((id) => id !== categoryId)
                      : [...selectedCategoryIds, categoryId];
                    handleInputChange('category_id', nextSelected);
                  }}
                  onClearCategories={() => handleInputChange('category_id', [])}
                  popoverPaperSx={countryPopoverSx}
                  popoverContainer={filterContainerRef.current}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </ThemeProvider>
  );
}
