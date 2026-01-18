import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederProfiles } from '@/lib/db/schema/profiles';
import { users } from '@/lib/db/schema/users';
import { breederBreedPreferences } from '@/lib/db/schema/user-breed-preferences';
import { breeds } from '@/lib/db/schema/animals';
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

    // Build query with all conditions - join with users for fallback location
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
        userPreferences: users.preferences,
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
      .from(breederProfiles)
      .leftJoin(users, eq(breederProfiles.userId, users.id));

    // Apply conditions
    query = query.where(and(...conditions)) as any;

    const results = await query
      .orderBy(
        desc(breederProfiles.premiumMember),
        desc(breederProfiles.averageRating),
        desc(breederProfiles.totalReviews)
      )
      .limit(limit)
      .offset(offset);

    // Fetch breed preferences for all breeders in this batch
    let breedsByBreeder: Record<string, string[]> = {};
    
    if (results.length > 0) {
      const breederIds = results.map(r => r.id);
      const breedPreferencesData = await db
        .select({
          breederProfileId: breederBreedPreferences.breederProfileId,
          breedName: breeds.name,
        })
        .from(breederBreedPreferences)
        .leftJoin(breeds, eq(breederBreedPreferences.breedId, breeds.id))
        .where(sql`${breederBreedPreferences.breederProfileId} IN (${sql.join(breederIds.map(id => sql`${id}`), sql`, `)})`);

      // Group breed preferences by breeder profile ID
      breedsByBreeder = breedPreferencesData.reduce((acc, item) => {
        if (!acc[item.breederProfileId]) {
          acc[item.breederProfileId] = [];
        }
        if (item.breedName) {
          acc[item.breederProfileId].push(item.breedName);
        }
        return acc;
      }, {} as Record<string, string[]>);
    }

    // Process results to merge location and breed preferences
    const breeders = results.map(result => {
      let location = result.location;
      
      // If breeder profile has no location, try to get from user preferences
      if (!location && result.userPreferences) {
        const prefs = result.userPreferences as any;
        if (prefs.country || prefs.city || prefs.region) {
          location = {
            country: prefs.country || prefs.countryCode || 'Not specified',
            city: prefs.city,
            state: prefs.region,
          };
        }
      }

      // Get breed preferences from junction table, fallback to primaryBreeds
      const breedPreferences = breedsByBreeder[result.id] || [];
      const primaryBreeds = breedPreferences.length > 0 
        ? breedPreferences 
        : (result.primaryBreeds || []);

      // Remove userPreferences from final output
      const { userPreferences, ...breederData } = result;
      return {
        ...breederData,
        location,
        primaryBreeds,
      };
    });

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(breederProfiles)
      .where(and(...conditions));

    // Calculate unique countries for stats
    const uniqueCountries = new Set(
      breeders
        .map(b => b.location?.country)
        .filter(Boolean)
    ).size;

    return NextResponse.json({
      success: true,
      breeders,
      total: Number(count),
      countries: uniqueCountries,
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
