import { addDays, format } from 'date-fns';

/**
 * Utility functions for creating progesterone testing tasks and notifications
 */

interface CreateProgesteroneTaskParams {
  userId: string;
  animalId: string;
  bitchName: string;
  testDate: Date;
  cycleDay: number;
  progesteroneLevel?: number;
  heatCycleId?: string;
}

/**
 * Calculate next test date based on progesterone level
 */
export function calculateNextTestDate(progesteroneLevel: number, currentDate: Date): {
  date: Date;
  days: number;
  reason: string;
} {
  let daysToAdd: number;
  let reason: string;

  if (progesteroneLevel < 4) {
    daysToAdd = 3;
    reason = 'Level below 4 ng/mL';
  } else if (progesteroneLevel < 10) {
    daysToAdd = 2;
    reason = 'Approaching ovulation';
  } else {
    daysToAdd = 1;
    reason = 'Fertile range - test daily';
  }

  return {
    date: addDays(currentDate, daysToAdd),
    days: daysToAdd,
    reason,
  };
}

/**
 * Create a progesterone test task via API
 */
export async function createProgesteroneTestTask(params: CreateProgesteroneTaskParams): Promise<any> {
  const { animalId, bitchName, testDate, cycleDay, progesteroneLevel, heatCycleId } = params;

  // Calculate next test date
  const nextTest = progesteroneLevel !== undefined
    ? calculateNextTestDate(progesteroneLevel, testDate)
    : { date: addDays(testDate, 3), days: 3, reason: 'Initial test' };

  const taskData = {
    type: 'event' as const,
    title: `Progesterone Test - ${bitchName} (Day ${cycleDay + nextTest.days})`,
    description: `${nextTest.reason}. Current level: ${progesteroneLevel !== undefined ? `${progesteroneLevel.toFixed(1)} ng/mL` : 'Not yet tested'}`,
    animalId,
    dueDate: format(nextTest.date, 'yyyy-MM-dd'),
    dueTime: '09:00', // Default to 9 AM
    priority: 'high' as const,
    notes: `${bitchName} — heat cycle day ${cycleDay + nextTest.days}.`,
    taskData: {
      eventType: 'progesterone_test',
      title: `Progesterone Test - Day ${cycleDay + nextTest.days}`,
      time: '09:00',
      isRecurring: false,
      heatCycleId,
      cycleDay: cycleDay + nextTest.days,
      previousLevel: progesteroneLevel,
    },
  };

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create progesterone test task');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a notification for progesterone test
 */
export async function createProgesteroneTestNotification(params: {
  bitchName: string;
  day: number;
  dueDate: Date;
  progesteroneLevel?: number;
}): Promise<void> {
  const { bitchName, day, dueDate, progesteroneLevel } = params;

  const notificationData = {
    type: 'progesterone_test_due',
    title: `Progesterone Test Due - ${bitchName}`,
    message: `Time to test ${bitchName}'s progesterone level (Day ${day})${progesteroneLevel !== undefined ? `. Previous level: ${progesteroneLevel.toFixed(1)} ng/mL` : ''}`,
    priority: 'high' as const,
    category: 'breeding' as const,
    actionLabel: 'View Heat Cycle',
    metadata: {
      bitchName,
      day,
      dueDate: dueDate.toISOString(),
      progesteroneLevel,
    },
  };

  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    console.error('Failed to create progesterone test notification');
  }
}

/**
 * Create both task and notification for progesterone test
 * This is the main function to call when you need to schedule a progesterone test
 */
export async function scheduleProgesteroneTest(params: CreateProgesteroneTaskParams): Promise<{
  task: any;
  success: boolean;
}> {
  try {
    // Create the task
    const task = await createProgesteroneTestTask(params);

    // Calculate next test date for notification
    const nextTest = params.progesteroneLevel !== undefined
      ? calculateNextTestDate(params.progesteroneLevel, params.testDate)
      : { date: addDays(params.testDate, 3), days: 3, reason: 'Initial test' };

    // Create notification (don't await, fire and forget)
    createProgesteroneTestNotification({
      bitchName: params.bitchName,
      day: params.cycleDay + nextTest.days,
      dueDate: nextTest.date,
      progesteroneLevel: params.progesteroneLevel,
    }).catch(err => console.error('Failed to create notification:', err));

    return {
      task,
      success: true,
    };
  } catch (error) {
    console.error('Error scheduling progesterone test:', error);
    throw error;
  }
}

/**
 * Create initial Day 5 test task when starting a heat cycle
 */
export async function scheduleInitialProgesteroneTest(params: {
  userId: string;
  animalId: string;
  bitchName: string;
  startDate: Date;
  heatCycleId: string;
}): Promise<any> {
  const { userId, animalId, bitchName, startDate, heatCycleId } = params;

  // Day 5 is 4 days after start date (Day 1)
  const day5Date = addDays(startDate, 4);

  return scheduleProgesteroneTest({
    userId,
    animalId,
    bitchName,
    testDate: startDate,
    cycleDay: 1,
    heatCycleId,
  });
}
