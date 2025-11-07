import { pgTable, text, timestamp, decimal, date, boolean, jsonb, pgEnum, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

// ============================================================================
// ENUMS
// ============================================================================

export const sexEnum = pgEnum('sex', ['male', 'female']);
export const semenTypeEnum = pgEnum('semen_type', ['fresh', 'chilled', 'frozen']);
export const photoCategoryEnum = pgEnum('photo_category', [
  'profile',
  'gallery',
  'training',
  'shows',
  'pedigree',
  'health',
  'shelter',
  'baby_photos',
  'whelping_areas',
  'vaccinations',
  'council_registration',
  'parents'
]);
export const fileTypeEnum = pgEnum('file_type', ['image', 'video', 'document']);
export const reminderTypeEnum = pgEnum('reminder_type', [
  'vaccination',
  'deworming',
  'vet_checkup',
  'grooming',
  'medication',
  'heat_cycle',
  'breeding',
  'custom'
]);

// ============================================================================
// BREEDS REFERENCE TABLE
// ============================================================================

export const breeds = pgTable('breeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  successRating: decimal('success_rating', { precision: 2, scale: 1 }), // 1.0, 2.0, 3.0
  sizeCategory: text('size_category'), // small, medium, large, giant
  averageWeight: decimal('average_weight', { precision: 5, scale: 2 }), // kg
  averageHeight: decimal('average_height', { precision: 5, scale: 2 }), // cm
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// MAIN ANIMAL TABLE
// ============================================================================

export const animals = pgTable('animals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  registeredName: text('registered_name'), // Official kennel club name
  breedId: uuid('breed_id').references(() => breeds.id),
  sex: sexEnum('sex').notNull(),
  dateOfBirth: date('date_of_birth'),
  microchipNumber: text('microchip_number'),
  registrationNumber: text('registration_number'),
  weight: decimal('weight', { precision: 5, scale: 2 }), // kg
  height: decimal('height', { precision: 5, scale: 2 }), // cm at shoulder
  color: text('color'),
  markings: text('markings'),

  // Profile information
  profileImageUrl: text('profile_image_url'),
  bio: text('bio'),
  temperament: text('temperament'),
  healthStatus: text('health_status'), // excellent, good, fair, poor

  // Breeding information
  isBreedingActive: boolean('is_breeding_active').default(false),
  isChampion: boolean('is_champion').default(false),
  titles: jsonb('titles').$type<string[]>(), // ['CH', 'GCH', etc.]
  breedingNotes: text('breeding_notes'),
  studFee: decimal('stud_fee', { precision: 10, scale: 2 }), // For males
  
  // Health & Genetic Testing
  healthCertifications: jsonb('health_certifications').$type<{
    name: string;
    issueDate: string;
    expiryDate?: string;
    issuedBy: string;
    certificateUrl?: string;
  }[]>(),
  geneticTests: jsonb('genetic_tests').$type<{
    testName: string;
    result: string; // 'clear', 'carrier', 'affected'
    testDate: string;
    laboratory: string;
    certificateUrl?: string;
  }[]>(),

  // Pedigree (use damId/sireId for relational pedigree tree)
  damId: uuid('dam_id'), // Mother - references animals.id (if in system)
  sireId: uuid('sire_id'), // Father - references animals.id (if in system)
  
  // Note: For manual parent entry (parents not in system), use manualPedigreeEntries table
  // with position='dam' or position='sire'

  // Breeder information
  // Note: breederId references user who bred this animal (never changes)
  breederId: text('breeder_id').references(() => users.id), // If breeder is in system
  breederName: text('breeder_name'), // If breeder is external (manual entry)
  breederRegistrationNumber: text('breeder_registration_number'), // Kennel club breeder ID
  
  // Owner information
  // Note: ownerId is current owner (can change when animal is sold)
  // For ownership history tracking, see separate ownership_history table (to be created)
  ownerId: text('owner_id').references(() => users.id), // Current owner (if in system)
  ownerName: text('owner_name'), // If owner is external (manual entry)
  ownerRegistrationNumber: text('owner_registration_number'), // Owner's registration ID

  // Location
  location: text('location'), // City, State/Province, Country

  // Status
  isActive: boolean('is_active').default(true),
  isDeceased: boolean('is_deceased').default(false),
  deceasedDate: date('deceased_date'),

  // Metadata
  notes: text('notes'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// ANIMAL PHOTOS (7 CATEGORIES, 10 IMAGES EACH)
// ============================================================================

export const animalPhotos = pgTable('animal_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  category: photoCategoryEnum('category').notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'), // Optimized thumbnail
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // in bytes
  width: integer('width'), // pixels
  height: integer('height'), // pixels
  caption: text('caption'),
  displayOrder: integer('display_order').default(0), // For sorting within category
  isPrimary: boolean('is_primary').default(false), // Primary photo for the category
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// ============================================================================
// ANIMAL DOCUMENTS
// ============================================================================

export const animalDocuments = pgTable('animal_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  documentType: text('document_type').notNull(), // pedigree, health_certificate, registration, vaccination_record, etc.
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // in bytes
  mimeType: text('mime_type'), // application/pdf, image/jpeg, etc.
  expiryDate: date('expiry_date'), // For certificates that expire
  notes: text('notes'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// ============================================================================
// FEEDING PLANS
// ============================================================================

export const feedingPlans = pgTable('feeding_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  foodType: text('food_type'), // Brand and type of food
  mealTimes: jsonb('meal_times').$type<Array<{
    time: string; // "08:00"
    amount: string; // "2 cups"
    unit: string; // "cups", "grams", etc.
  }>>(),
  specialDiet: text('special_diet'), // Allergies, restrictions
  supplements: jsonb('supplements').$type<Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>>(),
  calorieTarget: integer('calorie_target'), // kcal per day
  specialNotes: text('special_notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// SEMEN ASSESSMENTS (DOGS ONLY)
// ============================================================================

export const semenAssessments = pgTable('semen_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  assessmentDate: date('assessment_date').notNull(),
  assessmentType: text('assessment_type').notNull(), // visual, full_lab
  technicianName: text('technician_name'),
  clinic: text('clinic'),

  // For visual assessment
  visualQuality: text('visual_quality'), // poor, fair, good, excellent
  visualNotes: text('visual_notes'),

  // For full laboratory analysis
  volume: decimal('volume', { precision: 5, scale: 2 }), // ml
  concentration: integer('concentration'), // million/ml
  totalSpermCount: integer('total_sperm_count'), // million
  motility: decimal('motility', { precision: 5, scale: 2 }), // percentage
  progressiveMotility: decimal('progressive_motility', { precision: 5, scale: 2 }), // percentage
  morphology: decimal('morphology', { precision: 5, scale: 2 }), // percentage normal

  // Auto-calculated quality (from lab values)
  calculatedQuality: text('calculated_quality'), // poor, fair, good, excellent

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// SEASONS/HEAT CYCLES (BITCHES ONLY)
// ============================================================================

export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: text('status').default('active'), // active, completed
  durationDays: integer('duration_days'), // Calculated

  // Progesterone readings linked to this season
  hasProgesteroneReadings: boolean('has_progesterone_readings').default(false),
  progesteroneReadingCount: integer('progesterone_reading_count').default(0),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PROGESTERONE READINGS (LINKED TO SEASONS)
// ============================================================================

export const progesteroneReadings = pgTable('progesterone_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id').references(() => seasons.id, { onDelete: 'cascade' }).notNull(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  readingDate: date('reading_date').notNull(),
  dayNumber: integer('day_number').notNull(), // Day 0, 1, 2, etc.
  level: decimal('level', { precision: 5, scale: 2 }).notNull(), // ng/ml or nmol/L
  unit: text('unit').notNull(), // nanograms, nanomoles
  laboratory: text('laboratory').notNull(), // VIDAS, IDEXX

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// LITTERS
// ============================================================================

export const litters = pgTable('litters', {
  id: uuid('id').primaryKey().defaultRandom(),
  bitchId: uuid('bitch_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  sireId: uuid('sire_id').references(() => animals.id), // Can be null if frozen semen used
  frozenSemenId: uuid('frozen_semen_id'), // Reference to frozen semen if used

  // Mating information
  matingDate: date('mating_date').notNull(),
  breedingMethod: text('breeding_method'), // natural, ai, surgical_ai, frozen

  // Whelping information
  expectedWhelpingDate: date('expected_whelping_date'),
  actualWhelpingDate: date('actual_whelping_date'),
  gestationDays: integer('gestation_days'), // Calculated

  // Litter information
  puppyCount: integer('puppy_count'),
  survivingPuppies: integer('surviving_puppies'),
  maleCount: integer('male_count'),
  femaleCount: integer('female_count'),

  // Complications
  hasComplications: boolean('has_complications').default(false),
  complications: text('complications'),
  veterinarianNotes: text('veterinarian_notes'),

  // Status
  status: text('status').default('expected'), // expected, whelped, archived

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PUPPIES (INDIVIDUAL PUPPY RECORDS)
// ============================================================================

export const puppies = pgTable('puppies', {
  id: uuid('id').primaryKey().defaultRandom(),
  litterId: uuid('litter_id').references(() => litters.id, { onDelete: 'cascade' }).notNull(),
  animalId: uuid('animal_id').references(() => animals.id), // Links to animal record if retained

  name: text('name'),
  sex: sexEnum('sex').notNull(),
  birthWeight: decimal('birth_weight', { precision: 5, scale: 2 }), // kg
  currentWeight: decimal('current_weight', { precision: 5, scale: 2 }), // kg
  color: text('color'),
  markings: text('markings'),

  // Status
  status: text('status').default('available'), // available, reserved, sold, retained, deceased
  statusDate: date('status_date'),

  // Sale information
  buyerName: text('buyer_name'),
  buyerEmail: text('buyer_email'),
  buyerPhone: text('buyer_phone'),
  salePrice: integer('sale_price'), // in cents
  saleCurrency: text('sale_currency').default('USD'),
  saleDate: date('sale_date'),

  // Health
  microchipNumber: text('microchip_number'),
  registrationNumber: text('registration_number'),
  healthStatus: text('health_status'), // healthy, special_needs, deceased

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// FROZEN SEMEN INVENTORY
// ============================================================================

export const frozenSemen = pgTable('frozen_semen', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sourceAnimalId: uuid('source_animal_id').references(() => animals.id),

  // Collection information
  collectionDate: date('collection_date').notNull(),
  clinic: text('clinic'),
  technicianName: text('technician_name'),

  // Batch information
  batchIdentifier: text('batch_identifier').notNull(),
  strawCount: integer('straw_count').notNull(),
  strawsRemaining: integer('straws_remaining').notNull(),
  strawsUsed: integer('straws_used').default(0),

  // Storage
  storageLocation: text('storage_location'),
  storageType: text('storage_type'), // nitrogen_tank, facility_name

  // Quality assessment (can link to semen assessment OR store directly)
  semenAssessmentId: uuid('semen_assessment_id').references(() => semenAssessments.id),
  qualityRating: text('quality_rating'), // poor, fair, good, excellent

  // Quality metrics (stored directly for convenience)
  volume: decimal('volume', { precision: 5, scale: 2 }), // ml
  concentration: integer('concentration'), // million/ml
  motility: decimal('motility', { precision: 5, scale: 2 }), // percentage
  morphology: decimal('morphology', { precision: 5, scale: 2 }), // percentage normal

  // Status
  status: text('status').default('available'), // available, reserved, depleted, expired
  isAvailable: boolean('is_available').default(true),
  expiryDate: date('expiry_date'),

  // Marketplace
  isListedForSale: boolean('is_listed_for_sale').default(false),
  marketplaceListingId: text('marketplace_listing_id'),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// FROZEN SEMEN USAGE HISTORY
// ============================================================================

export const frozenSemenUsage = pgTable('frozen_semen_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  frozenSemenId: uuid('frozen_semen_id').references(() => frozenSemen.id, { onDelete: 'cascade' }).notNull(),
  litterId: uuid('litter_id').references(() => litters.id),
  bitchId: uuid('bitch_id').references(() => animals.id).notNull(),

  usageDate: date('usage_date').notNull(),
  strawsUsed: integer('straws_used').notNull(),
  breedingMethod: text('breeding_method'), // ai, surgical_ai
  clinic: text('clinic'),
  veterinarianName: text('veterinarian_name'),

  // Outcome
  wasSuccessful: boolean('was_successful'),
  resultingPuppies: integer('resulting_puppies'),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// ANIMAL REMINDERS
// ============================================================================

export const animalReminders = pgTable('animal_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  reminderType: reminderTypeEnum('reminder_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),

  // Timing
  dueDate: date('due_date').notNull(),
  reminderDate: date('reminder_date'), // When to send reminder notification

  // Recurrence
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'), // daily, weekly, monthly, yearly
  recurrenceInterval: integer('recurrence_interval'), // Every X days/weeks/months
  recurrenceEndDate: date('recurrence_end_date'),

  // Status
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),

  // Notifications
  sendEmail: boolean('send_email').default(true),
  sendPush: boolean('send_push').default(true),
  sendSms: boolean('send_sms').default(false),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// ANIMAL SHARING (FOR VETS, CO-OWNERS)
// ============================================================================

export const animalShares = pgTable('animal_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  ownerId: text('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sharedWithUserId: text('shared_with_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  accessLevel: text('access_level').notNull(), // read, write, full
  shareType: text('share_type'), // veterinarian, co_owner, temporary

  // Permissions
  canViewHealth: boolean('can_view_health').default(true),
  canEditHealth: boolean('can_edit_health').default(false),
  canViewBreeding: boolean('can_view_breeding').default(false),
  canEditBreeding: boolean('can_edit_breeding').default(false),

  // Timing
  sharedAt: timestamp('shared_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),

  notes: text('notes'),
});

// ============================================================================
// ANIMAL HEALTH RECORDS
// ============================================================================

export const healthRecords = pgTable('health_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  recordType: text('record_type').notNull(), // vaccination, checkup, illness, injury, surgery, medication

  recordDate: date('record_date').notNull(),
  veterinarianName: text('veterinarian_name'),
  clinicName: text('clinic_name'),

  // Vaccination specific
  vaccinationType: text('vaccination_type'), // rabies, dhpp, bordetella, etc.
  nextDueDate: date('next_due_date'),

  // Medication specific
  medicationName: text('medication_name'),
  dosage: text('dosage'),
  frequency: text('frequency'),
  startDate: date('start_date'),
  endDate: date('end_date'),

  // General
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  cost: integer('cost'), // in cents
  currency: text('currency').default('USD'),

  // Document
  certificateUrl: text('certificate_url'),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// TYPE EXPORTS FOR DRIZZLE INFERENCE
// ============================================================================

export type Breed = typeof breeds.$inferSelect;
export type NewBreed = typeof breeds.$inferInsert;

export type Animal = typeof animals.$inferSelect;
export type NewAnimal = typeof animals.$inferInsert;

export type AnimalPhoto = typeof animalPhotos.$inferSelect;
export type NewAnimalPhoto = typeof animalPhotos.$inferInsert;

export type AnimalDocument = typeof animalDocuments.$inferSelect;
export type NewAnimalDocument = typeof animalDocuments.$inferInsert;

export type FeedingPlan = typeof feedingPlans.$inferSelect;
export type NewFeedingPlan = typeof feedingPlans.$inferInsert;

export type SemenAssessment = typeof semenAssessments.$inferSelect;
export type NewSemenAssessment = typeof semenAssessments.$inferInsert;

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

export type ProgesteroneReading = typeof progesteroneReadings.$inferSelect;
export type NewProgesteroneReading = typeof progesteroneReadings.$inferInsert;

export type Litter = typeof litters.$inferSelect;
export type NewLitter = typeof litters.$inferInsert;

export type Puppy = typeof puppies.$inferSelect;
export type NewPuppy = typeof puppies.$inferInsert;

export type FrozenSemen = typeof frozenSemen.$inferSelect;
export type NewFrozenSemen = typeof frozenSemen.$inferInsert;

export type FrozenSemenUsage = typeof frozenSemenUsage.$inferSelect;
export type NewFrozenSemenUsage = typeof frozenSemenUsage.$inferInsert;

export type AnimalReminder = typeof animalReminders.$inferSelect;
export type NewAnimalReminder = typeof animalReminders.$inferInsert;

export type AnimalShare = typeof animalShares.$inferSelect;
export type NewAnimalShare = typeof animalShares.$inferInsert;

export type HealthRecord = typeof healthRecords.$inferSelect;
export type NewHealthRecord = typeof healthRecords.$inferInsert;

// ============================================================================
// MANUAL PEDIGREE ENTRIES
// ============================================================================
// For storing external animals not in the system (e.g., from certificates)

export const manualPedigreeEntries = pgTable('manual_pedigree_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').notNull().references(() => animals.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Position in tree: 'dam', 'sire', 'dam.dam', 'dam.sire', 'sire.dam', 'sire.sire', etc.
  position: text('position').notNull(),
  generation: integer('generation').notNull(), // 1=parents, 2=grandparents, 3=great-grandparents
  
  // Animal details
  name: text('name').notNull(),
  registeredName: text('registered_name'),
  registrationNumber: text('registration_number'),
  microchipNumber: text('microchip_number'),
  breed: text('breed'),
  sex: sexEnum('sex'),
  dateOfBirth: date('date_of_birth'),
  color: text('color'),
  
  // Optional additional info
  titles: jsonb('titles').$type<string[]>(),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ManualPedigreeEntry = typeof manualPedigreeEntries.$inferSelect;
export type NewManualPedigreeEntry = typeof manualPedigreeEntries.$inferInsert;
