'use client';

import { useState, useEffect, useRef } from 'react';
import { Event, PaginatedResponse, EventFilters } from '@/types';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Event>['pagination'] | null;
  categoryCounts: Record<number, number> | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

interface UseEventsOptions extends EventFilters {
  infiniteScroll?: boolean;
}

/**
 * Custom hook for fetching events
 * Uses the BFF API route instead of calling backend directly
 * Supports both pagination and infinite scroll modes
 */
export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const { infiniteScroll = false, ...filters } = options;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Event>['pagination'] | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const filtersRef = useRef<string>('');
  const isFetchingRef = useRef(false);

  const fetchEvents = async (pageToFetch: number, append: boolean = false) => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Convert page to offset for API
      const { page: _page, limit = 20, ...otherFilters } = filters;
      const offset = (pageToFetch - 1) * limit;

      // Build query string from filters
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(offset));

      Object.entries(otherFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
          return;
        }
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Call BFF API route (internal Next.js API)
      const url = `/api/events?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      const newEvents = data.data || [];

      // In infinite scroll mode, append events; otherwise replace
      if (append && infiniteScroll) {
        setEvents((prev) => {
          // Deduplicate by event ID
          const existingIds = new Set(prev.map((e: Event) => e.id));
          const uniqueNewEvents = newEvents.filter((e: Event) => !existingIds.has(e.id));
          return [...prev, ...uniqueNewEvents];
        });
      } else {
        setEvents(newEvents);
      }

      // Backend returns 'meta', transform to expected 'pagination' structure
      if (data.meta) {
        const limit = data.meta.limit || 20;
        const total = data.meta.total || 0;
        const offset = data.meta.offset || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        setPagination({
          total: total,
          page: currentPage,
          limit: limit,
          pages: totalPages,
        });
        setCategoryCounts(data.meta.category_counts || null);

        // Check if there are more pages
        setHasMore(currentPage < totalPages);
      } else {
        setPagination(null);
        setCategoryCounts(null);
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      if (!append) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && infiniteScroll) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchEvents(nextPage, true);
    }
  };

  // Reset state when filters change
  useEffect(() => {
    const newFiltersKey = JSON.stringify(filters);

    // If filters changed, reset to page 1
    if (newFiltersKey !== filtersRef.current) {
      filtersRef.current = newFiltersKey;
      setCurrentPage(1);
      setEvents([]);
      setHasMore(true);
      fetchEvents(1, false);
    }
  }, [JSON.stringify(filters)]);

  // Initial fetch
  useEffect(() => {
    if (events.length === 0 && !loading && !error) {
      fetchEvents(1, false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    categoryCounts,
    refetch: () => fetchEvents(1, false),
    loadMore,
    hasMore,
  };
}
