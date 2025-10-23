import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { manualPedigreeEntries } from '@/lib/db/schema/animals';
import { eq, and } from 'drizzle-orm';
import { checkPermission } from '@/lib/permissions/server';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { auth } from '@/lib/auth/config';

// ============================================================================
// GET /api/animals/[id]/pedigree/manual
// ============================================================================
// Fetch manual pedigree entries for an animal

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_READ as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view animals' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const entries = await db
      .select()
      .from(manualPedigreeEntries)
      .where(eq(manualPedigreeEntries.animalId, id));

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Error fetching manual pedigree entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/animals/[id]/pedigree/manual
// ============================================================================
// Create a new manual pedigree entry

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      position,
      generation,
      name,
      registeredName,
      registrationNumber,
      microchipNumber,
      breed,
      sex,
      dateOfBirth,
      color,
      titles,
      notes,
    } = body;

    // Validate required fields
    if (!position || !generation || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: position, generation, name' },
        { status: 400 }
      );
    }

    // Create manual entry
    const [entry] = await db
      .insert(manualPedigreeEntries)
      .values({
        animalId: id,
        userId: session.user.id,
        position,
        generation,
        name,
        registeredName,
        registrationNumber,
        microchipNumber,
        breed,
        sex,
        dateOfBirth,
        color,
        titles,
        notes,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Manual pedigree entry created successfully',
    });
  } catch (error) {
    console.error('Error creating manual pedigree entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/animals/[id]/pedigree/manual
// ============================================================================
// Update a manual pedigree entry

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { entryId, ...updateData } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing required field: entryId' },
        { status: 400 }
      );
    }

    // Update manual entry
    const [entry] = await db
      .update(manualPedigreeEntries)
      .set({
        ...updateData,
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
      return NextResponse.json(
        { error: 'Manual pedigree entry not found' },
        { status: 404 }
      );
    }

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

// ============================================================================
// DELETE /api/animals/[id]/pedigree/manual
// ============================================================================
// Delete a manual pedigree entry

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { allowed } = await checkPermission(PERMISSIONS.ANIMALS_UPDATE as any);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update animals' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing required parameter: entryId' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Manual pedigree entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Manual pedigree entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting manual pedigree entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
