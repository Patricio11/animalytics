/**
 * Pregnancy Screening Task Generator Service
 *
 * Automatically generates pregnancy screening tasks after the LAST MATING ONLY.
 *
 * Timeline:
 * - Day 24-28: Ultrasound + Blood Test (Hematology) + Progesterone
 * - Day 30: Progesterone plateau check
 * - Day 45: Mid-pregnancy checkup
 * - Day 50: X-ray for puppy count
 * - Day 55: Pre-whelping preparation
 * - Day 58: Whelping watch begins (expected whelping Day 58-64)
 */

import { db } from '@/lib/db';
import { tasks, breedingRecords, heatCycles, animals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { addDays, format } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface PregnancyScreeningTask {
  type: 'ultrasound' | 'blood_test' | 'xray' | 'checkup';
  title: string;
  description: string;
  daysPostMating: number;
  priority: 'low' | 'medium' | 'high';
  eventType: 'pregnancy_ultrasound' | 'pregnancy_blood_test' | 'pregnancy_xray' | 'pregnancy_checkup';
}

export interface TaskGenerationResult {
  success: boolean;
  tasksCreated: number;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
  }>;
  error?: string;
}

// ============================================================================
// PREGNANCY SCREENING TIMELINE
// ============================================================================

const PREGNANCY_SCREENING_TIMELINE: PregnancyScreeningTask[] = [
  {
    type: 'ultrasound',
    title: 'Pregnancy Scan & Blood Work Due',
    description: 'Between 24 and 28 days post-mating — book an ultrasound scan, hematology (blood test), and progesterone test to confirm pregnancy and check hormone levels.',
    daysPostMating: 25, // Day 25 — middle of the 24-28 window
    priority: 'high',
    eventType: 'pregnancy_ultrasound',
  },
  {
    type: 'checkup',
    title: 'Progesterone Plateau Check',
    description: 'Day 30 progesterone follow-up. If P4 plateaus at 21-28 ng/mL = PREGNANT (hormone sustaining pregnancy). If P4 drops below 5 ng/mL = NOT PREGNANT (no implantation).',
    daysPostMating: 30,
    priority: 'high',
    eventType: 'pregnancy_checkup',
  },
  {
    type: 'checkup',
    title: 'Mid-Pregnancy Checkup',
    description: 'Mid-pregnancy veterinary visit. Monitor the bitch\'s health, weight, nutrition, and fetal development.',
    daysPostMating: 45,
    priority: 'medium',
    eventType: 'pregnancy_checkup',
  },
  {
    type: 'xray',
    title: 'X-Ray for Puppy Count',
    description: 'X-ray to count puppies and assess skeletal development. Bones are calcified enough for accurate count after day 45.',
    daysPostMating: 50,
    priority: 'medium',
    eventType: 'pregnancy_xray',
  },
  {
    type: 'checkup',
    title: 'Pre-Whelping Preparation',
    description: 'Final vet checkup before whelping. Confirm presentation, prepare whelping area, and ensure emergency supplies are ready.',
    daysPostMating: 55,
    priority: 'high',
    eventType: 'pregnancy_checkup',
  },
  {
    type: 'checkup',
    title: 'Whelping Watch — Expected Due Date',
    description: 'Whelping is expected between day 58 and 64 from the last mating. Monitor closely for signs of labour: temperature drop, nesting behaviour, loss of appetite, restlessness.',
    daysPostMating: 60, // Middle of the 58-64 window
    priority: 'high',
    eventType: 'pregnancy_checkup',
  },
];

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Generate pregnancy screening tasks for a breeding record marked as last mating
 */
export async function generatePregnancyScreeningTasks(
  breedingRecordId: string,
  userId: string
): Promise<TaskGenerationResult> {
  try {
    // 1. Get the breeding record
    const [breedingRecord] = await db
      .select()
      .from(breedingRecords)
      .where(
        and(
          eq(breedingRecords.id, breedingRecordId),
          eq(breedingRecords.breederId, userId)
        )
      );

    if (!breedingRecord) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Breeding record not found',
      };
    }

    // 2. Check if tasks already generated
    if (breedingRecord.pregnancyScreeningTasksGenerated) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Pregnancy screening tasks already generated for this breeding',
      };
    }

    // 3. Get heat cycle and bitch information
    const [heatCycle] = await db
      .select()
      .from(heatCycles)
      .where(eq(heatCycles.id, breedingRecord.heatCycleId));

    if (!heatCycle) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Heat cycle not found',
      };
    }

    const [bitch] = await db
      .select({
        id: animals.id,
        name: animals.name,
        registrationNumber: animals.registrationNumber,
      })
      .from(animals)
      .where(eq(animals.id, heatCycle.bitchId));

    if (!bitch) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Bitch not found',
      };
    }

    // 4. DELETE any existing pregnancy screening tasks for this heat cycle
    // This prevents duplicates if user marks different breedings as "last mating"
    await db
      .delete(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.generatedBy, 'pregnancy_screening_generator')
        )
      );

    // Also delete tasks from any other breeding records in this heat cycle
    const allBreedingsInCycle = await db
      .select({ id: breedingRecords.id })
      .from(breedingRecords)
      .where(eq(breedingRecords.heatCycleId, breedingRecord.heatCycleId));

    for (const breeding of allBreedingsInCycle) {
      await db
        .delete(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.generationBatchId, `pregnancy_${breeding.id}`)
          )
        );
    }

    // 5. Generate tasks based on timeline (ONLY for LAST MATING)
    const lastMatingDate = new Date(breedingRecord.breedingDate);
    const createdTasks: Array<{
      id: string;
      title: string;
      dueDate: string;
      type: string;
    }> = [];

    for (const screeningTask of PREGNANCY_SCREENING_TIMELINE) {
      const dueDate = addDays(lastMatingDate, screeningTask.daysPostMating);
      
      const [newTask] = await db
        .insert(tasks)
        .values({
          userId,
          animalId: bitch.id,
          type: 'event',
          title: `${screeningTask.title} — ${bitch.name}`,
          description: `${bitch.name} was mated on ${format(lastMatingDate, 'MMMM d, yyyy')}. ${screeningTask.description}\n\nDue: Day ${screeningTask.daysPostMating} post-mating (${format(dueDate, 'EEEE, MMMM d, yyyy')})`,
          dueDate: format(dueDate, 'yyyy-MM-dd'),
          dueTime: '09:00', // Default to 9 AM
          priority: screeningTask.priority,
          status: 'pending',
          isAutoGenerated: true,
          generatedBy: 'pregnancy_screening_generator',
          generationBatchId: `pregnancy_${breedingRecordId}`,
          taskData: {
            eventType: screeningTask.eventType,
            pregnancyScreeningData: {
              heatCycleId: heatCycle.id,
              breedingRecordId: breedingRecord.id,
              lastMatingDate: breedingRecord.breedingDate,
              daysPostMating: screeningTask.daysPostMating,
              screeningType: screeningTask.type,
              autoGenerated: true,
              generatedDate: new Date().toISOString(),
            },
          },
          notes: `${bitch.name} — last mating ${format(lastMatingDate, 'MMM dd, yyyy')}. Auto-generated pregnancy task.`,
        })
        .returning();

      createdTasks.push({
        id: newTask.id,
        title: newTask.title,
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        type: screeningTask.type,
      });
    }

    // 6. Mark breeding record as tasks generated
    await db
      .update(breedingRecords)
      .set({
        pregnancyScreeningTasksGenerated: true,
        pregnancyScreeningTasksGeneratedAt: new Date(),
      })
      .where(eq(breedingRecords.id, breedingRecordId));

    return {
      success: true,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
    };
  } catch (error) {
    console.error('Error generating pregnancy screening tasks:', error);
    return {
      success: false,
      tasksCreated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Detect if a breeding record is the last mating in the breeding window
 * and automatically generate pregnancy screening tasks
 */
export async function checkAndGenerateTasksForLastMating(
  heatCycleId: string,
  userId: string
): Promise<TaskGenerationResult> {
  try {
    // 1. Get all breeding records for this heat cycle, ordered by date
    const breedingRecordsForCycle = await db
      .select()
      .from(breedingRecords)
      .where(
        and(
          eq(breedingRecords.heatCycleId, heatCycleId),
          eq(breedingRecords.breederId, userId)
        )
      )
      .orderBy(desc(breedingRecords.breedingDate));

    if (breedingRecordsForCycle.length === 0) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'No breeding records found for this heat cycle',
      };
    }

    // 2. Get the most recent breeding record (last mating)
    const lastBreedingRecord = breedingRecordsForCycle[0];

    // 3. Check if it's been at least 2 days since last mating
    // (to ensure it's truly the last one in the breeding window)
    const daysSinceLastMating = Math.floor(
      (new Date().getTime() - new Date(lastBreedingRecord.breedingDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastMating < 2) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Too soon to determine if this is the last mating. Wait at least 2 days.',
      };
    }

    // 4. Mark as last mating if not already marked
    if (!lastBreedingRecord.isLastMating) {
      await db
        .update(breedingRecords)
        .set({ isLastMating: true })
        .where(eq(breedingRecords.id, lastBreedingRecord.id));
    }

    // 5. Generate pregnancy screening tasks
    return await generatePregnancyScreeningTasks(lastBreedingRecord.id, userId);
  } catch (error) {
    console.error('Error checking and generating tasks for last mating:', error);
    return {
      success: false,
      tasksCreated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually mark a breeding record as the last mating and generate tasks
 * IMPORTANT: Only ONE breeding per heat cycle should be marked as "last mating"
 */
export async function markAsLastMatingAndGenerateTasks(
  breedingRecordId: string,
  userId: string
): Promise<TaskGenerationResult> {
  try {
    // 1. Get the breeding record to find its heat cycle
    const [breedingRecord] = await db
      .select()
      .from(breedingRecords)
      .where(
        and(
          eq(breedingRecords.id, breedingRecordId),
          eq(breedingRecords.breederId, userId)
        )
      );

    if (!breedingRecord) {
      return {
        success: false,
        tasksCreated: 0,
        tasks: [],
        error: 'Breeding record not found',
      };
    }

    // 2. UNMARK all other breeding records in this heat cycle as "last mating"
    await db
      .update(breedingRecords)
      .set({ isLastMating: false })
      .where(
        and(
          eq(breedingRecords.heatCycleId, breedingRecord.heatCycleId),
          eq(breedingRecords.breederId, userId)
        )
      );

    // 3. Mark THIS breeding record as the last mating
    await db
      .update(breedingRecords)
      .set({ isLastMating: true })
      .where(eq(breedingRecords.id, breedingRecordId));

    // 4. Generate tasks (this will also delete old tasks)
    return await generatePregnancyScreeningTasks(breedingRecordId, userId);
  } catch (error) {
    console.error('Error marking as last mating and generating tasks:', error);
    return {
      success: false,
      tasksCreated: 0,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get pregnancy screening tasks for a breeding record
 */
export async function getPregnancyScreeningTasks(
  breedingRecordId: string,
  userId: string
) {
  try {
    const screeningTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.generationBatchId, `pregnancy_${breedingRecordId}`)
        )
      )
      .orderBy(tasks.dueDate);

    return {
      success: true,
      tasks: screeningTasks,
    };
  } catch (error) {
    console.error('Error fetching pregnancy screening tasks:', error);
    return {
      success: false,
      tasks: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
