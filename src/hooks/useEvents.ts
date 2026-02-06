'use client';

import { useState, useEffect } from 'react';
import { Event, PaginatedResponse, EventFilters } from '@/types';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Event>['pagination'] | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching events
 * Uses the BFF API route instead of calling backend directly
 */
export function useEvents(filters: EventFilters = {}): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Event>['pagination'] | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      // Call BFF API route (internal Next.js API)
      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      console.log('useEvents fetch:', { 
        url: `/api/events?${params.toString()}`, 
        status: response.status,
        data,
        firstEvent: data.data?.[0]
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      setEvents(data.data || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  return {
    events,
    loading,
    error,
    pagination,
    refetch: fetchEvents,
  };
}
