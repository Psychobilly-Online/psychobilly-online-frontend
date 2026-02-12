import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: vi.Mock<
    [callback: IntersectionObserverCallback, options?: IntersectionObserverInit],
    IntersectionObserver
  >;
  let observerCallback: IntersectionObserverCallback;
  let observeInstance: {
    observe: vi.Mock;
    disconnect: vi.Mock;
    unobserve: vi.Mock;
  };

  beforeEach(() => {
    // Mock IntersectionObserver
    observeInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };

    mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      observerCallback = callback;
      return observeInstance;
    });

    global.IntersectionObserver =
      mockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onLoadMore when intersecting and not loading and hasMore is true', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      }),
    );

    // Create a mock element and attach the ref
    const mockElement = document.createElement('div');
    result.current(mockElement);

    expect(observeInstance.observe).toHaveBeenCalledWith(mockElement);

    // Simulate intersection
    observerCallback(
      [
        {
          isIntersecting: true,
          target: mockElement,
        } as IntersectionObserverEntry,
      ],
      observeInstance,
    );

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('does not call onLoadMore when loading is true', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: true,
        hasMore: true,
        onLoadMore,
      }),
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    // Simulate intersection
    observerCallback(
      [
        {
          isIntersecting: true,
          target: mockElement,
        } as IntersectionObserverEntry,
      ],
      observeInstance,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: false,
        onLoadMore,
      }),
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    // Observer should not be created when hasMore is false
    expect(observeInstance.observe).not.toHaveBeenCalled();
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when not intersecting', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      }),
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    // Simulate no intersection
    observerCallback(
      [
        {
          isIntersecting: false,
          target: mockElement,
        } as IntersectionObserverEntry,
      ],
      observeInstance,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('uses ref values to prevent stale closure issues', () => {
    const onLoadMore = vi.fn();
    const { result, rerender } = renderHook(
      ({ loading, hasMore, onLoadMore }) =>
        useInfiniteScroll({
          loading,
          hasMore,
          onLoadMore,
        }),
      {
        initialProps: { loading: false, hasMore: true, onLoadMore },
      },
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    // Update props to loading: true
    rerender({ loading: true, hasMore: true, onLoadMore });

    // Simulate intersection - should not call onLoadMore because loading is now true
    observerCallback(
      [
        {
          isIntersecting: true,
          target: mockElement,
        } as IntersectionObserverEntry,
      ],
      observeInstance,
    );

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('disconnects observer on unmount', () => {
    const onLoadMore = vi.fn();
    const { result, unmount } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      }),
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    expect(observeInstance.observe).toHaveBeenCalled();

    unmount();

    expect(observeInstance.disconnect).toHaveBeenCalled();
  });

  it('disconnects previous observer when ref is called with new element', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      }),
    );

    const mockElement1 = document.createElement('div');
    result.current(mockElement1);

    expect(observeInstance.observe).toHaveBeenCalledWith(mockElement1);
    expect(observeInstance.disconnect).toHaveBeenCalledTimes(0);

    const mockElement2 = document.createElement('div');
    result.current(mockElement2);

    // Should disconnect the first observer before creating a new one
    expect(observeInstance.disconnect).toHaveBeenCalledTimes(1);
    expect(observeInstance.observe).toHaveBeenCalledWith(mockElement2);
  });

  it('passes custom rootMargin and threshold to observer', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
        rootMargin: '200px',
        threshold: 0.5,
      }),
    );

    const mockElement = document.createElement('div');
    result.current(mockElement);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: '200px',
      threshold: 0.5,
    });
  });

  it('does not create observer when node is null', () => {
    const onLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll({
        loading: false,
        hasMore: true,
        onLoadMore,
      }),
    );

    result.current(null);

    expect(observeInstance.observe).not.toHaveBeenCalled();
  });
});
