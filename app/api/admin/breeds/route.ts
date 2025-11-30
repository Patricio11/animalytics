import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breeds } from '@/lib/db/schema/animals';
import { eq, sql, ilike, desc } from 'drizzle-orm';
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
 * GET /api/admin/breeds
 * List all breeds with searching and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Search
    const search = searchParams.get('search');

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(breeds)
      .where(search ? ilike(breeds.name, `%${search}%`) : undefined);

    // Get breeds
    const breedList = await db
      .select()
      .from(breeds)
      .where(search ? ilike(breeds.name, `%${search}%`) : undefined)
      .orderBy(breeds.name)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      breeds: breedList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeds' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/breeds
 * Create a new breed
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    if (!await isAdmin()) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      successRating,
      sizeCategory,
      averageWeight,
      averageHeight,
      description,
      imageUrl,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Breed name is required' },
        { status: 400 }
      );
    }

    // Check if breed already exists
    const existingBreed = await db
      .select()
      .from(breeds)
      .where(eq(breeds.name, name))
      .limit(1);

    if (existingBreed.length > 0) {
      return NextResponse.json(
        { error: 'Breed with this name already exists' },
        { status: 400 }
      );
    }

    // Create breed
    const [newBreed] = await db
      .insert(breeds)
      .values({
        name,
        successRating: successRating || null,
        sizeCategory: sizeCategory || null,
        averageWeight: averageWeight || null,
        averageHeight: averageHeight || null,
        description: description || null,
        imageUrl: imageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      breed: newBreed,
      message: 'Breed created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating breed:', error);
    return NextResponse.json(
      { error: 'Failed to create breed' },
      { status: 500 }
    );
  }
}
