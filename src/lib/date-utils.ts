/**
 * Parses a date string in YYYY-MM-DD format to a Date object in local timezone.
 * Returns null for invalid or malformed dates.
 * Validates that the date components don't roll over (e.g., 2026-13-40).
 *
 * @param dateString - ISO date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseDate(dateString?: string): Date | null {
  if (!dateString) return null;

  const parts = dateString.split('-');
  if (parts.length !== 3) return null;

  const [yearStr, monthStr, dayStr] = parts;

  // Ensure all parts are purely numeric (no time suffixes or extra characters)
  if (!/^\d+$/.test(yearStr) || !/^\d+$/.test(monthStr) || !/^\d+$/.test(dayStr)) {
    return null;
  }

  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  // Basic range checks before constructing the Date
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    return null;
  }

  // Ensure Date didn't "roll" the values (e.g., 2026-02-31 -> 2026-03-03)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 *
 * @param date - Date object to format
 * @returns ISO date string in YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats event date(s) for display
 * Handles single day and multi-day events
 *
 * @param startDate - Event start date (YYYY-MM-DD)
 * @param endDate - Optional event end date (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "15 Jun 2026" or "15-17 Jun 2026")
 */
export function formatEventDate(startDate: string, endDate?: string): string {
  const start = parseDate(startDate);
  if (!start) return 'Invalid date';

  const startDay = start.getDate();
  const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(start);
  const startYear = start.getFullYear();

  // Single day event
  if (!endDate || endDate === startDate) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const end = parseDate(endDate);
  if (!end) return `${startDay} ${startMonth} ${startYear}`;

  const endDay = end.getDate();
  const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(end);
  const endYear = end.getFullYear();

  // Same month and year
  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startDay}-${endDay} ${startMonth} ${startYear}`;
  }

  // Same year, different months
  if (startYear === endYear) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
  }

  // Different years
  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Returns the ordinal suffix for a day (1st, 2nd, 3rd, 4th, etc.)
 *
 * @param day - Day of the month (1-31)
 * @returns Ordinal suffix ('st', 'nd', 'rd', or 'th')
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Formats a date string to a full date with day of week and ordinal suffix
 * Example: "Saturday, May 23rd 2026"
 *
 * @param dateString - ISO date string in YYYY-MM-DD format
 * @returns Formatted date string with day of week and ordinal
 */
export function formatLongDate(dateString: string): string {
  const date = parseDate(dateString);
  if (!date) return 'Invalid date';

  const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const day = date.getDate();
  const year = date.getFullYear();
  const ordinal = getOrdinalSuffix(day);

  return `${dayOfWeek}, ${month} ${day}${ordinal} ${year}`;
}
