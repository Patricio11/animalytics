import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { semenAssessments, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateSemenAssessmentSchema = z.object({
  assessmentDate: z.string().optional(),
  assessmentType: z.enum(['visual', 'full_lab']).optional(),
  technicianName: z.string().optional(),
  clinic: z.string().optional(),
  visualQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  visualNotes: z.string().optional(),
  volume: z.number().positive().optional(),
  concentration: z.number().int().positive().optional(),
  totalSpermCount: z.number().int().positive().optional(),
  motility: z.number().min(0).max(100).optional(),
  progressiveMotility: z.number().min(0).max(100).optional(),
  morphology: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

// Helper function to calculate quality
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
// PATCH /api/animals/[id]/semen-assessments/[assessmentId]
// ============================================================================
// Update a semen assessment

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assessmentId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, assessmentId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateSemenAssessmentSchema.safeParse(body);
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

    const validatedData = validation.data;

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Convert numbers to strings for decimal fields
    if (validatedData.volume !== undefined) {
      updateData.volume = String(validatedData.volume);
    }
    if (validatedData.motility !== undefined) {
      updateData.motility = String(validatedData.motility);
    }
    if (validatedData.progressiveMotility !== undefined) {
      updateData.progressiveMotility = String(validatedData.progressiveMotility);
    }
    if (validatedData.morphology !== undefined) {
      updateData.morphology = String(validatedData.morphology);
    }

    // Recalculate quality if lab values changed
    if (validatedData.motility !== undefined || validatedData.concentration !== undefined) {
      // Get current assessment to merge values
      const [current] = await db
        .select()
        .from(semenAssessments)
        .where(eq(semenAssessments.id, assessmentId))
        .limit(1);

      if (current && current.assessmentType === 'full_lab') {
        const mergedData = {
          motility: validatedData.motility ?? current.motility,
          concentration: validatedData.concentration ?? current.concentration,
        };
        updateData.calculatedQuality = calculateQuality(mergedData);
      }
    }

    // Update assessment
    const [updated] = await db
      .update(semenAssessments)
      .set(updateData)
      .where(
        and(
          eq(semenAssessments.id, assessmentId),
          eq(semenAssessments.animalId, animalId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Semen assessment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Semen assessment updated successfully',
    });
  } catch (error) {
    console.error('Error updating semen assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update semen assessment' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/semen-assessments/[assessmentId]
// ============================================================================
// Delete a semen assessment

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assessmentId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, assessmentId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Delete assessment
    const [deleted] = await db
      .delete(semenAssessments)
      .where(
        and(
          eq(semenAssessments.id, assessmentId),
          eq(semenAssessments.animalId, animalId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Semen assessment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Semen assessment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting semen assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete semen assessment' },
      { status: 500 }
    );
  }
}
