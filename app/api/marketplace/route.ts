import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

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
    let query = db
      .select({
        // Animal fields
        id: animals.id,
        name: animals.name,
        breed: animals.breed,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        age: animals.age,
        color: animals.color,
        markings: animals.markings,
        profileImageUrl: animals.profileImageUrl,
        imageUrls: animals.imageUrls,
        bio: animals.bio,
        temperament: animals.temperament,
        price: animals.price,
        status: animals.status,
        isChampion: animals.isChampion,
        titles: animals.titles,
        healthCertified: animals.healthCertified,
        vaccinated: animals.vaccinated,
        microchipped: animals.microchipped,
        createdAt: animals.createdAt,
        // Breeder info
        breederId: animals.breederId,
        breederName: breederProfiles.displayName,
        breederSlug: breederProfiles.slug,
        breederLocation: breederProfiles.location,
        breederVerified: breederProfiles.kycVerified,
        breederPremium: breederProfiles.premiumMember,
      })
      .from(animals)
      .leftJoin(breederProfiles, eq(animals.breederId, breederProfiles.userId))
      .where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true)
        )
      );

    // Apply status filter
    if (status) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          eq(animals.status, status)
        )
      );
    }

    // Apply search filter
    if (search) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          or(
            ilike(animals.name, `%${search}%`),
            ilike(animals.breed, `%${search}%`),
            ilike(breederProfiles.displayName, `%${search}%`)
          )
        )
      );
    }

    // Apply breed filter
    if (breed) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          ilike(animals.breed, `%${breed}%`)
        )
      );
    }

    // Apply sex filter
    if (sex === 'male' || sex === 'female') {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          eq(animals.sex, sex)
        )
      );
    }

    // Apply price filters
    if (minPrice) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          sql`${animals.price} >= ${Number(minPrice)}`
        )
      );
    }

    if (maxPrice) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          sql`${animals.price} <= ${Number(maxPrice)}`
        )
      );
    }

    // Apply location filter
    if (location) {
      query = query.where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          or(
            sql`${breederProfiles.location}->>'city' ILIKE ${`%${location}%`}`,
            sql`${breederProfiles.location}->>'state' ILIKE ${`%${location}%`}`,
            sql`${breederProfiles.location}->>'country' ILIKE ${`%${location}%`}`
          )
        )
      );
    }

    // Order by: Featured/Premium first, then newest
    const marketplaceAnimals = await query
      .orderBy(
        desc(breederProfiles.premiumMember),
        desc(animals.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .leftJoin(breederProfiles, eq(animals.breederId, breederProfiles.userId))
      .where(
        and(
          eq(animals.isActive, true),
          eq(breederProfiles.isPublic, true),
          status ? eq(animals.status, status) : undefined
        )
      );

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
