import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { breederBreedPreferences } from '@/lib/db/schema/user-breed-preferences';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { petOwnerProfiles } from '@/lib/db/schema/pet-owner-profiles';
import { eq } from 'drizzle-orm';
import { detectUserLocation, getRegionalPreferencesFromLocation, getClientIp } from '@/lib/utils/location';

/**
 * POST /api/auth/save-signup-preferences
 * Save user preferences during signup (for unverified users)
 * This endpoint doesn't require authentication since the user just signed up
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, breedIds } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('💾 Saving signup preferences for:', email);

    // Find the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found user:', user.id);

    // 1. Update user role in the database
    if (role) {
      try {
        console.log('👤 Updating user role to:', role);
        await db
          .update(users)
          .set({
            role: role as 'breeder' | 'veterinarian' | 'admin' | 'event_organizer' | 'pet_owner',
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
        console.log('✅ User role updated');
      } catch (roleError) {
        console.error('Failed to update user role:', roleError);
      }
    }

    // 2. Initialize regional settings based on location
    try {
      const clientIp = getClientIp(request.headers);
      console.log('🌐 Client IP:', clientIp || 'not detected');

      // Detect location from IP
      const locationData = await detectUserLocation(clientIp);
      const regionalPreferences = getRegionalPreferencesFromLocation(locationData);
      console.log('📍 Location data:', locationData);
      console.log('📍 Regional preferences:', regionalPreferences);

      // Merge with existing preferences (if any)
      const updatedPreferences = {
        notifications: user.preferences?.notifications ?? true,
        emailUpdates: user.preferences?.emailUpdates ?? true,
        darkMode: user.preferences?.darkMode ?? false,
        language: regionalPreferences.language,
        timezone: regionalPreferences.timezone,
        currency: regionalPreferences.currency,
        locale: regionalPreferences.locale,
        dateFormat: regionalPreferences.dateFormat,
        timeFormat: regionalPreferences.timeFormat,
        measurementUnit: regionalPreferences.measurementUnit,
        firstDayOfWeek: regionalPreferences.firstDayOfWeek,
        // Save location data from IP detection
        country: locationData?.country,
        countryCode: locationData?.countryCode,
        city: locationData?.city,
        region: locationData?.region,
      };

      // Update user preferences
      await db
        .update(users)
        .set({
          preferences: updatedPreferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      console.log('✅ Regional preferences saved');
    } catch (regionalError) {
      console.error('Failed to save regional preferences:', regionalError);
      // Don't fail the whole request if regional settings fail
    }

    // 3. Save breed preferences if user is a breeder and selected breeds
    if (role === 'breeder' && breedIds && Array.isArray(breedIds) && breedIds.length > 0) {
      try {
        console.log('🐕 Saving breed preferences:', breedIds);

        // First, get or create breeder profile
        let [breederProfile] = await db
          .select()
          .from(breederProfiles)
          .where(eq(breederProfiles.userId, user.id))
          .limit(1);

        if (!breederProfile) {
          // Create breeder profile if it doesn't exist
          console.log('Creating breeder profile...');
          
          // Generate slug from user name (with fallback)
          const displayName = user.name || 'Breeder';
          const slug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + user.id.substring(0, 8);
          
          [breederProfile] = await db
            .insert(breederProfiles)
            .values({
              userId: user.id,
              displayName: displayName,
              slug: slug,
            })
            .returning();
          console.log('✅ Breeder profile created');
        }

        // Delete existing preferences (in case of re-signup)
        await db
          .delete(breederBreedPreferences)
          .where(eq(breederBreedPreferences.breederProfileId, breederProfile.id));

        // Insert new preferences
        const preferences = breedIds.map((breedId: string) => ({
          breederProfileId: breederProfile.id,
          breedId: breedId,
        }));

        await db.insert(breederBreedPreferences).values(preferences);

        console.log('✅ Breed preferences saved');
      } catch (breedError) {
        console.error('Failed to save breed preferences:', breedError);
        // Don't fail the whole request if breed preferences fail
      }
    }

    // 4. Create pet owner profile if user is a pet owner
    if (role === 'pet_owner') {
      try {
        console.log('🛒 Creating pet owner profile...');

        // Check if profile already exists
        const [existingPetOwnerProfile] = await db
          .select()
          .from(petOwnerProfiles)
          .where(eq(petOwnerProfiles.userId, user.id))
          .limit(1);

        if (!existingPetOwnerProfile) {
          // Generate display name from user name
          const displayName = user.name || 'Pet Owner';

          await db.insert(petOwnerProfiles).values({
            userId: user.id,
            displayName: displayName,
          });

          console.log('✅ Pet owner profile created');
        } else {
          console.log('ℹ️ Pet owner profile already exists');
        }
      } catch (petOwnerError) {
        console.error('Failed to create pet owner profile:', petOwnerError);
        // Don't fail the whole request if pet owner profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving signup preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
