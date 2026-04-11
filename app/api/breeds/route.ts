import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breeds } from '@/lib/db/schema/animals';
import { asc, ilike, sql, eq } from 'drizzle-orm';
import { DOG_BREEDS } from '@/lib/data/dog-breeds';
import { auth } from '@/lib/auth/config';

// ============================================================================
// GET /api/breeds
// ============================================================================
// Public API - Fetch all breeds (no auth required)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit') || '500');

    const allBreeds = await db
      .select({
        id: breeds.id,
        name: breeds.name,
        successRating: breeds.successRating,
        sizeCategory: breeds.sizeCategory,
        averageWeight: breeds.averageWeight,
        averageHeight: breeds.averageHeight,
        description: breeds.description,
        imageUrl: breeds.imageUrl,
      })
      .from(breeds)
      .where(search ? ilike(breeds.name, `%${search}%`) : undefined)
      .orderBy(asc(breeds.name))
      .limit(limit);

    // Get count of animals per breed
    const breedCounts = await db
      .select({
        breedId: breeds.id,
        count: sql<number>`count(*)`,
      })
      .from(breeds)
      .groupBy(breeds.id);

    // Merge counts with breeds
    const breedsWithCounts = allBreeds.map(breed => ({
      ...breed,
      animalCount: breedCounts.find(bc => bc.breedId === breed.id)?.count || 0,
    }));

    return NextResponse.json({
      success: true,
      breeds: breedsWithCounts,
      total: allBreeds.length,
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeds' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/breeds/seed
// ============================================================================
// Admin-only: Seed any missing breeds from the DOG_BREEDS list

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing breed names
    const existingBreeds = await db
      .select({ name: breeds.name })
      .from(breeds);
    const existingNames = new Set(existingBreeds.map(b => b.name.toLowerCase()));

    // Find missing breeds
    const missingBreeds = DOG_BREEDS.filter(
      name => !existingNames.has(name.toLowerCase())
    );

    if (missingBreeds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All breeds already exist',
        added: 0,
        total: existingBreeds.length,
      });
    }

    // Insert missing breeds
    await db.insert(breeds).values(
      missingBreeds.map(name => ({ name }))
    );

    return NextResponse.json({
      success: true,
      message: `Added ${missingBreeds.length} missing breeds`,
      added: missingBreeds.length,
      addedBreeds: missingBreeds,
      total: existingBreeds.length + missingBreeds.length,
    });
  } catch (error) {
    console.error('Error seeding breeds:', error);
    return NextResponse.json(
      { error: 'Failed to seed breeds' },
      { status: 500 }
    );
  }
}
