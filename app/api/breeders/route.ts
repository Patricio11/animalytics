import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { eq, desc, ilike, or, and, sql } from 'drizzle-orm';

// ============================================================================
// GET /api/breeders
// ============================================================================
// Fetch all public breeder profiles with optional search/filter

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const limit = Number(searchParams.get('limit') || '50');
    const offset = Number(searchParams.get('offset') || '0');

    // Build where conditions - only show public profiles
    const conditions: any[] = [eq(breederProfiles.isPublic, true)];

    // Apply search filter
    if (search) {
      conditions.push(
        or(
          ilike(breederProfiles.displayName, `%${search}%`),
          ilike(breederProfiles.tagline, `%${search}%`),
          sql`${breederProfiles.primaryBreeds}::text ILIKE ${`%${search}%`}`
        )
      );
    }

    // Apply breed filter
    if (breed) {
      conditions.push(
        sql`${breederProfiles.primaryBreeds}::jsonb @> ${JSON.stringify([breed])}`
      );
    }

    // Build query with all conditions
    let query = db
      .select({
        id: breederProfiles.id,
        userId: breederProfiles.userId,
        displayName: breederProfiles.displayName,
        slug: breederProfiles.slug,
        tagline: breederProfiles.tagline,
        logoUrl: breederProfiles.logoUrl,
        bannerUrl: breederProfiles.bannerUrl,
        location: breederProfiles.location,
        yearsInBusiness: breederProfiles.yearsInBusiness,
        primaryBreeds: breederProfiles.primaryBreeds,
        specializations: breederProfiles.specializations,
        kycVerified: breederProfiles.kycVerified,
        backgroundCheckVerified: breederProfiles.backgroundCheckVerified,
        healthCertified: breederProfiles.healthCertified,
        premiumMember: breederProfiles.premiumMember,
        averageRating: breederProfiles.averageRating,
        totalReviews: breederProfiles.totalReviews,
        totalSales: breederProfiles.totalSales,
        profileViews: breederProfiles.profileViews,
        responseRate: breederProfiles.responseRate,
        createdAt: breederProfiles.createdAt,
      })
      .from(breederProfiles);

    // Apply conditions
    query = query.where(and(...conditions)) as any;

    const breeders = await query
      .orderBy(
        desc(breederProfiles.premiumMember),
        desc(breederProfiles.averageRating),
        desc(breederProfiles.totalReviews)
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(breederProfiles)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      breeders,
      pagination: {
        total: Number(count),
        limit,
        offset,
        hasMore: offset + limit < Number(count),
      },
    });
  } catch (error) {
    console.error('Error fetching breeders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breeders' },
      { status: 500 }
    );
  }
}
