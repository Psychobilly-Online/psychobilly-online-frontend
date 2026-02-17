'use client';

import cx from 'classnames';
import { useEvents } from '@/hooks/useEvents';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters, FilterValues } from '@/components/events/EventFilters';
import { useState, useEffect, useRef, useMemo, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMetadata } from '@/contexts/MetadataContext';
import { TOP_BAR_HEIGHT } from '@/constants/layout';
import styles from './page.module.css';

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categoriesMap, eventDates, genres } = useMetadata();
  const [isPending, startTransition] = useTransition();

  // Derive filters directly from URL params - single source of truth
  const filters: FilterValues = useMemo(() => {
    const baseFilters: FilterValues = {
      limit: 25,
      sort_by: 'date',
      sort_order: 'ASC',
    };

    const search = searchParams.get('search');
    const country_id = searchParams.get('country_id');
    const category_id = searchParams.get('category_id');
    const genre_id = searchParams.get('genre_id');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const sort_by = searchParams.get('sort_by');
    const sort_order = searchParams.get('sort_order');

    if (search) baseFilters.search = search;
    if (country_id) baseFilters.country_id = country_id.split(',');
    if (category_id) baseFilters.category_id = category_id.split(',');
    if (genre_id) baseFilters.genre_id = genre_id.split(',');
    if (from_date) baseFilters.from_date = from_date;
    if (to_date) baseFilters.to_date = to_date;
    if (sort_by) baseFilters.sort_by = sort_by;
    if (sort_order) baseFilters.sort_order = sort_order;

    return baseFilters;
  }, [searchParams]);

  const searchTerms = useMemo(() => {
    const search = searchParams.get('search');
    return search ? search.split(',') : [];
  }, [searchParams]);

  // Set default genres (Psychobilly & Rockabilly) only on true first visit
  // Once user interacts with filters, never auto-apply defaults again
  useEffect(() => {
    if (genres.length === 0) return;

    // Check if user has ever interacted with filters in this session
    const hasInteracted = sessionStorage.getItem('eventsFiltersInteracted');
    if (hasInteracted) return;

    const hasGenreParam = searchParams.get('genre_id');
    const hasAnyFilter =
      searchParams.get('search') ||
      searchParams.get('country_id') ||
      searchParams.get('category_id') ||
      searchParams.get('from_date') ||
      searchParams.get('to_date');

    // Only apply defaults if there are no filters at all (true first visit)
    if (!hasGenreParam && !hasAnyFilter) {
      // Find IDs for Psychobilly and Rockabilly
      const psychobillyGenre = genres.find((g) => g.name.toLowerCase() === 'psychobilly');
      const rockabillyGenre = genres.find((g) => g.name.toLowerCase() === 'rockabilly');

      const defaultGenreIds: string[] = [];
      if (psychobillyGenre) defaultGenreIds.push(String(psychobillyGenre.id));
      if (rockabillyGenre) defaultGenreIds.push(String(rockabillyGenre.id));

      if (defaultGenreIds.length > 0) {
        // Mark that we've set defaults (counts as interaction)
        sessionStorage.setItem('eventsFiltersInteracted', 'true');

        // Build URL with default genres
        const params = new URLSearchParams(searchParams.toString());
        params.set('genre_id', defaultGenreIds.join(','));

        // Use replace to avoid adding to browser history
        router.replace(`/events?${params.toString()}`, { scroll: false });
      }
    } else if (hasGenreParam || hasAnyFilter) {
      // User has filters in URL (from bookmark, share, or previous interaction)
      // Mark as interacted so we don't override their choice
      sessionStorage.setItem('eventsFiltersInteracted', 'true');
    }
  }, [genres, searchParams, router]);

  const [shouldCollapseFilters, setShouldCollapseFilters] = useState(false);
  const [shouldExpandFilters, setShouldExpandFilters] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const lastScrollY = useRef(0);
  const hasAutoCollapsed = useRef(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const previousSearchTerms = useRef<string[]>([]);
  const isInitialMount = useRef(true);
  const scrollRestored = useRef(false);

  // Handle filter changes by updating URL
  // Note: Only add params that have values - omitting params effectively clears them from URL
  const setFilters = (newFilters: FilterValues) => {
    // Mark that user has interacted with filters
    sessionStorage.setItem('eventsFiltersInteracted', 'true');

    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.country_id?.length) params.set('country_id', newFilters.country_id.join(','));
    if (newFilters.category_id?.length) params.set('category_id', newFilters.category_id.join(','));
    if (newFilters.genre_id?.length) params.set('genre_id', newFilters.genre_id.join(','));
    if (newFilters.from_date) params.set('from_date', newFilters.from_date);
    if (newFilters.to_date) params.set('to_date', newFilters.to_date);
    if (newFilters.sort_by && newFilters.sort_by !== 'date')
      params.set('sort_by', newFilters.sort_by);
    if (newFilters.sort_order && newFilters.sort_order !== 'ASC')
      params.set('sort_order', newFilters.sort_order);

    const newUrl = params.toString() ? `/events?${params.toString()}` : '/events';

    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  };

  // No longer fetching categories or event dates here - using MetadataContext

  // Scroll to top and expand filters when search terms or filters change
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousSearchTerms.current = searchTerms;
      return;
    }

    // Reset scroll restoration flag when filters change
    scrollRestored.current = false;

    // Check if search terms actually changed
    const termsChanged =
      searchTerms.length !== previousSearchTerms.current.length ||
      !searchTerms.every((term) => previousSearchTerms.current.includes(term)) ||
      !previousSearchTerms.current.every((term) => searchTerms.includes(term));

    if (termsChanged) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (searchTerms.length > 0) {
        setShouldExpandFilters(true);
        // Reset expand trigger after a short delay
        setTimeout(() => setShouldExpandFilters(false), 100);
      }
      previousSearchTerms.current = searchTerms;
    }
  }, [searchTerms]);

  const { events, loading, error, pagination, categoryCounts, genreCounts, loadMore, hasMore } =
    useEvents({
      infiniteScroll: true,
      ...filters,
    });
  const [lastTotalCount, setLastTotalCount] = useState<number | undefined>(undefined);

  // Restore scroll position when events are loaded from cache
  useEffect(() => {
    if (!loading && events.length > 0 && !scrollRestored.current) {
      const savedPosition = sessionStorage.getItem('eventsScrollPosition');
      if (savedPosition) {
        const scrollPos = parseInt(savedPosition, 10);

        // Wait for DOM to be fully painted
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPos);
            sessionStorage.removeItem('eventsScrollPosition');
            scrollRestored.current = true;
          });
        });
      }
    }
  }, [loading, events.length]);

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
        setIsFilterSticky(rect.top <= TOP_BAR_HEIGHT);
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
            genreCounts={genreCounts || undefined}
            eventDates={eventDates}
            shouldCollapse={shouldCollapseFilters}
            shouldExpand={shouldExpandFilters}
            onCollapseComplete={() => setShouldCollapseFilters(false)}
            isSticky={isFilterSticky}
            loading={loading}
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
                      categoryName={
                        event.category_id ? categoriesMap[event.category_id] : undefined
                      }
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
