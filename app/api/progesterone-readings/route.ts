import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { 
  heatCycles, 
  heatCycleProgesteroneReadings, 
  heatCycleReminders,
  breedingRecords,
  animals
} from '@/lib/db/schema';
import { tasks } from '@/lib/db/schema/tasks';
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
import { addDays, differenceInDays, format } from 'date-fns';
import { z } from 'zod';
import {
  detectPhase,
  calculateNextTest,
  isBreedingWindowOpen,
  estimateOvulationDay,
  calculateWhelpingDate
} from '@/lib/utils/progesterone';
import { 
  createBreedingWindowNotification,
  createDailyTestNotification,
  createOvulationNotification 
} from '@/lib/services/notification-creator';
import type {
  CreateProgesteroneReadingRequest,
  CreateProgesteroneReadingResponse
} from '@/lib/types/heat-cycle';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createReadingSchema = z.object({
  heatCycleId: z.string().uuid('Invalid heat cycle ID'),
  day: z.number().int().min(5, 'First progesterone test should be on Day 5 or later').max(30).optional(), // Optional - will be auto-calculated if not provided
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  progesteroneLevel: z.number()
    .min(0.5, 'Progesterone level must be at least 0.5 ng/mL. Values below this are typically measurement errors.')
    .max(100, 'Progesterone level cannot exceed 100 ng/mL. Please verify your reading.'),
  unit: z.enum(['nanograms', 'nanomoles']).optional(),
  laboratory: z.enum(['VIDAS', 'IDEXX', 'IMMULITE', 'RIA', 'ELISA', 'OTHER']).optional(),
  notes: z.string().optional(),
  markAsMating: z.boolean().optional(),
  markAsLastMating: z.boolean().optional(),
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
      notes,
      markAsMating = false,
      markAsLastMating = false,
    } = validation.data;

    // Verify the heat cycle belongs to the breeder
    const [heatCycle] = await db
      .select()
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.id, heatCycleId),
          eq(heatCycles.breederId, session.user.id)
        )
      )
      .limit(1);

    if (!heatCycle) {
      return errorResponse('Heat cycle not found or does not belong to you', 404);
    }

    // Block adding readings to completed or cancelled cycles
    if (heatCycle.status !== 'active') {
      const statusMessage = heatCycle.status === 'completed' 
        ? 'This heat cycle has been completed. You cannot add new progesterone readings to a completed cycle.'
        : 'This heat cycle has been cancelled. You cannot add new progesterone readings to a cancelled cycle.';
      return errorResponse(statusMessage, 400);
    }

    // Auto-calculate day if not provided
    // Day = difference between test date and start date + 1
    const calculatedDay: number = day ?? (() => {
      const daysDiff = differenceInDays(new Date(testDate), new Date(heatCycle.startDate));
      return daysDiff + 1;
    })();
    
    // Validate calculated day
    if (calculatedDay < 1) {
      return errorResponse('Test date cannot be before the heat cycle start date', 400);
    }
    if (calculatedDay < 5) {
      return errorResponse(
        'First progesterone test should be on Day 5 or later. Day 1 is the start of season (first blood) and does not require a progesterone reading.',
        400
      );
    }
    if (calculatedDay > 30) {
      return errorResponse('Test date is too far from the start date (max 30 days)', 400);
    }

    // Check for duplicate reading on the same day
    const [existingReading] = await db
      .select()
      .from(heatCycleProgesteroneReadings)
      .where(
        and(
          eq(heatCycleProgesteroneReadings.heatCycleId, heatCycleId),
          eq(heatCycleProgesteroneReadings.day, calculatedDay)
        )
      )
      .limit(1);

    if (existingReading) {
      return errorResponse(
        `A reading already exists for Day ${calculatedDay}. Please edit or delete the existing reading first.`,
        409
      );
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
        breederId: session.user.id,
        day: calculatedDay,
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

    // Create breeding record if marked as mating
    let breedingRecordId: string | null = null;
    let pregnancyTasksResult: any = null;
    if (markAsMating || markAsLastMating) {
      try {
        const [breedingRecord] = await db
          .insert(breedingRecords)
          .values({
            heatCycleId,
            breederId: session.user.id,
            breedingDate: testDate,
            breedingDay: calculatedDay,
            breedingMethod: 'natural', // Default, can be updated later
            progesteroneLevelAtBreeding: progesteroneLevel.toString(),
            isLastMating: markAsLastMating,
            notes: markAsLastMating 
              ? 'Last mating - pregnancy screening tasks will be generated' 
              : 'Mating recorded from progesterone reading',
          })
          .returning();
        
        breedingRecordId = breedingRecord.id;

        // If marked as last mating, auto-generate pregnancy screening tasks
        if (markAsLastMating) {
          try {
            const { generatePregnancyScreeningTasks } = await import('@/lib/services/pregnancy-screening-tasks');
            const result = await generatePregnancyScreeningTasks(breedingRecord.id, session.user.id);
            pregnancyTasksResult = result;
            
            if (result.success) {
              console.log(`✅ Generated ${result.tasksCreated} pregnancy screening tasks for breeding ${breedingRecord.id}`);
            } else {
              console.error('❌ Failed to generate pregnancy screening tasks:', result.error);
            }
          } catch (taskGenError) {
            console.error('Error generating pregnancy screening tasks:', taskGenError);
          }
        }
      } catch (breedingError) {
        console.error('Error creating breeding record:', breedingError);
        // Don't fail the whole request if breeding record fails
      }
    }

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
      .update(heatCycles)
      .set({
        currentDay: calculatedDay,
        estimatedOvulationDay: estimatedOvulationDay || undefined,
        estimatedOvulationDate: estimatedOvulationDate?.toISOString().split('T')[0],
        estimatedWhelpingDate: estimatedWhelpingDate?.toISOString().split('T')[0],
        updatedAt: new Date(),
      })
      .where(eq(heatCycles.id, heatCycleId))
      .returning();

    // Check if breeding window is open
    const breedingWindowOpen = isBreedingWindowOpen(progesteroneLevel);

    // Get bitch name for task/reminder
    const [bitchData] = await db
      .select({ name: animals.name })
      .from(animals)
      .where(eq(animals.id, heatCycle.bitchId))
      .limit(1);
    
    const bitchName = bitchData?.name || 'Unknown';

    // Create reminder for next test
    try {
      await db.insert(heatCycleReminders).values({
        heatCycleId,
        breederId: session.user.id,
        reminderType: nextTest.days === 1 ? 'daily_test' : 'test_due',
        dueDate: nextTest.date.toISOString().split('T')[0],
        dueTime: '09:00:00',
        title: `Day ${calculatedDay + nextTest.days} Progesterone Test Due`,
        message: nextTest.reason,
        priority: nextTest.days === 1 ? 'high' : 'normal',
        channels: ['email', 'in_app'],
      });
    } catch (reminderError) {
      console.error('Error creating reminder:', reminderError);
    }

    // Create task for next test
    try {
      await db.insert(tasks).values({
        userId: session.user.id,
        type: 'event',
        title: `Progesterone Test - ${bitchName} (Day ${calculatedDay + nextTest.days})`,
        description: `${nextTest.reason}. Current level: ${progesteroneLevel.toFixed(1)} ng/mL`,
        animalId: heatCycle.bitchId,
        dueDate: format(nextTest.date, 'yyyy-MM-dd'),
        dueTime: '09:00',
        priority: nextTest.days === 1 ? 'high' : 'medium',
        notes: `Heat cycle day ${calculatedDay + nextTest.days}. Heat Cycle ID: ${heatCycleId}`,
        taskData: {
          eventType: 'progesterone_test',
          progesteroneTestData: {
            heatCycleId,
            cycleDay: calculatedDay + nextTest.days,
            previousLevel: progesteroneLevel,
            autoGenerated: true,
          },
        },
      });
    } catch (taskError) {
      console.error('Error creating task:', taskError);
    }

    // If breeding window is open, create breeding window reminder
    if (breedingWindowOpen && progesteroneLevel >= 15 && progesteroneLevel < 25) {
      try {
        await db.insert(heatCycleReminders).values({
          heatCycleId,
          breederId: session.user.id,
          reminderType: 'breeding_window',
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: new Date().toISOString().split('T')[1].substring(0, 8),
          title: 'Breeding Window Open!',
          message: `Optimal breeding time detected for Day ${calculatedDay}. Progesterone level: ${progesteroneLevel} ng/mL`,
          priority: 'urgent',
          channels: ['email', 'sms', 'in_app'],
        });

        // Create in-app notification
        await createBreedingWindowNotification({
          userId: session.user.id,
          bitchName: heatCycle.bitchId, // TODO: Fetch actual bitch name
          day: calculatedDay,
          progesteroneLevel,
          heatCycleId,
          breedingMethod: heatCycle.breedingMethod,
        });
      } catch (breedingReminderError) {
        console.error('Error creating breeding reminder:', breedingReminderError);
      }
    }

    // Create daily test notification if levels are rising (>10 ng/mL)
    if (progesteroneLevel >= 10 && nextTest.days === 1) {
      try {
        await createDailyTestNotification({
          userId: session.user.id,
          bitchName: heatCycle.bitchId, // TODO: Fetch actual bitch name
          day: calculatedDay,
          lastLevel: progesteroneLevel,
          heatCycleId,
        });
      } catch (error) {
        console.error('Error creating daily test notification:', error);
      }
    }

    // Create ovulation notification if detected
    if (phaseInfo.phase === 'Ovulation' && updatedCycle.estimatedOvulationDay === calculatedDay) {
      try {
        await createOvulationNotification({
          userId: session.user.id,
          bitchName: heatCycle.bitchId, // TODO: Fetch actual bitch name
          day: calculatedDay,
          heatCycleId,
        });
      } catch (error) {
        console.error('Error creating ovulation notification:', error);
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
      breedingRecordCreated: breedingRecordId !== null,
      breedingRecordId: breedingRecordId || undefined,
      isLastMating: markAsLastMating,
      pregnancyTasksGenerated: pregnancyTasksResult?.success || false,
      pregnancyTasksCount: pregnancyTasksResult?.tasksCreated || 0,
      pregnancyTasks: pregnancyTasksResult?.tasks || [],
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
