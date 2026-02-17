'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '@/types';
import { EventDetail } from '@/components/events/EventDetail';
import styles from './page.module.css';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/events/${params.id}`, {
          signal: abortController.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch event');
        }

        // Handle both response structures: data.data or direct data
        const eventData = data.data || data;

        if (!eventData || !eventData.id) {
          throw new Error('Event not found');
        }

        setEvent(eventData);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (params.id) {
      fetchEvent();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Event Not Found</h1>
          <p>{error || 'The event you are looking for does not exist.'}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <EventDetail event={event} />
    </div>
  );
}
