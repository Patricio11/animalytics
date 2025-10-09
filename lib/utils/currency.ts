/**
 * Currency Utilities
 *
 * Best Practice: Store all monetary values as CENTS (smallest currency unit)
 * - Avoids floating-point precision errors
 * - Enables accurate calculations
 * - Industry standard for financial applications
 *
 * Example: $10.99 is stored as 1099 cents
 */

// Supported currencies with their details
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, position: 'before' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2, position: 'before' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2, position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2, position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, position: 'before' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, position: 'before' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, position: 'before' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Convert dollars to cents (store in database)
 * @param amount - Amount in dollars (e.g., 10.99)
 * @returns Amount in cents (e.g., 1099)
 */
export function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to dollars (display to user)
 * @param cents - Amount in cents (e.g., 1099)
 * @returns Amount in dollars (e.g., 10.99)
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @param currencyCode - ISO 4217 currency code
 * @param locale - BCP 47 locale string (e.g., 'en-US', 'pt-BR')
 * @returns Formatted currency string (e.g., "$10.99", "R$ 10,99")
 */
export function formatCurrency(
  cents: number,
  currencyCode: CurrencyCode = 'USD',
  locale: string = 'en-US'
): string {
  const currency = CURRENCIES[currencyCode];
  const amount = cents / Math.pow(10, currency.decimals);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);
}

/**
 * Parse currency string to cents
 * @param value - Currency string (e.g., "$10.99", "10.99", "10,99")
 * @param currencyCode - ISO 4217 currency code
 * @returns Amount in cents (e.g., 1099)
 */
export function parseCurrencyToCents(
  value: string,
  currencyCode: CurrencyCode = 'USD'
): number {
  const currency = CURRENCIES[currencyCode];

  // Remove currency symbols and whitespace
  let cleanValue = value.replace(/[^\d,.-]/g, '');

  // Replace comma with period for decimal separator (handle European format)
  if (cleanValue.lastIndexOf(',') > cleanValue.lastIndexOf('.')) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } else {
    cleanValue = cleanValue.replace(/,/g, '');
  }

  const amount = parseFloat(cleanValue);

  if (isNaN(amount)) {
    return 0;
  }

  return Math.round(amount * Math.pow(10, currency.decimals));
}

/**
 * Convert amount from one currency to another
 * Note: In production, exchange rates should be fetched from an API
 *
 * @param cents - Amount in cents
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRate - Exchange rate (from API)
 * @returns Converted amount in cents
 */
export function convertCurrency(
  cents: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return cents;
  }

  const fromDecimals = CURRENCIES[fromCurrency].decimals;
  const toDecimals = CURRENCIES[toCurrency].decimals;

  // Convert cents to base amount
  const baseAmount = cents / Math.pow(10, fromDecimals);

  // Apply exchange rate
  const convertedAmount = baseAmount * exchangeRate;

  // Convert back to cents in target currency
  return Math.round(convertedAmount * Math.pow(10, toDecimals));
}

/**
 * Add two cent amounts
 * @param cents1 - First amount in cents
 * @param cents2 - Second amount in cents
 * @returns Sum in cents
 */
export function addCents(cents1: number, cents2: number): number {
  return cents1 + cents2;
}

/**
 * Subtract two cent amounts
 * @param cents1 - First amount in cents
 * @param cents2 - Second amount in cents
 * @returns Difference in cents
 */
export function subtractCents(cents1: number, cents2: number): number {
  return cents1 - cents2;
}

/**
 * Multiply cents by a factor (e.g., for calculating totals, taxes)
 * @param cents - Amount in cents
 * @param factor - Multiplication factor
 * @returns Product in cents
 */
export function multiplyCents(cents: number, factor: number): number {
  return Math.round(cents * factor);
}

/**
 * Divide cents by a divisor (e.g., for splitting costs)
 * @param cents - Amount in cents
 * @param divisor - Division factor
 * @returns Quotient in cents
 */
export function divideCents(cents: number, divisor: number): number {
  return Math.round(cents / divisor);
}

/**
 * Calculate percentage of an amount
 * @param cents - Amount in cents
 * @param percentage - Percentage (e.g., 15 for 15%)
 * @returns Percentage amount in cents
 */
export function calculatePercentage(cents: number, percentage: number): number {
  return Math.round((cents * percentage) / 100);
}

/**
 * Format cents as compact currency (e.g., $1.2K, $1.5M)
 * @param cents - Amount in cents
 * @param currencyCode - ISO 4217 currency code
 * @param locale - BCP 47 locale string
 * @returns Compact formatted currency string
 */
export function formatCurrencyCompact(
  cents: number,
  currencyCode: CurrencyCode = 'USD',
  locale: string = 'en-US'
): string {
  const currency = CURRENCIES[currencyCode];
  const amount = cents / Math.pow(10, currency.decimals);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Validate cents amount
 * @param cents - Amount in cents
 * @returns True if valid, false otherwise
 */
export function isValidCentsAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0;
}

/**
 * Get currency symbol
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Get currency name
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency name
 */
export function getCurrencyName(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].name;
}
