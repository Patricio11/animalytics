import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

/**
 * POST /api/settings/regional/fix
 * Manually set South African regional settings for current user
 * This is a temporary endpoint to fix existing users
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch current user
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

    // Set South African defaults
    const updatedPreferences = {
      notifications: currentUser.preferences?.notifications ?? true,
      emailUpdates: currentUser.preferences?.emailUpdates ?? true,
      darkMode: currentUser.preferences?.darkMode ?? false,
      language: 'en',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      locale: 'en-ZA',
      dateFormat: 'DD/MM/YYYY' as const,
      timeFormat: '24h' as const,
      measurementUnit: 'metric' as const,
      firstDayOfWeek: 1 as const,
    };

    // Update user preferences
    await db
      .update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    console.log(`✅ Fixed regional settings for user ${session.user.id} to South Africa defaults`);

    return NextResponse.json({
      success: true,
      message: 'Regional settings fixed to South Africa defaults',
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Error fixing regional settings:', error);
    return NextResponse.json(
      { error: 'Failed to fix regional settings' },
      { status: 500 }
    );
  }
}
