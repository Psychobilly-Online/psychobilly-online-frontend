'use client';

import { useEvents } from '@/hooks/useEvents';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters, FilterValues } from '@/components/events/EventFilters';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function EventsPage() {
  const [eventDates, setEventDates] = useState<Set<number>>(new Set());

  const [filters, setFilters] = useState<FilterValues>({
    limit: 20,
    sort_by: 'date',
    sort_order: 'ASC',
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

    // Fetch all event dates for calendar highlighting (cached on server)
    fetch('/api/events?dates=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const dates = data.data.map((dateStr: string) => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          });
          setEventDates(new Set(dates));
        }
      })
      .catch((err) => console.error('Failed to fetch event dates:', err));
  }, []);

  const { events, loading, error, pagination, categoryCounts, loadMore, hasMore } = useEvents({
    infiniteScroll: true,
    ...filters,
  });
  const [lastTotalCount, setLastTotalCount] = useState<number | undefined>(undefined);

  // Setup infinite scroll - trigger loading 2 screens before bottom
  const lastElementRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
    rootMargin: '800px', // Load earlier to avoid jumping
  });

  useEffect(() => {
    if (typeof pagination?.total === 'number') {
      setLastTotalCount(pagination.total);
    }
  }, [pagination?.total]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div id="content" className={`row ${styles.eventsLayout}`}>
      <div className={`col1 col-lg-12 col-md-12 col-xs-12 ${styles.mainColumn}`} id="col1">
        <div className={styles.filterBar}>
          <EventFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            totalCount={loading ? lastTotalCount : pagination?.total}
            categoryCounts={categoryCounts || undefined}
            eventDates={eventDates}
          />
        </div>

        {loading && events.length === 0 && <div className={styles.status}>Loading events...</div>}

        {error && <div className={`${styles.status} ${styles.statusError}`}>Error: {error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className={styles.status}>No events found.</div>
        )}

        {events.length > 0 && (
          <>
            <div className={`${styles.eventsList} ${loading ? styles.eventsListLoading : ''}`}>
              {events.map((event, index) => {
                // Attach ref to the last element for infinite scroll detection
                const isLastElement = index === events.length - 1;
                return (
                  <div key={event.id} ref={isLastElement ? lastElementRef : null}>
                    <EventCard
                      event={event}
                      categoryName={event.category_id ? categories[event.category_id] : undefined}
                    />
                  </div>
                );
              })}
            </div>

            {loading && <div className={styles.loadingMore}>Loading more events...</div>}

            {!loading && !hasMore && events.length > 0 && (
              <div className={styles.endMessage}>
                No more events to load. Showing all {pagination?.total || events.length} events.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
