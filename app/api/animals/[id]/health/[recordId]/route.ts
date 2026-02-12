import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords, animals } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq, and } from 'drizzle-orm';

/**
 * DELETE /api/animals/[id]/health/[recordId]
 * Delete a health record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const session = await requireAuth();
    const { id, recordId } = await params;

    // Verify ownership
    const [animal] = await db
      .select({ id: animals.id })
      .from(animals)
      .where(and(eq(animals.id, id), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found or access denied' },
        { status: 403 }
      );
    }

    await db
      .delete(healthRecords)
      .where(and(eq(healthRecords.id, recordId), eq(healthRecords.animalId, id)));

    return NextResponse.json({
      success: true,
      message: 'Health record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting health record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete health record' },
      { status: 500 }
    );
  }
}
