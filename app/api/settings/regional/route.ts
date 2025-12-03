import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';

/**
 * GET /api/settings/regional
 * Get current user's regional settings
 */
export async function GET(request: NextRequest) {
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

    // Fetch user preferences
    const [user] = await db
      .select({
        preferences: users.preferences,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.preferences,
    });
  } catch (error) {
    console.error('Error fetching regional settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regional settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/regional
 * Update user's regional settings
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Validate the incoming data
    const allowedFields = [
      'language',
      'timezone',
      'currency',
      'locale',
      'dateFormat',
      'timeFormat',
      'measurementUnit',
      'firstDayOfWeek',
      'city',
      'region',
      'country',
      'countryCode',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Fetch current preferences
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

    // Merge with existing preferences - ensure all required fields are present
    const updatedPreferences = {
      notifications: currentUser.preferences?.notifications ?? true,
      emailUpdates: currentUser.preferences?.emailUpdates ?? true,
      darkMode: currentUser.preferences?.darkMode ?? false,
      language: currentUser.preferences?.language ?? 'en',
      timezone: currentUser.preferences?.timezone ?? 'UTC',
      currency: currentUser.preferences?.currency ?? 'USD',
      locale: currentUser.preferences?.locale ?? 'en-US',
      dateFormat: currentUser.preferences?.dateFormat ?? 'MM/DD/YYYY' as const,
      timeFormat: currentUser.preferences?.timeFormat ?? '12h' as const,
      measurementUnit: currentUser.preferences?.measurementUnit ?? 'metric' as const,
      firstDayOfWeek: currentUser.preferences?.firstDayOfWeek ?? 0 as const,
      ...updates,
    };

    // Update in database
    await db
      .update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Regional settings updated successfully',
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating regional settings:', error);
    return NextResponse.json(
      { error: 'Failed to update regional settings' },
      { status: 500 }
    );
  }
}
