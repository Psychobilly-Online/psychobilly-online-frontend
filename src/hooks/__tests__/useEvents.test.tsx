import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useEvents } from '../useEvents';
import type { Event } from '@/types';

describe('useEvents', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
        page: 2,
        limit: 20,
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
});
