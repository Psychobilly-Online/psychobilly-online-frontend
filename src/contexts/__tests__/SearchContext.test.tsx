import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchProvider, useSearchContext } from '../SearchContext';

describe('SearchContext', () => {
  describe('Initial State', () => {
    it('starts with empty filters', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      expect(result.current.filters).toEqual({
        search: undefined,
        sort_by: 'date',
        sort_order: 'ASC',
        limit: 25,
      });
    });

    it('starts with empty search terms array', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      expect(result.current.searchTerms).toEqual([]);
    });
  });

  describe('addSearchTerm', () => {
    it('adds a single search term', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });

      expect(result.current.searchTerms).toEqual(['Mad Sin']);
      expect(result.current.filters.search).toBe('Mad Sin');
    });

    it('adds multiple search terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });

      act(() => {
        result.current.addSearchTerm('Berlin');
      });

      expect(result.current.searchTerms).toEqual(['Mad Sin', 'Berlin']);
      expect(result.current.filters.search).toBe('Mad Sin,Berlin');
    });

    it('trims whitespace from search terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('  Mad Sin  ');
      });

      expect(result.current.searchTerms).toEqual(['Mad Sin']);
      expect(result.current.filters.search).toBe('Mad Sin');
    });

    it('ignores empty search terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('');
        result.current.addSearchTerm('   ');
      });

      expect(result.current.searchTerms).toEqual([]);
      expect(result.current.filters.search).toBeUndefined();
    });

    it('prevents duplicate search terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
        result.current.addSearchTerm('Mad Sin');
      });

      expect(result.current.searchTerms).toEqual(['Mad Sin']);
      expect(result.current.filters.search).toBe('Mad Sin');
    });

    it('updates filters with comma-separated terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });
      act(() => {
        result.current.addSearchTerm('Berlin');
      });
      act(() => {
        result.current.addSearchTerm('SO36');
      });

      expect(result.current.filters.search).toBe('Mad Sin,Berlin,SO36');
    });
  });

  describe('removeSearchTerm', () => {
    it('removes a search term', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
        result.current.addSearchTerm('Berlin');
      });

      act(() => {
        result.current.removeSearchTerm('Mad Sin');
      });

      expect(result.current.searchTerms).toEqual(['Berlin']);
      expect(result.current.filters.search).toBe('Berlin');
    });

    it('removes the last search term and clears filter', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });

      act(() => {
        result.current.removeSearchTerm('Mad Sin');
      });

      expect(result.current.searchTerms).toEqual([]);
      expect(result.current.filters.search).toBeUndefined();
    });

    it('handles removing non-existent term gracefully', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });

      act(() => {
        result.current.removeSearchTerm('Berlin');
      });

      expect(result.current.searchTerms).toEqual(['Mad Sin']);
      expect(result.current.filters.search).toBe('Mad Sin');
    });

    it('updates filters after removal', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });
      act(() => {
        result.current.addSearchTerm('Berlin');
      });
      act(() => {
        result.current.addSearchTerm('SO36');
      });

      act(() => {
        result.current.removeSearchTerm('Berlin');
      });

      expect(result.current.filters.search).toBe('Mad Sin,SO36');
    });
  });

  describe('clearSearchTerms', () => {
    it('clears all search terms', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
        result.current.addSearchTerm('Berlin');
      });

      act(() => {
        result.current.clearSearchTerms();
      });

      expect(result.current.searchTerms).toEqual([]);
      expect(result.current.filters.search).toBeUndefined();
    });

    it('handles clearing when already empty', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.clearSearchTerms();
      });

      expect(result.current.searchTerms).toEqual([]);
      expect(result.current.filters.search).toBeUndefined();
    });
  });

  describe('setFilters', () => {
    it('updates filters directly', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          category_id: ['1', '2'],
          from_date: '2026-01-01',
        });
      });

      expect(result.current.filters.category_id).toEqual(['1', '2']);
      expect(result.current.filters.from_date).toBe('2026-01-01');
    });

    it('updates filters and preserves search when included', () => {
      const { result } = renderHook(() => useSearchContext(), {
        wrapper: SearchProvider,
      });

      act(() => {
        result.current.addSearchTerm('Mad Sin');
      });

      act(() => {
        result.current.setFilters({
          ...result.current.filters,
          category_id: ['1'],
        });
      });

      // searchTerms state is separate from filters,
      // so it persists but filters.search must be set explicitly
      expect(result.current.searchTerms).toEqual(['Mad Sin']);
      expect(result.current.filters.category_id).toEqual(['1']);
    });
  });

  describe('Error Handling', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useSearchContext());
      }).toThrow('useSearchContext must be used within SearchProvider');
    });
  });
});
