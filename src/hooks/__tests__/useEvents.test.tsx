import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useEvents } from '../useEvents';
import type { Event } from '@/types';

describe('useEvents', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds query params for arrays and pagination', async () => {
    const mockResponse = {
      data: [],
      meta: { limit: 20, total: 0, offset: 20, category_counts: { 1: 3 } },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    renderHook(() =>
      useEvents({
        limit: 20,
        page: 2,
        country_id: ['1', '2'],
        category_id: ['3'],
        search: 'rock',
      }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
    const url = new URL(calledUrl, 'http://localhost');

    expect(url.pathname).toBe('/api/events');
    expect(url.searchParams.get('limit')).toBe('20');
    expect(url.searchParams.get('offset')).toBe('20');
    expect(url.searchParams.get('country_id')).toBe('1,2');
    expect(url.searchParams.get('category_id')).toBe('3');
    expect(url.searchParams.get('search')).toBe('rock');
  });

  it('maps meta into pagination and category counts', async () => {
    const event: Event = {
      id: 1,
      date_start: '2026-02-10',
      date_end: '2026-02-10',
      headline: 'Test',
      venue_id: 1,
      approved: true,
    } as Event;

    const mockResponse = {
      data: [event],
      meta: { limit: 10, total: 25, offset: 10, category_counts: { 2: 5 } },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useEvents({ limit: 10, page: 2 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.pagination).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      pages: 3,
    });
    expect(result.current.categoryCounts).toEqual({ 2: 5 });
  });

  it('handles API errors and resets data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Bad request' }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useEvents({ search: 'bad' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Bad request');
    expect(result.current.events).toEqual([]);
  });

  it('handles missing meta gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pagination).toBeNull();
    expect(result.current.categoryCounts).toBeNull();
  });

  describe('infinite scroll mode', () => {
    it('appends events across pages when loading more', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      const event2: Event = {
        id: 2,
        date_start: '2026-02-11',
        date_end: '2026-02-11',
        headline: 'Event 2',
        venue_id: 2,
        approved: true,
      } as Event;

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [event1],
            meta: { limit: 1, total: 2, offset: 0, category_counts: {} },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [event2],
            meta: { limit: 1, total: 2, offset: 1, category_counts: {} },
          }),
        });

      global.fetch = fetchMock as unknown as typeof fetch;

      const { result } = renderHook(() => useEvents({ infiniteScroll: true, limit: 1 }));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].id).toBe(1);
      expect(result.current.hasMore).toBe(true);

      // Load more
      result.current.loadMore();

      await waitFor(() => {
        expect(result.current.events).toHaveLength(2);
      });

      expect(result.current.events[0].id).toBe(1);
      expect(result.current.events[1].id).toBe(2);
      expect(result.current.hasMore).toBe(false);
    });

    it('deduplicates events by ID when loading more', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      const event2: Event = {
        id: 2,
        date_start: '2026-02-11',
        date_end: '2026-02-11',
        headline: 'Event 2',
        venue_id: 2,
        approved: true,
      } as Event;

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [event1, event2],
            meta: { limit: 2, total: 3, offset: 0, category_counts: {} },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            // Intentionally return event2 again (duplicate)
            data: [event2],
            meta: { limit: 2, total: 3, offset: 2, category_counts: {} },
          }),
        });

      global.fetch = fetchMock as unknown as typeof fetch;

      const { result } = renderHook(() => useEvents({ infiniteScroll: true, limit: 2 }));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(2);

      // Load more
      result.current.loadMore();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still have 2 events, not 3 (event2 was deduplicated)
      expect(result.current.events).toHaveLength(2);
      expect(result.current.events[0].id).toBe(1);
      expect(result.current.events[1].id).toBe(2);
    });

    it('stops loading when hasMore becomes false', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [event1],
          meta: { limit: 10, total: 1, offset: 0, category_counts: {} },
        }),
      });

      global.fetch = fetchMock as unknown as typeof fetch;

      const { result } = renderHook(() => useEvents({ infiniteScroll: true, limit: 10 }));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.hasMore).toBe(false);

      // Try to load more when hasMore is false
      result.current.loadMore();

      // Should not trigger another fetch
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not load more when already loading', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      let resolveFirstFetch: (value: any) => void;
      const firstFetchPromise = new Promise((resolve) => {
        resolveFirstFetch = resolve;
      });

      const fetchMock = vi.fn().mockImplementation(() => firstFetchPromise);

      global.fetch = fetchMock as unknown as typeof fetch;

      const { result } = renderHook(() => useEvents({ infiniteScroll: true, limit: 1 }));

      // While loading, try to load more
      expect(result.current.loading).toBe(true);
      result.current.loadMore();

      // Should not trigger another fetch while loading
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Resolve the fetch
      resolveFirstFetch!({
        ok: true,
        json: async () => ({
          data: [event1],
          meta: { limit: 1, total: 2, offset: 0, category_counts: {} },
        }),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('pagination mode', () => {
    it('respects page filter when infiniteScroll is false', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [event1],
          meta: { limit: 10, total: 30, offset: 20, category_counts: {} },
        }),
      });

      global.fetch = fetchMock as unknown as typeof fetch;

      renderHook(() => useEvents({ infiniteScroll: false, limit: 10, page: 3 }));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
      const url = new URL(calledUrl, 'http://localhost');

      // Should fetch page 3 (offset 20)
      expect(url.searchParams.get('offset')).toBe('20');
    });

    it('refetch uses current page in pagination mode', async () => {
      const event1: Event = {
        id: 1,
        date_start: '2026-02-10',
        date_end: '2026-02-10',
        headline: 'Event 1',
        venue_id: 1,
        approved: true,
      } as Event;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [event1],
          meta: { limit: 10, total: 30, offset: 10, category_counts: {} },
        }),
      });

      global.fetch = fetchMock as unknown as typeof fetch;

      const { result } = renderHook(() => useEvents({ infiniteScroll: false, limit: 10, page: 2 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear the mock to track new calls
      fetchMock.mockClear();

      // Refetch
      result.current.refetch();

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
      const url = new URL(calledUrl, 'http://localhost');

      // Should still be on page 2 (offset 10)
      expect(url.searchParams.get('offset')).toBe('10');
    });
  });
});
