'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Custom hook for infinite scroll functionality
 * Uses Intersection Observer to detect when user scrolls near the bottom
 */
export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);

  // Update refs when values change
  useEffect(() => {
    loadingRef.current = loading;
    hasMoreRef.current = hasMore;
    onLoadMoreRef.current = onLoadMore;
  }, [loading, hasMore, onLoadMore]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Don't observe if node is null or no more items
      if (!node || !hasMoreRef.current) {
        return;
      }

      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Only trigger if not currently loading and has more items
          if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
            onLoadMoreRef.current();
          }
        },
        {
          rootMargin,
          threshold,
        },
      );

      // Start observing the target element
      observerRef.current.observe(node);
    },
    [rootMargin, threshold],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}
