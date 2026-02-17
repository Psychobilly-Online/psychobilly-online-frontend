'use client';

import { useState, useEffect, useRef } from 'react';
import { Event, PaginatedResponse, EventFilters } from '@/types';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Event>['pagination'] | null;
  categoryCounts: Record<number, number> | null;
  genreCounts: Record<number, number> | null;
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
  const [genreCounts, setGenreCounts] = useState<Record<number, number> | null>(null);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const filtersRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventIdsRef = useRef<Set<number>>(new Set());
  const requestIdRef = useRef(0);
  const isInitialFetch = useRef(true);
  const hasRestoredCache = useRef(false);

  const fetchEvents = async (pageToFetch: number, append: boolean = false) => {
    // Only cancel if this is a filter change (not initial or loadMore)
    // Don't cancel on initial fetch or when appending for infinite scroll
    if (abortControllerRef.current && !append && !isInitialFetch.current) {
      abortControllerRef.current.abort();
    }
    isInitialFetch.current = false;

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      // Convert batch to offset for API
      const { page: _page, limit = 25, ...otherFilters } = filters;
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

      const response = await fetch(url, { signal: abortController.signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const newEvents = data.data || [];

      // In infinite scroll mode, append events; otherwise replace
      if (append && infiniteScroll) {
        // Use the ref-based Set for O(1) deduplication
        const uniqueNewEvents = newEvents.filter((e: Event) => {
          if (eventIdsRef.current.has(e.id)) {
            return false;
          }
          eventIdsRef.current.add(e.id);
          return true;
        });
        setEvents((prev) => [...prev, ...uniqueNewEvents]);
      } else {
        // Reset the Set when replacing events
        eventIdsRef.current.clear();
        newEvents.forEach((e: Event) => eventIdsRef.current.add(e.id));
        setEvents(newEvents);
      }

      // Backend returns 'meta', transform to expected 'pagination' structure
      if (data.meta) {
        const limit = data.meta.limit || 25;
        const total = data.meta.total || 0;
        const offset = data.meta.offset || 0;
        const responseBatch = Math.floor(offset / limit) + 1;
        const totalBatches = Math.ceil(total / limit);

        setPagination({
          total: total,
          page: responseBatch,
          limit: limit,
          pages: totalBatches,
        });
        setCategoryCounts(data.meta.category_counts || null);
        setGenreCounts(data.meta.genre_counts || null);

        // Check if there are more batches to load
        setHasMore(responseBatch < totalBatches);

        // Update currentBatch after successful append
        if (append && infiniteScroll) {
          setCurrentBatch(responseBatch);
        }
      } else {
        setPagination(null);
        setCategoryCounts(null);
        setGenreCounts(null);
        setHasMore(false);
      }
    } catch (err: any) {
      // Ignore abort errors as they are expected when filters change
      if (err.name === 'AbortError') {
        return;
      }

      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setError(err.message || 'An error occurred');
        if (!append) {
          setEvents([]);
        }
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        // Only clear the abort controller ref if this request wasn't aborted
        if (!abortController.signal.aborted) {
          abortControllerRef.current = null;
        }
      }
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && infiniteScroll) {
      const nextBatch = currentBatch + 1;
      // Don't update currentBatch here - will be updated in fetchEvents after success
      fetchEvents(nextBatch, true);
    }
  };

  // Reset state when filters change
  useEffect(() => {
    const newFiltersKey = JSON.stringify(filters);

    // Check if we have cached data to restore (only on first run when filtersRef is empty)
    if (filtersRef.current === '' && !hasRestoredCache.current) {
      hasRestoredCache.current = true;

      try {
        const cached = sessionStorage.getItem('eventsCache');
        const cachedFilters = sessionStorage.getItem('eventsCacheFilters');

        if (cached && cachedFilters === newFiltersKey) {
          const {
            events: cachedEvents,
            pagination: cachedPagination,
            categoryCounts: cachedCounts,
            genreCounts: cachedGenreCounts,
          } = JSON.parse(cached);
          setEvents(cachedEvents);
          setPagination(cachedPagination);
          setCategoryCounts(cachedCounts);
          setGenreCounts(cachedGenreCounts || null);
          setCurrentBatch(Math.ceil(cachedEvents.length / (filters.limit || 25)));
          setHasMore(cachedPagination.total > cachedEvents.length);
          setLoading(false);
          filtersRef.current = newFiltersKey;

          // Update eventIdsRef
          eventIdsRef.current.clear();
          cachedEvents.forEach((e: Event) => eventIdsRef.current.add(e.id));

          return;
        }
      } catch (err) {
        console.error('[useEvents] Failed to restore cache:', err);
      }
    }

    // If filters changed, reset and fetch
    if (newFiltersKey !== filtersRef.current) {
      filtersRef.current = newFiltersKey;
      isInitialFetch.current = true; // Reset so we don't abort the new filter's first request

      // Clear cache when filters change
      sessionStorage.removeItem('eventsCache');
      sessionStorage.removeItem('eventsCacheFilters');
      sessionStorage.removeItem('eventsScrollPosition');

      if (infiniteScroll) {
        // In infinite scroll mode, always reset to batch 1
        setCurrentBatch(1);
        setEvents([]);
        setHasMore(true);
        eventIdsRef.current.clear();
        fetchEvents(1, false);
      } else {
        // In pagination mode, use the page from filters or default to 1
        const targetBatch = filters.page ?? 1;
        setCurrentBatch(targetBatch);
        fetchEvents(targetBatch, false);
      }
    }
    // NOTE: filters dependency is intentional - we stringify it internally for comparison (line 184)
    // to detect actual value changes vs reference changes. This is the standard pattern for
    // complex filter objects in this codebase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, infiniteScroll]);

  // Cache events whenever they change (after successful fetch)
  useEffect(() => {
    if (events.length > 0 && pagination && !loading) {
      try {
        sessionStorage.setItem(
          'eventsCache',
          JSON.stringify({
            events,
            pagination,
            categoryCounts,
            genreCounts,
          }),
        );
        sessionStorage.setItem('eventsCacheFilters', JSON.stringify(filters));
      } catch (err) {
        console.error('[useEvents] Failed to cache:', err);
      }
    }
  }, [events, pagination, categoryCounts, genreCounts, loading, filters]);

  // Cleanup on unmount - removed abort as it was interfering with navigation
  // The abort controller in fetchEvents already handles cancelling stale requests
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    categoryCounts,
    genreCounts,
    refetch: () => {
      if (infiniteScroll) {
        setCurrentBatch(1);
        setEvents([]);
        setHasMore(true);
        eventIdsRef.current.clear();
        fetchEvents(1, false);
      } else {
        fetchEvents(currentBatch, false);
      }
    },
    loadMore,
    hasMore,
  };
}
