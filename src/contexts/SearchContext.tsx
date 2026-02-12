'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { FilterValues } from '@/components/events/EventFilters';

interface SearchContextType {
  filters: FilterValues;
  setFilters: (filters: FilterValues) => void;
  performSearch: (query: string) => void;
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

  const performSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      search: query || undefined,
    }));
  };

  return (
    <SearchContext.Provider value={{ filters, setFilters, performSearch }}>
      {children}
    </SearchContext.Provider>
  );
}
