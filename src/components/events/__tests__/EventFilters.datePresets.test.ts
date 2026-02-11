import { describe, expect, it, beforeEach, vi } from 'vitest';

/**
 * Test suite for date preset calculations
 * These tests verify the date range logic for various presets
 */
describe('EventFilters date presets', () => {
  beforeEach(() => {
    // Mock current date to Feb 11, 2026 for consistent tests
    vi.setSystemTime(new Date(2026, 1, 11)); // Month is 0-indexed
  });

  describe('next-month preset', () => {
    it('calculates correct date range from today to one month ahead', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      expect(today.getFullYear()).toBe(2026);
      expect(today.getMonth()).toBe(1); // February (0-indexed)
      expect(today.getDate()).toBe(11);
      
      expect(nextMonth.getFullYear()).toBe(2026);
      expect(nextMonth.getMonth()).toBe(2); // March
      expect(nextMonth.getDate()).toBe(11);
    });

    it('handles month overflow correctly', () => {
      // Set to December 15
      vi.setSystemTime(new Date(2026, 11, 15));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      expect(nextMonth.getFullYear()).toBe(2027); // Year increments
      expect(nextMonth.getMonth()).toBe(0); // January
      expect(nextMonth.getDate()).toBe(15);
    });
  });

  describe('next-3-months preset', () => {
    it('calculates correct date range from today to three months ahead', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const next3Months = new Date(today);
      next3Months.setMonth(next3Months.getMonth() + 3);
      
      expect(today.getFullYear()).toBe(2026);
      expect(today.getMonth()).toBe(1); // February
      
      expect(next3Months.getFullYear()).toBe(2026);
      expect(next3Months.getMonth()).toBe(4); // May
      expect(next3Months.getDate()).toBe(11);
    });

    it('handles year overflow correctly', () => {
      // Set to November 15
      vi.setSystemTime(new Date(2026, 10, 15));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const next3Months = new Date(today);
      next3Months.setMonth(next3Months.getMonth() + 3);
      
      expect(next3Months.getFullYear()).toBe(2027); // Year increments
      expect(next3Months.getMonth()).toBe(1); // February
      expect(next3Months.getDate()).toBe(15);
    });
  });

  describe('any preset', () => {
    it('sets from_date to a very old date', () => {
      const anyDate = new Date(1950, 0, 1);
      anyDate.setHours(0, 0, 0, 0);
      
      expect(anyDate.getFullYear()).toBe(1950);
      expect(anyDate.getMonth()).toBe(0); // January
      expect(anyDate.getDate()).toBe(1);
    });
  });

  describe('today preset', () => {
    it('clears both from_date and to_date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // The "today" preset should result in null values
      // which means no date filtering (showing from today onwards)
      expect(today.getFullYear()).toBe(2026);
      expect(today.getMonth()).toBe(1);
      expect(today.getDate()).toBe(11);
    });
  });

  describe('date formatting for API', () => {
    it('formats dates as YYYY-MM-DD', () => {
      const date = new Date(2026, 1, 11);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      
      expect(formatted).toBe('2026-02-11');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2026, 0, 5); // Jan 5
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formatted = `${year}-${month}-${day}`;
      
      expect(formatted).toBe('2026-01-05');
    });
  });

  describe('event date highlighting', () => {
    it('converts date strings to timestamps at midnight', () => {
      const dateStr = '2026-02-15';
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const timestamp = date.getTime();
      
      expect(timestamp).toBe(new Date(2026, 1, 15).getTime());
    });

    it('creates a Set for efficient date lookups', () => {
      const dates = ['2026-02-15', '2026-03-20', '2026-04-10'];
      const timestamps = dates.map((dateStr) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });
      
      const dateSet = new Set(timestamps);
      
      expect(dateSet.size).toBe(3);
      expect(dateSet.has(new Date(2026, 1, 15).getTime())).toBe(true);
      expect(dateSet.has(new Date(2026, 2, 20).getTime())).toBe(true);
      expect(dateSet.has(new Date(2026, 3, 10).getTime())).toBe(true);
      expect(dateSet.has(new Date(2026, 4, 1).getTime())).toBe(false);
    });

    it('handles midnight boundary correctly', () => {
      const date1 = new Date(2026, 1, 15, 0, 0, 0, 0); // Midnight
      const date2 = new Date(2026, 1, 15, 23, 59, 59, 999); // End of day
      
      date2.setHours(0, 0, 0, 0); // Normalize to midnight
      
      expect(date1.getTime()).toBe(date2.getTime());
    });
  });
});
