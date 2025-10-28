import { db } from '@/lib/db';
import { heatCycleReminders, users, breederProfiles, kycVerifications } from '@/lib/db/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import {
  sendProgesteroneReminderEmail,
  sendBreedingWindowEmail,
  sendDailyTestReminderEmail,
} from './email';
import {
  sendProgesteroneReminderSMS,
  sendBreedingWindowSMS,
  sendDailyTestReminderSMS,
  formatPhoneNumber,
  isValidPhoneNumber,
} from './sms';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'in_app';

export interface NotificationData {
  reminderId: string;
  breederId: string;
  breederEmail: string;
  breederPhone?: string;
  breederName: string;
  bitchName: string;
  reminderType: string;
  title: string;
  message: string;
  dueDate: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

// ============================================================================
// SEND NOTIFICATIONS
// ============================================================================

/**
 * Send a single notification via specified channels
 */
export async function sendNotification(data: NotificationData): Promise<{
  email: boolean;
  sms: boolean;
  inApp: boolean;
}> {
  const results = {
    email: false,
    sms: false,
    inApp: true, // In-app is always successful (stored in DB)
  };

  // Send email if requested
  if (data.channels.includes('email')) {
    try {
      results.email = await sendProgesteroneReminderEmail(data.breederEmail, {
        breederName: data.breederName,
        bitchName: data.bitchName,
        reminderType: data.reminderType,
        title: data.title,
        message: data.message,
        dueDate: data.dueDate,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Send SMS if requested and phone number is available
  if (data.channels.includes('sms') && data.breederPhone) {
    try {
      const formattedPhone = formatPhoneNumber(data.breederPhone);
      
      if (isValidPhoneNumber(formattedPhone)) {
        results.sms = await sendProgesteroneReminderSMS(formattedPhone, {
          bitchName: data.bitchName,
          day: data.metadata?.day || 0,
          dueDate: data.dueDate,
        });
      } else {
        console.error('Invalid phone number format:', data.breederPhone);
      }
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  return results;
}

/**
 * Send breeding window alert
 */
export async function sendBreedingAlert(data: {
  breederId: string;
  breederEmail: string;
  breederPhone?: string;
  breederName: string;
  bitchName: string;
  progesteroneLevel: number;
  day: number;
  breedingDates: string[];
  whelpingDate?: string;
  channels: NotificationChannel[];
}): Promise<{ email: boolean; sms: boolean }> {
  const results = {
    email: false,
    sms: false,
  };

  // Send email
  if (data.channels.includes('email')) {
    try {
      results.email = await sendBreedingWindowEmail(data.breederEmail, {
        breederName: data.breederName,
        bitchName: data.bitchName,
        progesteroneLevel: data.progesteroneLevel,
        day: data.day,
        breedingDates: data.breedingDates,
        whelpingDate: data.whelpingDate,
      });
    } catch (error) {
      console.error('Error sending breeding window email:', error);
    }
  }

  // Send SMS
  if (data.channels.includes('sms') && data.breederPhone) {
    try {
      const formattedPhone = formatPhoneNumber(data.breederPhone);
      
      if (isValidPhoneNumber(formattedPhone)) {
        results.sms = await sendBreedingWindowSMS(formattedPhone, {
          bitchName: data.bitchName,
          progesteroneLevel: data.progesteroneLevel,
          day: data.day,
        });
      }
    } catch (error) {
      console.error('Error sending breeding window SMS:', error);
    }
  }

  return results;
}

/**
 * Send daily test reminder
 */
export async function sendDailyTestAlert(data: {
  breederId: string;
  breederEmail: string;
  breederPhone?: string;
  breederName: string;
  bitchName: string;
  day: number;
  lastLevel: number;
  channels: NotificationChannel[];
}): Promise<{ email: boolean; sms: boolean }> {
  const results = {
    email: false,
    sms: false,
  };

  // Send email
  if (data.channels.includes('email')) {
    try {
      results.email = await sendDailyTestReminderEmail(data.breederEmail, {
        breederName: data.breederName,
        bitchName: data.bitchName,
        day: data.day,
        lastLevel: data.lastLevel,
      });
    } catch (error) {
      console.error('Error sending daily test email:', error);
    }
  }

  // Send SMS
  if (data.channels.includes('sms') && data.breederPhone) {
    try {
      const formattedPhone = formatPhoneNumber(data.breederPhone);
      
      if (isValidPhoneNumber(formattedPhone)) {
        results.sms = await sendDailyTestReminderSMS(formattedPhone, {
          bitchName: data.bitchName,
          day: data.day,
          lastLevel: data.lastLevel,
        });
      }
    } catch (error) {
      console.error('Error sending daily test SMS:', error);
    }
  }

  return results;
}

// ============================================================================
// PROCESS PENDING REMINDERS (CRON JOB)
// ============================================================================

/**
 * Process all pending reminders that are due
 * This should be called by a cron job every hour
 */
export async function processPendingReminders(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all unsent reminders that are due today or earlier
    const dueReminders = await db
      .select({
        id: heatCycleReminders.id,
        heatCycleId: heatCycleReminders.heatCycleId,
        breederId: heatCycleReminders.breederId,
        reminderType: heatCycleReminders.reminderType,
        dueDate: heatCycleReminders.dueDate,
        title: heatCycleReminders.title,
        message: heatCycleReminders.message,
        channels: heatCycleReminders.channels,
        priority: heatCycleReminders.priority,
      })
      .from(heatCycleReminders)
      .where(
        and(
          lte(heatCycleReminders.dueDate, today),
          eq(heatCycleReminders.sent, false)
        )
      );

    let successful = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      try {
        // Get breeder details with phone from profile or KYC
        const [breeder] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            publicPhone: breederProfiles.publicPhone,
            kycPhone: kycVerifications.phoneNumber,
          })
          .from(users)
          .leftJoin(breederProfiles, eq(users.id, breederProfiles.userId))
          .leftJoin(kycVerifications, eq(users.id, kycVerifications.userId))
          .where(eq(users.id, reminder.breederId))
          .limit(1);

        if (!breeder) {
          console.error(`Breeder not found for reminder ${reminder.id}`);
          failed++;
          continue;
        }

        // Use public phone from profile, fallback to KYC phone
        const phone = breeder.publicPhone || breeder.kycPhone || undefined;

        // TODO: Get bitch name from heat cycle
        // For now, use placeholder
        const bitchName = 'Your Bitch'; // This should be fetched from the heat cycle

        // Send notification
        const results = await sendNotification({
          reminderId: reminder.id,
          breederId: breeder.id,
          breederEmail: breeder.email || '',
          breederPhone: phone,
          breederName: breeder.name || 'Breeder',
          bitchName,
          reminderType: reminder.reminderType,
          title: reminder.title,
          message: reminder.message,
          dueDate: reminder.dueDate,
          channels: reminder.channels as NotificationChannel[],
        });

        // Mark reminder as sent
        await db
          .update(heatCycleReminders)
          .set({
            sent: true,
            sentAt: new Date(),
          })
          .where(eq(heatCycleReminders.id, reminder.id));

        successful++;
        console.log(`✅ Reminder ${reminder.id} sent successfully`);
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        failed++;
      }
    }

    return {
      processed: dueReminders.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error('Error processing pending reminders:', error);
    return {
      processed: 0,
      successful: 0,
      failed: 0,
    };
  }
}

// ============================================================================
// MARK REMINDER AS READ (IN-APP)
// ============================================================================

/**
 * Mark an in-app reminder as read
 */
export async function markReminderAsRead(reminderId: string): Promise<boolean> {
  try {
    await db
      .update(heatCycleReminders)
      .set({
        sent: true,
        sentAt: new Date(),
      })
      .where(eq(heatCycleReminders.id, reminderId));

    return true;
  } catch (error) {
    console.error('Error marking reminder as read:', error);
    return false;
  }
}

// ============================================================================
// GET UNREAD REMINDERS (IN-APP)
// ============================================================================

/**
 * Get all unread in-app reminders for a breeder
 */
export async function getUnreadReminders(breederId: string): Promise<any[]> {
  try {
    const reminders = await db
      .select()
      .from(heatCycleReminders)
      .where(
        and(
          eq(heatCycleReminders.breederId, breederId),
          eq(heatCycleReminders.sent, false)
        )
      )
      .orderBy(heatCycleReminders.dueDate);

    return reminders;
  } catch (error) {
    console.error('Error fetching unread reminders:', error);
    return [];
  }
}
