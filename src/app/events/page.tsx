'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters, FilterValues } from '@/components/events/EventFilters';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function EventsPage() {
  const [page, setPage] = useState(1);

  // Default to showing upcoming events (from today onwards)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const [filters, setFilters] = useState<FilterValues>({
    limit: 20,
    from_date: today, // Default: show only upcoming events
  });
  const [categories, setCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    // Fetch categories for display
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        const categoryMap: Record<number, string> = {};
        data.data?.forEach((cat: any) => {
          categoryMap[cat.id] = cat.name;
        });
        setCategories(categoryMap);
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  const { events, loading, error, pagination } = useEvents({
    page,
    ...filters,
  });

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div id="content" className={`row ${styles.eventsLayout}`}>
      <div className={`col1 col-lg-12 col-md-12 col-xs-12 ${styles.mainColumn}`} id="col1">
        <div className={styles.filterBar}>
          <EventFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            totalCount={pagination?.total}
          />
        </div>

        {loading && <div className={styles.status}>Loading events...</div>}

        {error && <div className={`${styles.status} ${styles.statusError}`}>Error: {error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className={styles.status}>No events found.</div>
        )}

        {!loading && !error && events.length > 0 && (
          <>
            <div className={styles.eventsList}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  categoryName={event.category_id ? categories[event.category_id] : undefined}
                />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className={styles.paginationBar}>
                <div className={styles.pagination}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={styles.paginationButton}
                  >
                    Previous
                  </button>

                  <span className={styles.paginationInfo}>
                    Page {page} of {pagination.pages} ({pagination.total} events)
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className={styles.paginationButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
