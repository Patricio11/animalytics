import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/server';

// ============================================================================
// PATCH /api/profile/visibility
// ============================================================================
// Toggle breeder profile visibility (public/private)

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { isPublic } = await request.json();

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    // Update the breeder profile
    const [updatedProfile] = await db
      .update(breederProfiles)
      .set({
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(breederProfiles.userId, session.user.id))
      .returning();

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isPublic: updatedProfile.isPublic,
      message: isPublic 
        ? 'Your profile is now public and visible in the directory' 
        : 'Your profile is now private and hidden from the directory',
    });
  } catch (error) {
    console.error('Error updating profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update profile visibility' },
      { status: 500 }
    );
  }
}
