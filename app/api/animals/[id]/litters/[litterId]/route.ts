import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { litters, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateLitterSchema = z.object({
  sireId: z.string().optional(),
  frozenSemenId: z.string().optional(),
  matingDate: z.string().optional(),
  breedingMethod: z.enum(['natural', 'ai', 'surgical_ai', 'frozen']).optional(),
  expectedWhelpingDate: z.string().optional(),
  actualWhelpingDate: z.string().optional(),
  puppyCount: z.number().int().min(0).optional(),
  survivingPuppies: z.number().int().min(0).optional(),
  maleCount: z.number().int().min(0).optional(),
  femaleCount: z.number().int().min(0).optional(),
  hasComplications: z.boolean().optional(),
  complications: z.string().optional(),
  veterinarianNotes: z.string().optional(),
  status: z.enum(['expected', 'whelped', 'archived']).optional(),
  notes: z.string().optional(),
});

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
// PATCH /api/animals/[id]/litters/[litterId]
// ============================================================================
// Update a litter

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateLitterSchema.safeParse(body);
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

    // Get current litter to recalculate gestation if needed
    const [currentLitter] = await db
      .select()
      .from(litters)
      .where(eq(litters.id, litterId))
      .limit(1);

    if (!currentLitter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Recalculate gestation days if dates changed
    const newMatingDate = validatedData.matingDate || currentLitter.matingDate;
    const newWhelpingDate = validatedData.actualWhelpingDate !== undefined 
      ? validatedData.actualWhelpingDate 
      : currentLitter.actualWhelpingDate;
    
    if (newWhelpingDate) {
      updateData.gestationDays = calculateGestationDays(newMatingDate, newWhelpingDate);
    }

    // Update litter
    const [updated] = await db
      .update(litters)
      .set(updateData)
      .where(
        and(
          eq(litters.id, litterId),
          eq(litters.bitchId, animalId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Litter updated successfully',
    });
  } catch (error) {
    console.error('Error updating litter:', error);
    return NextResponse.json(
      { error: 'Failed to update litter' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/litters/[litterId]
// ============================================================================
// Delete a litter

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Delete litter (cascade will delete puppies)
    const [deleted] = await db
      .delete(litters)
      .where(
        and(
          eq(litters.id, litterId),
          eq(litters.bitchId, animalId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Litter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting litter:', error);
    return NextResponse.json(
      { error: 'Failed to delete litter' },
      { status: 500 }
    );
  }
}
