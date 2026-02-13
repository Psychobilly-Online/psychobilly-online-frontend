'use client';

import cx from 'classnames';
import { useState, useEffect } from 'react';
import { IconButton } from '@/components/common/IconButton';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** Current page context for search (e.g., 'events', 'news') */
  searchContext?: 'events' | 'news' | 'default';
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Initial search value */
  searchValue?: string;
  /** Hide the TopBar (for homepage/startpage) */
  hide?: boolean;
}

export function TopBar({
  searchContext = 'default',
  onSearch,
  searchValue = '',
  hide = false,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue);

  // Sync internal state with prop changes
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  if (hide) {
    return null;
  }

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
        <IconButton
          size="medium"
          ariaLabel="Open menu"
          onClick={() => {
            /* TODO: Implement menu */
          }}
          icon={
            <div className={styles.hamburgerIcon}>
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </div>
          }
        />

        {/* Search Field (left-aligned, next to hamburger) */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
          <button
            type="submit"
            className={cx(styles.submitButton, !searchQuery && styles.disabled)}
            aria-label="Submit search"
            disabled={!searchQuery}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Right Icons */}
        <div className={styles.rightIcons}>
          <IconButton
            size="small"
            ariaLabel="Notifications"
            onClick={() => {
              /* TODO: Implement notifications */
            }}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            }
          />

          <IconButton
            size="small"
            ariaLabel="Account"
            onClick={() => {
              /* TODO: Implement account menu */
            }}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
