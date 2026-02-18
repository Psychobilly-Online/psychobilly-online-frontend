import { describe, it, expect } from 'vitest';
import { parseDate, formatDate, formatEventDate, formatLongDate } from '../date-utils';

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

  describe('formatEventDate', () => {
    it('formats single day event', () => {
      expect(formatEventDate('2026-06-15')).toBe('15 Jun 2026');
      expect(formatEventDate('2026-06-15', '2026-06-15')).toBe('15 Jun 2026');
    });

    it('formats multi-day event in same month', () => {
      expect(formatEventDate('2026-06-15', '2026-06-17')).toBe('15-17 Jun 2026');
    });

    it('formats multi-day event across months in same year', () => {
      expect(formatEventDate('2026-04-30', '2026-05-01')).toBe('30 Apr - 1 May 2026');
    });

    it('formats multi-day event across years', () => {
      expect(formatEventDate('2025-12-31', '2026-01-01')).toBe('31 Dec 2025 - 1 Jan 2026');
    });

    it('handles invalid start date', () => {
      expect(formatEventDate('invalid-date')).toBe('Invalid date');
    });

    it('handles invalid end date', () => {
      expect(formatEventDate('2026-06-15', 'invalid-date')).toBe('15 Jun 2026');
    });

    it('formats dates with single-digit days correctly', () => {
      expect(formatEventDate('2026-03-01')).toBe('1 Mar 2026');
      expect(formatEventDate('2026-03-01', '2026-03-09')).toBe('1-9 Mar 2026');
    });

    it('handles all months correctly', () => {
      const months = [
        { date: '2026-01-15', expected: 'Jan' },
        { date: '2026-02-15', expected: 'Feb' },
        { date: '2026-03-15', expected: 'Mar' },
        { date: '2026-04-15', expected: 'Apr' },
        { date: '2026-05-15', expected: 'May' },
        { date: '2026-06-15', expected: 'Jun' },
        { date: '2026-07-15', expected: 'Jul' },
        { date: '2026-08-15', expected: 'Aug' },
        { date: '2026-09-15', expected: 'Sep' },
        { date: '2026-10-15', expected: 'Oct' },
        { date: '2026-11-15', expected: 'Nov' },
        { date: '2026-12-15', expected: 'Dec' },
      ];

      months.forEach(({ date, expected }) => {
        const result = formatEventDate(date);
        expect(result).toContain(expected);
      });
    });
  });

  describe('formatLongDate', () => {
    it('formats date with weekday, month, ordinal day, and year', () => {
      // 2026-05-23 is a Saturday
      expect(formatLongDate('2026-05-23')).toBe('Saturday, May 23rd 2026');
    });

    it('uses correct ordinal suffixes', () => {
      expect(formatLongDate('2026-05-01')).toContain('1st');
      expect(formatLongDate('2026-05-02')).toContain('2nd');
      expect(formatLongDate('2026-05-03')).toContain('3rd');
      expect(formatLongDate('2026-05-04')).toContain('4th');
      expect(formatLongDate('2026-05-11')).toContain('11th');
      expect(formatLongDate('2026-05-12')).toContain('12th');
      expect(formatLongDate('2026-05-13')).toContain('13th');
      expect(formatLongDate('2026-05-21')).toContain('21st');
      expect(formatLongDate('2026-05-22')).toContain('22nd');
      expect(formatLongDate('2026-05-23')).toContain('23rd');
      expect(formatLongDate('2026-05-30')).toContain('30th');
      expect(formatLongDate('2026-05-31')).toContain('31st');
    });

    it('formats all weekdays correctly', () => {
      // Known dates for 2026
      expect(formatLongDate('2026-02-16')).toContain('Monday'); // Monday
      expect(formatLongDate('2026-02-17')).toContain('Tuesday'); // Tuesday
      expect(formatLongDate('2026-02-18')).toContain('Wednesday'); // Wednesday
      expect(formatLongDate('2026-02-19')).toContain('Thursday'); // Thursday
      expect(formatLongDate('2026-02-20')).toContain('Friday'); // Friday
      expect(formatLongDate('2026-02-21')).toContain('Saturday'); // Saturday
      expect(formatLongDate('2026-02-22')).toContain('Sunday'); // Sunday
    });

    it('formats all months correctly', () => {
      expect(formatLongDate('2026-01-15')).toContain('January');
      expect(formatLongDate('2026-02-15')).toContain('February');
      expect(formatLongDate('2026-03-15')).toContain('March');
      expect(formatLongDate('2026-04-15')).toContain('April');
      expect(formatLongDate('2026-05-15')).toContain('May');
      expect(formatLongDate('2026-06-15')).toContain('June');
      expect(formatLongDate('2026-07-15')).toContain('July');
      expect(formatLongDate('2026-08-15')).toContain('August');
      expect(formatLongDate('2026-09-15')).toContain('September');
      expect(formatLongDate('2026-10-15')).toContain('October');
      expect(formatLongDate('2026-11-15')).toContain('November');
      expect(formatLongDate('2026-12-15')).toContain('December');
    });

    it('handles invalid date', () => {
      expect(formatLongDate('invalid-date')).toBe('Invalid date');
    });

    it('formats edge dates correctly', () => {
      expect(formatLongDate('2026-01-01')).toContain('January 1st');
      expect(formatLongDate('2026-12-31')).toContain('December 31st');
    });
  });
});
