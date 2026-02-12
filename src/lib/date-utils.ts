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
