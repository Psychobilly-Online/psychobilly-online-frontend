'use client';

import { useState, useEffect } from 'react';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** Current page context for search (e.g., 'events', 'news') */
  searchContext?: 'events' | 'news' | 'default';
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Initial search value */
  searchValue?: string;
}

export function TopBar({ searchContext = 'default', onSearch, searchValue = '' }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue);

  // Sync internal state with prop changes
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchContext) {
      case 'events':
        return 'Search for bands, venue, city...';
      case 'news':
        return 'Search news...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        {/* Hamburger Menu */}
        <button
          className={styles.hamburger}
          aria-label="Open menu"
          onClick={() => {
            /* TODO: Implement menu */
          }}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        {/* Search Field */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </form>

        {/* Right Icons */}
        <div className={styles.rightIcons}>
          <button
            className={styles.iconButton}
            aria-label="Notifications"
            onClick={() => {
              /* TODO: Implement notifications */
            }}
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <button
            className={styles.iconButton}
            aria-label="Account"
            onClick={() => {
              /* TODO: Implement account menu */
            }}
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
