/**
 * Location Detection Utilities
 * Detects user's location for filtering public content
 */

export interface UserLocation {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get user location from IP address using ipapi.co (free tier)
 * Falls back to browser geolocation if IP detection fails
 */
export async function detectUserLocation(): Promise<UserLocation | null> {
  try {
    // Try IP-based geolocation first (works server-side and client-side)
    const response = await fetch('https://ipapi.co/json/');
    
    if (response.ok) {
      const data = await response.json();
      
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || '',
        city: data.city || undefined,
        region: data.region || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      };
    }
  } catch (error) {
    console.warn('IP-based location detection failed:', error);
  }

  // Fallback: try browser geolocation API (client-side only)
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 300000, // Cache for 5 minutes
        });
      });

      // Use reverse geocoding to get location details
      // This is a simplified version - you might want to use a proper geocoding service
      return {
        country: 'Unknown',
        countryCode: '',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.warn('Browser geolocation failed:', error);
    }
  }

  return null;
}

/**
 * Get location from localStorage or detect new location
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  // Check if we have cached location (valid for 24 hours)
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('userLocation');
    const cacheTime = localStorage.getItem('userLocationTime');
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age < maxAge) {
        return JSON.parse(cached);
      }
    }
  }

  // Detect new location
  const location = await detectUserLocation();
  
  // Cache the result
  if (location && typeof window !== 'undefined') {
    localStorage.setItem('userLocation', JSON.stringify(location));
    localStorage.setItem('userLocationTime', Date.now().toString());
  }

  return location;
}

/**
 * Clear cached location
 */
export function clearCachedLocation(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userLocationTime');
  }
}

/**
 * Format location for display
 */
export function formatLocation(location: UserLocation | null): string {
  if (!location) return '';
  
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.join(', ');
}
