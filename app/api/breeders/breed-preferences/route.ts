import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { breederBreedPreferences, breeds, breederProfiles } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import { eq, inArray } from 'drizzle-orm';

// ============================================================================
// GET /api/breeders/breed-preferences
// ============================================================================
// Get the current breeder's breed preferences

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get breeder profile
    const breederProfile = await db
      .select({ id: breederProfiles.id })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (!breederProfile || breederProfile.length === 0) {
      return NextResponse.json(
        { error: 'Breeder profile not found' },
        { status: 404 }
      );
    }

    const breederProfileId = breederProfile[0].id;

    // Fetch breeder's breed preferences with breed details
    const preferences = await db
      .select({
        id: breederBreedPreferences.id,
        breedId: breederBreedPreferences.breedId,
        breed: {
          id: breeds.id,
          name: breeds.name,
          sizeCategory: breeds.sizeCategory,
          imageUrl: breeds.imageUrl,
          description: breeds.description,
        },
        createdAt: breederBreedPreferences.createdAt,
      })
      .from(breederBreedPreferences)
      .leftJoin(breeds, eq(breederBreedPreferences.breedId, breeds.id))
      .where(eq(breederBreedPreferences.breederProfileId, breederProfileId));

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching breed preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breed preferences' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/breeders/breed-preferences
// ============================================================================
// Update breeder's breed preferences (replaces all existing preferences)

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get breeder profile
    const breederProfile = await db
      .select({ id: breederProfiles.id })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (!breederProfile || breederProfile.length === 0) {
      return NextResponse.json(
        { error: 'Breeder profile not found' },
        { status: 404 }
      );
    }

    const breederProfileId = breederProfile[0].id;

    const body = await request.json();
    const { breedIds } = body as { breedIds: string[] };

    if (!Array.isArray(breedIds)) {
      return NextResponse.json(
        { error: 'breedIds must be an array' },
        { status: 400 }
      );
    }

    // Validate that all breed IDs exist
    if (breedIds.length > 0) {
      const existingBreeds = await db
        .select({ id: breeds.id })
        .from(breeds)
        .where(inArray(breeds.id, breedIds));

      if (existingBreeds.length !== breedIds.length) {
        return NextResponse.json(
          { error: 'One or more breed IDs are invalid' },
          { status: 400 }
        );
      }
    }

    // Delete all existing preferences for this breeder
    await db
      .delete(breederBreedPreferences)
      .where(eq(breederBreedPreferences.breederProfileId, breederProfileId));

    // Insert new preferences
    if (breedIds.length > 0) {
      const newPreferences = breedIds.map(breedId => ({
        breederProfileId,
        breedId,
      }));

      await db.insert(breederBreedPreferences).values(newPreferences);
    }

    // Fetch and return updated preferences
    const updatedPreferences = await db
      .select({
        id: breederBreedPreferences.id,
        breedId: breederBreedPreferences.breedId,
        breed: {
          id: breeds.id,
          name: breeds.name,
          sizeCategory: breeds.sizeCategory,
          imageUrl: breeds.imageUrl,
          description: breeds.description,
        },
        createdAt: breederBreedPreferences.createdAt,
      })
      .from(breederBreedPreferences)
      .leftJoin(breeds, eq(breederBreedPreferences.breedId, breeds.id))
      .where(eq(breederBreedPreferences.breederProfileId, breederProfileId));

    return NextResponse.json({
      success: true,
      message: `Successfully updated breed preferences (${breedIds.length} breeds)`,
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating breed preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update breed preferences' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/breeders/breed-preferences
// ============================================================================
// Clear all breed preferences for the breeder

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get breeder profile
    const breederProfile = await db
      .select({ id: breederProfiles.id })
      .from(breederProfiles)
      .where(eq(breederProfiles.userId, session.user.id))
      .limit(1);

    if (!breederProfile || breederProfile.length === 0) {
      return NextResponse.json(
        { error: 'Breeder profile not found' },
        { status: 404 }
      );
    }

    const breederProfileId = breederProfile[0].id;

    await db
      .delete(breederBreedPreferences)
      .where(eq(breederBreedPreferences.breederProfileId, breederProfileId));

    return NextResponse.json({
      success: true,
      message: 'All breed preferences cleared',
    });
  } catch (error) {
    console.error('Error clearing breed preferences:', error);
    return NextResponse.json(
      { error: 'Failed to clear breed preferences' },
      { status: 500 }
    );
  }
}
