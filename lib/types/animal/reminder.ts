/**
 * Animal reminder type definitions
 */

// ============================================================================
// REMINDER TYPES
// ============================================================================

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CustomReminder {
  id: string;
  title: string;
  frequency: ReminderFrequency;
  nextDate: string;
}

export interface ReminderSettings {
  enabled: boolean;
  vaccinations: boolean;
  vetCheckups: boolean;
  heatCycles: boolean; // bitches only
  seasonTracking: boolean; // bitches only
  feedingSchedule: boolean;
  customReminders: CustomReminder[];
}
