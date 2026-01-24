import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * Helper function to check if user is admin
 */
async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    return false;
  }

  return true;
}

/**
 * PATCH /api/admin/users/[id]/profile
 * Update breeder profile visibility (isPublic flag)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { isPublic } = body;

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean value' },
        { status: 400 }
      );
    }

    // Find breeder profile by userId
    const [profile] = await db
      .select()
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, id))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Breeder profile not found for this user' },
        { status: 404 }
      );
    }

    // Update isPublic status
    const [updatedProfile] = await db
      .update(breederProfiles)
      .set({
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(breederProfiles.userId, id))
      .returning();

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Profile ${isPublic ? 'published' : 'unpublished'} successfully`,
    });
  } catch (error) {
    console.error('Error updating profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update profile visibility' },
      { status: 500 }
    );
  }
}
