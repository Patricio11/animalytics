import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { animals } from '@/lib/db/schema/animals';
import { listings } from '@/lib/db/schema/marketplace';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { breederBreedPreferences } from '@/lib/db/schema/user-breed-preferences';
import { eq, sql } from 'drizzle-orm';
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
 * GET /api/admin/users/[id]
 * Get detailed information about a specific user
 */
export async function GET(
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

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user statistics
    const [animalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(animals)
      .where(eq(animals.userId, id));

    const [listingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.userId, id));

    const [activeListingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.userId, id));

    // Get recent animals
    const recentAnimals = await db
      .select({
        id: animals.id,
        name: animals.name,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        createdAt: animals.createdAt,
      })
      .from(animals)
      .where(eq(animals.userId, id))
      .orderBy(sql`${animals.createdAt} DESC`)
      .limit(5);

    // Get recent listings
    const recentListings = await db
      .select({
        id: listings.id,
        title: listings.title,
        category: listings.category,
        status: listings.status,
        price: listings.price,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(eq(listings.userId, id))
      .orderBy(sql`${listings.createdAt} DESC`)
      .limit(5);

    // Get breed preferences + full breeder profile (if breeder)
    let breedIds: string[] = [];
    let breederProfile: any = null;
    if (user.role === 'breeder') {
      const [profile] = await db
        .select()
        .from(breederProfiles)
        .where(eq(breederProfiles.userId, id))
        .limit(1);
      if (profile) {
        breederProfile = profile;
        const prefs = await db
          .select({ breedId: breederBreedPreferences.breedId })
          .from(breederBreedPreferences)
          .where(eq(breederBreedPreferences.breederProfileId, profile.id));
        breedIds = prefs.map((p) => p.breedId);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        breedIds,
        breederProfile,
      },
      statistics: {
        animals: animalCount.count,
        listings: listingCount.count,
        activeListings: activeListingCount.count,
      },
      recentActivity: {
        animals: recentAnimals,
        listings: recentListings,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user information
 */
export async function PUT(
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

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Allow updating specific fields
    const allowedFields = [
      'name',
      'email',
      'role',
      'organization',
      'licenseNumber',
      'certifications',
      'specializations',
      'isVerified',
      'emailVerified',
      'subscription',
      'permissions',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    // Sync breed preferences (only relevant for breeders)
    // Accept breedIds: string[] from the body. Replaces the existing set.
    if (Array.isArray(body.breedIds) && updatedUser.role === 'breeder') {
      try {
        // Find or create the breeder profile
        let [profile] = await db
          .select()
          .from(breederProfiles)
          .where(eq(breederProfiles.userId, id))
          .limit(1);

        if (!profile) {
          const displayName = updatedUser.name || 'Breeder';
          const slug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + id.substring(0, 8);
          [profile] = await db
            .insert(breederProfiles)
            .values({
              userId: id,
              displayName,
              slug,
              isPublic: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
        }

        // Replace breed preferences atomically (delete + insert)
        await db
          .delete(breederBreedPreferences)
          .where(eq(breederBreedPreferences.breederProfileId, profile.id));

        if (body.breedIds.length > 0) {
          await db.insert(breederBreedPreferences).values(
            body.breedIds.map((breedId: string) => ({
              breederProfileId: profile.id,
              breedId,
            }))
          );
        }
      } catch (breedError) {
        console.error('Failed to sync breed preferences:', breedError);
        // Don't fail the whole update if breed sync fails
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (soft delete by setting isActive to false)
 */
export async function DELETE(
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

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting own account
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Soft delete - set email to archived format and mark as inactive
    await db
      .update(users)
      .set({
        email: `deleted_${id}_${existingUser.email}`,
        isVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
