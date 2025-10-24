import { pgTable, text, timestamp, decimal, date, jsonb, uuid } from 'drizzle-orm/pg-core';
import { animals } from './animals';
import { matings, laboratoryEnum, unitEnum, breedingMethodEnum } from './matings';
import { users } from './users';

// ============================================================================
// PROGESTERONE TESTS TABLE
// ============================================================================

export const progesteroneTests = pgTable('progesterone_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }), // Optional: link to specific bitch
  matingId: uuid('mating_id').references(() => matings.id, { onDelete: 'set null' }), // Optional: link to mating record
  
  // Test metadata
  testDate: date('test_date').notNull(),
  laboratory: laboratoryEnum('laboratory').notNull(),
  unit: unitEnum('unit').notNull(),
  breedingMethod: breedingMethodEnum('breeding_method').notNull(),
  
  // Progesterone readings (Day 0-5)
  readings: jsonb('readings').notNull().$type<{
    day: number; // 0-5
    value: number;
    date: string; // ISO date string
  }[]>(),
  
  // Calculation results
  rating: decimal('rating', { precision: 5, scale: 2 }), // Overall rating percentage
  alternativeRating: decimal('alternative_rating', { precision: 5, scale: 2 }), // Alternative pattern rating
  matchedPattern: text('matched_pattern'), // e.g., "Pattern A", "Pattern B"
  confidence: decimal('confidence', { precision: 5, scale: 2 }), // Confidence score
  
  // Trend analysis
  trend: text('trend'), // 'rising', 'falling', 'stable', 'insufficient'
  averageChange: decimal('average_change', { precision: 10, scale: 4 }), // Average daily change
  isOptimal: text('is_optimal'), // 'true' or 'false' as text
  
  // Breeding recommendation
  recommendation: text('recommendation'), // 'optimal', 'good', 'acceptable', 'not_recommended'
  recommendationMessage: text('recommendation_message'),
  suggestedAction: text('suggested_action'),
  
  // Breeding window
  breedingWindow: jsonb('breeding_window').$type<{
    startDay: number;
    endDay: number;
    confidence: number;
  }>(),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ProgesteroneTest = typeof progesteroneTests.$inferSelect;
export type NewProgesteroneTest = typeof progesteroneTests.$inferInsert;
