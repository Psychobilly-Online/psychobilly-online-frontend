'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
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

  const addSearchTerm = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    setSearchTerms((prev) => {
      // Check if term already exists
      if (prev.includes(trimmedTerm)) return prev;

      const newTerms = [...prev, trimmedTerm];

      // Update filters with comma-separated search terms
      setFilters((prevFilters) => ({
        ...prevFilters,
        search: newTerms.join(','),
      }));

      return newTerms;
    });
  };

  const removeSearchTerm = (term: string) => {
    setSearchTerms((prev) => {
      const newTerms = prev.filter((t) => t !== term);

      // Update filters with comma-separated search terms
      setFilters((prevFilters) => ({
        ...prevFilters,
        search: newTerms.length > 0 ? newTerms.join(',') : undefined,
      }));

      return newTerms;
    });
  };

  const clearSearchTerms = () => {
    setSearchTerms([]);
    setFilters((prev) => ({
      ...prev,
      search: undefined,
    }));
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
