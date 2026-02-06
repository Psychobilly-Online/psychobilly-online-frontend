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

      // Convert page to offset for API
      const { page, limit = 20, ...otherFilters } = filters;
      const offset = page ? (page - 1) * limit : 0;

      // Build query string from filters
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(offset));
      
      Object.entries(otherFilters).forEach(([key, value]) => {
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

      setEvents(data.data || []);
      
      // Backend returns 'meta', transform to expected 'pagination' structure
      if (data.meta) {
        const limit = data.meta.limit || 20;
        const total = data.meta.total || 0;
        const offset = data.meta.offset || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        
        setPagination({
          total: total,
          page: currentPage,
          limit: limit,
          pages: Math.ceil(total / limit)
        });
      } else {
        setPagination(null);
      }
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
