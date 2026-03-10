import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Venue } from '@/types/venue';

export interface UseVenueListOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  country?: string;
  city?: string;
  orphanedOnly?: boolean;
  multiSearch?: boolean;
}

export interface UseVenueListResult {
  venues: Venue[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
  reload: () => void;
  setPage: (page: number) => void;
}

/**
 * Shared hook for loading and managing venue lists across admin components
 * Supports pagination, search, status/country/city filtering, and orphaned-only mode
 */
export function useVenueList(options: UseVenueListOptions = {}): UseVenueListResult {
  const {
    page: initialPage = 1,
    limit = 50,
    search = '',
    status,
    country,
    city,
    orphanedOnly = false,
    multiSearch = false,
  } = options;

  const { token } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const loadVenues = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Handle multi-search (semicolon-separated terms)
      if (multiSearch && search) {
        const searchTerms = search
          .split(';')
          .map((term) => term.trim())
          .filter((term) => term.length > 0);

        if (searchTerms.length === 0) {
          setVenues([]);
          setTotal(0);
          setPages(1);
          setIsLoading(false);
          return;
        }

        // Fetch results for each term and combine
        const allResults: Venue[] = [];
        const seenIds = new Set<number>();

        for (const term of searchTerms) {
          const params = new URLSearchParams({
            page: '1',
            limit: '500', // High limit per term to capture all matches without pagination
            search: term,
          });

          if (status) {
            params.append('status', status);
          }

          if (country) {
            params.append('country', country);
          }

          if (city) {
            params.append('city', city);
          }

          const endpoint = orphanedOnly ? '/api/admin/venues/orphaned' : '/api/admin/venues';
          const response = await fetch(`${endpoint}?${params}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to search venues');
          }

          const data = await response.json();

          // Add results, avoiding duplicates
          (data.venues || []).forEach((venue: Venue) => {
            if (!seenIds.has(venue.id)) {
              seenIds.add(venue.id);
              allResults.push(venue);
            }
          });
        }

        // Sort by venue name
        allResults.sort((a, b) => a.venue.localeCompare(b.venue));

        setVenues(allResults);
        setTotal(allResults.length);
        setPages(1); // Disable pagination for multi-search
      } else {
        // Normal paginated search
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (search) {
          params.append('search', search);
        }

        if (status) {
          params.append('status', status);
        }

        if (country) {
          params.append('country', country);
        }

        if (city) {
          params.append('city', city);
        }

        const endpoint = orphanedOnly ? '/api/admin/venues/orphaned' : '/api/admin/venues';
        const response = await fetch(`${endpoint}?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load venues');
        }

        const data = await response.json();

        setVenues(data.venues || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load venues:', err);
      setError(err.message || 'Failed to load venues');
      setVenues([]);
      setTotal(0);
      setPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, limit, search, status, country, city, orphanedOnly, multiSearch]);

  // Load data when dependencies change
  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  // Provide reload function
  const reload = useCallback(() => {
    loadVenues();
  }, [loadVenues]);

  return {
    venues,
    isLoading,
    error,
    total,
    pages,
    currentPage,
    reload,
    setPage: setCurrentPage,
  };
}
