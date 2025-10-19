import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/marketplace/[id]
// ============================================================================
// Public API - Fetch single animal details (no auth required)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch animal with breeder info
    const [animal] = await db
      .select({
        // Animal fields
        id: animals.id,
        name: animals.name,
        breed: animals.breed,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        age: animals.age,
        weight: animals.weight,
        height: animals.height,
        color: animals.color,
        markings: animals.markings,
        profileImageUrl: animals.profileImageUrl,
        imageUrls: animals.imageUrls,
        bio: animals.bio,
        temperament: animals.temperament,
        healthStatus: animals.healthStatus,
        price: animals.price,
        status: animals.status,
        isChampion: animals.isChampion,
        titles: animals.titles,
        healthCertified: animals.healthCertified,
        vaccinated: animals.vaccinated,
        microchipped: animals.microchipped,
        registrationNumber: animals.registrationNumber,
        microchipNumber: animals.microchipNumber,
        parentage: animals.parentage,
        healthRecords: animals.healthRecords,
        createdAt: animals.createdAt,
        updatedAt: animals.updatedAt,
        // Breeder info
        breederId: animals.breederId,
        breederName: breederProfiles.displayName,
        breederSlug: breederProfiles.slug,
        breederLogoUrl: breederProfiles.logoUrl,
        breederLocation: breederProfiles.location,
        breederVerified: breederProfiles.kycVerified,
        breederPremium: breederProfiles.premiumMember,
        breederRating: breederProfiles.averageRating,
        breederReviews: breederProfiles.totalReviews,
        breederResponseRate: breederProfiles.responseRate,
      })
      .from(animals)
      .leftJoin(breederProfiles, eq(animals.breederId, breederProfiles.userId))
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Check if animal is public (active and breeder profile is public)
    const [breederProfile] = await db
      .select({ isPublic: breederProfiles.isPublic })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, animal.breederId))
      .limit(1);

    if (!animal.isActive || !breederProfile?.isPublic) {
      return NextResponse.json(
        { error: 'This animal is not available for public viewing' },
        { status: 403 }
      );
    }

    // Increment view count (async, don't wait)
    // Note: Uncomment when viewCount field is added to schema
    // db.update(animals)
    //   .set({ 
    //     viewCount: sql`${animals.viewCount} + 1`,
    //   })
    //   .where(eq(animals.id, id))
    //   .execute()
    //   .catch(console.error);

    return NextResponse.json({
      success: true,
      animal,
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animal details' },
      { status: 500 }
    );
  }
}
