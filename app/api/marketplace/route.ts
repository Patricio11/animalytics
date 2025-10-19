import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, desc, and, or, ilike, sql, isNotNull } from 'drizzle-orm';

// ============================================================================
// GET /api/marketplace
// ============================================================================
// Public API - Fetch all available animals for marketplace (no auth required)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const sex = searchParams.get('sex');
    const status = searchParams.get('status') || 'available';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const limit = Number(searchParams.get('limit') || '50');
    const offset = Number(searchParams.get('offset') || '0');

    // Build query - only show available animals from public profiles
    let conditions = [
      eq(animals.isActive, true),
      eq(animals.isBreedingActive, true), // Only show animals available for breeding
      isNotNull(breederProfiles.isPublic),
      eq(breederProfiles.isPublic, true)
    ];

    // Apply filters
    if (status === 'available') {
      // Already filtered by isBreedingActive
    }

    if (search) {
      conditions.push(
        or(
          ilike(animals.name, `%${search}%`),
          ilike(breeds.name, `%${search}%`),
          ilike(breederProfiles.displayName, `%${search}%`)
        )!
      );
    }

    if (breed) {
      conditions.push(ilike(breeds.name, `%${breed}%`));
    }

    if (sex === 'male' || sex === 'female') {
      conditions.push(eq(animals.sex, sex));
    }

    if (location) {
      conditions.push(
        or(
          sql`${breederProfiles.location}->>'city' ILIKE ${`%${location}%`}`,
          sql`${breederProfiles.location}->>'state' ILIKE ${`%${location}%`}`,
          sql`${breederProfiles.location}->>'country' ILIKE ${`%${location}%`}`
        )!
      );
    }

    const marketplaceAnimals = await db
      .select({
        // Animal fields
        id: animals.id,
        name: animals.name,
        breedId: animals.breedId,
        breedName: breeds.name,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        color: animals.color,
        markings: animals.markings,
        profileImageUrl: animals.profileImageUrl,
        bio: animals.bio,
        temperament: animals.temperament,
        isChampion: animals.isChampion,
        titles: animals.titles,
        microchipNumber: animals.microchipNumber,
        registrationNumber: animals.registrationNumber,
        createdAt: animals.createdAt,
        // Breeder info
        breederId: animals.userId,
        breederName: breederProfiles.displayName,
        breederSlug: breederProfiles.slug,
        breederLocation: breederProfiles.location,
        breederVerified: breederProfiles.kycVerified,
        breederPremium: breederProfiles.premiumMember,
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(and(...conditions))
      .orderBy(
        desc(breederProfiles.premiumMember),
        desc(animals.createdAt)
      )
      .limit(limit)
      .offset(offset);


    // Get total count for pagination
    const countConditions = [
      eq(animals.isActive, true),
      eq(animals.isBreedingActive, true),
      isNotNull(breederProfiles.isPublic),
      eq(breederProfiles.isPublic, true)
    ];

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(and(...countConditions));

    return NextResponse.json({
      success: true,
      animals: marketplaceAnimals,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + limit < Number(count),
      },
    });
  } catch (error) {
    console.error('Error fetching marketplace animals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace animals' },
      { status: 500 }
    );
  }
}
