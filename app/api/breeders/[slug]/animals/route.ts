import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { animals } from '@/lib/db/schema/animals';
import { eq, and, desc, asc } from 'drizzle-orm';

// ============================================================================
// GET /api/breeders/[slug]/animals
// ============================================================================
// Fetch all animals belonging to a breeder (by slug)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true'; // Filter for active animals only
    const limit = Number(searchParams.get('limit') || '50');

    // First, get the breeder profile
    const [profile] = await db
      .select({ id: breederProfiles.id, userId: breederProfiles.userId })
      .from(breederProfiles)
      .where(eq(breederProfiles.slug, slug))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Breeder not found' },
        { status: 404 }
      );
    }

    // Build query conditions
    const conditions = [eq(animals.userId, profile.userId)];
    
    // Filter for active animals only if requested
    if (activeOnly) {
      conditions.push(eq(animals.isActive, true));
    }

    // Fetch animals with photos and breed relations
    const breederAnimals = await db.query.animals.findMany({
      where: and(...conditions),
      with: {
        breed: true,
        photos: true,
      },
      orderBy: [desc(animals.createdAt)],
      limit,
    });

    return NextResponse.json({
      success: true,
      animals: breederAnimals,
      total: breederAnimals.length,
    });
  } catch (error) {
    console.error('Error fetching breeder animals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
      { status: 500 }
    );
  }
}
