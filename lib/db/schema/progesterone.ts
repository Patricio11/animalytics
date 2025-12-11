import { 
  pgTable, 
  text, 
  timestamp, 
  decimal, 
  date, 
  integer,
  boolean,
  uuid,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { animals } from './animals';
import { users } from './users';

// ============================================================================
// ENUMS
// ============================================================================

export const heatCycleStatusEnum = pgEnum('heat_cycle_status', [
  'active', 
  'completed', 
  'cancelled'
]);

export const heatCycleBreedingMethodEnum = pgEnum('heat_cycle_breeding_method', [
  'natural_ai',      // Natural breeding or fresh AI
  'frozen'           // Frozen semen AI
]);

export const progesteroneUnitEnum = pgEnum('progesterone_unit', [
  'nanograms',       // ng/mL (most common)
  'nanomoles'        // nmol/L
]);

export const laboratoryTypeEnum = pgEnum('laboratory_type', [
  'VIDAS',           // VIDAS machine (most common)
  'IDEXX',           // IDEXX machine
  'IMMULITE',        // Immulite machine
  'RIA',             // Radioimmunoassay
  'ELISA',           // Enzyme-linked immunosorbent assay
  'OTHER'            // Other laboratory methods
]);

export const breedingRecordMethodEnum = pgEnum('breeding_record_method', [
  'natural',         // Natural tie
  'ai_fresh',        // Fresh AI
  'ai_chilled',      // Chilled semen AI
  'ai_frozen',       // Frozen semen AI
  'tci',             // Transcervical insemination
  'surgical'         // Surgical AI
]);

export const progesteroneReminderTypeEnum = pgEnum('progesterone_reminder_type', [
  'test_due',                // Regular test reminder
  'breeding_window',         // Breeding window detected
  'daily_test',              // Daily testing required
  'whelping_approaching'     // Whelping date approaching
]);

export const reminderPriorityEnum = pgEnum('reminder_priority', [
  'low',
  'normal',
  'high',
  'urgent'
]);

// ============================================================================
// HEAT CYCLES TABLE
// Main table for tracking heat cycles
// ============================================================================

export const heatCycles = pgTable('heat_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bitchId: uuid('bitch_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  
  // Cycle Information
  startDate: date('start_date').notNull(), // Day 1 of heat (first day of bleeding)
  endDate: date('end_date'),
  currentDay: integer('current_day').notNull().default(1),
  status: heatCycleStatusEnum('status').notNull().default('active'),
  
  // Breeding Information
  breedingMethod: heatCycleBreedingMethodEnum('breeding_method').notNull(),
  estimatedOvulationDay: integer('estimated_ovulation_day'), // Day when ovulation occurred
  estimatedOvulationDate: date('estimated_ovulation_date'),
  estimatedWhelpingDate: date('estimated_whelping_date'), // 63 days from ovulation
  
  // Success Tracking
  successful: boolean('successful'), // Did breeding result in pregnancy?
  actualWhelpingDate: date('actual_whelping_date'),
  
  // Next Cycle Tracking
  nextExpectedCycleDate: date('next_expected_cycle_date'), // Expected date of next heat (typically 6 months)
  nextCycleReminderSent: boolean('next_cycle_reminder_sent').default(false),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type HeatCycle = typeof heatCycles.$inferSelect;
export type NewHeatCycle = typeof heatCycles.$inferInsert;

// ============================================================================
// HEAT CYCLE PROGESTERONE READINGS TABLE
// Individual progesterone test results for heat cycles
// ============================================================================

export const heatCycleProgesteroneReadings = pgTable('heat_cycle_progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id, { onDelete: 'cascade' }).notNull(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Reading Information
  day: integer('day').notNull(), // Day of heat cycle (1-30+)
  testDate: date('test_date').notNull(),
  progesteroneLevel: decimal('progesterone_level', { precision: 5, scale: 2 }).notNull(),
  unit: progesteroneUnitEnum('unit').notNull().default('nanograms'),
  laboratory: laboratoryTypeEnum('laboratory').default('VIDAS'),
  
  // Automatic Analysis Results
  phase: text('phase'), // Anestrus, LH Surge, Ovulation, Egg Maturation, Fertile Range
  phaseColor: text('phase_color'), // Hex color for UI display
  nextTestDays: integer('next_test_days'), // Days until next test (1, 2, or 3)
  nextTestDate: date('next_test_date'),
  nextTestReason: text('next_test_reason'), // Why this interval was chosen
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type HeatCycleProgesteroneReading = typeof heatCycleProgesteroneReadings.$inferSelect;
export type NewHeatCycleProgesteroneReading = typeof heatCycleProgesteroneReadings.$inferInsert;

// ============================================================================
// BREEDING RECORDS TABLE
// Track actual breeding dates and methods
// ============================================================================

export const breedingRecords = pgTable('breeding_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id, { onDelete: 'cascade' }).notNull(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Breeding Information
  breedingDate: date('breeding_date').notNull(),
  breedingDay: integer('breeding_day'), // Day of heat cycle when breeding occurred
  breedingMethod: breedingRecordMethodEnum('breeding_method').notNull(),
  
  // Stud Information
  studId: uuid('stud_id').references(() => animals.id), // If using own stud
  studName: text('stud_name'), // If using external stud
  studRegistration: text('stud_registration'),
  
  // Semen Information (for AI)
  frozenSemenId: uuid('frozen_semen_id'), // Reference to frozen semen batch if applicable
  semenQuality: text('semen_quality'), // Excellent, Good, Fair, Poor
  motility: integer('motility'), // Percentage
  concentration: decimal('concentration', { precision: 10, scale: 2 }), // Million/mL
  
  // Progesterone at time of breeding
  progesteroneLevelAtBreeding: decimal('progesterone_level_at_breeding', { precision: 5, scale: 2 }),
  
  // Last Mating Tracking
  isLastMating: boolean('is_last_mating').default(false), // Mark as last mating in breeding window
  pregnancyScreeningTasksGenerated: boolean('pregnancy_screening_tasks_generated').default(false),
  pregnancyScreeningTasksGeneratedAt: timestamp('pregnancy_screening_tasks_generated_at'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type NewBreedingRecord = typeof breedingRecords.$inferInsert;

// ============================================================================
// HEAT CYCLE REMINDERS TABLE
// Automated reminders for testing and breeding
// ============================================================================

export const heatCycleReminders = pgTable('heat_cycle_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  heatCycleId: uuid('heat_cycle_id').references(() => heatCycles.id, { onDelete: 'cascade' }).notNull(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Reminder Information
  reminderType: progesteroneReminderTypeEnum('reminder_type').notNull(),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time'), // HH:MM format
  
  // Notification Content
  title: text('title').notNull(),
  message: text('message').notNull(),
  priority: reminderPriorityEnum('priority').notNull().default('normal'),
  
  // Delivery Channels
  channels: text('channels').array(), // ['email', 'sms', 'in_app']
  
  // Status
  sent: boolean('sent').notNull().default(false),
  sentAt: timestamp('sent_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type HeatCycleReminder = typeof heatCycleReminders.$inferSelect;
export type NewHeatCycleReminder = typeof heatCycleReminders.$inferInsert;

// ============================================================================
// PROGESTERONE TEMPLATES TABLE (Optional)
// Reusable templates for common scenarios
// ============================================================================

export const progesteroneTemplates = pgTable('progesterone_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederId: text('breeder_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Template Information
  name: text('name').notNull(),
  description: text('description'),
  breedingMethod: heatCycleBreedingMethodEnum('breeding_method').notNull(),
  
  // Template Settings
  firstTestDay: integer('first_test_day').notNull().default(5),
  preferredLaboratory: laboratoryTypeEnum('preferred_laboratory').default('VIDAS'),
  reminderChannels: text('reminder_channels').array().default(['email', 'in_app']),
  
  // Usage Tracking
  timesUsed: integer('times_used').notNull().default(0),
  lastUsed: timestamp('last_used'),
  
  // Metadata
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProgesteroneTemplate = typeof progesteroneTemplates.$inferSelect;
export type NewProgesteroneTemplate = typeof progesteroneTemplates.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const heatCyclesRelations = relations(heatCycles, ({ one, many }) => ({
  breeder: one(users, {
    fields: [heatCycles.breederId],
    references: [users.id],
  }),
  bitch: one(animals, {
    fields: [heatCycles.bitchId],
    references: [animals.id],
  }),
  readings: many(heatCycleProgesteroneReadings),
  breedingRecords: many(breedingRecords),
  reminders: many(heatCycleReminders),
}));

export const heatCycleProgesteroneReadingsRelations = relations(heatCycleProgesteroneReadings, ({ one }) => ({
  heatCycle: one(heatCycles, {
    fields: [heatCycleProgesteroneReadings.heatCycleId],
    references: [heatCycles.id],
  }),
  breeder: one(users, {
    fields: [heatCycleProgesteroneReadings.breederId],
    references: [users.id],
  }),
}));

export const breedingRecordsRelations = relations(breedingRecords, ({ one }) => ({
  heatCycle: one(heatCycles, {
    fields: [breedingRecords.heatCycleId],
    references: [heatCycles.id],
  }),
  breeder: one(users, {
    fields: [breedingRecords.breederId],
    references: [users.id],
  }),
  stud: one(animals, {
    fields: [breedingRecords.studId],
    references: [animals.id],
  }),
}));

export const heatCycleRemindersRelations = relations(heatCycleReminders, ({ one }) => ({
  heatCycle: one(heatCycles, {
    fields: [heatCycleReminders.heatCycleId],
    references: [heatCycles.id],
  }),
  breeder: one(users, {
    fields: [heatCycleReminders.breederId],
    references: [users.id],
  }),
}));

export const progesteroneTemplatesRelations = relations(progesteroneTemplates, ({ one }) => ({
  breeder: one(users, {
    fields: [progesteroneTemplates.breederId],
    references: [users.id],
  }),
}));
