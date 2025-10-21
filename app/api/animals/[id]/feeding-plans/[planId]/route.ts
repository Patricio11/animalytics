import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feedingPlans, animals } from '@/lib/db/schema/animals';
import { auth } from '@/lib/auth/config';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const mealTimeSchema = z.object({
  time: z.string(),
  amount: z.string(),
  unit: z.string(),
});

const supplementSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

const updateFeedingPlanSchema = z.object({
  foodType: z.string().optional(),
  mealTimes: z.array(mealTimeSchema).optional(),
  specialDiet: z.string().optional(),
  supplements: z.array(supplementSchema).optional(),
  calorieTarget: z.number().int().positive().optional(),
  specialNotes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// PATCH /api/animals/[id]/feeding-plans/[planId]
// ============================================================================
// Update a feeding plan

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, planId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateFeedingPlanSchema.safeParse(body);
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

    // If activating this plan, deactivate others
    if (validatedData.isActive === true) {
      await db
        .update(feedingPlans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(feedingPlans.animalId, animalId),
            eq(feedingPlans.isActive, true)
          )
        );
    }

    // Update feeding plan
    const [updated] = await db
      .update(feedingPlans)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(feedingPlans.id, planId),
          eq(feedingPlans.animalId, animalId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Feeding plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Feeding plan updated successfully',
    });
  } catch (error) {
    console.error('Error updating feeding plan:', error);
    return NextResponse.json(
      { error: 'Failed to update feeding plan' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/animals/[id]/feeding-plans/[planId]
// ============================================================================
// Delete a feeding plan

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: animalId, planId } = await params;

    // Verify animal ownership
    const [animal] = await db
      .select()
      .from(animals)
      .where(and(eq(animals.id, animalId), eq(animals.userId, session.user.id)))
      .limit(1);

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    // Delete feeding plan
    const [deleted] = await db
      .delete(feedingPlans)
      .where(
        and(
          eq(feedingPlans.id, planId),
          eq(feedingPlans.animalId, animalId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Feeding plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feeding plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feeding plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete feeding plan' },
      { status: 500 }
    );
  }
}
