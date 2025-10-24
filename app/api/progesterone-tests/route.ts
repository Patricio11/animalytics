import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { progesteroneTests, animals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ============================================================================
// POST - Create new progesterone test
// ============================================================================

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

    // Validate required fields
    if (!body.testDate || !body.laboratory || !body.unit || !body.breedingMethod || !body.readings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create progesterone test
    const [newTest] = await db.insert(progesteroneTests).values({
      userId,
      animalId: body.animalId || null,
      matingId: body.matingId || null,
      testDate: body.testDate,
      laboratory: body.laboratory,
      unit: body.unit,
      breedingMethod: body.breedingMethod,
      readings: body.readings,
      rating: body.rating || null,
      alternativeRating: body.alternativeRating || null,
      matchedPattern: body.matchedPattern || null,
      confidence: body.confidence || null,
      trend: body.trend || null,
      averageChange: body.averageChange || null,
      isOptimal: body.isOptimal || null,
      recommendation: body.recommendation || null,
      recommendationMessage: body.recommendationMessage || null,
      suggestedAction: body.suggestedAction || null,
      breedingWindow: body.breedingWindow || null,
      notes: body.notes || null,
    }).returning();

    return NextResponse.json({
      success: true,
      test: newTest,
    });
  } catch (error) {
    console.error('Error creating progesterone test:', error);
    return NextResponse.json(
      { error: 'Failed to create progesterone test' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch progesterone tests for current user
// ============================================================================

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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get('animalId');
    const matingId = searchParams.get('matingId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Build where conditions
    const whereConditions = [eq(progesteroneTests.userId, userId)];
    
    if (animalId) {
      whereConditions.push(eq(progesteroneTests.animalId, animalId));
    }
    
    if (matingId) {
      whereConditions.push(eq(progesteroneTests.matingId, matingId));
    }

    // Build query with all conditions
    let query = db
      .select({
        id: progesteroneTests.id,
        userId: progesteroneTests.userId,
        animalId: progesteroneTests.animalId,
        matingId: progesteroneTests.matingId,
        testDate: progesteroneTests.testDate,
        laboratory: progesteroneTests.laboratory,
        unit: progesteroneTests.unit,
        breedingMethod: progesteroneTests.breedingMethod,
        readings: progesteroneTests.readings,
        rating: progesteroneTests.rating,
        alternativeRating: progesteroneTests.alternativeRating,
        matchedPattern: progesteroneTests.matchedPattern,
        confidence: progesteroneTests.confidence,
        trend: progesteroneTests.trend,
        averageChange: progesteroneTests.averageChange,
        isOptimal: progesteroneTests.isOptimal,
        recommendation: progesteroneTests.recommendation,
        recommendationMessage: progesteroneTests.recommendationMessage,
        suggestedAction: progesteroneTests.suggestedAction,
        breedingWindow: progesteroneTests.breedingWindow,
        notes: progesteroneTests.notes,
        createdAt: progesteroneTests.createdAt,
        updatedAt: progesteroneTests.updatedAt,
        animal: {
          id: animals.id,
          name: animals.name,
          registrationNumber: animals.registrationNumber,
          profileImageUrl: animals.profileImageUrl,
        },
      })
      .from(progesteroneTests)
      .leftJoin(animals, eq(progesteroneTests.animalId, animals.id))
      .where(and(...whereConditions))
      .orderBy(desc(progesteroneTests.createdAt));

    // Execute query
    let tests = await query;

    // Apply limit if specified
    if (limit) {
      tests = tests.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      tests,
    });
  } catch (error) {
    console.error('Error fetching progesterone tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progesterone tests' },
      { status: 500 }
    );
  }
}
