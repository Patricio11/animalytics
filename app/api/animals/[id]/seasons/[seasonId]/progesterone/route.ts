import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { progesteroneReadings, seasons, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createProgesteroneReadingSchema = z.object({
  readingDate: z.string(), // ISO date string
  dayNumber: z.number().int().min(0),
  level: z.number().positive(),
  unit: z.enum(['nanograms', 'nanomoles']),
  laboratory: z.enum(['VIDAS', 'IDEXX']),
  notes: z.string().optional(),
});

// ============================================================================
// GET /api/animals/[id]/seasons/[seasonId]/progesterone
// ============================================================================
// Get all progesterone readings for a season

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, seasonId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify season exists
    const [season] = await db
      .select()
      .from(seasons)
      .where(and(eq(seasons.id, seasonId), eq(seasons.animalId, animalId)))
      .limit(1);

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Get progesterone readings
    const readings = await db
      .select()
      .from(progesteroneReadings)
      .where(eq(progesteroneReadings.seasonId, seasonId))
      .orderBy(desc(progesteroneReadings.dayNumber));

    return NextResponse.json({
      success: true,
      data: readings,
    });
  } catch (error) {
    console.error('Error fetching progesterone readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progesterone readings' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/seasons/[seasonId]/progesterone
// ============================================================================
// Create a new progesterone reading

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, seasonId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = createProgesteroneReadingSchema.safeParse(body);
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

    // Verify season exists
    const [season] = await db
      .select()
      .from(seasons)
      .where(and(eq(seasons.id, seasonId), eq(seasons.animalId, animalId)))
      .limit(1);

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    const validatedData = validation.data;

    // Create progesterone reading
    const [reading] = await db
      .insert(progesteroneReadings)
      .values({
        id: createId(),
        seasonId,
        animalId,
        readingDate: validatedData.readingDate,
        dayNumber: validatedData.dayNumber,
        level: String(validatedData.level),
        unit: validatedData.unit,
        laboratory: validatedData.laboratory,
        notes: validatedData.notes || null,
        createdAt: new Date(),
      })
      .returning();

    // Update season to reflect it has progesterone readings
    const currentCount = season.progesteroneReadingCount || 0;
    await db
      .update(seasons)
      .set({
        hasProgesteroneReadings: true,
        progesteroneReadingCount: currentCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, seasonId));

    return NextResponse.json({
      success: true,
      data: reading,
      message: 'Progesterone reading created successfully',
    });
  } catch (error) {
    console.error('Error creating progesterone reading:', error);
    return NextResponse.json(
      { error: 'Failed to create progesterone reading' },
      { status: 500 }
    );
  }
}
