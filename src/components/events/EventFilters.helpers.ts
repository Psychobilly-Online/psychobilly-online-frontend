import type { Country } from './EventFilters.types';

export const parseDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const normalizeFilterValue = (value: string | number | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined;
  }
  if (value === '' || value === null) return undefined;
  return value;
};

export const getCountryIso = (country: Country) => country.iso_code || country.iso || '';
