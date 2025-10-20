import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breeds } from '@/lib/db/schema/animals';
import { asc, ilike, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/breeds
// ============================================================================
// Public API - Fetch all breeds (no auth required)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = Number(searchParams.get('limit') || '100');

    let query = db
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
      .from(breeds);

    // Apply search filter
    if (search) {
      query = query.where(ilike(breeds.name, `%${search}%`));
    }

    const allBreeds = await query
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
