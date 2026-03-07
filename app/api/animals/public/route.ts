import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/animals/public
// ============================================================================
// Public API - Browse all active animals from verified breeders (no auth required)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const sex = searchParams.get('sex');
    const location = searchParams.get('location');
    const limit = Number(searchParams.get('limit') || '24');
    const offset = Number(searchParams.get('offset') || '0');

    // Only show active animals from verified breeders
    const conditions: any[] = [
      eq(animals.isActive, true),
      eq(breederProfiles.kycVerified, true),
    ];

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

    const publicAnimals = await db
      .select({
        id: animals.id,
        name: animals.name,
        registeredName: animals.registeredName,
        breedId: animals.breedId,
        breedName: breeds.name,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        color: animals.color,
        profileImageUrl: animals.profileImageUrl,
        isChampion: animals.isChampion,
        titles: animals.titles,
        registrationNumber: animals.registrationNumber,
        createdAt: animals.createdAt,
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
        desc(animals.isChampion),
        desc(animals.createdAt)
      )
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      animals: publicAnimals,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + limit < Number(count),
      },
    });
  } catch (error) {
    console.error('Error fetching public animals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
      { status: 500 }
    );
  }
}
