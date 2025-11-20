import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buyerProfiles } from '@/lib/db/schema/buyer-profiles';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * GET /api/buyer/profile
 * Get the current user's buyer profile
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

    // Get buyer profile
    const [profile] = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching buyer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buyer/profile
 * Create a new buyer profile
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
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .limit(1);

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Buyer profile already exists' },
        { status: 409 }
      );
    }

    // Create buyer profile
    const [newProfile] = await db
      .insert(buyerProfiles)
      .values({
        userId,
        displayName: body.displayName || session.user.name || 'Buyer',
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

    // Update user role to buyer if not already
    await db
      .update(users)
      .set({
        role: 'buyer',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log('✅ Buyer profile created for user:', userId);

    return NextResponse.json({
      success: true,
      profile: newProfile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer profile:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/buyer/profile
 * Update the current user's buyer profile
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
      .from(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
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
      .update(buyerProfiles)
      .set(updateData)
      .where(eq(buyerProfiles.userId, userId))
      .returning();

    console.log('✅ Buyer profile updated for user:', userId);

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating buyer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update buyer profile' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/buyer/profile
 * Delete the current user's buyer profile
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
      .delete(buyerProfiles)
      .where(eq(buyerProfiles.userId, userId))
      .returning();

    if (!deletedProfile) {
      return NextResponse.json(
        { error: 'Buyer profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Buyer profile deleted for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Buyer profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting buyer profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer profile' },
      { status: 500 }
    );
  }
}
