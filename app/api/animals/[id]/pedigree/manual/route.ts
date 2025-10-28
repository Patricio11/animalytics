import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { manualPedigreeEntries, animals } from '@/lib/db/schema/animals';
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

    console.log('📝 Creating manual pedigree entry:', {
      animalId: id,
      userId: session.user.id,
      position,
      generation,
      name,
    });

    // Validate required fields
    if (!position || !generation || !name) {
      console.error('❌ Validation failed:', { position, generation, name });
      return NextResponse.json(
        { error: 'Missing required fields: position, generation, name' },
        { status: 400 }
      );
    }

    // Check if we need to create parent entries first
    // For example, if adding "sire.sire" (grandsire), we need "sire" (father) to exist first
    const positionParts = position.split('.');
    if (positionParts.length > 1) {
      // This is a grandparent or deeper - check if parent exists
      const parentPosition = positionParts.slice(0, -1).join('.');
      const parentGeneration = generation - 1;
      
      console.log(`🔍 Checking if parent exists at position: ${parentPosition}`);
      
      // Check in manual_pedigree_entries
      const [existingParent] = await db
        .select()
        .from(manualPedigreeEntries)
        .where(
          and(
            eq(manualPedigreeEntries.animalId, id),
            eq(manualPedigreeEntries.position, parentPosition)
          )
        )
        .limit(1);
      
      // Also check if parent is linked in animals table
      const [animal] = await db
        .select()
        .from(animals)
        .where(eq(animals.id, id))
        .limit(1);
      
      const hasLinkedParent = parentPosition === 'dam' ? animal?.damId : 
                              parentPosition === 'sire' ? animal?.sireId : 
                              false;
      
      if (!existingParent && !hasLinkedParent) {
        console.log(`⚠️ Parent doesn't exist at ${parentPosition}, creating placeholder...`);
        
        // Determine parent sex based on position
        const parentSex = parentPosition.endsWith('dam') ? 'female' : 
                         parentPosition.endsWith('sire') ? 'male' : null;
        
        // Create placeholder parent
        await db
          .insert(manualPedigreeEntries)
          .values({
            animalId: id,
            userId: session.user.id,
            position: parentPosition,
            generation: parentGeneration,
            name: `Unknown ${parentPosition.split('.').pop() === 'dam' ? 'Dam' : 'Sire'}`,
            sex: parentSex,
            notes: 'Auto-created placeholder for pedigree structure',
          });
        
        console.log(`✅ Created placeholder parent at ${parentPosition}`);
      }
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

    console.log('✅ Manual pedigree entry created:', entry);

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
