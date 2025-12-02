import { db } from '@/lib/db';
import { heatCycles } from '@/lib/db/schema/progesterone';
import { notifications } from '@/lib/db/schema/notifications';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { addDays, format } from 'date-fns';

/**
 * Check for upcoming heat cycles and send reminders 3 days before
 * This should be run daily via cron job
 */
export async function sendNextCycleReminders() {
  try {
    console.log('🔔 Checking for upcoming heat cycle reminders...');

    // Get today's date and 3 days from now
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    // Find completed cycles where:
    // 1. Next expected cycle date is 3 days away
    // 2. Reminder hasn't been sent yet
    const cyclesNeedingReminders = await db
      .select({
        id: heatCycles.id,
        breederId: heatCycles.breederId,
        bitchId: heatCycles.bitchId,
        nextExpectedCycleDate: heatCycles.nextExpectedCycleDate,
        bitch: {
          name: sql`(SELECT name FROM animals WHERE id = ${heatCycles.bitchId})`,
        },
      })
      .from(heatCycles)
      .where(
        and(
          eq(heatCycles.status, 'completed'),
          eq(heatCycles.nextCycleReminderSent, false),
          gte(heatCycles.nextExpectedCycleDate, todayStr),
          lte(heatCycles.nextExpectedCycleDate, threeDaysStr)
        )
      );

    console.log(`📊 Found ${cyclesNeedingReminders.length} cycles needing reminders`);

    // Create notifications for each cycle
    for (const cycle of cyclesNeedingReminders) {
      try {
        // Create in-app notification
        await db.insert(notifications).values({
          userId: cycle.breederId,
          type: 'progesterone_next_cycle',
          category: 'breeding',
          priority: 'high',
          title: `Next Heat Cycle Expected Soon`,
          message: `${cycle.bitch.name}'s next heat cycle is expected on ${format(new Date(cycle.nextExpectedCycleDate!), 'MMM dd, yyyy')} (in 3 days). Start monitoring for signs of heat.`,
          actionLabel: 'View Progesterone Tracker',
          actionUrl: '/calculators/progesterone',
          relatedEntityType: 'heat_cycle',
          relatedEntityId: cycle.id,
          metadata: JSON.stringify({
            heatCycleId: cycle.id,
            bitchId: cycle.bitchId,
            bitchName: cycle.bitch.name,
            expectedDate: cycle.nextExpectedCycleDate,
          }),
        });

        // Mark reminder as sent
        await db
          .update(heatCycles)
          .set({ nextCycleReminderSent: true })
          .where(eq(heatCycles.id, cycle.id));

        console.log(`✅ Sent reminder for ${cycle.bitch.name} (Cycle: ${cycle.id})`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for cycle ${cycle.id}:`, error);
      }
    }

    return {
      success: true,
      remindersCreated: cyclesNeedingReminders.length,
    };
  } catch (error) {
    console.error('❌ Error in sendNextCycleReminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manual trigger for testing
 * Can be called from an API route
 */
export async function triggerNextCycleReminders() {
  return await sendNextCycleReminders();
}
