import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { detectAndGetRegionalPreferences, getClientIp } from '@/lib/utils/location';

/**
 * POST /api/settings/regional/initialize
 * Initialize regional settings based on user location (called after signup)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Checking session...');
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      console.error('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.id);

    // Get client IP from headers
    const clientIp = getClientIp(request.headers);
    console.log('🌐 Client IP:', clientIp || 'not detected');

    // Detect location and get regional preferences
    console.log('🔍 Detecting location...');
    const regionalPreferences = await detectAndGetRegionalPreferences(clientIp);
    console.log('📍 Regional preferences:', regionalPreferences);

    // Fetch current user to preserve other preferences
    const [currentUser] = await db
      .select({
        preferences: users.preferences,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Merge with existing preferences
    const updatedPreferences = {
      notifications: currentUser.preferences?.notifications ?? true,
      emailUpdates: currentUser.preferences?.emailUpdates ?? true,
      darkMode: currentUser.preferences?.darkMode ?? false,
      language: regionalPreferences.language,
      timezone: regionalPreferences.timezone,
      currency: regionalPreferences.currency,
      locale: regionalPreferences.locale,
      dateFormat: regionalPreferences.dateFormat,
      timeFormat: regionalPreferences.timeFormat,
      measurementUnit: regionalPreferences.measurementUnit,
      firstDayOfWeek: regionalPreferences.firstDayOfWeek,
    };

    // Update user preferences
    await db
      .update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    console.log(`✅ Regional preferences initialized for user ${session.user.id}:`, {
      country: regionalPreferences.country,
      currency: regionalPreferences.currency,
      timezone: regionalPreferences.timezone,
    });

    return NextResponse.json({
      success: true,
      message: 'Regional settings initialized successfully',
      data: {
        location: {
          country: regionalPreferences.country,
          countryCode: regionalPreferences.countryCode,
        },
        preferences: updatedPreferences,
      },
    });
  } catch (error) {
    console.error('Error initializing regional settings:', error);
    return NextResponse.json(
      { error: 'Failed to initialize regional settings' },
      { status: 500 }
    );
  }
}
