import { pgTable, text, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { breederProfiles } from './profiles';
import { breeds } from './animals';

/**
 * Breeder Breed Preferences Table
 * Stores which breeds a breeder is interested in or works with
 * Used to filter animals, breeds, and other content
 */
export const breederBreedPreferences = pgTable('breeder_breed_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  breederProfileId: uuid('breeder_profile_id').references(() => breederProfiles.id, { onDelete: 'cascade' }).notNull(),
  breedId: uuid('breed_id').references(() => breeds.id, { onDelete: 'cascade' }).notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Composite unique constraint to prevent duplicate preferences
export const breederBreedPreferencesUnique = pgTable('breeder_breed_preferences_unique', {
  breederProfileId: uuid('breeder_profile_id').notNull(),
  breedId: uuid('breed_id').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.breederProfileId, table.breedId] }),
  };
});
