import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { healthRecords } from '@/lib/db/schema/animals';
import { requireAuth } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';

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
    const { recordId } = await params;

    await db
      .delete(healthRecords)
      .where(eq(healthRecords.id, recordId));

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
