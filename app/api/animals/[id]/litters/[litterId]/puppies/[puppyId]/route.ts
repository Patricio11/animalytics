import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { puppies, litters, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updatePuppySchema = z.object({
  name: z.string().optional(),
  sex: z.enum(['male', 'female']).optional(),
  birthWeight: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  color: z.string().optional(),
  markings: z.string().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'retained', 'deceased']).optional(),
  statusDate: z.string().optional(),
  buyerName: z.string().optional(),
  buyerEmail: z.string().email().optional(),
  buyerPhone: z.string().optional(),
  salePrice: z.number().int().min(0).optional(),
  saleCurrency: z.string().optional(),
  saleDate: z.string().optional(),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  healthStatus: z.enum(['healthy', 'special_needs', 'deceased']).optional(),
  notes: z.string().optional(),
});

// ============================================================================
// PATCH /api/animals/[id]/litters/[litterId]/puppies/[puppyId]
// ============================================================================
// Update a puppy

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string; puppyId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId, puppyId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updatePuppySchema.safeParse(body);
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

    // Verify litter exists
    const [litter] = await db
      .select()
      .from(litters)
      .where(and(eq(litters.id, litterId), eq(litters.bitchId, animalId)))
      .limit(1);

    if (!litter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    const validatedData = validation.data;

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Convert numbers to strings for decimal fields
    if (validatedData.birthWeight !== undefined) {
      updateData.birthWeight = String(validatedData.birthWeight);
    }
    if (validatedData.currentWeight !== undefined) {
      updateData.currentWeight = String(validatedData.currentWeight);
    }

    // Update puppy
    const [updated] = await db
      .update(puppies)
      .set(updateData)
      .where(
        and(
          eq(puppies.id, puppyId),
          eq(puppies.litterId, litterId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Puppy not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Puppy updated successfully',
    });
  } catch (error) {
    console.error('Error updating puppy:', error);
    return NextResponse.json(
      { error: 'Failed to update puppy' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/litters/[litterId]/puppies/[puppyId]
// ============================================================================
// Delete a puppy

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; litterId: string; puppyId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, litterId, puppyId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Verify litter exists
    const [litter] = await db
      .select()
      .from(litters)
      .where(and(eq(litters.id, litterId), eq(litters.bitchId, animalId)))
      .limit(1);

    if (!litter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Delete puppy
    const [deleted] = await db
      .delete(puppies)
      .where(
        and(
          eq(puppies.id, puppyId),
          eq(puppies.litterId, litterId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Puppy not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Puppy deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting puppy:', error);
    return NextResponse.json(
      { error: 'Failed to delete puppy' },
      { status: 500 }
    );
  }
}
