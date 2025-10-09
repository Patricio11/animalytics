/**
 * Internationalization Configuration
 *
 * Uses next-intl for seamless translation support
 * Currently focused on English, but structured for easy addition of other languages
 */

export const locales = ['en', 'es', 'pt', 'fr', 'de', 'af'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  af: 'Afrikaans',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
  fr: '🇫🇷',
  de: '🇩🇪',
  af: '🇿🇦',
};

// Locale to timezone mapping (common defaults)
export const localeToTimezone: Record<Locale, string> = {
  en: 'America/New_York',
  es: 'Europe/Madrid',
  pt: 'America/Sao_Paulo',
  fr: 'Europe/Paris',
  de: 'Europe/Berlin',
  af: 'Africa/Johannesburg',
};

// Locale to currency mapping (common defaults)
export const localeToCurrency: Record<Locale, string> = {
  en: 'USD',
  es: 'EUR',
  pt: 'BRL',
  fr: 'EUR',
  de: 'EUR',
  af: 'ZAR',
};

// Locale to date format mapping
export const localeToDateFormat: Record<Locale, 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'> = {
  en: 'MM/DD/YYYY',
  es: 'DD/MM/YYYY',
  pt: 'DD/MM/YYYY',
  fr: 'DD/MM/YYYY',
  de: 'DD/MM/YYYY',
  af: 'YYYY-MM-DD',
};

// Locale to measurement system mapping
export const localeToMeasurementSystem: Record<Locale, 'metric' | 'imperial'> = {
  en: 'imperial', // US uses imperial
  es: 'metric',
  pt: 'metric',
  fr: 'metric',
  de: 'metric',
  af: 'metric',
};
