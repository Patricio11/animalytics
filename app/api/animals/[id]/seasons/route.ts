import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasons, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSeasonSchema = z.object({
  startDate: z.string(), // ISO date string
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed']).optional().default('active'),
  notes: z.string().optional(),
});

const updateSeasonSchema = createSeasonSchema.partial();

// Helper function to calculate duration
function calculateDuration(startDate: string, endDate?: string): number | null {
  if (!endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ============================================================================
// GET /api/animals/[id]/seasons
// ============================================================================
// Get all seasons for an animal

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify animal is female
    if (animal.sex !== 'female') {
      return NextResponse.json(
        { error: 'Seasons are only available for female animals' },
        { status: 400 }
      );
    }

    // Get seasons
    const animalSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.animalId, animalId))
      .orderBy(desc(seasons.startDate));

    return NextResponse.json({
      success: true,
      data: animalSeasons,
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/seasons
// ============================================================================
// Create a new season

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = createSeasonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify animal is female
    if (animal.sex !== 'female') {
      return NextResponse.json(
        { error: 'Seasons are only available for female animals' },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Calculate duration if end date provided
    const durationDays = validatedData.endDate
      ? calculateDuration(validatedData.startDate, validatedData.endDate)
      : null;

    // Create season
    const [season] = await db
      .insert(seasons)
      .values({
        id: createId(),
        animalId,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate || null,
        status: validatedData.status || 'active',
        durationDays,
        hasProgesteroneReadings: false,
        progesteroneReadingCount: 0,
        notes: validatedData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: season,
      message: 'Season created successfully',
    });
  } catch (error) {
    console.error('Error creating season:', error);
    return NextResponse.json(
      { error: 'Failed to create season' },
      { status: 500 }
    );
  }
}
