import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateLabel,
  getCountryIso,
  normalizeFilterValue,
  parseDate,
} from '../EventFilters.helpers';

const makeDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);

describe('EventFilters helpers', () => {
  it('parses dates safely', () => {
    expect(parseDate('2026-02-10')?.getFullYear()).toBe(2026);
    expect(parseDate('')).toBeUndefined();
    expect(parseDate('2026-02')).toBeUndefined();
  });

  it('formats dates in API format', () => {
    expect(formatDate(makeDate(2026, 2, 10))).toBe('2026-02-10');
  });

  it('formats labels in en-GB', () => {
    expect(formatDateLabel(makeDate(2026, 2, 10))).toBe('10 Feb 2026');
  });

  it('normalizes filter values', () => {
    expect(normalizeFilterValue([])).toBeUndefined();
    expect(normalizeFilterValue(['1'])).toEqual(['1']);
    expect(normalizeFilterValue('')).toBeUndefined();
    expect(normalizeFilterValue(null as unknown as string)).toBeUndefined();
  });

  it('returns country iso code', () => {
    expect(getCountryIso({ id: 1, name: 'Germany', iso: 'DE' })).toBe('DE');
    expect(getCountryIso({ id: 2, name: 'USA', iso: 'US' })).toBe('US');
    expect(getCountryIso({ id: 3, name: 'Unknown' })).toBe(''); // Fallback for missing iso
  });
});
