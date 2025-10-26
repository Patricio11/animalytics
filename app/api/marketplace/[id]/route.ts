import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { animals, breeds, animalPhotos } from '@/lib/db/schema/animals';
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
        breedId: animals.breedId,
        breedName: breeds.name,
        sex: animals.sex,
        dateOfBirth: animals.dateOfBirth,
        weight: animals.weight,
        height: animals.height,
        color: animals.color,
        markings: animals.markings,
        profileImageUrl: animals.profileImageUrl,
        bio: animals.bio,
        temperament: animals.temperament,
        healthStatus: animals.healthStatus,
        isChampion: animals.isChampion,
        titles: animals.titles,
        registrationNumber: animals.registrationNumber,
        microchipNumber: animals.microchipNumber,
        isActive: animals.isActive,
        isBreedingActive: animals.isBreedingActive,
        damId: animals.damId,
        sireId: animals.sireId,
        createdAt: animals.createdAt,
        updatedAt: animals.updatedAt,
        // Breeder info
        breederId: animals.userId,
        breederName: breederProfiles.displayName,
        breederSlug: breederProfiles.slug,
        breederLogoUrl: breederProfiles.logoUrl,
        breederLocation: breederProfiles.location,
        breederVerified: breederProfiles.kycVerified,
        breederPremium: breederProfiles.premiumMember,
        breederRating: breederProfiles.averageRating,
        breederReviews: breederProfiles.totalReviews,
        breederResponseRate: breederProfiles.responseRate,
        breederPublicEmail: breederProfiles.publicEmail,
        breederPublicPhone: breederProfiles.publicPhone,
      })
      .from(animals)
      .leftJoin(breeds, eq(animals.breedId, breeds.id))
      .leftJoin(breederProfiles, eq(animals.userId, breederProfiles.userId))
      .where(eq(animals.id, id))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      );
    }

    // Check if animal is public (active and breeder profile is public)
    if (!animal.isActive || !animal.isBreedingActive) {
      return NextResponse.json(
        { error: 'This animal is not available for public viewing' },
        { status: 403 }
      );
    }

    const [breederProfile] = await db
      .select({ isPublic: breederProfiles.isPublic })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, animal.breederId))
      .limit(1);

    if (!breederProfile?.isPublic) {
      return NextResponse.json(
        { error: 'This animal is not available for public viewing' },
        { status: 403 }
      );
    }

    // Fetch all photos for this animal
    const photos = await db
      .select({
        id: animalPhotos.id,
        category: animalPhotos.category,
        fileUrl: animalPhotos.fileUrl,
        thumbnailUrl: animalPhotos.thumbnailUrl,
        caption: animalPhotos.caption,
        displayOrder: animalPhotos.displayOrder,
        isPrimary: animalPhotos.isPrimary,
      })
      .from(animalPhotos)
      .where(eq(animalPhotos.animalId, id))
      .orderBy(animalPhotos.displayOrder);

    // Fetch parent information if available
    let dam = null;
    let sire = null;

    if (animal.damId) {
      const [damResult] = await db
        .select({
          id: animals.id,
          name: animals.name,
          breedName: breeds.name,
          profileImageUrl: animals.profileImageUrl,
        })
        .from(animals)
        .leftJoin(breeds, eq(animals.breedId, breeds.id))
        .where(eq(animals.id, animal.damId))
        .limit(1);
      dam = damResult || null;
    }

    if (animal.sireId) {
      const [sireResult] = await db
        .select({
          id: animals.id,
          name: animals.name,
          breedName: breeds.name,
          profileImageUrl: animals.profileImageUrl,
        })
        .from(animals)
        .leftJoin(breeds, eq(animals.breedId, breeds.id))
        .where(eq(animals.id, animal.sireId))
        .limit(1);
      sire = sireResult || null;
    }

    // Increment view count (async, don't wait)
    db.update(animals)
      .set({ 
        viewCount: sql`${animals.viewCount} + 1`,
      })
      .where(eq(animals.id, id))
      .execute()
      .catch(console.error);

    return NextResponse.json({
      success: true,
      animal: {
        ...animal,
        photos,
        parentage: {
          dam,
          sire,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animal details' },
      { status: 500 }
    );
  }
}
