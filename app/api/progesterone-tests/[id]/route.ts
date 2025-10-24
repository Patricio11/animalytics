import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { progesteroneTests, animals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// GET - Fetch single progesterone test
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const testId = params.id;

    // Fetch test with animal data
    const [test] = await db
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
      .where(
        and(
          eq(progesteroneTests.id, testId),
          eq(progesteroneTests.userId, userId)
        )
      );

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      test,
    });
  } catch (error) {
    console.error('Error fetching progesterone test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progesterone test' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Update progesterone test
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const testId = params.id;
    const body = await request.json();

    // Verify ownership
    const [existingTest] = await db
      .select()
      .from(progesteroneTests)
      .where(
        and(
          eq(progesteroneTests.id, testId),
          eq(progesteroneTests.userId, userId)
        )
      );

    if (!existingTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Update test
    const [updatedTest] = await db
      .update(progesteroneTests)
      .set({
        animalId: body.animalId !== undefined ? body.animalId : existingTest.animalId,
        matingId: body.matingId !== undefined ? body.matingId : existingTest.matingId,
        testDate: body.testDate || existingTest.testDate,
        laboratory: body.laboratory || existingTest.laboratory,
        unit: body.unit || existingTest.unit,
        breedingMethod: body.breedingMethod || existingTest.breedingMethod,
        readings: body.readings || existingTest.readings,
        rating: body.rating !== undefined ? body.rating : existingTest.rating,
        alternativeRating: body.alternativeRating !== undefined ? body.alternativeRating : existingTest.alternativeRating,
        matchedPattern: body.matchedPattern !== undefined ? body.matchedPattern : existingTest.matchedPattern,
        confidence: body.confidence !== undefined ? body.confidence : existingTest.confidence,
        trend: body.trend !== undefined ? body.trend : existingTest.trend,
        averageChange: body.averageChange !== undefined ? body.averageChange : existingTest.averageChange,
        isOptimal: body.isOptimal !== undefined ? body.isOptimal : existingTest.isOptimal,
        recommendation: body.recommendation !== undefined ? body.recommendation : existingTest.recommendation,
        recommendationMessage: body.recommendationMessage !== undefined ? body.recommendationMessage : existingTest.recommendationMessage,
        suggestedAction: body.suggestedAction !== undefined ? body.suggestedAction : existingTest.suggestedAction,
        breedingWindow: body.breedingWindow !== undefined ? body.breedingWindow : existingTest.breedingWindow,
        notes: body.notes !== undefined ? body.notes : existingTest.notes,
        updatedAt: new Date(),
      })
      .where(eq(progesteroneTests.id, testId))
      .returning();

    return NextResponse.json({
      success: true,
      test: updatedTest,
    });
  } catch (error) {
    console.error('Error updating progesterone test:', error);
    return NextResponse.json(
      { error: 'Failed to update progesterone test' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Delete progesterone test
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const testId = params.id;

    // Verify ownership and delete
    const [deletedTest] = await db
      .delete(progesteroneTests)
      .where(
        and(
          eq(progesteroneTests.id, testId),
          eq(progesteroneTests.userId, userId)
        )
      )
      .returning();

    if (!deletedTest) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting progesterone test:', error);
    return NextResponse.json(
      { error: 'Failed to delete progesterone test' },
      { status: 500 }
    );
  }
}
