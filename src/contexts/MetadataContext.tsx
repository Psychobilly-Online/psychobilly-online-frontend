'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { parseDate } from '@/lib/date-utils';

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

interface Genre {
  id: number;
  name: string;
  slug?: string;
}

interface MetadataContextType {
  countries: Country[];
  categories: Category[];
  categoriesMap: Record<number, string>;
  genres: Genre[];
  genresMap: Record<number, string>;
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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});
  const [eventDates, setEventDates] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all metadata in parallel once on mount
    // Using Promise.allSettled for graceful handling of partial failures
    Promise.allSettled([
      fetch('/api/countries').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/genres').then((res) => res.json()),
      fetch('/api/events?dates=true').then((res) => res.json()),
    ])
      .then((results) => {
        const [countriesResult, categoriesResult, genresResult, datesResult] = results;
        
        const countriesData = countriesResult.status === 'fulfilled' ? countriesResult.value : { data: [] };
        const categoriesData = categoriesResult.status === 'fulfilled' ? categoriesResult.value : { data: [] };
        const genresData = genresResult.status === 'fulfilled' ? genresResult.value : { data: [] };
        const datesData = datesResult.status === 'fulfilled' ? datesResult.value : { success: false };
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

        // Set genres
        const genresList = genresData.data || [];
        setGenres(genresList);

        // Build genres map for quick lookup
        const genMap: Record<number, string> = {};
        genresList.forEach((genre: Genre) => {
          genMap[genre.id] = genre.name;
        });
        setGenresMap(genMap);

        // Set event dates using parseDate to avoid timezone issues
        if (datesData.success && datesData.data) {
          const dates = datesData.data
            .map((dateStr: string) => {
              const date = parseDate(dateStr);
              if (!date) return null;
              date.setHours(0, 0, 0, 0);
              return date.getTime();
            })
            .filter((timestamp: number | null): timestamp is number => timestamp !== null);
          setEventDates(new Set(dates));
        }

        setLoading(false);
      })
      .catch((err) => {
        // This shouldn't happen with allSettled, but handle just in case
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
        genres,
        genresMap,
        eventDates,
        loading,
        error,
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
}
