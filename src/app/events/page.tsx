'use client';

import cx from 'classnames';
import { useEvents } from '@/hooks/useEvents';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters, FilterValues } from '@/components/events/EventFilters';
import { useState, useEffect, useRef } from 'react';
import { useSearchContext } from '@/contexts/SearchContext';
import styles from './page.module.css';

export default function EventsPage() {
  const { filters, setFilters, searchTerms } = useSearchContext();
  const [eventDates, setEventDates] = useState<Set<number>>(new Set());
  const [shouldCollapseFilters, setShouldCollapseFilters] = useState(false);
  const [shouldExpandFilters, setShouldExpandFilters] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const lastScrollY = useRef(0);
  const hasAutoCollapsed = useRef(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const previousSearchTerms = useRef<string[]>([]);
  const isInitialMount = useRef(true);

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

  // Scroll to top and expand filters when search terms change
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousSearchTerms.current = searchTerms;
      return;
    }

    // Check if search terms actually changed
    const termsChanged = 
      searchTerms.length !== previousSearchTerms.current.length ||
      searchTerms.some((term, index) => term !== previousSearchTerms.current[index]);

    if (termsChanged) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (searchTerms.length > 0) {
        setShouldExpandFilters(true);
        // Reset expand trigger after a short delay
        const timer = setTimeout(() => setShouldExpandFilters(false), 100);
        previousSearchTerms.current = searchTerms;
        return () => clearTimeout(timer);
      }
      previousSearchTerms.current = searchTerms;
    }
  }, [searchTerms]);

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

  // Auto-collapse filters when scrolling down (only once)
  useEffect(() => {
    // Initialize to current position to avoid false detection on first scroll
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if filter is sticky (reached top position)
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        const topBarHeight = 45; // TopBar height in px
        setIsFilterSticky(rect.top <= topBarHeight);
      }

      // Auto-collapse once if scrolling down and past 50px
      if (
        !hasAutoCollapsed.current &&
        currentScrollY > lastScrollY.current &&
        currentScrollY > 50
      ) {
        setShouldCollapseFilters(true);
        hasAutoCollapsed.current = true;
      }
      // Reset auto-collapse flag if scrolling back to top
      else if (currentScrollY < 10) {
        hasAutoCollapsed.current = false;
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div id="content" className={cx('row', styles.eventsLayout)}>
      <div
        className={cx('col1', 'col-lg-12', 'col-md-12', 'col-xs-12', styles.mainColumn)}
        id="col1"
      >
        <div className={cx(styles.filterBar, isFilterSticky && styles.sticky)} ref={filterRef}>
          <EventFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            totalCount={loading ? lastTotalCount : pagination?.total}
            categoryCounts={categoryCounts || undefined}
            eventDates={eventDates}
            shouldCollapse={shouldCollapseFilters}
            shouldExpand={shouldExpandFilters}
            onCollapseComplete={() => setShouldCollapseFilters(false)}
            isSticky={isFilterSticky}
          />
        </div>

        {loading && events.length === 0 && <div className={styles.status}>Searching events...</div>}

        {error && <div className={cx(styles.status, styles.statusError)}>Error: {error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className={styles.status}>No events found.</div>
        )}

        {events.length > 0 && (
          <>
            <div className={cx(styles.eventsList, loading && styles.eventsListLoading)}>
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
