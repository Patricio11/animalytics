import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { matings } from '@/lib/db/schema/matings';
import { eq } from 'drizzle-orm';

// ============================================================================
// POST /api/conception-ratings
// ============================================================================
// Create a new conception rating calculation and save to matings table

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      bitchId,
      dogId,
      frozenSemenId,
      matingDate,
      breedingMethod,
      calculationData,
      ratingBreakdown,
      conceptionRating,
      overallRating,
      informationAccuracy,
      notes,
    } = body;

    // Validation
    if (!bitchId) {
      return NextResponse.json(
        { error: 'Bitch ID is required' },
        { status: 400 }
      );
    }

    if (!dogId && !frozenSemenId) {
      return NextResponse.json(
        { error: 'Either dog ID or frozen semen ID is required' },
        { status: 400 }
      );
    }

    // Create mating record with conception rating data
    const [newMating] = await db
      .insert(matings)
      .values({
        userId,
        bitchId,
        dogId: dogId || null,
        frozenSemenId: frozenSemenId || null,
        matingDate: matingDate || new Date().toISOString().split('T')[0],
        breedingMethod: breedingMethod || 'natural_ai',
        semenType: calculationData?.semenInformation?.type || 'fresh',
        status: 'planned',
        
        // Calculated ratings
        conceptionRating: conceptionRating?.toString(),
        overallRating: overallRating?.toString(),
        informationAccuracy: informationAccuracy?.toString(),
        
        // Store all wizard data
        calculationData: calculationData || {},
        ratingBreakdown: ratingBreakdown || {},
        
        notes: notes || null,
      })
      .returning();

    // Fetch the complete mating with related data
    const completeMating = await db.query.matings.findFirst({
      where: eq(matings.id, newMating.id),
      with: {
        bitch: {
          with: {
            breed: true,
            photos: true,
          },
        },
        dog: {
          with: {
            breed: true,
            photos: true,
          },
        },
        frozenSemen: true,
      },
    });

    return NextResponse.json({
      success: true,
      mating: completeMating,
      message: 'Conception rating saved successfully',
    });
  } catch (error) {
    console.error('Error creating conception rating:', error);
    return NextResponse.json(
      { error: 'Failed to save conception rating' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/conception-ratings
// ============================================================================
// Fetch all conception ratings for the current user

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all matings with conception ratings
    const userMatings = await db.query.matings.findMany({
      where: eq(matings.userId, session.user.id),
      with: {
        bitch: {
          with: {
            breed: true,
            photos: true,
          },
        },
        dog: {
          with: {
            breed: true,
            photos: true,
          },
        },
        frozenSemen: true,
      },
      orderBy: (matings, { desc }) => [desc(matings.createdAt)],
    });

    return NextResponse.json({
      success: true,
      ratings: userMatings,
      total: userMatings.length,
    });
  } catch (error) {
    console.error('Error fetching conception ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conception ratings' },
      { status: 500 }
    );
  }
}
