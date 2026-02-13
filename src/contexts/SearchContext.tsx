'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { FilterValues } from '@/components/events/EventFilters';

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
    if (!trimmedTerm || searchTerms.includes(trimmedTerm)) return;

    const newTerms = [...searchTerms, trimmedTerm];
    setSearchTerms(newTerms);
    
    // Update filters with comma-separated search terms
    setFilters((prev) => ({
      ...prev,
      search: newTerms.join(','),
    }));
  };

  const removeSearchTerm = (term: string) => {
    const newTerms = searchTerms.filter((t) => t !== term);
    setSearchTerms(newTerms);
    
    // Update filters with comma-separated search terms
    setFilters((prev) => ({
      ...prev,
      search: newTerms.length > 0 ? newTerms.join(',') : undefined,
    }));
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
      value={{ filters, setFilters, searchTerms, addSearchTerm, removeSearchTerm, clearSearchTerms }}
    >
      {children}
    </SearchContext.Provider>
  );
}
