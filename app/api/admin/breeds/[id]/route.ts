import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breeds } from '@/lib/db/schema/animals';
import { animals } from '@/lib/db/schema/animals';
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
 * GET /api/admin/breeds/[id]
 * Get detailed information about a specific breed
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

    // Get breed details
    const [breed] = await db
      .select()
      .from(breeds)
      .where(eq(breeds.id, id))
      .limit(1);

    if (!breed) {
      return NextResponse.json(
        { error: 'Breed not found' },
        { status: 404 }
      );
    }

    // Get animal count for this breed
    const [animalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(animals)
      .where(eq(animals.breedId, id));

    return NextResponse.json({
      success: true,
      breed,
      statistics: {
        animalCount: animalCount.count,
      },
    });
  } catch (error) {
    console.error('Error fetching breed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breed' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/breeds/[id]
 * Update breed information
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

    // Check if breed exists
    const [existingBreed] = await db
      .select()
      .from(breeds)
      .where(eq(breeds.id, id))
      .limit(1);

    if (!existingBreed) {
      return NextResponse.json(
        { error: 'Breed not found' },
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
      'successRating',
      'sizeCategory',
      'averageWeight',
      'averageHeight',
      'description',
      'imageUrl',
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update breed
    const [updatedBreed] = await db
      .update(breeds)
      .set(updateData)
      .where(eq(breeds.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      breed: updatedBreed,
      message: 'Breed updated successfully',
    });
  } catch (error) {
    console.error('Error updating breed:', error);
    return NextResponse.json(
      { error: 'Failed to update breed' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/breeds/[id]
 * Delete a breed (only if no animals are associated)
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

    // Check if breed exists
    const [existingBreed] = await db
      .select()
      .from(breeds)
      .where(eq(breeds.id, id))
      .limit(1);

    if (!existingBreed) {
      return NextResponse.json(
        { error: 'Breed not found' },
        { status: 404 }
      );
    }

    // Check if any animals are using this breed
    const [animalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(animals)
      .where(eq(animals.breedId, id));

    if (animalCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete breed. ${animalCount.count} animal(s) are associated with this breed.` },
        { status: 400 }
      );
    }

    // Delete breed
    await db
      .delete(breeds)
      .where(eq(breeds.id, id));

    return NextResponse.json({
      success: true,
      message: 'Breed deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting breed:', error);
    return NextResponse.json(
      { error: 'Failed to delete breed' },
      { status: 500 }
    );
  }
}
