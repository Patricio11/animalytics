/**
 * Date/Time Utilities with Timezone Support
 *
 * Best Practices:
 * - Store all dates in UTC in the database
 * - Display dates in user's timezone
 * - Use IANA timezone names (e.g., 'America/New_York', 'Europe/London', 'Africa/Johannesburg')
 * - Use Intl.DateTimeFormat for locale-aware formatting
 */

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

/**
 * Format date according to user preferences
 * @param date - Date object or ISO string
 * @param format - Date format preference
 * @param timezone - IANA timezone name
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: DateFormat = 'MM/DD/YYYY',
  timezone: string = 'UTC'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formatted = new Intl.DateTimeFormat('en-US', options).format(dateObj);
  const [month, day, year] = formatted.split('/');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return formatted;
  }
}

/**
 * Format time according to user preferences
 * @param date - Date object or ISO string
 * @param format - Time format preference (12h or 24h)
 * @param timezone - IANA timezone name
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  format: TimeFormat = '12h',
  timezone: string = 'UTC'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h',
  };

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format date and time together
 * @param date - Date object or ISO string
 * @param dateFormat - Date format preference
 * @param timeFormat - Time format preference
 * @param timezone - IANA timezone name
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string,
  dateFormat: DateFormat = 'MM/DD/YYYY',
  timeFormat: TimeFormat = '12h',
  timezone: string = 'UTC'
): string {
  const formattedDate = formatDate(date, dateFormat, timezone);
  const formattedTime = formatTime(date, timeFormat, timezone);
  return `${formattedDate} ${formattedTime}`;
}

/**
 * Format date in relative format (e.g., "2 hours ago", "3 days ago")
 * @param date - Date object or ISO string
 * @param locale - BCP 47 locale string
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param dateFormat - Date format preference
 * @param timezone - IANA timezone name
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  dateFormat: DateFormat = 'MM/DD/YYYY',
  timezone: string = 'UTC'
): string {
  const start = formatDate(startDate, dateFormat, timezone);
  const end = formatDate(endDate, dateFormat, timezone);
  return `${start} - ${end}`;
}

/**
 * Convert date to user's timezone
 * @param date - Date object or ISO string (in UTC)
 * @param timezone - Target IANA timezone name
 * @returns Date object in user's timezone
 */
export function convertToTimezone(
  date: Date | string,
  timezone: string
): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(dateObj);
  const getValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '0';

  return new Date(
    parseInt(getValue('year')),
    parseInt(getValue('month')) - 1,
    parseInt(getValue('day')),
    parseInt(getValue('hour')),
    parseInt(getValue('minute')),
    parseInt(getValue('second'))
  );
}

/**
 * Get current date/time in user's timezone
 * @param timezone - IANA timezone name
 * @returns Date object in user's timezone
 */
export function nowInTimezone(timezone: string): Date {
  return convertToTimezone(new Date(), timezone);
}

/**
 * Parse date string to Date object
 * @param dateString - Date string in user's format
 * @param format - Date format used
 * @returns Date object
 */
export function parseDate(
  dateString: string,
  format: DateFormat = 'MM/DD/YYYY'
): Date | null {
  const parts = dateString.split(/[\/\-]/);

  if (parts.length !== 3) {
    return null;
  }

  let year: number, month: number, day: number;

  switch (format) {
    case 'MM/DD/YYYY':
      [month, day, year] = parts.map(Number);
      break;
    case 'DD/MM/YYYY':
      [day, month, year] = parts.map(Number);
      break;
    case 'YYYY-MM-DD':
      [year, month, day] = parts.map(Number);
      break;
    default:
      return null;
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

/**
 * Calculate age from birthdate
 * @param birthdate - Date of birth
 * @param referenceDate - Reference date (defaults to now)
 * @returns Age in years
 */
export function calculateAge(
  birthdate: Date | string,
  referenceDate: Date = new Date()
): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Add days to a date
 * @param date - Source date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Add months to a date
 * @param date - Source date
 * @param months - Number of months to add
 * @returns New date
 */
export function addMonths(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setMonth(dateObj.getMonth() + months);
  return dateObj;
}

/**
 * Get day of week name
 * @param date - Date object or ISO string
 * @param locale - BCP 47 locale string
 * @param format - 'long' or 'short'
 * @returns Day name (e.g., "Monday" or "Mon")
 */
export function getDayName(
  date: Date | string,
  locale: string = 'en-US',
  format: 'long' | 'short' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { weekday: format }).format(dateObj);
}

/**
 * Get month name
 * @param date - Date object or ISO string
 * @param locale - BCP 47 locale string
 * @param format - 'long' or 'short'
 * @returns Month name (e.g., "January" or "Jan")
 */
export function getMonthName(
  date: Date | string,
  locale: string = 'en-US',
  format: 'long' | 'short' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { month: format }).format(dateObj);
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Get number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days difference
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date for database storage (ISO 8601 UTC)
 * @param date - Date to format
 * @returns ISO 8601 string
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}
