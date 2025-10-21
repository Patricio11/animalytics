import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { progesteroneReadings, seasons, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// DELETE /api/animals/[id]/seasons/[seasonId]/progesterone/[readingId]
// ============================================================================
// Delete a progesterone reading

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonId: string; readingId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, seasonId, readingId } = await params;

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

    // Delete progesterone reading
    const [deleted] = await db
      .delete(progesteroneReadings)
      .where(
        and(
          eq(progesteroneReadings.id, readingId),
          eq(progesteroneReadings.seasonId, seasonId),
          eq(progesteroneReadings.animalId, animalId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Progesterone reading not found' }, { status: 404 });
    }

    // Update season reading count
    const currentCount = season.progesteroneReadingCount || 0;
    const newCount = Math.max(0, currentCount - 1);
    
    await db
      .update(seasons)
      .set({
        progesteroneReadingCount: newCount,
        hasProgesteroneReadings: newCount > 0,
        updatedAt: new Date(),
      })
      .where(eq(seasons.id, seasonId));

    return NextResponse.json({
      success: true,
      message: 'Progesterone reading deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting progesterone reading:', error);
    return NextResponse.json(
      { error: 'Failed to delete progesterone reading' },
      { status: 500 }
    );
  }
}
