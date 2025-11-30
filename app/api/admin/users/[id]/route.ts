import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/users';
import { animals } from '@/lib/db/schema/animals';
import { listings } from '@/lib/db/schema/marketplace';
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

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        // Don't send sensitive data
        preferences: undefined,
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
