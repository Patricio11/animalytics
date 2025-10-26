import { pgTable, text, timestamp, decimal, date, jsonb, pgEnum, integer, uuid } from 'drizzle-orm/pg-core';
import { animals, frozenSemen } from './animals';
import { users } from './users';

// ============================================================================
// ENUMS
// ============================================================================

export const laboratoryEnum = pgEnum('laboratory', ['VIDAS', 'IDEXX']);
export const unitEnum = pgEnum('unit', ['nanograms', 'nanomoles']);
export const breedingMethodEnum = pgEnum('breeding_method', ['natural_ai', 'tci', 'surgical_ai', 'frozen']);
export const matingStatusEnum = pgEnum('mating_status', ['planned', 'confirmed', 'unsuccessful', 'resulted_in_litter']);

// ============================================================================
// MAIN MATING RECORD
// ============================================================================

export const matings = pgTable('matings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bitchId: uuid('bitch_id').references(() => animals.id, { onDelete: 'cascade' }).notNull(),
  dogId: uuid('dog_id').references(() => animals.id), // Can be null if frozen semen used
  frozenSemenId: uuid('frozen_semen_id').references(() => frozenSemen.id),
  matingDate: date('mating_date').notNull(),
  breedingMethod: breedingMethodEnum('breeding_method').notNull(),
  semenType: text('semen_type'), // fresh, chilled, frozen
  status: matingStatusEnum('status').default('planned'),

  // Calculated ratings
  progesteroneRating: decimal('progesterone_rating', { precision: 5, scale: 2 }),
  conceptionRating: decimal('conception_rating', { precision: 5, scale: 2 }),
  overallRating: decimal('overall_rating', { precision: 5, scale: 2 }),
  informationAccuracy: decimal('information_accuracy', { precision: 3, scale: 1 }), // 0-5 stars

  // ========================================================================
  // CONCEPTION CALCULATOR DATA - ALL 9 WIZARD STEPS
  // ========================================================================

  calculationData: jsonb('calculation_data').$type<{
    // Step 1: Breed Selection
    breed?: {
      bitchBreed?: string;
      bitchBreedRating?: number; // 1-3 stars
      dogBreed?: string;
      dogBreedRating?: number; // 1-3 stars
      combinedRating?: number;
    };

    // Step 2: Bitch Information
    bitchInformation?: {
      // Original fields
      age?: number; // Years
      weight?: number; // kg
      bodyConditionScore?: number; // 1-9 scale (5 = ideal)
      healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
      // New fields from Step 2
      livingCondition?: 'kennels' | 'pack' | 'on_her_own';
      positionInPack?: 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know';
      ageAtMating?: number; // Age in years at time of mating
      runsWithOthers?: 'yes' | 'no' | 'dont_know';
      runsWithHowMany?: number; // Number of other dogs
      ranWithOthersDuringPreviousPregnancies?: 'yes' | 'no' | 'dont_know';
    };

    // Step 3: Bitch History
    bitchHistory?: {
      // Original fields
      hasBeenBred?: 'yes' | 'no';
      previousLitters?: number;
      monthsSinceLastLitter?: number;
      hasComplications?: 'yes' | 'no';
      complications?: string; // Detailed description
      // New fields from Step 3
      previousPregnancies?: 'yes' | 'no' | 'dont_know';
      numberOfSiblings?: '0' | '1-3' | '4-5' | '6+';
      numberOfBreedings?: number;
      hadMatingThatDidNotProduce?: 'yes' | 'no' | 'dont_know';
      timesDidNotProduce?: '1' | '2' | '3+';
    };

    // Step 4: Litter History
    litterHistory?: {
      totalLitters?: number;
      totalPuppies?: number;
      successfulLitters?: number; // Litters without complications
      averageLitterSize?: number;
      litterDetails?: Array<{
        date: string;
        sireName: string;
        puppyCount: number;
        hasComplications: boolean;
      }>;
    };

    // Step 5: Dog History
    dogHistory?: {
      // Original fields
      hasBeenUsed?: 'yes' | 'no';
      previousLitters?: number;
      successRate?: number; // Percentage (0-100)
      ageAtFirstUse?: number; // Years
      // New fields from Step 5
      littersSired?: '0' | '1-2' | '3-5' | '5+';
      fathersLittersSired?: '1-3' | '4-10' | '11+';
      recentLitterDate?: 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months';
      pupsInMostRecentSire?: '0' | '1-3' | '4-6' | '7+';
    };

    // Step 6: Breeder History
    breederHistory?: {
      yearsExperience?: number;
      totalLitters?: number;
      averageLittersPerYear?: number;
      breedFamiliarity?: 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice';
    };

    // Step 7: Semen Information
    semenInformation?: {
      type?: 'fresh' | 'chilled' | 'frozen';
      collectionDate?: string;
      daysSinceCollection?: number;
      storageTime?: number; // Months (for frozen)
      shippingDuration?: number; // Hours (for chilled)
    };

    // Step 8: Semen Assessment
    semenAssessment?: {
      assessmentType?: 'full' | 'visual' | 'none';
      // For full laboratory analysis
      volume?: number; // ml
      concentration?: number; // million/ml
      motility?: number; // percentage
      morphology?: number; // percentage normal
      // For visual assessment
      visualQuality?: 'excellent' | 'good' | 'fair' | 'poor';
      visualNotes?: string;
      // Overall quality (auto-calculated for full, manual for visual)
      overallQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    };

    // Step 9: Conception Rating (calculated results - stored for history)
    conceptionRatingResults?: {
      overallRating: number; // 0-100%
      informationAccuracy: number; // 0-5 stars
      totalWeight: number;
      missingWeight: number;
      recommendation?: string;
      keyFactors?: string[];
    };
  }>(),

  // ========================================================================
  // RATING BREAKDOWN (DETAILED CONTRIBUTION FROM EACH SECTION)
  // ========================================================================

  ratingBreakdown: jsonb('rating_breakdown').$type<{
    breed?: {
      score: number; // 0-1 normalized
      weight: number; // Section weight (10%)
      contribution: number; // Actual contribution to overall
      maxPossible: number; // Maximum possible
      percentage: number; // Percentage contribution
      filled: boolean;
    };
    bitchInformation?: {
      score: number;
      weight: number; // 20%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
    bitchHistory?: {
      score: number;
      weight: number; // 15%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
    litterHistory?: {
      score: number;
      weight: number; // 10%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
    dogHistory?: {
      score: number;
      weight: number; // 10%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
    breederHistory?: {
      score: number;
      weight: number; // 10%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
    semenQuality?: {
      score: number;
      weight: number; // 25%
      contribution: number;
      maxPossible: number;
      percentage: number;
      filled: boolean;
    };
  }>(),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// CONCEPTION RATING HISTORY
// ============================================================================

export const conceptionRatingHistory = pgTable('conception_rating_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  matingId: uuid('mating_id').references(() => matings.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  calculationType: text('calculation_type').notNull(), // 'full_wizard', 'quick_estimate', 'recalculation'
  calculatedAt: timestamp('calculated_at').defaultNow(),

  // Snapshot of calculation at time of calculation
  rating: decimal('rating', { precision: 5, scale: 2 }).notNull(), // 0-100
  informationAccuracy: decimal('information_accuracy', { precision: 3, scale: 1 }), // 0-5 stars

  // Complete input data snapshot (for audit trail)
  inputData: jsonb('input_data').$type<MatingCalculationData>(),

  // Breakdown snapshot
  breakdown: jsonb('breakdown').$type<MatingRatingBreakdown>(),

  // Recommendation at time of calculation
  recommendation: text('recommendation'),

  notes: text('notes'),
});

// ============================================================================
// TYPE EXPORTS FOR DRIZZLE INFERENCE
// ============================================================================

export type Mating = typeof matings.$inferSelect;
export type NewMating = typeof matings.$inferInsert;

export type ConceptionRatingHistoryRecord = typeof conceptionRatingHistory.$inferSelect;
export type NewConceptionRatingHistoryRecord = typeof conceptionRatingHistory.$inferInsert;

// ============================================================================
// TYPESCRIPT INTERFACES FOR WIZARD DATA
// ============================================================================

// Individual wizard step interfaces
export interface BreedSelectionData {
  bitchBreed?: string;
  bitchBreedRating?: number;
  dogBreed?: string;
  dogBreedRating?: number;
  combinedRating?: number;
}

export interface BitchInformationData {
  // Original fields
  age?: number;
  weight?: number;
  bodyConditionScore?: number;
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  // New fields from Step 2
  livingCondition?: 'kennels' | 'pack' | 'on_her_own';
  positionInPack?: 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know';
  ageAtMating?: number; // Age in years at time of mating
  runsWithOthers?: 'yes' | 'no' | 'dont_know';
  runsWithHowMany?: number; // Number of other dogs
  ranWithOthersDuringPreviousPregnancies?: 'yes' | 'no' | 'dont_know';
}

export interface BitchHistoryData {
  // Original fields
  hasBeenBred?: 'yes' | 'no';
  previousLitters?: number;
  monthsSinceLastLitter?: number;
  hasComplications?: 'yes' | 'no';
  complications?: string;
  // New fields from Step 3
  previousPregnancies?: 'yes' | 'no' | 'dont_know';
  numberOfSiblings?: '0' | '1-3' | '4-5' | '6+';
  numberOfBreedings?: number;
  hadMatingThatDidNotProduce?: 'yes' | 'no' | 'dont_know';
  timesDidNotProduce?: '1' | '2' | '3+';
}

export interface LitterHistoryData {
  totalLitters?: number;
  totalPuppies?: number;
  successfulLitters?: number;
  averageLitterSize?: number;
  litterDetails?: Array<{
    date: string;
    sireName: string;
    puppyCount: number;
    hasComplications: boolean;
  }>;
}

export interface DogHistoryData {
  // Original fields
  hasBeenUsed?: 'yes' | 'no';
  previousLitters?: number;
  successRate?: number;
  ageAtFirstUse?: number;
  // New fields from Step 5
  littersSired?: '0' | '1-2' | '3-5' | '5+';
  fathersLittersSired?: '1-3' | '4-10' | '11+';
  recentLitterDate?: 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months';
  pupsInMostRecentSire?: '0' | '1-3' | '4-6' | '7+';
}

export interface BreederHistoryData {
  yearsExperience?: number;
  totalLitters?: number;
  averageLittersPerYear?: number;
  breedFamiliarity?: 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice';
}

export interface SemenInformationData {
  type?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  daysSinceCollection?: number;
  storageTime?: number;
  shippingDuration?: number;
}

export interface SemenAssessmentData {
  assessmentType?: 'full' | 'visual' | 'none';
  volume?: number;
  concentration?: number;
  motility?: number;
  morphology?: number;
  visualQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  visualNotes?: string;
  overallQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ConceptionRatingResultsData {
  overallRating: number;
  informationAccuracy: number;
  totalWeight: number;
  missingWeight: number;
  recommendation?: string;
  keyFactors?: string[];
}

// Section contribution interface
export interface SectionContribution {
  score: number;
  weight: number;
  contribution: number;
  maxPossible: number;
  percentage: number;
  filled: boolean;
}

// Complete calculation data structure
export interface MatingCalculationData {
  breed?: BreedSelectionData;
  bitchInformation?: BitchInformationData;
  bitchHistory?: BitchHistoryData;
  litterHistory?: LitterHistoryData;
  dogHistory?: DogHistoryData;
  breederHistory?: BreederHistoryData;
  semenInformation?: SemenInformationData;
  semenAssessment?: SemenAssessmentData;
  conceptionRatingResults?: ConceptionRatingResultsData;
}

// Complete rating breakdown structure
export interface MatingRatingBreakdown {
  breed?: SectionContribution;
  bitchInformation?: SectionContribution;
  bitchHistory?: SectionContribution;
  litterHistory?: SectionContribution;
  dogHistory?: SectionContribution;
  breederHistory?: SectionContribution;
  semenQuality?: SectionContribution;
}
