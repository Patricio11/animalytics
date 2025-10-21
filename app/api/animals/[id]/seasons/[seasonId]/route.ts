import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seasons, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateSeasonSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'completed']).optional(),
  notes: z.string().optional(),
});

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
// PATCH /api/animals/[id]/seasons/[seasonId]
// ============================================================================
// Update a season

export async function PATCH(
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
    const validation = updateSeasonSchema.safeParse(body);
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

    // Get current season to calculate duration
    const [currentSeason] = await db
      .select()
      .from(seasons)
      .where(eq(seasons.id, seasonId))
      .limit(1);

    if (!currentSeason) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Recalculate duration if dates changed
    const newStartDate = validatedData.startDate || currentSeason.startDate;
    const newEndDate = validatedData.endDate !== undefined ? validatedData.endDate : currentSeason.endDate;
    
    if (newEndDate) {
      updateData.durationDays = calculateDuration(newStartDate, newEndDate);
    }

    // Update season
    const [updated] = await db
      .update(seasons)
      .set(updateData)
      .where(
        and(
          eq(seasons.id, seasonId),
          eq(seasons.animalId, animalId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Season updated successfully',
    });
  } catch (error) {
    console.error('Error updating season:', error);
    return NextResponse.json(
      { error: 'Failed to update season' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/seasons/[seasonId]
// ============================================================================
// Delete a season

export async function DELETE(
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

    // Delete season (cascade will delete progesterone readings)
    const [deleted] = await db
      .delete(seasons)
      .where(
        and(
          eq(seasons.id, seasonId),
          eq(seasons.animalId, animalId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Season deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting season:', error);
    return NextResponse.json(
      { error: 'Failed to delete season' },
      { status: 500 }
    );
  }
}
