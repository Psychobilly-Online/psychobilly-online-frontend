'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { useState } from 'react';
import styles from './page.module.css';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  const { events, loading, error, pagination } = useEvents({
    page,
    limit,
    approved: true, // Only show approved events
  });

  if (loading && !events.length) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.eventsPage}>
        <header className={styles.header}>
          <h1>Upcoming Events</h1>
          <p>Find psychobilly events near you</p>
        </header>

        {events.length === 0 ? (
          <div className={styles.noEvents}>
            <p>No events found.</p>
          </div>
        ) : (
          <>
            <div className={styles.eventsList}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                
                <span className={styles.paginationInfo}>
                  Page {page} of {pagination.pages} ({pagination.total} events)
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
