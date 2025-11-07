import { relations } from 'drizzle-orm';
import { users } from './users';
import { 
  animals, 
  litters, 
  frozenSemen, 
  semenAssessments, 
  seasons, 
  progesteroneReadings, 
  puppies, 
  breeds,
  animalPhotos,
  animalDocuments,
  feedingPlans,
  healthRecords,
  animalReminders,
  manualPedigreeEntries
} from './animals';
import { matings } from './matings';
import { progesteroneTests } from './progesterone-tests';
import { tasks } from './tasks';
import { listings } from './marketplace';
import { breederBreedPreferences } from './user-breed-preferences';
import { breederProfiles } from './profiles';

// ============================================================================
// USER RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  animals: many(animals),
  matings: many(matings),
  tasks: many(tasks),
  listings: many(listings),
  frozenSemen: many(frozenSemen),
}));

// ============================================================================
// BREED RELATIONS
// ============================================================================

export const breedsRelations = relations(breeds, ({ many }) => ({
  animals: many(animals),
  breederPreferences: many(breederBreedPreferences),
}));

// ============================================================================
// ANIMAL RELATIONS
// ============================================================================

export const animalsRelations = relations(animals, ({ one, many }) => ({
  // Belongs to
  user: one(users, {
    fields: [animals.userId],
    references: [users.id],
  }),
  breed: one(breeds, {
    fields: [animals.breedId],
    references: [breeds.id],
  }),
  owner: one(users, {
    fields: [animals.ownerId],
    references: [users.id],
    relationName: 'owner',
  }),
  breeder: one(users, {
    fields: [animals.breederId],
    references: [users.id],
    relationName: 'breeder',
  }),
  
  // Pedigree relations (parent animals in system)
  sire: one(animals, {
    fields: [animals.sireId],
    references: [animals.id],
    relationName: 'sire',
  }),
  dam: one(animals, {
    fields: [animals.damId],
    references: [animals.id],
    relationName: 'dam',
  }),

  // Has many
  matingsAsBitch: many(matings, { relationName: 'bitch' }),
  matingsAsDog: many(matings, { relationName: 'dog' }),
  littersAsBitch: many(litters, { relationName: 'bitch' }),
  littersAsSire: many(litters, { relationName: 'sire' }),
  tasks: many(tasks),
  semenAssessments: many(semenAssessments),
  seasons: many(seasons),
  photos: many(animalPhotos),
  documents: many(animalDocuments),
  feedingPlans: many(feedingPlans),
  healthRecords: many(healthRecords),
  reminders: many(animalReminders),
  manualPedigreeEntries: many(manualPedigreeEntries),
}));

// ============================================================================
// MATING RELATIONS
// ============================================================================

export const matingsRelations = relations(matings, ({ one }) => ({
  user: one(users, {
    fields: [matings.userId],
    references: [users.id],
  }),
  bitch: one(animals, {
    fields: [matings.bitchId],
    references: [animals.id],
    relationName: 'bitch',
  }),
  dog: one(animals, {
    fields: [matings.dogId],
    references: [animals.id],
    relationName: 'dog',
  }),
  frozenSemen: one(frozenSemen, {
    fields: [matings.frozenSemenId],
    references: [frozenSemen.id],
  }),
}));

// ============================================================================
// LITTER RELATIONS
// ============================================================================

export const littersRelations = relations(litters, ({ one, many }) => ({
  bitch: one(animals, {
    fields: [litters.bitchId],
    references: [animals.id],
    relationName: 'bitch',
  }),
  sire: one(animals, {
    fields: [litters.sireId],
    references: [animals.id],
    relationName: 'sire',
  }),
  puppies: many(puppies),
}));

// ============================================================================
// PUPPY RELATIONS
// ============================================================================

export const puppiesRelations = relations(puppies, ({ one }) => ({
  litter: one(litters, {
    fields: [puppies.litterId],
    references: [litters.id],
  }),
}));

// ============================================================================
// TASK RELATIONS
// ============================================================================

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  animal: one(animals, {
    fields: [tasks.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// FROZEN SEMEN RELATIONS
// ============================================================================

export const frozenSemenRelations = relations(frozenSemen, ({ one }) => ({
  user: one(users, {
    fields: [frozenSemen.userId],
    references: [users.id],
  }),
  sourceAnimal: one(animals, {
    fields: [frozenSemen.sourceAnimalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// SEMEN ASSESSMENT RELATIONS
// ============================================================================

export const semenAssessmentsRelations = relations(semenAssessments, ({ one }) => ({
  animal: one(animals, {
    fields: [semenAssessments.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// SEASON RELATIONS
// ============================================================================

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  animal: one(animals, {
    fields: [seasons.animalId],
    references: [animals.id],
  }),
  progesteroneReadings: many(progesteroneReadings),
}));

// ============================================================================
// PROGESTERONE READING RELATIONS
// ============================================================================

export const progesteroneReadingsRelations = relations(progesteroneReadings, ({ one }) => ({
  animal: one(animals, {
    fields: [progesteroneReadings.animalId],
    references: [animals.id],
  }),
  season: one(seasons, {
    fields: [progesteroneReadings.seasonId],
    references: [seasons.id],
  }),
}));

// ============================================================================
// LISTING RELATIONS
// ============================================================================

export const listingsRelations = relations(listings, ({ one }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  animal: one(animals, {
    fields: [listings.animalId],
    references: [animals.id],
  }),
  frozenSemen: one(frozenSemen, {
    fields: [listings.frozenSemenId],
    references: [frozenSemen.id],
  }),
}));

// ============================================================================
// ANIMAL PHOTOS RELATIONS
// ============================================================================

export const animalPhotosRelations = relations(animalPhotos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalPhotos.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// ANIMAL DOCUMENTS RELATIONS
// ============================================================================

export const animalDocumentsRelations = relations(animalDocuments, ({ one }) => ({
  animal: one(animals, {
    fields: [animalDocuments.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// FEEDING PLANS RELATIONS
// ============================================================================

export const feedingPlansRelations = relations(feedingPlans, ({ one }) => ({
  animal: one(animals, {
    fields: [feedingPlans.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// HEALTH RECORDS RELATIONS
// ============================================================================

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  animal: one(animals, {
    fields: [healthRecords.animalId],
    references: [animals.id],
  }),
}));

// ============================================================================
// ANIMAL REMINDERS RELATIONS
// ============================================================================

export const animalRemindersRelations = relations(animalReminders, ({ one }) => ({
  animal: one(animals, {
    fields: [animalReminders.animalId],
    references: [animals.id],
  }),
  user: one(users, {
    fields: [animalReminders.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// BREEDER PROFILE RELATIONS
// ============================================================================

export const breederProfilesRelations = relations(breederProfiles, ({ many, one }) => ({
  user: one(users, {
    fields: [breederProfiles.userId],
    references: [users.id],
  }),
  breedPreferences: many(breederBreedPreferences),
}));

// ============================================================================
// BREEDER BREED PREFERENCES RELATIONS
// ============================================================================

export const breederBreedPreferencesRelations = relations(breederBreedPreferences, ({ one }) => ({
  breederProfile: one(breederProfiles, {
    fields: [breederBreedPreferences.breederProfileId],
    references: [breederProfiles.id],
  }),
  breed: one(breeds, {
    fields: [breederBreedPreferences.breedId],
    references: [breeds.id],
  }),
}));

// ============================================================================
// PROGESTERONE TESTS RELATIONS
// ============================================================================

export const progesteroneTestsRelations = relations(progesteroneTests, ({ one }) => ({
  user: one(users, {
    fields: [progesteroneTests.userId],
    references: [users.id],
  }),
  animal: one(animals, {
    fields: [progesteroneTests.animalId],
    references: [animals.id],
  }),
  mating: one(matings, {
    fields: [progesteroneTests.matingId],
    references: [matings.id],
  }),
}));

// ============================================================================
// MANUAL PEDIGREE ENTRIES RELATIONS
// ============================================================================

export const manualPedigreeEntriesRelations = relations(manualPedigreeEntries, ({ one }) => ({
  animal: one(animals, {
    fields: [manualPedigreeEntries.animalId],
    references: [animals.id],
  }),
  user: one(users, {
    fields: [manualPedigreeEntries.userId],
    references: [users.id],
  }),
}));
