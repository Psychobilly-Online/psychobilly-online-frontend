'use client';

import cx from 'classnames';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchContext } from '@/contexts/SearchContext';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  /** Current page context for search (e.g., 'events', 'news') */
  searchContext?: 'events' | 'news' | 'default';
}

/**
 * Get search placeholder text based on context
 */
function getSearchPlaceholder(context: SearchBarProps['searchContext']): string {
  switch (context) {
    case 'events':
      return 'Search for bands, venue, city...';
    case 'news':
      return 'Search news...';
    default:
      return 'Search...';
  }
}

export function SearchBar({ searchContext = 'default' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addSearchTerm } = useSearchContext();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // If we're on the events page, add search term to current context
      if (pathname === '/events') {
        addSearchTerm(trimmedQuery);
        setSearchQuery('');
      } else {
        // Otherwise, navigate to events page with search term
        router.push(`/events?search=${encodeURIComponent(trimmedQuery)}`);
        setSearchQuery('');
      }
    }
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSearch}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={getSearchPlaceholder(searchContext)}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search"
      />
      <button
        type="submit"
        className={cx(styles.submitButton, !searchQuery && styles.disabled)}
        aria-label="Submit search"
        disabled={!searchQuery.trim()}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
