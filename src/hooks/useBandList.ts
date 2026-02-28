import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface BandGenre {
  id: number;
  name: string;
  is_primary: boolean;
}

export interface Band {
  id: number;
  name: string;
  name_variations?: string[];
  genres?: BandGenre[];
}

export interface UseBandListOptions {
  page?: number;
  limit?: number;
  search?: string;
  genreId?: string | number;
  orphanedOnly?: boolean;
  multiSearch?: boolean;
}

export interface UseBandListResult {
  bands: Band[];
  isLoading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
  reload: () => void;
  setPage: (page: number) => void;
}

/**
 * Shared hook for loading and managing band lists across admin components
 * Supports pagination, search, genre filtering, and orphaned-only mode
 */
export function useBandList(options: UseBandListOptions = {}): UseBandListResult {
  const {
    page: initialPage = 1,
    limit = 50,
    search = '',
    genreId,
    orphanedOnly = false,
    multiSearch = false,
  } = options;

  const { token } = useAuth();
  const [bands, setBands] = useState<Band[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const loadBands = useCallback(async () => {
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
          setBands([]);
          setTotal(0);
          setPages(1);
          setIsLoading(false);
          return;
        }

        // Fetch results for each term and combine
        const allResults: Band[] = [];
        const seenIds = new Set<number>();

        for (const term of searchTerms) {
          const params = new URLSearchParams({
            page: '1',
            limit: '10000', // Use high limit for multi-search to get all results
            search: term,
          });

          if (genreId) {
            params.append('genre_id', genreId.toString());
          }

          const endpoint = orphanedOnly ? '/api/admin/bands/orphaned' : '/api/admin/bands';
          const response = await fetch(`${endpoint}?${params}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to search bands');
          }

          const data = await response.json();

          // Add results, avoiding duplicates
          (data.bands || []).forEach((band: Band) => {
            if (!seenIds.has(band.id)) {
              seenIds.add(band.id);
              allResults.push(band);
            }
          });
        }

        // Sort by name
        allResults.sort((a, b) => a.name.localeCompare(b.name));

        setBands(allResults);
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

        if (genreId) {
          params.append('genre_id', genreId.toString());
        }

        const endpoint = orphanedOnly ? '/api/admin/bands/orphaned' : '/api/admin/bands';
        const response = await fetch(`${endpoint}?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load bands');
        }

        const data = await response.json();
        setBands(data.bands || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bands');
      setBands([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, limit, search, genreId, orphanedOnly, multiSearch]);

  useEffect(() => {
    loadBands();
  }, [loadBands]);

  return {
    bands,
    isLoading,
    error,
    total,
    pages,
    currentPage,
    reload: loadBands,
    setPage: setCurrentPage,
  };
}
