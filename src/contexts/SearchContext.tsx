'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { FilterValues } from '@/components/events/EventFilters';

interface SearchContextType {
  filters: FilterValues;
  setFilters: (filters: FilterValues) => void;
  searchTerms: string[];
  addSearchTerm: (term: string) => void;
  removeSearchTerm: (term: string) => void;
  clearSearchTerms: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Memoize filters to prevent unnecessary re-renders
  const filters: FilterValues = useMemo(() => {
    const baseFilters: FilterValues = {
      limit: 25,
      sort_by: 'date',
      sort_order: 'ASC',
    };

    const search = searchParams.get('search');
    const country_id = searchParams.get('country_id');
    const category_id = searchParams.get('category_id');
    const genre_id = searchParams.get('genre_id');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const sort_by = searchParams.get('sort_by');
    const sort_order = searchParams.get('sort_order');

    if (search) baseFilters.search = search;
    if (country_id) baseFilters.country_id = country_id.split(',');
    if (category_id) baseFilters.category_id = category_id.split(',');
    if (genre_id) baseFilters.genre_id = genre_id.split(',');
    if (from_date) baseFilters.from_date = from_date;
    if (to_date) baseFilters.to_date = to_date;
    if (sort_by) baseFilters.sort_by = sort_by;
    if (sort_order) baseFilters.sort_order = sort_order;

    return baseFilters;
  }, [searchParams]);

  const searchTerms = useMemo(() => {
    const search = searchParams.get('search');
    return search ? search.split(',') : [];
  }, [searchParams]);

  const setFilters = useCallback(
    (newFilters: FilterValues) => {
      // Mark that user has interacted with filters
      sessionStorage.setItem('eventsFiltersInteracted', 'true');

      const params = new URLSearchParams();

      // Only add params that have values - omitting params effectively clears them
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.country_id?.length) params.set('country_id', newFilters.country_id.join(','));
      if (newFilters.category_id?.length)
        params.set('category_id', newFilters.category_id.join(','));
      if (newFilters.genre_id?.length) params.set('genre_id', newFilters.genre_id.join(','));
      if (newFilters.from_date) params.set('from_date', newFilters.from_date);
      if (newFilters.to_date) params.set('to_date', newFilters.to_date);
      if (newFilters.sort_by && newFilters.sort_by !== 'date')
        params.set('sort_by', newFilters.sort_by);
      if (newFilters.sort_order && newFilters.sort_order !== 'ASC')
        params.set('sort_order', newFilters.sort_order);

      const path = window.location.pathname;
      const newUrl = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(newUrl, { scroll: false });
    },
    [router],
  );

  const addSearchTerm = useCallback(
    (term: string) => {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      // Mark that user has interacted with filters
      sessionStorage.setItem('eventsFiltersInteracted', 'true');

      const currentSearch = searchParams.get('search');
      const currentTerms = currentSearch ? currentSearch.split(',') : [];
      const newTerms = currentTerms.includes(trimmedTerm)
        ? currentTerms
        : [...currentTerms, trimmedTerm];

      const params = new URLSearchParams(searchParams.toString());
      params.set('search', newTerms.join(','));

      const path = window.location.pathname;
      const newUrl = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router],
  );

  const removeSearchTerm = useCallback(
    (term: string) => {
      // Mark that user has interacted with filters
      sessionStorage.setItem('eventsFiltersInteracted', 'true');

      const currentSearch = searchParams.get('search');
      const currentTerms = currentSearch ? currentSearch.split(',') : [];
      const newTerms = currentTerms.filter((t) => t !== term);

      const params = new URLSearchParams(searchParams.toString());
      if (newTerms.length > 0) {
        params.set('search', newTerms.join(','));
      } else {
        params.delete('search');
      }

      const path = window.location.pathname;
      const newUrl = params.toString() ? `${path}?${params.toString()}` : path;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router],
  );

  const clearSearchTerms = useCallback(() => {
    // Mark that user has interacted with filters
    sessionStorage.setItem('eventsFiltersInteracted', 'true');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');

    const path = window.location.pathname;
    const newUrl = params.toString() ? `${path}?${params.toString()}` : path;
    router.push(newUrl, { scroll: false });
  }, [searchParams, router]);

  return (
    <SearchContext.Provider
      value={{
        filters,
        setFilters,
        searchTerms,
        addSearchTerm,
        removeSearchTerm,
        clearSearchTerms,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
