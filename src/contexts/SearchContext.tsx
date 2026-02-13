'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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
  const [filters, setFilters] = useState<FilterValues>({
    limit: 25,
    sort_by: 'date',
    sort_order: 'ASC',
  });
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  // Synchronize searchTerms with filters.search to avoid race conditions
  useEffect(() => {
    const searchValue = searchTerms.length > 0 ? searchTerms.join(',') : undefined;
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
    }));
  }, [searchTerms]);

  const addSearchTerm = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    setSearchTerms((prev) => {
      // Check if term already exists
      if (prev.includes(trimmedTerm)) return prev;
      return [...prev, trimmedTerm];
    });
  };

  const removeSearchTerm = (term: string) => {
    setSearchTerms((prev) => prev.filter((t) => t !== term));
  };

  const clearSearchTerms = () => {
    setSearchTerms([]);
  };

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
