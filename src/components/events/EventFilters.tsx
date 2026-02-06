'use client';

import { useState, useEffect } from 'react';
import styles from './EventFilters.module.css';

export interface FilterValues {
  search?: string;
  country_id?: string;
  city?: string;
  from_date?: string;
  to_date?: string;
  category_id?: string;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

interface EventFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
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

export function EventFilters({ onFilterChange, initialFilters = {} }: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    limit: 20,
    ...initialFilters
  });

  // Fetch countries and categories on mount
  useEffect(() => {
    // Fetch countries
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => setCountries(data.data || []))
      .catch(err => console.error('Failed to load countries:', err));

    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // TODO: Fetch cities when country changes
  // Need API endpoint: GET /api/cities?country_id={id}
  // Should query venues table for unique cities in selected country
  useEffect(() => {
    if (filters.country_id) {
      // TODO: Implement city fetching
      // fetch(`/api/cities?country_id=${filters.country_id}`)
      //   .then(res => res.json())
      //   .then(data => setCities(data.data || []))
      //   .catch(err => console.error('Failed to load cities:', err));
      setCities([]); // Clear cities for now
    } else {
      setCities([]);
    }
  }, [filters.country_id]);

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
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => key !== 'limit' && filters[key as keyof FilterValues]
  ).length;

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <h3>
          Filter Events
          {activeFilterCount > 0 && (
            <span className={styles.filterCount}>({activeFilterCount})</span>
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
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.print_name}
                </option>
              ))}
            </select>
          </div>

          {/* City - TODO: Make this a select populated from venues */}
          <div className={styles.formGroup}>
            <label htmlFor="city">City</label>
            {cities.length > 0 ? (
              <select
                id="city"
                value={filters.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="city"
                placeholder="Select country first (or type city name)"
                value={filters.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!filters.country_id}
              />
            )}
            <small>TODO: Populate from venues table after country selection</small>
          </div>

          {/* Date Range - Using native date inputs for now */}
          {/* TODO: Implement single date range picker (e.g., react-dates or similar) */}
          <div className={styles.formGroup}>
            <label htmlFor="from_date">Date From</label>
            <input
              type="date"
              id="from_date"
              value={filters.from_date || ''}
              onChange={(e) => handleInputChange('from_date', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="to_date">Date To</label>
            <input
              type="date"
              id="to_date"
              value={filters.to_date || ''}
              onChange={(e) => handleInputChange('to_date', e.target.value)}
              min={filters.from_date || undefined}
            />
            <small>TODO: Replace with single date range picker component</small>
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
              {categories.map(category => (
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

          {/* Sort By - TODO: Implement backend sorting */}
          <div className={styles.formGroup}>
            <label htmlFor="sort_by">Sort By</label>
            <select
              id="sort_by"
              value={filters.sort_by || 'date'}
              onChange={(e) => handleInputChange('sort_by', e.target.value)}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="city">City</option>
              <option value="category">Category</option>
            </select>
            <small>TODO: Implement backend sorting</small>
          </div>

          {/* Sort Order */}
          <div className={styles.formGroup}>
            <label htmlFor="sort_order">Order</label>
            <select
              id="sort_order"
              value={filters.sort_order || 'asc'}
              onChange={(e) => handleInputChange('sort_order', e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Clear Filters
            </button>
          )}
        </form>
      )}
    </div>
  );
}
