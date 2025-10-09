/**
 * Locale Detection Utilities
 *
 * Automatically detect user's preferred locale, timezone, currency, and measurement system
 * based on browser settings and IP geolocation (optional)
 */

import {
  type Locale,
  defaultLocale,
  localeToTimezone,
  localeToCurrency,
  localeToDateFormat,
  localeToMeasurementSystem,
} from '@/lib/i18n/config';

/**
 * Detect user's preferred language from browser
 * @returns ISO 639-1 language code
 */
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Get browser language (e.g., 'en-US', 'pt-BR', 'es-ES')
  const browserLang = navigator.language || navigator.languages?.[0] || '';

  // Extract language code (first 2 characters)
  const langCode = browserLang.substring(0, 2).toLowerCase();

  // Map to supported locale
  const supportedLangs: Record<string, Locale> = {
    en: 'en',
    es: 'es',
    pt: 'pt',
    fr: 'fr',
    de: 'de',
    af: 'af',
  };

  return supportedLangs[langCode] || defaultLocale;
}

/**
 * Detect user's timezone from browser
 * @returns IANA timezone name
 */
export function detectBrowserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC';
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Failed to detect timezone:', error);
    return 'UTC';
  }
}

/**
 * Detect user's preferred locale (language + region)
 * @returns BCP 47 locale string (e.g., 'en-US', 'pt-BR')
 */
export function detectBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return 'en-US';
  }

  return navigator.language || navigator.languages?.[0] || 'en-US';
}

/**
 * Detect user's preferred currency based on locale
 * @param locale - Optional BCP 47 locale string
 * @returns ISO 4217 currency code
 */
export function detectCurrency(locale?: string): string {
  const browserLocale = locale || detectBrowserLocale();
  const langCode = browserLocale.substring(0, 2).toLowerCase() as Locale;

  // Use locale-to-currency mapping
  return localeToCurrency[langCode] || 'USD';
}

/**
 * Detect user's preferred date format based on locale
 * @param locale - Optional BCP 47 locale string
 * @returns Date format preference
 */
export function detectDateFormat(locale?: string): 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' {
  const browserLocale = locale || detectBrowserLocale();
  const langCode = browserLocale.substring(0, 2).toLowerCase() as Locale;

  return localeToDateFormat[langCode] || 'MM/DD/YYYY';
}

/**
 * Detect user's preferred time format (12h vs 24h) based on locale
 * @param locale - Optional BCP 47 locale string
 * @returns Time format preference
 */
export function detectTimeFormat(locale?: string): '12h' | '24h' {
  const browserLocale = locale || detectBrowserLocale();

  // US primarily uses 12h format, most others use 24h
  const uses12Hour = browserLocale.startsWith('en-US');
  return uses12Hour ? '12h' : '24h';
}

/**
 * Detect user's preferred measurement system based on locale
 * @param locale - Optional BCP 47 locale string
 * @returns Measurement system preference
 */
export function detectMeasurementSystem(locale?: string): 'metric' | 'imperial' {
  const browserLocale = locale || detectBrowserLocale();
  const langCode = browserLocale.substring(0, 2).toLowerCase() as Locale;

  return localeToMeasurementSystem[langCode] || 'metric';
}

/**
 * Detect first day of week based on locale
 * @param locale - Optional BCP 47 locale string
 * @returns 0 for Sunday (US), 1 for Monday (Europe/most others)
 */
export function detectFirstDayOfWeek(locale?: string): 0 | 1 {
  const browserLocale = locale || detectBrowserLocale();

  // US and Canada start week on Sunday, most others on Monday
  const startsSunday = browserLocale.startsWith('en-US') || browserLocale.startsWith('en-CA');
  return startsSunday ? 0 : 1;
}

/**
 * Get complete user preferences based on browser detection
 * @returns Complete preferences object ready for database storage
 */
export function detectUserPreferences() {
  const browserLocale = detectBrowserLocale();
  const language = detectBrowserLanguage();

  return {
    language,
    timezone: detectBrowserTimezone(),
    currency: detectCurrency(browserLocale),
    locale: browserLocale,
    dateFormat: detectDateFormat(browserLocale),
    timeFormat: detectTimeFormat(browserLocale),
    measurementUnit: detectMeasurementSystem(browserLocale),
    firstDayOfWeek: detectFirstDayOfWeek(browserLocale),
    notifications: true,
    emailUpdates: true,
    darkMode: false,
  };
}

/**
 * Detect country from timezone (fallback method)
 * @param timezone - IANA timezone name
 * @returns ISO 3166-1 alpha-2 country code
 */
export function getCountryFromTimezone(timezone: string): string {
  const timezoneToCountry: Record<string, string> = {
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'America/Sao_Paulo': 'BR',
    'Europe/London': 'GB',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Europe/Madrid': 'ES',
    'Africa/Johannesburg': 'ZA',
    'Australia/Sydney': 'AU',
    'Asia/Tokyo': 'JP',
    'Asia/Shanghai': 'CN',
    'Asia/Kolkata': 'IN',
  };

  return timezoneToCountry[timezone] || 'US';
}

/**
 * Format number according to user's locale
 * @param value - Number to format
 * @param locale - BCP 47 locale string
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
