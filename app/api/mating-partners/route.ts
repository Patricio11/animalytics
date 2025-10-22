import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, desc, and, or, ilike, sql, isNotNull, ne } from 'drizzle-orm';

// ============================================================================
// GET /api/mating-partners
// ============================================================================
// Search for potential mating partners across the entire system
// Filters: breed, sex (opposite of user's dog), location, age, health status

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const sex = searchParams.get('sex'); // male or female
    const location = searchParams.get('location');
    const minAge = searchParams.get('minAge'); // in months
    const maxAge = searchParams.get('maxAge'); // in months
    const healthStatus = searchParams.get('healthStatus');
    const championOnly = searchParams.get('championOnly') === 'true';
    const excludeBreederId = searchParams.get('excludeBreederId'); // Exclude own dogs
    const limit = Number(searchParams.get('limit') || '50');
    const offset = Number(searchParams.get('offset') || '0');

    // Build query - only show available animals for breeding from public profiles
    let conditions = [
      eq(animals.isActive, true),
      eq(animals.isBreedingActive, true), // Only dogs available for breeding
      isNotNull(breederProfiles.isPublic),
      eq(breederProfiles.isPublic, true),
    ];

    // Exclude own dogs if breeder ID provided
    if (excludeBreederId) {
      conditions.push(ne(animals.userId, excludeBreederId));
    }

    // Search by name, breed, or breeder
    if (search) {
      conditions.push(
        or(
          ilike(animals.name, `%${search}%`),
          ilike(breeds.name, `%${search}%`),
          ilike(breederProfiles.displayName, `%${search}%`)
        )!
      );
    }

    // Filter by breed (exact match or similar)
    if (breed) {
      conditions.push(ilike(breeds.name, `%${breed}%`));
    }

    // Filter by sex (typically opposite of user's dog)
    if (sex === 'male' || sex === 'female') {
      conditions.push(eq(animals.sex, sex));
    }

    // Filter by location (city, state, or country)
    if (location) {
      conditions.push(
        or(
          sql`${breederProfiles.location}->>'city' ILIKE ${`%${location}%`}`,
          sql`${breederProfiles.location}->>'state' ILIKE ${`%${location}%`}`,
          sql`${breederProfiles.location}->>'country' ILIKE ${`%${location}%`}`
        )!
      );
    }

    // Filter by age range
    if (minAge || maxAge) {
      if (minAge) {
        // Dog must be at least minAge months old
        const minDate = new Date();
        minDate.setMonth(minDate.getMonth() - Number(minAge));
        conditions.push(sql`${animals.dateOfBirth} <= ${minDate.toISOString()}`);
      }
      if (maxAge) {
        // Dog must be at most maxAge months old
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() - Number(maxAge));
        conditions.push(sql`${animals.dateOfBirth} >= ${maxDate.toISOString()}`);
      }
    }

    // Filter by health status
    if (healthStatus) {
      conditions.push(eq(animals.healthStatus, healthStatus as any));
    }

    // Filter by champion status
    if (championOnly) {
      conditions.push(eq(animals.isChampion, true));
    }

    // Execute query
    const matingPartners = await db
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
        healthStatus: animals.healthStatus,
        isChampion: animals.isChampion,
        titles: animals.titles,
        microchipNumber: animals.microchipNumber,
        registrationNumber: animals.registrationNumber,
        
        // Breeding-specific info
        isBreedingActive: animals.isBreedingActive,
        breedingNotes: animals.breedingNotes,
        studFee: animals.studFee,
        
        // Health certifications
        healthCertifications: animals.healthCertifications,
        geneticTests: animals.geneticTests,
        
        // Pedigree references (use damId/sireId to build tree)
        damId: animals.damId,
        sireId: animals.sireId,
        
        // Timestamps
        createdAt: animals.createdAt,
        updatedAt: animals.updatedAt,
        
        // Breeder info
        breederId: animals.userId,
        breederName: breederProfiles.displayName,
        breederSlug: breederProfiles.slug,
        breederLocation: breederProfiles.location,
        breederContactEmail: breederProfiles.publicEmail,
        breederContactPhone: breederProfiles.publicPhone,
        breederVerified: breederProfiles.kycVerified,
        breederPremium: breederProfiles.premiumMember,
        breederRating: breederProfiles.averageRating,
        breederTotalReviews: breederProfiles.totalReviews,
        breederResponseRate: breederProfiles.responseRate,
        breederResponseTimeHours: breederProfiles.responseTimeHours,
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(and(...conditions))
      .orderBy(
        desc(breederProfiles.premiumMember), // Premium breeders first
        desc(animals.isChampion), // Champions first
        desc(breederProfiles.averageRating), // Higher rated breeders
        desc(animals.createdAt) // Newest listings
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      partners: matingPartners,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + limit < Number(count),
      },
      filters: {
        search,
        breed,
        sex,
        location,
        minAge,
        maxAge,
        healthStatus,
        championOnly,
      },
    });
  } catch (error) {
    console.error('Error fetching mating partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mating partners' },
      { status: 500 }
    );
  }
}
