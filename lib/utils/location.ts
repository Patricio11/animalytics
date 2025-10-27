/**
 * Location Detection & Regional Presets
 * Detects user location and provides regional defaults
 */

export interface RegionalPreset {
  country: string;
  countryCode: string;
  currency: string;
  timezone: string;
  locale: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  measurementUnit: 'metric' | 'imperial';
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  language: string;
}

export interface LocationData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  timezone?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Regional presets for different countries
 */
export const REGIONAL_PRESETS: Record<string, RegionalPreset> = {
  // South Africa
  ZA: {
    country: 'South Africa',
    countryCode: 'ZA',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    locale: 'en-ZA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'en',
  },
  
  // United States
  US: {
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    timezone: 'America/New_York',
    locale: 'en-US',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    measurementUnit: 'imperial',
    firstDayOfWeek: 0, // Sunday
    language: 'en',
  },
  
  // United Kingdom
  GB: {
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    timezone: 'Europe/London',
    locale: 'en-GB',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'en',
  },
  
  // Canada
  CA: {
    country: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
    timezone: 'America/Toronto',
    locale: 'en-CA',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    measurementUnit: 'metric',
    firstDayOfWeek: 0, // Sunday
    language: 'en',
  },
  
  // Australia
  AU: {
    country: 'Australia',
    countryCode: 'AU',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    locale: 'en-AU',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'en',
  },
  
  // Germany
  DE: {
    country: 'Germany',
    countryCode: 'DE',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    locale: 'de-DE',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'de',
  },
  
  // France
  FR: {
    country: 'France',
    countryCode: 'FR',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    locale: 'fr-FR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'fr',
  },
  
  // Spain
  ES: {
    country: 'Spain',
    countryCode: 'ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    locale: 'es-ES',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'es',
  },
  
  // Brazil
  BR: {
    country: 'Brazil',
    countryCode: 'BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 0, // Sunday
    language: 'pt',
  },
  
  // Netherlands
  NL: {
    country: 'Netherlands',
    countryCode: 'NL',
    currency: 'EUR',
    timezone: 'Europe/Amsterdam',
    locale: 'nl-NL',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementUnit: 'metric',
    firstDayOfWeek: 1, // Monday
    language: 'en',
  },
};

/**
 * Default preset (fallback)
 */
export const DEFAULT_PRESET: RegionalPreset = {
  country: 'International',
  countryCode: 'INT',
  currency: 'USD',
  timezone: 'UTC',
  locale: 'en-US',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  measurementUnit: 'metric',
  firstDayOfWeek: 1,
  language: 'en',
};

/**
 * Detect user location from IP address using ipapi.co (free tier: 1000 requests/day)
 */
export async function detectUserLocation(ipAddress?: string): Promise<LocationData | null> {
  try {
    // DEVELOPMENT MODE: Mock South African location for localhost
    if (process.env.NODE_ENV === 'development' && (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1')) {
      console.log('🧪 Development mode: Using mock South African location');
      return {
        country: 'South Africa',
        countryCode: 'ZA',
        city: 'Cape Town',
        region: 'Western Cape',
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR',
        latitude: -33.9249,
        longitude: 18.4241,
      };
    }

    // If no IP provided, the API will use the request IP
    const url = ipAddress 
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/';
    
    console.log('🌍 Detecting location from IP:', ipAddress || 'auto-detect');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Animalytics/1.0',
      },
    });

    if (!response.ok) {
      console.error('Location detection failed:', response.statusText);
      return null;
    }

    const data = await response.json();

    console.log('📍 Location API response:', data);

    // Check for API errors
    if (data.error) {
      console.error('Location API error:', data.reason);
      return null;
    }

    const locationData = {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      currency: data.currency,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    console.log('✅ Location detected:', locationData);

    return locationData;
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
}

/**
 * Get regional preset based on country code
 */
export function getRegionalPreset(countryCode: string): RegionalPreset {
  return REGIONAL_PRESETS[countryCode.toUpperCase()] || DEFAULT_PRESET;
}

/**
 * Get regional preferences from location data
 */
export function getRegionalPreferencesFromLocation(location: LocationData | null): RegionalPreset {
  if (!location || !location.countryCode) {
    return DEFAULT_PRESET;
  }

  const preset = getRegionalPreset(location.countryCode);

  // Override timezone if available from location data
  if (location.timezone) {
    preset.timezone = location.timezone;
  }

  return preset;
}

/**
 * Detect location and return regional preferences
 */
export async function detectAndGetRegionalPreferences(ipAddress?: string): Promise<RegionalPreset> {
  const location = await detectUserLocation(ipAddress);
  return getRegionalPreferencesFromLocation(location);
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string | undefined {
  // Try various headers in order of preference
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }

  return undefined;
}
