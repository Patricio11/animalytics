import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { semenAssessments, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSemenAssessmentSchema = z.object({
  assessmentDate: z.string(), // ISO date string
  assessmentType: z.enum(['visual', 'full_lab']),
  technicianName: z.string().optional(),
  clinic: z.string().optional(),
  
  // Visual assessment
  visualQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  visualNotes: z.string().optional(),
  
  // Lab analysis
  volume: z.number().positive().optional(),
  concentration: z.number().int().positive().optional(),
  totalSpermCount: z.number().int().positive().optional(),
  motility: z.number().min(0).max(100).optional(),
  progressiveMotility: z.number().min(0).max(100).optional(),
  morphology: z.number().min(0).max(100).optional(),
  
  notes: z.string().optional(),
});

const updateSemenAssessmentSchema = createSemenAssessmentSchema.partial();

// Helper function to calculate quality from lab values
function calculateQuality(data: any): string {
  if (!data.motility || !data.concentration) return 'fair';
  
  const motility = parseFloat(data.motility);
  const concentration = parseInt(data.concentration);
  
  if (motility >= 70 && concentration >= 200) return 'excellent';
  if (motility >= 50 && concentration >= 100) return 'good';
  if (motility >= 30 && concentration >= 50) return 'fair';
  return 'poor';
}

// ============================================================================
// GET /api/animals/[id]/semen-assessments
// ============================================================================
// Get all semen assessments for an animal

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

    // Verify animal is male
    if (animal.sex !== 'male') {
      return NextResponse.json(
        { error: 'Semen assessments are only available for male animals' },
        { status: 400 }
      );
    }

    // Get assessments
    const assessments = await db
      .select()
      .from(semenAssessments)
      .where(eq(semenAssessments.animalId, animalId))
      .orderBy(desc(semenAssessments.assessmentDate));

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error('Error fetching semen assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch semen assessments' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/semen-assessments
// ============================================================================
// Create a new semen assessment

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
    const validation = createSemenAssessmentSchema.safeParse(body);
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

    // Verify animal is male
    if (animal.sex !== 'male') {
      return NextResponse.json(
        { error: 'Semen assessments are only available for male animals' },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Calculate quality for lab assessments
    let calculatedQuality = null;
    if (validatedData.assessmentType === 'full_lab') {
      calculatedQuality = calculateQuality(validatedData);
    }

    // Create assessment
    const [assessment] = await db
      .insert(semenAssessments)
      .values({
        id: createId(),
        animalId,
        assessmentDate: validatedData.assessmentDate,
        assessmentType: validatedData.assessmentType,
        technicianName: validatedData.technicianName || null,
        clinic: validatedData.clinic || null,
        visualQuality: validatedData.visualQuality || null,
        visualNotes: validatedData.visualNotes || null,
        volume: validatedData.volume ? String(validatedData.volume) : null,
        concentration: validatedData.concentration || null,
        totalSpermCount: validatedData.totalSpermCount || null,
        motility: validatedData.motility ? String(validatedData.motility) : null,
        progressiveMotility: validatedData.progressiveMotility ? String(validatedData.progressiveMotility) : null,
        morphology: validatedData.morphology ? String(validatedData.morphology) : null,
        calculatedQuality,
        notes: validatedData.notes || null,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: assessment,
      message: 'Semen assessment created successfully',
    });
  } catch (error) {
    console.error('Error creating semen assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create semen assessment' },
      { status: 500 }
    );
  }
}
