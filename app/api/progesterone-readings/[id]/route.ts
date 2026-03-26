import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { 
  heatCycles, 
  heatCycleProgesteroneReadings 
} from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { differenceInDays } from 'date-fns';
import { z } from 'zod';
import {
  detectPhase,
  calculateNextTest,
  estimateOvulationDay,
  calculateWhelpingDate
} from '@/lib/utils/progesterone';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateReadingSchema = z.object({
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  progesteroneLevel: z.number().min(0).max(50).optional(),
  laboratory: z.enum(['VIDAS', 'IDEXX', 'IDEXX_LAB', 'IMMULITE', 'CHEMILUMINESCENCE', 'RIA', 'OTHER']).optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /api/progesterone-readings/[id]
 * Update an existing progesterone reading
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

    // Parse and validate request body
    const body = await request.json();
    const validation = updateReadingSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const updates = validation.data;

    // Fetch the existing reading
    const [existingReading] = await db
      .select()
      .from(heatCycleProgesteroneReadings)
      .where(
        and(
          eq(heatCycleProgesteroneReadings.id, id),
          eq(heatCycleProgesteroneReadings.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!existingReading) {
      return errorResponse('Reading not found or does not belong to you', 404);
    }

    // Fetch the heat cycle
    const [heatCycle] = await db
      .select()
      .from(heatCycles)
      .where(eq(heatCycles.id, existingReading.heatCycleId))
      .limit(1);

    if (!heatCycle) {
      return errorResponse('Associated heat cycle not found', 404);
    }

    // Recalculate day if test date changed
    let newDay = existingReading.day;
    if (updates.testDate && updates.testDate !== existingReading.testDate) {
      const daysDiff = differenceInDays(new Date(updates.testDate), new Date(heatCycle.startDate));
      newDay = daysDiff + 1;

      // Validate new day
      if (newDay < 1) {
        return errorResponse('Test date cannot be before the heat cycle start date', 400);
      }
      if (newDay > 60) {
        return errorResponse('Test date is too far from the start date (max 60 days)', 400);
      }

      // Check for duplicate on new day (excluding current reading)
      const [duplicateReading] = await db
        .select()
        .from(heatCycleProgesteroneReadings)
        .where(
          and(
            eq(heatCycleProgesteroneReadings.heatCycleId, existingReading.heatCycleId),
            eq(heatCycleProgesteroneReadings.day, newDay),
            // Exclude current reading from duplicate check
            eq(heatCycleProgesteroneReadings.id, id)
          )
        )
        .limit(1);

      if (duplicateReading && duplicateReading.id !== id) {
        return errorResponse(
          `A reading already exists for Day ${newDay}. Please delete that reading first.`,
          409
        );
      }
    }

    // Get the progesterone level (use updated or existing)
    const progesteroneLevel = updates.progesteroneLevel ?? parseFloat(existingReading.progesteroneLevel);

    // Recalculate phase and next test
    const phaseInfo = detectPhase(progesteroneLevel);
    const testDate = updates.testDate ?? existingReading.testDate;
    const nextTest = calculateNextTest(progesteroneLevel, new Date(testDate));

    // Update the reading
    const [updatedReading] = await db
      .update(heatCycleProgesteroneReadings)
      .set({
        day: newDay,
        testDate: updates.testDate ?? existingReading.testDate,
        progesteroneLevel: updates.progesteroneLevel?.toString() ?? existingReading.progesteroneLevel,
        laboratory: updates.laboratory ?? existingReading.laboratory,
        notes: updates.notes ?? existingReading.notes,
        phase: phaseInfo.phase,
        phaseColor: phaseInfo.color,
        nextTestDays: nextTest.days,
        nextTestDate: nextTest.date.toISOString().split('T')[0],
        nextTestReason: nextTest.reason,
      })
      .where(eq(heatCycleProgesteroneReadings.id, id))
      .returning();

    // Recalculate heat cycle estimates
    const allReadings = await db
      .select({
        day: heatCycleProgesteroneReadings.day,
        progesteroneLevel: heatCycleProgesteroneReadings.progesteroneLevel,
      })
      .from(heatCycleProgesteroneReadings)
      .where(eq(heatCycleProgesteroneReadings.heatCycleId, existingReading.heatCycleId))
      .orderBy(heatCycleProgesteroneReadings.day);

    // Estimate ovulation day
    const estimatedOvulationDay = estimateOvulationDay(
      allReadings.map(r => ({
        day: r.day,
        progesteroneLevel: parseFloat(r.progesteroneLevel),
      }))
    );

    // Calculate estimated whelping date if ovulation is detected
    let estimatedWhelpingDate: Date | null = null;
    let estimatedOvulationDate: Date | null = null;
    
    if (estimatedOvulationDay) {
      const { addDays } = await import('date-fns');
      estimatedOvulationDate = addDays(new Date(heatCycle.startDate), estimatedOvulationDay - 1);
      estimatedWhelpingDate = calculateWhelpingDate(estimatedOvulationDate);
    }

    // Find the latest reading day for currentDay
    const latestDay = Math.max(...allReadings.map(r => r.day));

    // Update heat cycle
    await db
      .update(heatCycles)
      .set({
        currentDay: latestDay,
        estimatedOvulationDay: estimatedOvulationDay || undefined,
        estimatedOvulationDate: estimatedOvulationDate?.toISOString().split('T')[0],
        estimatedWhelpingDate: estimatedWhelpingDate?.toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(eq(heatCycles.id, existingReading.heatCycleId));

    return successResponse({
      reading: updatedReading,
      message: 'Reading updated successfully',
    });

  } catch (error) {
    console.error('Error in PATCH /api/progesterone-readings/[id]:', error);
    return serverErrorResponse('Failed to update reading');
  }
}

/**
 * DELETE /api/progesterone-readings/[id]
 * Delete a progesterone reading
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

    // Fetch the reading to delete
    const [readingToDelete] = await db
      .select()
      .from(heatCycleProgesteroneReadings)
      .where(
        and(
          eq(heatCycleProgesteroneReadings.id, id),
          eq(heatCycleProgesteroneReadings.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!readingToDelete) {
      return errorResponse('Reading not found or does not belong to you', 404);
    }

    // Fetch the heat cycle
    const [heatCycle] = await db
      .select()
      .from(heatCycles)
      .where(eq(heatCycles.id, readingToDelete.heatCycleId))
      .limit(1);

    if (!heatCycle) {
      return errorResponse('Associated heat cycle not found', 404);
    }

    // Delete the reading
    await db
      .delete(heatCycleProgesteroneReadings)
      .where(eq(heatCycleProgesteroneReadings.id, id));

    // Recalculate heat cycle estimates with remaining readings
    const remainingReadings = await db
      .select({
        day: heatCycleProgesteroneReadings.day,
        progesteroneLevel: heatCycleProgesteroneReadings.progesteroneLevel,
      })
      .from(heatCycleProgesteroneReadings)
      .where(eq(heatCycleProgesteroneReadings.heatCycleId, readingToDelete.heatCycleId))
      .orderBy(heatCycleProgesteroneReadings.day);

    // Estimate ovulation day from remaining readings
    const estimatedOvulationDay = remainingReadings.length > 0
      ? estimateOvulationDay(
          remainingReadings.map(r => ({
            day: r.day,
            progesteroneLevel: parseFloat(r.progesteroneLevel),
          }))
        )
      : null;

    // Calculate estimated whelping date if ovulation is detected
    let estimatedWhelpingDate: Date | null = null;
    let estimatedOvulationDate: Date | null = null;
    
    if (estimatedOvulationDay) {
      const { addDays } = await import('date-fns');
      estimatedOvulationDate = addDays(new Date(heatCycle.startDate), estimatedOvulationDay - 1);
      estimatedWhelpingDate = calculateWhelpingDate(estimatedOvulationDate);
    }

    // Find the latest reading day for currentDay (or reset to 1 if no readings)
    const latestDay = remainingReadings.length > 0
      ? Math.max(...remainingReadings.map(r => r.day))
      : 1;

    // Update heat cycle
    await db
      .update(heatCycles)
      .set({
        currentDay: latestDay,
        estimatedOvulationDay: estimatedOvulationDay || undefined,
        estimatedOvulationDate: estimatedOvulationDate?.toISOString().split('T')[0] || null,
        estimatedWhelpingDate: estimatedWhelpingDate?.toISOString().split('T')[0] || null,
        updatedAt: new Date(),
      })
      .where(eq(heatCycles.id, readingToDelete.heatCycleId));

    return successResponse({
      message: 'Reading deleted successfully',
      remainingReadings: remainingReadings.length,
    });

  } catch (error) {
    console.error('Error in DELETE /api/progesterone-readings/[id]:', error);
    return serverErrorResponse('Failed to delete reading');
  }
}
