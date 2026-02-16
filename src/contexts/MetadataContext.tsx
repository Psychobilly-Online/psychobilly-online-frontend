'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface Country {
  id: number;
  name: string;
  print_name?: string;
  iso_code: string;
}

interface Category {
  id: number;
  name: string;
}

interface MetadataContextType {
  countries: Country[];
  categories: Category[];
  categoriesMap: Record<number, string>;
  eventDates: Set<number>;
  loading: boolean;
  error: string | null;
}

const MetadataContext = createContext<MetadataContextType | null>(null);

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
};

interface MetadataProviderProps {
  children: ReactNode;
}

/**
 * MetadataProvider - Centralized metadata fetching and caching
 * Fetches countries, categories, and event dates once and caches them
 * Prevents duplicate network requests across components
 */
export function MetadataProvider({ children }: MetadataProviderProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({});
  const [eventDates, setEventDates] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all metadata in parallel once on mount
    Promise.all([
      fetch('/api/countries').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/events?dates=true').then((res) => res.json()),
    ])
      .then(([countriesData, categoriesData, datesData]) => {
        // Set countries
        setCountries(countriesData.data || []);

        // Set categories
        const cats = categoriesData.data || [];
        setCategories(cats);

        // Build categories map for quick lookup
        const catMap: Record<number, string> = {};
        cats.forEach((cat: Category) => {
          catMap[cat.id] = cat.name;
        });
        setCategoriesMap(catMap);

        // Set event dates
        if (datesData.success && datesData.data) {
          const dates = datesData.data.map((dateStr: string) => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          });
          setEventDates(new Set(dates));
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch metadata:', err);
        setError(err.message || 'Failed to load metadata');
        setLoading(false);
      });
  }, []); // Empty dependency - fetch only once on mount

  return (
    <MetadataContext.Provider
      value={{
        countries,
        categories,
        categoriesMap,
        eventDates,
        loading,
        error,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
}
