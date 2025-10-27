/**
 * Regional Formatting Utilities
 * Formats currency, dates, times, and measurements based on user's regional settings
 */

import { CURRENCIES } from './currency';

export interface RegionalSettings {
  currency: string;
  timezone: string;
  locale: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  measurementUnit: 'metric' | 'imperial';
  firstDayOfWeek: 0 | 1;
  language: string;
}

/**
 * Format currency amount based on regional settings
 */
export function formatCurrency(
  amount: number,
  settings: RegionalSettings,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    decimals?: number;
  }
): string {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
  } = options || {};

  const currencyInfo = CURRENCIES[settings.currency as keyof typeof CURRENCIES];
  
  if (!currencyInfo) {
    return amount.toFixed(decimals);
  }

  // Format the number with locale-specific formatting
  const formattedNumber = new Intl.NumberFormat(settings.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  // Build the display string
  let result = formattedNumber;

  if (showSymbol) {
    result = `${currencyInfo.symbol}${result}`;
  }

  if (showCode) {
    result = `${result} ${settings.currency}`;
  }

  return result;
}

/**
 * Format date based on regional settings
 */
export function formatDate(
  date: Date | string,
  settings: RegionalSettings,
  options?: {
    includeTime?: boolean;
    shortFormat?: boolean;
  }
): string {
  const {
    includeTime = false,
    shortFormat = false,
  } = options || {};

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // Format date based on user's preference
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  let formattedDate: string;

  switch (settings.dateFormat) {
    case 'DD/MM/YYYY':
      formattedDate = `${day}/${month}/${year}`;
      break;
    case 'MM/DD/YYYY':
      formattedDate = `${month}/${day}/${year}`;
      break;
    case 'YYYY-MM-DD':
      formattedDate = `${year}-${month}-${day}`;
      break;
    default:
      formattedDate = `${day}/${month}/${year}`;
  }

  if (shortFormat) {
    formattedDate = formattedDate.replace(/\/\d{4}/, '');
  }

  if (includeTime) {
    const timeStr = formatTime(dateObj, settings);
    formattedDate = `${formattedDate} ${timeStr}`;
  }

  return formattedDate;
}

/**
 * Format time based on regional settings
 */
export function formatTime(
  date: Date | string,
  settings: RegionalSettings
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  if (settings.timeFormat === '12h') {
    return dateObj.toLocaleTimeString(settings.locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return dateObj.toLocaleTimeString(settings.locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

/**
 * Format weight based on regional settings
 */
export function formatWeight(
  weightInKg: number,
  settings: RegionalSettings,
  options?: {
    decimals?: number;
    showUnit?: boolean;
  }
): string {
  const { decimals = 1, showUnit = true } = options || {};

  if (settings.measurementUnit === 'imperial') {
    const pounds = weightInKg * 2.20462;
    const formatted = pounds.toFixed(decimals);
    return showUnit ? `${formatted} lbs` : formatted;
  } else {
    const formatted = weightInKg.toFixed(decimals);
    return showUnit ? `${formatted} kg` : formatted;
  }
}

/**
 * Format height/length based on regional settings
 */
export function formatHeight(
  heightInCm: number,
  settings: RegionalSettings,
  options?: {
    decimals?: number;
    showUnit?: boolean;
  }
): string {
  const { decimals = 1, showUnit = true } = options || {};

  if (settings.measurementUnit === 'imperial') {
    const inches = heightInCm * 0.393701;
    const formatted = inches.toFixed(decimals);
    return showUnit ? `${formatted} in` : formatted;
  } else {
    const formatted = heightInCm.toFixed(decimals);
    return showUnit ? `${formatted} cm` : formatted;
  }
}

/**
 * Format temperature based on regional settings
 */
export function formatTemperature(
  tempInCelsius: number,
  settings: RegionalSettings,
  options?: {
    decimals?: number;
    showUnit?: boolean;
  }
): string {
  const { decimals = 1, showUnit = true } = options || {};

  if (settings.measurementUnit === 'imperial') {
    const fahrenheit = (tempInCelsius * 9/5) + 32;
    const formatted = fahrenheit.toFixed(decimals);
    return showUnit ? `${formatted}°F` : formatted;
  } else {
    const formatted = tempInCelsius.toFixed(decimals);
    return showUnit ? `${formatted}°C` : formatted;
  }
}

/**
 * Parse currency input and convert to number
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols, spaces, and letters
  const cleaned = input.replace(/[^\d.,\-]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '.');
  
  return parseFloat(normalized) || 0;
}

/**
 * Convert weight from user's unit to kg (for database storage)
 */
export function convertWeightToKg(
  weight: number,
  settings: RegionalSettings
): number {
  if (settings.measurementUnit === 'imperial') {
    return weight / 2.20462; // lbs to kg
  }
  return weight;
}

/**
 * Convert height from user's unit to cm (for database storage)
 */
export function convertHeightToCm(
  height: number,
  settings: RegionalSettings
): number {
  if (settings.measurementUnit === 'imperial') {
    return height / 0.393701; // inches to cm
  }
  return height;
}

/**
 * Convert temperature from user's unit to Celsius (for database storage)
 */
export function convertTemperatureToCelsius(
  temp: number,
  settings: RegionalSettings
): number {
  if (settings.measurementUnit === 'imperial') {
    return (temp - 32) * 5/9; // Fahrenheit to Celsius
  }
  return temp;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string,
  settings: RegionalSettings
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj, settings);
  }
}
