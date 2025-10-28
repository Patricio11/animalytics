import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { heatCycles, heatCycleProgesteroneReadings, heatCycleReminders, breedingRecords } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';

/**
 * PATCH /api/heat-cycles/[id]
 * Update a heat cycle (e.g., cancel it)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Verify the heat cycle belongs to the breeder
    const [existingCycle] = await db
      .select()
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.id, id),
          eq(heatCycles.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!existingCycle) {
      return errorResponse('Heat cycle not found or does not belong to you', 404);
    }

    // Update the cycle
    const [updatedCycle] = await db
      .update(heatCycles)
      .set({
        status: status || existingCycle.status,
        notes: notes !== undefined ? notes : existingCycle.notes,
        endDate: status === 'cancelled' || status === 'completed' ? new Date().toISOString().split('T')[0] : existingCycle.endDate,
        updatedAt: new Date(),
      })
      .where(eq(heatCycles.id, id))
      .returning();

    return successResponse({
      cycle: updatedCycle,
      message: status === 'cancelled' ? 'Heat cycle cancelled successfully' : 'Heat cycle updated successfully',
    });

  } catch (error) {
    console.error('Error in PATCH /api/heat-cycles/[id]:', error);
    return serverErrorResponse('Failed to update heat cycle');
  }
}

/**
 * DELETE /api/heat-cycles/[id]
 * Delete a heat cycle and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // Verify the heat cycle belongs to the breeder
    const [existingCycle] = await db
      .select()
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.id, id),
          eq(heatCycles.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!existingCycle) {
      return errorResponse('Heat cycle not found or does not belong to you', 404);
    }

    // Delete the cycle (cascade will handle related records)
    await db
      .delete(heatCycles)
      .where(eq(heatCycles.id, id));

    return successResponse({
      message: 'Heat cycle deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/heat-cycles/[id]:', error);
    return serverErrorResponse('Failed to delete heat cycle');
  }
}
