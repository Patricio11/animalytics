import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { buyerProfiles } from '@/lib/db/schema/buyer-profiles';
import { accounts } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { detectAndGetRegionalPreferences, getClientIp } from '@/lib/utils/location';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * POST /api/auth/initialize-oauth-user
 * Initialize user profile and preferences after OAuth sign-in/sign-up
 * This endpoint is called automatically after Google OAuth callback
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('🔐 Initializing OAuth user:', userId);

    // Check if this user authenticated via OAuth
    const [userAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    if (!userAccount || userAccount.providerId !== 'google') {
      return NextResponse.json(
        { message: 'User is not an OAuth user, skipping initialization' },
        { status: 200 }
      );
    }

    console.log('✅ OAuth user confirmed');

    // 1. Initialize regional preferences based on location
    try {
      const clientIp = getClientIp(request.headers);
      console.log('🌐 Client IP:', clientIp || 'not detected');

      const regionalPreferences = await detectAndGetRegionalPreferences(clientIp);
      console.log('📍 Regional preferences detected:', regionalPreferences);

      // Get current user to merge preferences
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // Merge with existing preferences (if any)
      const updatedPreferences = {
        notifications: currentUser?.preferences?.notifications ?? true,
        emailUpdates: currentUser?.preferences?.emailUpdates ?? true,
        darkMode: currentUser?.preferences?.darkMode ?? false,
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
        .where(eq(users.id, userId));

      console.log('✅ Regional preferences saved');
    } catch (regionalError) {
      console.error('Failed to save regional preferences:', regionalError);
      // Don't fail the whole request if regional settings fail
    }

    // 2. Get the user to check their role
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userRole = currentUser?.role || 'breeder';

    // 3. Create appropriate profile based on role
    if (userRole === 'buyer') {
      // Create buyer profile
      try {
        const [existingBuyerProfile] = await db
          .select()
          .from(buyerProfiles)
          .where(eq(buyerProfiles.userId, userId))
          .limit(1);

        if (!existingBuyerProfile) {
          console.log('🛒 Creating buyer profile for OAuth user...');

          const displayName = session.user.name || 'Buyer';

          await db.insert(buyerProfiles).values({
            userId: userId,
            displayName: displayName,
          });

          console.log('✅ Buyer profile created');
        } else {
          console.log('ℹ️ Buyer profile already exists');
        }
      } catch (profileError) {
        console.error('Failed to create buyer profile:', profileError);
        // Don't fail the whole request if profile creation fails
      }
    } else {
      // Create breeder profile (default for breeder, veterinarian, etc.)
      try {
        const [existingProfile] = await db
          .select()
          .from(breederProfiles)
          .where(eq(breederProfiles.userId, userId))
          .limit(1);

        if (!existingProfile) {
          console.log('👤 Creating breeder profile for OAuth user...');

          // Generate slug from user name
          const displayName = session.user.name || 'Breeder';
          const slug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + userId.substring(0, 8);

          await db.insert(breederProfiles).values({
            userId: userId,
            displayName: displayName,
            slug: slug,
            location: {
              country: 'US',
            },
          });

          console.log('✅ Breeder profile created');
        } else {
          console.log('ℹ️ Breeder profile already exists');
        }
      } catch (profileError) {
        console.error('Failed to create breeder profile:', profileError);
        // Don't fail the whole request if profile creation fails
      }
    }

    console.log('🎉 OAuth user initialization complete');

    return NextResponse.json({
      success: true,
      message: 'OAuth user initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing OAuth user:', error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth user' },
      { status: 500 }
    );
  }
}
