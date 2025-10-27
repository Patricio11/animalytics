import { 
  pgTable, 
  text, 
  timestamp, 
  decimal, 
  date, 
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum
} from 'drizzle-orm/pg-core';
import { animals } from './animals';
import { users } from './users';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const heatCycleStatusEnum = pgEnum('heat_cycle_status', ['active', 'completed', 'cancelled']);
export const heatCycleBreedingMethodEnum = pgEnum('heat_cycle_breeding_method', ['natural_ai', 'frozen']);
export const progesteroneUnitEnum = pgEnum('progesterone_unit', ['nanograms', 'nanomoles']);
export const laboratoryTypeEnum = pgEnum('laboratory_type', ['VIDAS', 'IDEXX']);
export const breedingRecordMethodEnum = pgEnum('breeding_record_method', [
  'natural',
  'ai_fresh',
  'ai_chilled',
  'ai_frozen',
  'tci',
  'surgical'
]);
export const heatCycleReminderTypeEnum = pgEnum('heat_cycle_reminder_type', [
  'test_due',
  'breeding_window',
  'daily_test',
  'whelping_approaching'
]);
export const reminderPriorityEnum = pgEnum('reminder_priority', ['low', 'normal', 'high', 'urgent']);

// ============================================================================
// HEAT CYCLES TABLE
// ============================================================================

export const heatCyclesTable = pgTable('heat_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bitchId: uuid('bitch_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  
  // Cycle Information
  startDate: date('start_date').notNull(), // Day 1 of heat
  endDate: date('end_date'),
  currentDay: integer('current_day').notNull().default(1),
  status: heatCycleStatusEnum('status').notNull().default('active'),
  
  // Breeding Information
  breedingMethod: heatCycleBreedingMethodEnum('breeding_method').notNull(),
  estimatedOvulationDay: integer('estimated_ovulation_day'),
  estimatedOvulationDate: date('estimated_ovulation_date'),
  estimatedWhelpingDate: date('estimated_whelping_date'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type HeatCycle = typeof heatCyclesTable.$inferSelect;
export type NewHeatCycle = typeof heatCyclesTable.$inferInsert;

// ============================================================================
// PROGESTERONE READINGS TABLE
// ============================================================================

export const heatCycleProgesteroneReadings = pgTable('heat_cycle_progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id, { onDelete: 'cascade' }).notNull(),
  
  // Reading Information
  day: integer('day').notNull(), // 1-30
  testDate: date('test_date').notNull(),
  progesteroneLevel: decimal('progesterone_level', { precision: 5, scale: 2 }).notNull(),
  unit: progesteroneUnitEnum('unit').notNull().default('nanograms'),
  laboratory: laboratoryTypeEnum('laboratory').default('VIDAS'),
  
  // Analysis Results
  phase: text('phase'),
  phaseColor: text('phase_color'),
  nextTestDays: integer('next_test_days'),
  nextTestDate: date('next_test_date'),
  nextTestReason: text('next_test_reason'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type HeatCycleProgesteroneReading = typeof heatCycleProgesteroneReadings.$inferSelect;
export type NewHeatCycleProgesteroneReading = typeof heatCycleProgesteroneReadings.$inferInsert;

// ============================================================================
// BREEDING RECORDS TABLE
// ============================================================================

export const breedingRecords = pgTable('breeding_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id, { onDelete: 'cascade' }).notNull(),
  
  // Breeding Information
  breedingDate: date('breeding_date').notNull(),
  breedingTime: text('breeding_time'), // HH:MM:SS format
  studId: uuid('stud_id').references(() => animals.id, { onDelete: 'set null' }),
  studName: text('stud_name'),
  studRegistration: text('stud_registration'),
  
  // Method Details
  method: breedingRecordMethodEnum('method').notNull(),
  frozenSemenBatchId: uuid('frozen_semen_batch_id'), // Reference to frozen_semen_batches if needed
  
  // Success Tracking
  tieDurationMinutes: integer('tie_duration_minutes'),
  successful: boolean('successful'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type NewBreedingRecord = typeof breedingRecords.$inferInsert;

// ============================================================================
// PROGESTERONE REMINDERS TABLE
// ============================================================================

export const progesteroneReminders = pgTable('progesterone_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCyclesTable.id, { onDelete: 'cascade' }).notNull(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Reminder Information
  reminderType: heatCycleReminderTypeEnum('reminder_type').notNull(),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time').notNull().default('09:00:00'),
  
  // Delivery Status
  sent: boolean('sent').notNull().default(false),
  sentAt: timestamp('sent_at'),
  channels: jsonb('channels').notNull().$type<('email' | 'sms' | 'in_app')[]>().default(['in_app']),
  
  // Content
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: reminderPriorityEnum('priority').notNull().default('normal'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProgesteroneReminder = typeof progesteroneReminders.$inferSelect;
export type NewProgesteroneReminder = typeof progesteroneReminders.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const heatCyclesTableRelations = relations(heatCyclesTable, ({ one, many }) => ({
  breeder: one(users, {
    fields: [heatCyclesTable.breederId],
    references: [users.id],
  }),
  bitch: one(animals, {
    fields: [heatCyclesTable.bitchId],
    references: [animals.id],
  }),
  readings: many(heatCycleProgesteroneReadings),
  breedingRecords: many(breedingRecords),
  reminders: many(progesteroneReminders),
}));

export const heatCycleProgesteroneReadingsRelations = relations(heatCycleProgesteroneReadings, ({ one }) => ({
  heatCycle: one(heatCyclesTable, {
    fields: [heatCycleProgesteroneReadings.heatCycleId],
    references: [heatCyclesTable.id],
  }),
}));

export const breedingRecordsRelations = relations(breedingRecords, ({ one }) => ({
  heatCycle: one(heatCyclesTable, {
    fields: [breedingRecords.heatCycleId],
    references: [heatCyclesTable.id],
  }),
  stud: one(animals, {
    fields: [breedingRecords.studId],
    references: [animals.id],
  }),
}));

export const progesteroneRemindersRelations = relations(progesteroneReminders, ({ one }) => ({
  heatCycle: one(heatCyclesTable, {
    fields: [progesteroneReminders.heatCycleId],
    references: [heatCyclesTable.id],
  }),
  breeder: one(users, {
    fields: [progesteroneReminders.breederId],
    references: [users.id],
  }),
}));
