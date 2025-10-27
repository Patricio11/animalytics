import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { 
  heatCyclesTable, 
  heatCycleProgesteroneReadings, 
  progesteroneReminders 
} from '@/lib/db/schema';
import { auth } from '@/lib/auth/config';
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { eq, and } from 'drizzle-orm';
import { addDays } from 'date-fns';
import { z } from 'zod';
import {
  detectPhase,
  calculateNextTest,
  isBreedingWindowOpen,
  estimateOvulationDay,
  calculateWhelpingDate
} from '@/lib/utils/progesterone';
import type {
  CreateProgesteroneReadingRequest,
  CreateProgesteroneReadingResponse
} from '@/lib/types/heat-cycle';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createReadingSchema = z.object({
  heatCycleId: z.string().uuid('Invalid heat cycle ID'),
  day: z.number().int().min(1).max(30),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  progesteroneLevel: z.number().min(0).max(50),
  unit: z.enum(['nanograms', 'nanomoles']).optional(),
  laboratory: z.enum(['VIDAS', 'IDEXX']).optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/progesterone-readings
 * Create a new progesterone reading
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createReadingSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const {
      heatCycleId,
      day,
      testDate,
      progesteroneLevel,
      unit = 'nanograms',
      laboratory = 'VIDAS',
      notes
    } = validation.data;

    // Verify the heat cycle belongs to the breeder
    const [heatCycle] = await db
      .select()
      .from(heatCyclesTable)
      .where(
        and(
          eq(heatCyclesTable.id, heatCycleId),
          eq(heatCyclesTable.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!heatCycle) {
      return errorResponse('Heat cycle not found or does not belong to you', 404);
    }

    if (heatCycle.status !== 'active') {
      return errorResponse('Cannot add readings to inactive heat cycle', 400);
    }

    // Detect phase
    const phaseInfo = detectPhase(progesteroneLevel);

    // Calculate next test recommendation
    const nextTest = calculateNextTest(progesteroneLevel, new Date(testDate));

    // Create progesterone reading
    const [reading] = await db
      .insert(heatCycleProgesteroneReadings)
      .values({
        heatCycleId,
        day,
        testDate,
        progesteroneLevel: progesteroneLevel.toString(),
        unit,
        laboratory,
        phase: phaseInfo.phase,
        phaseColor: phaseInfo.color,
        nextTestDays: nextTest.days,
        nextTestDate: nextTest.date.toISOString().split('T')[0],
        nextTestReason: nextTest.reason,
        notes,
      })
      .returning();

    // Get all readings for this cycle (including the new one)
    const allReadings = await db
      .select({
        day: heatCycleProgesteroneReadings.day,
        progesteroneLevel: heatCycleProgesteroneReadings.progesteroneLevel,
      })
      .from(heatCycleProgesteroneReadings)
      .where(eq(heatCycleProgesteroneReadings.heatCycleId, heatCycleId))
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
      estimatedOvulationDate = addDays(new Date(heatCycle.startDate), estimatedOvulationDay - 1);
      estimatedWhelpingDate = calculateWhelpingDate(estimatedOvulationDate);
    }

    // Update heat cycle with estimates and current day
    const [updatedCycle] = await db
      .update(heatCyclesTable)
      .set({
        currentDay: day,
        estimatedOvulationDay: estimatedOvulationDay || undefined,
        estimatedOvulationDate: estimatedOvulationDate?.toISOString().split('T')[0],
        estimatedWhelpingDate: estimatedWhelpingDate?.toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(eq(heatCyclesTable.id, heatCycleId))
      .returning();

    // Check if breeding window is open
    const breedingWindowOpen = isBreedingWindowOpen(progesteroneLevel);

    // Create reminder for next test
    try {
      await db.insert(progesteroneReminders).values({
        heatCycleId,
        breederId: session.user.id,
        reminderType: nextTest.days === 1 ? 'daily_test' : 'test_due',
        dueDate: nextTest.date.toISOString().split('T')[0],
        dueTime: '09:00:00',
        title: `Day ${day + nextTest.days} Progesterone Test Due`,
        message: nextTest.reason,
        priority: nextTest.days === 1 ? 'high' : 'normal',
        channels: ['email', 'in_app'],
      });
    } catch (reminderError) {
      console.error('Error creating reminder:', reminderError);
    }

    // If breeding window is open, create breeding window reminder
    if (breedingWindowOpen && progesteroneLevel >= 15 && progesteroneLevel < 25) {
      try {
        await db.insert(progesteroneReminders).values({
          heatCycleId,
          breederId: session.user.id,
          reminderType: 'breeding_window',
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: new Date().toISOString().split('T')[1].substring(0, 8),
          title: 'Breeding Window Open!',
          message: `Optimal breeding time detected for Day ${day}. Progesterone level: ${progesteroneLevel} ng/mL`,
          priority: 'urgent',
          channels: ['email', 'sms', 'in_app'],
        });
      } catch (breedingReminderError) {
        console.error('Error creating breeding reminder:', breedingReminderError);
      }
    }

    const response: CreateProgesteroneReadingResponse = {
      reading: {
        id: reading.id,
        heatCycleId: reading.heatCycleId,
        day: reading.day,
        testDate: new Date(reading.testDate),
        progesteroneLevel: parseFloat(reading.progesteroneLevel),
        unit: reading.unit,
        laboratory: reading.laboratory || 'VIDAS',
        phase: reading.phase || undefined,
        phaseColor: reading.phaseColor || undefined,
        nextTestDays: reading.nextTestDays || undefined,
        nextTestDate: reading.nextTestDate ? new Date(reading.nextTestDate) : undefined,
        nextTestReason: reading.nextTestReason || undefined,
        notes: reading.notes || undefined,
        createdAt: new Date(reading.createdAt),
      },
      nextTestRecommendation: nextTest,
      breedingWindowOpen,
      updatedCycle: {
        id: updatedCycle.id,
        breederId: updatedCycle.breederId,
        bitchId: updatedCycle.bitchId,
        startDate: new Date(updatedCycle.startDate),
        endDate: updatedCycle.endDate ? new Date(updatedCycle.endDate) : undefined,
        currentDay: updatedCycle.currentDay,
        status: updatedCycle.status,
        breedingMethod: updatedCycle.breedingMethod,
        estimatedOvulationDay: updatedCycle.estimatedOvulationDay || undefined,
        estimatedOvulationDate: updatedCycle.estimatedOvulationDate 
          ? new Date(updatedCycle.estimatedOvulationDate) 
          : undefined,
        estimatedWhelpingDate: updatedCycle.estimatedWhelpingDate 
          ? new Date(updatedCycle.estimatedWhelpingDate) 
          : undefined,
        notes: updatedCycle.notes || undefined,
        createdAt: new Date(updatedCycle.createdAt),
        updatedAt: new Date(updatedCycle.updatedAt),
      },
    };

    return createdResponse(response);

  } catch (error) {
    console.error('Error in POST /api/progesterone-readings:', error);
    return serverErrorResponse('Failed to create progesterone reading');
  }
}
