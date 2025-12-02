import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { heatCycles, heatCycleProgesteroneReadings, heatCycleReminders, breedingRecords, animals } from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/heat-cycles/[id]
 * Fetch a single heat cycle with all details
 */
export async function GET(
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

    // Fetch the heat cycle with bitch details
    const [cycle] = await db
      .select({
        id: heatCycles.id,
        breederId: heatCycles.breederId,
        bitchId: heatCycles.bitchId,
        startDate: heatCycles.startDate,
        endDate: heatCycles.endDate,
        currentDay: heatCycles.currentDay,
        status: heatCycles.status,
        breedingMethod: heatCycles.breedingMethod,
        estimatedOvulationDay: heatCycles.estimatedOvulationDay,
        estimatedOvulationDate: heatCycles.estimatedOvulationDate,
        estimatedWhelpingDate: heatCycles.estimatedWhelpingDate,
        notes: heatCycles.notes,
        createdAt: heatCycles.createdAt,
        updatedAt: heatCycles.updatedAt,
        bitch: {
          id: animals.id,
          name: animals.name,
          registeredName: animals.registeredName,
          breedId: animals.breedId,
          sex: animals.sex,
          dateOfBirth: animals.dateOfBirth,
        },
      })
      .from(heatCycles)
      .leftJoin(animals, eq(heatCycles.bitchId, animals.id))
      .where(
        and(
          eq(heatCycles.id, id),
          eq(heatCycles.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!cycle) {
      return errorResponse('Heat cycle not found', 404);
    }

    // Fetch all progesterone readings for this cycle
    const readings = await db
      .select()
      .from(heatCycleProgesteroneReadings)
      .where(eq(heatCycleProgesteroneReadings.heatCycleId, id))
      .orderBy(desc(heatCycleProgesteroneReadings.day));

    // Fetch breeding records
    const breedings = await db
      .select()
      .from(breedingRecords)
      .where(eq(breedingRecords.heatCycleId, id))
      .orderBy(desc(breedingRecords.breedingDate));

    // Fetch reminders
    const reminders = await db
      .select()
      .from(heatCycleReminders)
      .where(eq(heatCycleReminders.heatCycleId, id))
      .orderBy(desc(heatCycleReminders.dueDate));

    return successResponse({
      ...cycle,
      readings,
      breedings,
      reminders,
    });

  } catch (error) {
    console.error('Error in GET /api/heat-cycles/[id]:', error);
    return serverErrorResponse('Failed to fetch heat cycle');
  }
}

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

    // Calculate next expected cycle date if completing (typically 6 months for dogs)
    let nextExpectedCycleDate = existingCycle.nextExpectedCycleDate;
    if (status === 'completed' && !nextExpectedCycleDate) {
      const endDate = new Date();
      const nextDate = new Date(endDate);
      nextDate.setMonth(nextDate.getMonth() + 6); // Add 6 months
      nextExpectedCycleDate = nextDate.toISOString().split('T')[0];
    }

    // Update the cycle
    const [updatedCycle] = await db
      .update(heatCycles)
      .set({
        status: status || existingCycle.status,
        notes: notes !== undefined ? notes : existingCycle.notes,
        endDate: status === 'cancelled' || status === 'completed' ? new Date().toISOString().split('T')[0] : existingCycle.endDate,
        nextExpectedCycleDate: status === 'completed' ? nextExpectedCycleDate : existingCycle.nextExpectedCycleDate,
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
