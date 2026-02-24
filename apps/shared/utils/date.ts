/**
 * Date formatting utilities shared across apps.
 * Used by Accounting (transaction dates, report dates) and InventoryTracker (transaction dates, batch dates).
 */

/**
 * Format a date string or Date object for display.
 * Returns a locale-formatted string like "Oct 25, 2023".
 */
export function formatDate(
  date: string | Date,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format a date string or Date object with time.
 * Returns a string like "Oct 25, 2023, 2:30 PM".
 */
export function formatDateTime(
  date: string | Date,
  locale = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a date range for display.
 * Returns a string like "Oct 1, 2023 - Oct 31, 2023".
 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  locale = "en-US"
): string {
  return `${formatDate(start, locale)} - ${formatDate(end, locale)}`;
}
