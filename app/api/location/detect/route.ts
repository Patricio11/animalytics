import { NextRequest, NextResponse } from 'next/server';
import { detectUserLocation, getRegionalPreferencesFromLocation, getClientIp } from '@/lib/utils/location';

/**
 * GET /api/location/detect
 * Detect user location and return regional preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const clientIp = getClientIp(request.headers);
    
    console.log('🔍 Detecting location for IP:', clientIp || 'auto-detect');

    // Detect location (will use mock in development mode for localhost)
    const location = await detectUserLocation(clientIp);

    if (!location) {
      console.error('❌ Location detection failed');
      return NextResponse.json(
        { 
          error: 'Could not detect location',
          fallback: true,
        },
        { status: 200 } // Still return 200 with fallback flag
      );
    }

    console.log('✅ Location detected successfully:', location);

    // Get regional preferences based on location
    const regionalPreferences = getRegionalPreferencesFromLocation(location);

    return NextResponse.json({
      success: true,
      location: {
        country: location.country,
        countryCode: location.countryCode,
        city: location.city,
        region: location.region,
        timezone: location.timezone,
      },
      regionalPreferences,
    });
  } catch (error) {
    console.error('Error detecting location:', error);
    return NextResponse.json(
      { 
        error: 'Failed to detect location',
        fallback: true,
      },
      { status: 200 } // Return 200 to allow fallback handling
    );
  }
}
