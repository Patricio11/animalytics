import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { manualPedigreeEntries } from '@/lib/db/schema/animals';
import { eq, and } from 'drizzle-orm';
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';

// ============================================================================
// DELETE /api/animals/[id]/pedigree/manual/[entryId]
// ============================================================================
// Delete a specific manual pedigree entry

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id, entryId } = await params;

    console.log('🗑️ Deleting manual pedigree entry:', {
      animalId: id,
      entryId,
    });

    // Delete manual entry
    const [entry] = await db
      .delete(manualPedigreeEntries)
      .where(
        and(
          eq(manualPedigreeEntries.id, entryId),
          eq(manualPedigreeEntries.animalId, id)
        )
      )
      .returning();

    if (!entry) {
      console.log('❌ Manual pedigree entry not found');
      return NextResponse.json(
        { error: 'Manual pedigree entry not found' },
        { status: 404 }
      );
    }

    console.log('✅ Manual pedigree entry deleted successfully:', entry.name);

    return NextResponse.json({
      success: true,
      message: 'Manual pedigree entry deleted successfully',
      data: entry,
    });
  } catch (error) {
    console.error('Error deleting manual pedigree entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/animals/[id]/pedigree/manual/[entryId]
// ============================================================================
// Update a specific manual pedigree entry

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id, entryId } = await params;
    const body = await request.json();

    console.log('✏️ Updating manual pedigree entry:', {
      animalId: id,
      entryId,
      updates: body,
    });

    // Update manual entry
    const [entry] = await db
      .update(manualPedigreeEntries)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(manualPedigreeEntries.id, entryId),
          eq(manualPedigreeEntries.animalId, id)
        )
      )
      .returning();

    if (!entry) {
      console.log('❌ Manual pedigree entry not found');
      return NextResponse.json(
        { error: 'Manual pedigree entry not found' },
        { status: 404 }
      );
    }

    console.log('✅ Manual pedigree entry updated successfully:', entry.name);

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Manual pedigree entry updated successfully',
    });
  } catch (error) {
    console.error('Error updating manual pedigree entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
