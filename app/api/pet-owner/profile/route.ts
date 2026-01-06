import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { petOwnerProfiles } from '@/lib/db/schema/pet-owner-profiles';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/pet-owner/profile
 * Get the current user's pet owner profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
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

    // Get pet owner profile
    const [profile] = await db
      .select()
      .from(petOwnerProfiles)
      .where(eq(petOwnerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Pet owner profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching pet owner profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pet owner profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pet-owner/profile
 * Create a new pet owner profile
 */
export async function POST(request: NextRequest) {
  try {
    // Get current session
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
    const body = await request.json();

    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(petOwnerProfiles)
      .where(eq(petOwnerProfiles.userId, userId))
      .limit(1);

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Pet owner profile already exists' },
        { status: 409 }
      );
    }

    // Create pet owner profile
    const [newProfile] = await db
      .insert(petOwnerProfiles)
      .values({
        userId,
        displayName: body.displayName || session.user.name || 'Pet Owner',
        bio: body.bio || null,
        avatar: body.avatar || session.user.image || null,
        location: body.location || null,
        interestedBreeds: body.interestedBreeds || [],
        budgetRange: body.budgetRange || null,
        lookingFor: body.lookingFor || [],
        preferredGender: body.preferredGender || null,
        experienceLevel: body.experienceLevel || 'first_time',
        showRealName: body.showRealName ?? true,
        showLocation: body.showLocation ?? true,
        allowMessages: body.allowMessages ?? true,
      })
      .returning();

    // Update user role to pet_owner if not already
    await db
      .update(users)
      .set({
        role: 'pet_owner',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log('✅ Pet owner profile created for user:', userId);

    return NextResponse.json({
      success: true,
      profile: newProfile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pet owner profile:', error);
    return NextResponse.json(
      { error: 'Failed to create pet owner profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pet-owner/profile
 * Update the current user's pet owner profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get current session
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
    const body = await request.json();

    // Check if profile exists
    const [existingProfile] = await db
      .select()
      .from(petOwnerProfiles)
      .where(eq(petOwnerProfiles.userId, userId))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Pet owner profile not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.interestedBreeds !== undefined) updateData.interestedBreeds = body.interestedBreeds;
    if (body.budgetRange !== undefined) updateData.budgetRange = body.budgetRange;
    if (body.lookingFor !== undefined) updateData.lookingFor = body.lookingFor;
    if (body.preferredGender !== undefined) updateData.preferredGender = body.preferredGender;
    if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel;
    if (body.showRealName !== undefined) updateData.showRealName = body.showRealName;
    if (body.showLocation !== undefined) updateData.showLocation = body.showLocation;
    if (body.allowMessages !== undefined) updateData.allowMessages = body.allowMessages;

    // Update profile
    const [updatedProfile] = await db
      .update(petOwnerProfiles)
      .set(updateData)
      .where(eq(petOwnerProfiles.userId, userId))
      .returning();

    console.log('✅ Pet owner profile updated for user:', userId);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating pet owner profile:', error);
    return NextResponse.json(
      { error: 'Failed to update pet owner profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pet-owner/profile
 * Delete the current user's pet owner profile
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get current session
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

    // Delete profile
    const [deletedProfile] = await db
      .delete(petOwnerProfiles)
      .where(eq(petOwnerProfiles.userId, userId))
      .returning();

    if (!deletedProfile) {
      return NextResponse.json(
        { error: 'Pet owner profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Pet owner profile deleted for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Pet owner profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pet owner profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet owner profile' },
      { status: 500 }
    );
  }
}
