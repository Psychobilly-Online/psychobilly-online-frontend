import { describe, it, expect } from 'vitest';
import { parseDate, formatDate } from '../date-utils';

describe('date-utils', () => {
  describe('parseDate', () => {
    it('parses valid YYYY-MM-DD date strings', () => {
      const date = parseDate('2026-02-12');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // 0-indexed
      expect(date?.getDate()).toBe(12);
    });

    it('returns null for undefined or empty string', () => {
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('returns null for malformed date strings', () => {
      expect(parseDate('2026/02/12')).toBeNull(); // wrong separator
      expect(parseDate('2026-02')).toBeNull(); // missing day
      expect(parseDate('02-12-2026')).toBeNull(); // wrong order
      expect(parseDate('not-a-date')).toBeNull();
    });

    it('returns null for dates with time components', () => {
      expect(parseDate('2026-02-12T00:00:00')).toBeNull();
      expect(parseDate('2026-02-12 00:00:00')).toBeNull();
    });

    it('returns null for dates with invalid month', () => {
      expect(parseDate('2026-00-12')).toBeNull(); // month 0
      expect(parseDate('2026-13-12')).toBeNull(); // month 13
      expect(parseDate('2026-99-12')).toBeNull(); // month 99
    });

    it('returns null for dates with invalid day', () => {
      expect(parseDate('2026-02-00')).toBeNull(); // day 0
      expect(parseDate('2026-02-32')).toBeNull(); // day 32
      expect(parseDate('2026-02-99')).toBeNull(); // day 99
    });

    it('rejects dates that would roll over (invalid day for month)', () => {
      expect(parseDate('2026-02-31')).toBeNull(); // Feb 31 would roll to Mar 3
      expect(parseDate('2026-04-31')).toBeNull(); // Apr 31 would roll to May 1
      expect(parseDate('2026-11-31')).toBeNull(); // Nov 31 would roll to Dec 1
    });

    it('accepts Feb 29 in leap years', () => {
      const date = parseDate('2024-02-29');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(29);
    });

    it('rejects Feb 29 in non-leap years', () => {
      expect(parseDate('2026-02-29')).toBeNull(); // 2026 is not a leap year
      expect(parseDate('2023-02-29')).toBeNull();
    });

    it('rejects dates with non-numeric components', () => {
      expect(parseDate('202a-02-12')).toBeNull();
      expect(parseDate('2026-0b-12')).toBeNull();
      expect(parseDate('2026-02-1c')).toBeNull();
    });

    it('handles edge dates correctly', () => {
      expect(parseDate('2026-01-01')).toBeInstanceOf(Date); // Jan 1
      expect(parseDate('2026-12-31')).toBeInstanceOf(Date); // Dec 31
      expect(parseDate('1970-01-01')).toBeInstanceOf(Date); // Unix epoch
      expect(parseDate('2100-12-31')).toBeInstanceOf(Date); // far future
    });
  });

  describe('formatDate', () => {
    it('formats Date objects to YYYY-MM-DD', () => {
      const date = new Date(2026, 1, 12); // Feb 12, 2026 (month is 0-indexed)
      expect(formatDate(date)).toBe('2026-02-12');
    });

    it('pads single-digit months and days with zeros', () => {
      const date = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDate(date)).toBe('2026-01-05');
    });

    it('handles edge dates', () => {
      expect(formatDate(new Date(2026, 0, 1))).toBe('2026-01-01');
      expect(formatDate(new Date(2026, 11, 31))).toBe('2026-12-31');
    });
  });

  describe('parseDate and formatDate round-trip', () => {
    it('round-trips valid dates correctly', () => {
      const original = '2026-02-12';
      const parsed = parseDate(original);
      expect(parsed).toBeInstanceOf(Date);
      const formatted = formatDate(parsed!);
      expect(formatted).toBe(original);
    });

    it('round-trips edge dates', () => {
      const dates = ['2026-01-01', '2026-12-31', '2024-02-29'];
      dates.forEach((dateStr) => {
        const parsed = parseDate(dateStr);
        expect(parsed).toBeInstanceOf(Date);
        expect(formatDate(parsed!)).toBe(dateStr);
      });
    });
  });
});
