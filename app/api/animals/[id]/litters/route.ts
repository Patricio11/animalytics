import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { litters, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createLitterSchema = z.object({
  sireId: z.string().optional(),
  frozenSemenId: z.string().optional(),
  matingDate: z.string(), // ISO date string
  breedingMethod: z.enum(['natural', 'ai', 'surgical_ai', 'frozen']).optional(),
  expectedWhelpingDate: z.string().optional(),
  actualWhelpingDate: z.string().optional(),
  puppyCount: z.number().int().min(0).optional(),
  survivingPuppies: z.number().int().min(0).optional(),
  maleCount: z.number().int().min(0).optional(),
  femaleCount: z.number().int().min(0).optional(),
  hasComplications: z.boolean().optional().default(false),
  complications: z.string().optional(),
  veterinarianNotes: z.string().optional(),
  status: z.enum(['expected', 'whelped', 'archived']).optional().default('expected'),
  notes: z.string().optional(),
});

const updateLitterSchema = createLitterSchema.partial();

// Helper function to calculate gestation days
function calculateGestationDays(matingDate: string, whelpingDate?: string): number | null {
  if (!whelpingDate) return null;
  const mating = new Date(matingDate);
  const whelping = new Date(whelpingDate);
  const diffTime = Math.abs(whelping.getTime() - mating.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ============================================================================
// GET /api/animals/[id]/litters
// ============================================================================
// Get all litters for an animal

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
        { error: 'Litters are only available for female animals' },
        { status: 400 }
      );
    }

    // Get litters
    const animalLitters = await db
      .select()
      .from(litters)
      .where(eq(litters.bitchId, animalId))
      .orderBy(desc(litters.matingDate));

    return NextResponse.json({
      success: true,
      data: animalLitters,
    });
  } catch (error) {
    console.error('Error fetching litters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch litters' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/litters
// ============================================================================
// Create a new litter

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
    const validation = createLitterSchema.safeParse(body);
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
        { error: 'Litters are only available for female animals' },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Calculate gestation days if whelping date provided
    const gestationDays = validatedData.actualWhelpingDate
      ? calculateGestationDays(validatedData.matingDate, validatedData.actualWhelpingDate)
      : null;

    // Create litter
    const [litter] = await db
      .insert(litters)
      .values({
        bitchId: animalId,
        sireId: validatedData.sireId || null,
        frozenSemenId: validatedData.frozenSemenId || null,
        matingDate: validatedData.matingDate,
        breedingMethod: validatedData.breedingMethod || null,
        expectedWhelpingDate: validatedData.expectedWhelpingDate || null,
        actualWhelpingDate: validatedData.actualWhelpingDate || null,
        gestationDays,
        puppyCount: validatedData.puppyCount || null,
        survivingPuppies: validatedData.survivingPuppies || null,
        maleCount: validatedData.maleCount || null,
        femaleCount: validatedData.femaleCount || null,
        hasComplications: validatedData.hasComplications || false,
        complications: validatedData.complications || null,
        veterinarianNotes: validatedData.veterinarianNotes || null,
        status: validatedData.status || 'expected',
        notes: validatedData.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: litter,
      message: 'Litter created successfully',
    });
  } catch (error) {
    console.error('Error creating litter:', error);
    return NextResponse.json(
      { error: 'Failed to create litter' },
      { status: 500 }
    );
  }
}
