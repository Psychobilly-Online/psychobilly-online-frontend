import { parseDate as parseDateUtil, formatDate as formatDateUtil } from '@/lib/date-utils';
import type { Country } from './EventFilters.types';

export const parseDate = (value?: string) => {
  return parseDateUtil(value) ?? undefined;
};

export const formatDate = (date: Date) => {
  return formatDateUtil(date);
};

export const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const normalizeFilterValue = (value: string | number | string[] | undefined | null) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined;
  }
  if (value === '' || value === null) return undefined;
  return value;
};

export const getCountryIso = (country: Country) => country.iso_code || country.iso || '';
