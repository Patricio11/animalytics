import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, and, gt, desc, sql } from 'drizzle-orm';

/**
 * GET /api/breeders/featured
 * Public endpoint — returns currently boosted breeder profiles for the landing page.
 * Uses a live animal count via subquery instead of the stale denormalized column.
 */
export async function GET() {
  try {
    const now = new Date();

    const featured = await db
      .select({
        id: breederProfiles.id,
        slug: breederProfiles.slug,
        displayName: breederProfiles.displayName,
        tagline: breederProfiles.tagline,
        logoUrl: sql<string | null>`COALESCE(
          NULLIF(${breederProfiles.logoUrl}, ''),
          (SELECT file_url FROM animal_photos
           JOIN animals ON animals.id = animal_photos.animal_id
           WHERE animals.user_id = ${breederProfiles.userId}
           AND animal_photos.category = 'profile'
           AND animals.is_active = true
           ORDER BY animal_photos.is_primary DESC
           LIMIT 1)
        )`.as('logo_url'),
        bannerUrl: breederProfiles.bannerUrl,
        location: breederProfiles.location,
        primaryBreeds: breederProfiles.primaryBreeds,
        specializations: breederProfiles.specializations,
        averageRating: breederProfiles.averageRating,
        totalReviews: breederProfiles.totalReviews,
        profileViews: breederProfiles.profileViews,
        kycVerified: breederProfiles.kycVerified,
        premiumMember: breederProfiles.premiumMember,
        boostedUntil: breederProfiles.boostedUntil,
        yearsInBusiness: breederProfiles.yearsInBusiness,
        // Live animal count via subquery
        animalCount: sql<number>`(
          SELECT COUNT(*) FROM animals
          WHERE animals.user_id = ${breederProfiles.userId}
          AND animals.is_active = true
        )`.as('animal_count'),
      })
      .from(breederProfiles)
      .where(
        and(
          eq(breederProfiles.isBoosted, true),
          eq(breederProfiles.isPublic, true),
          eq(breederProfiles.kycVerified, true),
          gt(breederProfiles.boostedUntil, now)
        )
      )
      .orderBy(desc(breederProfiles.boostedUntil))
      .limit(8);

    return NextResponse.json({ success: true, breeders: featured });
  } catch (error) {
    console.error('Error fetching featured breeders:', error);
    return NextResponse.json({ error: 'Failed to fetch featured breeders' }, { status: 500 });
  }
}
