'use client';

import { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import styles from './EventFilters.module.css';

export interface FilterValues {
  search?: string;
  country_id?: string;
  from_date?: string;
  to_date?: string;
  category_id?: string;
  limit?: number;
}

interface EventFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
  totalCount?: number;
}

interface Country {
  id: number;
  name: string;
  print_name: string;
  iso_code: string;
}

interface Category {
  id: number;
  name: string;
}

export function EventFilters({
  onFilterChange,
  initialFilters = {},
  totalCount,
}: EventFiltersProps) {
  const monthLabels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const yearOptions = Array.from(
    { length: new Date().getFullYear() + 2 - 2009 + 1 },
    (_, index) => 2009 + index,
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    limit: 20,
    ...initialFilters,
  });

  const parseDate = (value?: string) => {
    if (!value) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const handleInputChange = (field: keyof FilterValues, value: string | number) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined, // Remove empty values
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { limit: 20 };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    setDateRange([null, null]);
  };

  const [startDate, endDate] = dateRange;

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange(dates);

    const newFilters = {
      ...filters,
      from_date: start ? formatDate(start) : undefined,
      to_date: end ? formatDate(end) : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const DateRangeInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <button type="button" className={styles.dateRangeButton} onClick={onClick} ref={ref}>
        {value || 'Select date range'}
      </button>
    ),
  );

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'limit' && filters[key as keyof FilterValues],
  ).length;

  return (
    <div className={`${styles.filterContainer} ${!isExpanded ? styles.collapsed : ''}`}>
      <div className={styles.filterHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <h3>
          Filter Events
          {activeFilterCount > 0 && (
            <span className={styles.filterCount}>({activeFilterCount})</span>
          )}
          {typeof totalCount === 'number' && (
            <span className={styles.resultCount}>{totalCount} found</span>
          )}
        </h3>
        <button
          type="button"
          className={styles.toggleButton}
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <form className={styles.filterForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.filterFields}>
            {/* Search */}
            <div className={styles.formGroup}>
              <label htmlFor="search">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Event title, bands, city..."
                value={filters.search || ''}
                onChange={(e) => handleInputChange('search', e.target.value)}
              />
              <small>Searches in title, bands, city, and description</small>
            </div>

            {/* Country */}
            <div className={styles.formGroup}>
              <label htmlFor="country">Country</label>
              <select
                id="country"
                value={filters.country_id || ''}
                onChange={(e) => handleInputChange('country_id', e.target.value)}
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.print_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className={`${styles.formGroup} ${styles.dateRangeGroup}`}>
              <label htmlFor="date_range">Date Range</label>
              <DatePicker
                id="date_range"
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                minDate={new Date(2009, 0, 1)}
                maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                dateFormat="dd MMM yyyy"
                customInput={<DateRangeInput />}
                popperClassName={styles.datePickerPopper}
                calendarClassName={styles.datePickerCalendar}
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className={styles.datePickerHeader}>
                    <button
                      type="button"
                      className={styles.datePickerNavButton}
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                    >
                      ‹
                    </button>
                    <select
                      className={styles.datePickerMonthSelect}
                      value={date.getMonth()}
                      onChange={(event) => changeMonth(parseInt(event.target.value))}
                    >
                      {monthLabels.map((label, index) => (
                        <option key={label} value={index}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <select
                      className={styles.datePickerYearSelect}
                      value={date.getFullYear()}
                      onChange={(event) => changeYear(parseInt(event.target.value))}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.datePickerNavButton}
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                    >
                      ›
                    </button>
                  </div>
                )}
              />
            </div>

            {/* Category */}
            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={filters.category_id || ''}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results per page */}
            <div className={styles.formGroup}>
              <label htmlFor="limit">Results per page</label>
              <select
                id="limit"
                value={filters.limit || 20}
                onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <div className={styles.filterActions}>
              <button type="button" onClick={handleReset} className={styles.resetButton}>
                Clear Filters
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
