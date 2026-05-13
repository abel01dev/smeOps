/**
 * Currency formatting utilities.
 *
 * The MVP is fixed to Ethiopian Birr (ETB). The shape of this module is intentionally
 * small so we can later promote `currency` to a per-organization setting without
 * touching call sites — they will keep calling `formatMoney(value)`.
 */

export const DEFAULT_CURRENCY = "ETB" as const;
export const DEFAULT_LOCALE = "en-ET" as const;

export interface MoneyFormatOptions {
  currency?: string;
  locale?: string;
  /** If true, omits the currency code/symbol and returns the plain number. */
  numericOnly?: boolean;
}

/**
 * Format a numeric or string monetary value for display.
 * Accepts string because Prisma `Decimal` serializes as string over JSON.
 */
export function formatMoney(
  value: number | string,
  options: MoneyFormatOptions = {},
): string {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    numericOnly = false,
  } = options;

  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return numericOnly ? "0.00" : `${currency} 0.00`;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(numeric);
  return numericOnly ? formatted : `${currency} ${formatted}`;
}

/** Format an integer count (for stock, quantities, etc.). */
export function formatCount(value: number | string, locale = DEFAULT_LOCALE): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "0";
  return new Intl.NumberFormat(locale).format(Math.trunc(numeric));
}
