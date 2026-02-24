/**
 * Currency and number formatting utilities shared across financial apps.
 * Used by Accounting (balances, budgets, reports) and SupplierTracker (order costs).
 */

/**
 * Format a number as a currency string.
 * Defaults to USD with 2 decimal places.
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas and fixed decimal places.
 */
export function formatNumber(
  value: number,
  decimals = 2,
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a currency string back to a number. Removes currency symbols and commas.
 * Returns NaN if the string cannot be parsed.
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  return parseFloat(cleaned);
}
