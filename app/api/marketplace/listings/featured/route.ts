import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema/marketplace';
import { animals } from '@/lib/db/schema/animals';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * GET /api/marketplace/listings/featured
 * Public endpoint — returns featured/boosted active listings for the landing page.
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const rows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        currency: listings.currency,
        category: listings.category,
        breed: listings.breed,
        sex: listings.sex,
        age: listings.age,
        color: listings.color,
        healthCertified: listings.healthCertified,
        championLines: listings.championLines,
        location: listings.location,
        additionalImages: listings.additionalImages,
        isFeatured: listings.isFeatured,
        featuredTier: listings.featuredTier,
        viewCount: listings.viewCount,
        interestedCount: listings.interestedCount,
        createdAt: listings.createdAt,
        // Animal info
        animalId: listings.animalId,
        animalName: animals.name,
        animalDob: animals.dateOfBirth,
        animalProfileImage: animals.profileImageUrl,
        // Breeder info
        breederName: breederProfiles.displayName,
        breederLogo: breederProfiles.logoUrl,
        breederLocation: breederProfiles.location,
        breederVerified: breederProfiles.kycVerified,
        breederSlug: breederProfiles.slug,
      })
      .from(listings)
      .leftJoin(animals, eq(listings.animalId, animals.id))
      .leftJoin(breederProfiles, eq(listings.userId, breederProfiles.userId))
      .where(
        and(
          eq(listings.status, 'active'),
          eq(listings.isFeatured, true),
          sql`${listings.featuredEndDate} >= ${today}`
        )
      )
      .orderBy(desc(listings.featuredPriority), desc(listings.createdAt))
      .limit(8);

    // Build image arrays — use additionalImages first, fallback to animal profile image, then placeholder
    const result = rows.map((row) => {
      const imgs = Array.isArray(row.additionalImages) && row.additionalImages.length > 0
        ? row.additionalImages
        : row.animalProfileImage
          ? [row.animalProfileImage]
          : ['/placeholder-dog.jpg'];

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        price: row.price ? row.price / 100 : null,
        currency: row.currency,
        category: row.category,
        breed: row.breed,
        sex: row.sex,
        age: row.age,
        color: row.color,
        healthCertified: row.healthCertified,
        championLines: row.championLines,
        location: row.location,
        images: imgs,
        isFeatured: row.isFeatured,
        featuredTier: row.featuredTier,
        viewCount: row.viewCount || 0,
        interestedCount: row.interestedCount || 0,
        createdAt: row.createdAt,
        animalName: row.animalName,
        animalDob: row.animalDob,
        breederName: row.breederName,
        breederLogo: row.breederLogo,
        breederLocation: row.breederLocation,
        breederVerified: row.breederVerified,
        breederSlug: row.breederSlug,
      };
    });

    return NextResponse.json({ success: true, listings: result });
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return NextResponse.json({ error: 'Failed to fetch featured listings' }, { status: 500 });
  }
}
