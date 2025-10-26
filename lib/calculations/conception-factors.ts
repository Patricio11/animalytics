/**
 * Factor weightings and lookup tables for conception rating calculations
 *
 * Note: These factors are based on veterinary breeding science and can be
 * adjusted as more data becomes available. All factors normalize to 0-1 range.
 */

// Section weights - how much each category contributes to overall rating
// Total must equal 100
export const SECTION_WEIGHTS = {
  breed: 10,
  bitchInformation: 20,
  bitchHistory: 15,
  litterHistory: 10,
  dogHistory: 10,
  breederHistory: 10,
  semenQuality: 25,
} as const;

// Verify weights sum to 100
const totalWeight = Object.values(SECTION_WEIGHTS).reduce((sum, w) => sum + w, 0);
if (totalWeight !== 100) {
  console.warn(`Section weights sum to ${totalWeight}, expected 100`);
}

// Breed difficulty ratings (1-3 scale)
// Higher = easier to breed successfully
export const BREED_RATINGS: Record<string, number> = {
  'Labrador Retriever': 3,
  'Golden Retriever': 3,
  'German Shepherd': 2,
  'French Bulldog': 1,
  'Bulldog': 1,
  'Poodle': 3,
  'Beagle': 3,
  'Rottweiler': 2,
  'Yorkshire Terrier': 2,
  'Boxer': 2,
  'Dachshund': 2,
  'Siberian Husky': 2,
  'Default': 2, // Default for unknown breeds
};

// Age factors - optimal age is 2-7 years
export const AGE_FACTORS: Record<string, number> = {
  'under-1': 0.3,    // Too young, not recommended
  '1-2': 0.7,        // Young but possible
  '2-3': 1.0,        // Optimal - prime breeding age
  '3-5': 1.0,        // Optimal - prime breeding age
  '5-7': 0.9,        // Good - still fertile
  '7-9': 0.6,        // Declining fertility
  '9-plus': 0.3,     // High risk, not recommended
};

// Body condition score factors (1-9 scale)
// Score of 5 is ideal
export const BODY_CONDITION_FACTORS: Record<number, number> = {
  1: 0.3,  // Emaciated - health risk
  2: 0.5,  // Very thin - health risk
  3: 0.7,  // Thin - suboptimal
  4: 0.9,  // Underweight - acceptable
  5: 1.0,  // Ideal - perfect condition
  6: 0.95, // Slightly overweight - minor impact
  7: 0.8,  // Overweight - reduced fertility
  8: 0.6,  // Obese - significant health risk
  9: 0.4,  // Severely obese - high risk
};

// Health status factors
export const HEALTH_STATUS_FACTORS = {
  excellent: 1.0,
  good: 0.85,
  fair: 0.65,
  poor: 0.3,
} as const;

// Breeding history factors
export const BREEDING_HISTORY_FACTORS = {
  firstTime: 0.85,              // First time breeding penalty
  experienced: 1.0,             // Has bred before successfully
  hasComplications: 0.7,        // Previous complications penalty
} as const;

// Time since last litter factors (months)
export const TIME_SINCE_LAST_LITTER_FACTORS: Record<string, number> = {
  'under-6': 0.4,    // Too soon - health risk
  '6-12': 0.7,       // Recovering
  '12-18': 1.0,      // Optimal recovery time
  '18-24': 1.0,      // Optimal recovery time
  '24-36': 0.95,     // Good, long recovery
  '36-plus': 0.85,   // Very long gap, may have reduced fertility
};

// Litter history success rate factors
export const LITTER_SUCCESS_FACTORS = {
  noHistory: 0.85,              // No history - slight penalty
  highSuccess: 1.0,             // 80%+ success rate
  moderateSuccess: 0.9,         // 50-79% success rate
  lowSuccess: 0.7,              // Below 50% success rate
} as const;

// Dog breeding history factors
export const DOG_HISTORY_FACTORS = {
  firstTime: 0.85,              // First time stud penalty
  proven: 1.0,                  // Has bred successfully
} as const;

// Dog success rate factors
export const DOG_SUCCESS_RATE_FACTORS: Record<string, number> = {
  'excellent': 1.0,             // 75%+ success rate
  'good': 0.9,                  // 50-74% success rate
  'fair': 0.75,                 // 25-49% success rate
  'poor': 0.5,                  // Below 25% success rate
  'unknown': 0.85,              // No data available
};

// Breeder experience factors (years)
export const BREEDER_EXPERIENCE_FACTORS: Record<string, number> = {
  'novice': 0.7,                // Less than 1 year
  'beginner': 0.8,              // 1-3 years
  'intermediate': 0.9,          // 3-5 years
  'experienced': 1.0,           // 5-10 years
  'expert': 1.0,                // 10+ years
};

// Breed familiarity factors
export const BREED_FAMILIARITY_FACTORS = {
  expert: 1.0,
  experienced: 0.95,
  moderate: 0.85,
  limited: 0.75,
  novice: 0.7,
} as const;

// Semen type factors
export const SEMEN_TYPE_FACTORS = {
  fresh: 1.0,      // Natural or immediate use
  chilled: 0.8,    // Shipped/cooled
  frozen: 0.65,    // Cryopreserved
} as const;

// Semen quality factors
export const SEMEN_QUALITY_FACTORS = {
  excellent: 1.0,
  good: 0.85,
  fair: 0.65,
  poor: 0.35,
} as const;

// Semen assessment type factors
export const SEMEN_ASSESSMENT_FACTORS = {
  full: 1.0,       // Complete laboratory analysis
  visual: 0.85,    // Visual assessment only
  none: 0.7,       // No assessment (risky)
} as const;

// NEW FIELDS - Step 2: Bitch Information
export const RUNS_WITH_OTHERS_FACTORS = {
  yes: 0.85,       // Runs with others - stress/injury risk
  no: 1.0,         // Isolated - safer
  dont_know: 0.9,  // Unknown - slight penalty
} as const;

export const RAN_WITH_OTHERS_DURING_PREGNANCY_FACTORS = {
  yes: 0.8,        // Previous pregnancy with others - higher risk
  no: 1.0,         // Isolated during pregnancy - safer
  dont_know: 0.9,  // Unknown
} as const;

// NEW FIELDS - Step 3: Bitch History
export const PREVIOUS_PREGNANCIES_FACTORS = {
  yes: 1.0,        // Has been pregnant before
  no: 0.9,         // Never pregnant - slight uncertainty
  dont_know: 0.95, // Unknown
} as const;

export const NUMBER_OF_SIBLINGS_FACTORS = {
  '0': 0.85,       // Only pup - may indicate fertility issues in lineage
  '1-3': 0.9,      // Small litter lineage
  '4-5': 1.0,      // Good litter size lineage
  '6+': 1.0,       // Large litter lineage - good genetics
} as const;

export const MATING_FAILURE_FACTORS = {
  yes: 0.7,        // Has had failed matings - fertility concern
  no: 1.0,         // No failures
  dont_know: 0.9,  // Unknown
} as const;

export const TIMES_DID_NOT_PRODUCE_FACTORS = {
  '1': 0.85,       // One failure - minor concern
  '2': 0.7,        // Two failures - moderate concern
  '3+': 0.5,       // Multiple failures - significant concern
} as const;

// NEW FIELDS - Step 5: Dog History
export const LITTERS_SIRED_FACTORS = {
  '0': 0.85,       // Unproven stud
  '1-2': 0.95,     // Limited experience
  '3-5': 1.0,      // Proven stud
  '5+': 1.0,       // Highly proven
} as const;

export const FATHERS_LITTERS_SIRED_FACTORS = {
  '1-3': 0.9,      // Father had limited success
  '4-10': 1.0,     // Father was proven
  '11+': 1.0,      // Father was highly successful - good genetics
} as const;

export const RECENT_LITTER_DATE_FACTORS = {
  less_than_1_month: 1.0,    // Recently active - good fertility
  '1-6_months': 1.0,         // Recently active
  '6-18_months': 0.95,       // Moderately recent
  more_than_18_months: 0.7,  // Long gap - may indicate low sperm count
} as const;

export const PUPS_IN_RECENT_SIRE_FACTORS = {
  '0': 0.5,        // No pups - fertility concern
  '1-3': 0.8,      // Small litter - some concern
  '4-6': 1.0,      // Good litter size
  '7+': 1.0,       // Large litter - excellent fertility
} as const;

// NEW FIELDS - Step 7: Semen Information
export const TIME_BETWEEN_COLLECTION_FACTORS = {
  less_than_24hrs: 1.0,      // Optimal for chilled
  '24-48hrs': 0.95,          // Good for chilled
  more_than_48hrs: 0.75,     // Degraded quality
} as const;

export const AGE_AT_COLLECTION_FACTORS = {
  under_12_months: 0.5,      // Too young - poor quality
  '1-3_years': 1.0,          // Prime age - excellent
  '3-5_years': 0.95,         // Good age
  '5+_years': 0.85,          // Older - declining quality
} as const;

export const BATCH_USED_PREVIOUSLY_FACTORS = {
  yes: 1.0,        // Proven batch
  no: 0.95,        // Unproven - slight uncertainty
  dont_know: 0.95, // Unknown
} as const;

export const DID_PRODUCE_PUPS_FACTORS = {
  yes: 1.0,        // Batch proven successful
  no: 0.6,         // Batch failed before - concern
  dont_know: 0.9,  // Unknown
} as const;

export const PUPS_PRODUCED_FACTORS = {
  '1-3': 0.85,     // Small litter from batch
  '4-6': 1.0,      // Good litter from batch
  '7+': 1.0,       // Large litter - excellent batch
} as const;

// NEW FIELDS - Step 8: Semen Assessment
export const SEMEN_ASSESSED_FACTORS = {
  yes: 1.0,        // Assessed - confidence in quality
  no: 0.7,         // Not assessed - risky
  dont_know: 0.8,  // Unknown
} as const;

// Laboratory analysis thresholds for automatic quality determination
export const LAB_ANALYSIS_THRESHOLDS = {
  motility: {
    excellent: 80,
    good: 70,
    fair: 50,
  },
  concentration: {
    excellent: 500,    // million/mL
    good: 300,
    fair: 200,
  },
  morphology: {
    excellent: 85,
    good: 80,
    fair: 60,
  },
} as const;

// Helper functions for factor lookups

export function getAgeFactor(age: number): number {
  if (age < 1) return AGE_FACTORS['under-1'];
  if (age < 2) return AGE_FACTORS['1-2'];
  if (age < 3) return AGE_FACTORS['2-3'];
  if (age < 5) return AGE_FACTORS['3-5'];
  if (age < 7) return AGE_FACTORS['5-7'];
  if (age < 9) return AGE_FACTORS['7-9'];
  return AGE_FACTORS['9-plus'];
}

export function getBodyConditionFactor(score: number): number {
  return BODY_CONDITION_FACTORS[Math.round(score)] || BODY_CONDITION_FACTORS[5];
}

export function getBreedRating(breed: string): number {
  return BREED_RATINGS[breed] || BREED_RATINGS['Default'];
}

export function getTimeSinceLastLitterFactor(months: number): number {
  if (months < 6) return TIME_SINCE_LAST_LITTER_FACTORS['under-6'];
  if (months < 12) return TIME_SINCE_LAST_LITTER_FACTORS['6-12'];
  if (months < 18) return TIME_SINCE_LAST_LITTER_FACTORS['12-18'];
  if (months < 24) return TIME_SINCE_LAST_LITTER_FACTORS['18-24'];
  if (months < 36) return TIME_SINCE_LAST_LITTER_FACTORS['24-36'];
  return TIME_SINCE_LAST_LITTER_FACTORS['36-plus'];
}

export function getDogSuccessRateFactor(successRate: number | undefined): number {
  if (successRate === undefined) return DOG_SUCCESS_RATE_FACTORS['unknown'];
  if (successRate >= 75) return DOG_SUCCESS_RATE_FACTORS['excellent'];
  if (successRate >= 50) return DOG_SUCCESS_RATE_FACTORS['good'];
  if (successRate >= 25) return DOG_SUCCESS_RATE_FACTORS['fair'];
  return DOG_SUCCESS_RATE_FACTORS['poor'];
}

export function getBreederExperienceFactor(years: number): string {
  if (years < 1) return 'novice';
  if (years < 3) return 'beginner';
  if (years < 5) return 'intermediate';
  if (years < 10) return 'experienced';
  return 'expert';
}

export function calculateLabQuality(
  motility?: number,
  concentration?: number,
  morphology?: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (!motility && !concentration && !morphology) return 'good'; // Default

  let score = 0;
  let count = 0;

  if (motility !== undefined) {
    if (motility >= LAB_ANALYSIS_THRESHOLDS.motility.excellent) score += 3;
    else if (motility >= LAB_ANALYSIS_THRESHOLDS.motility.good) score += 2;
    else if (motility >= LAB_ANALYSIS_THRESHOLDS.motility.fair) score += 1;
    count++;
  }

  if (concentration !== undefined) {
    if (concentration >= LAB_ANALYSIS_THRESHOLDS.concentration.excellent) score += 3;
    else if (concentration >= LAB_ANALYSIS_THRESHOLDS.concentration.good) score += 2;
    else if (concentration >= LAB_ANALYSIS_THRESHOLDS.concentration.fair) score += 1;
    count++;
  }

  if (morphology !== undefined) {
    if (morphology >= LAB_ANALYSIS_THRESHOLDS.morphology.excellent) score += 3;
    else if (morphology >= LAB_ANALYSIS_THRESHOLDS.morphology.good) score += 2;
    else if (morphology >= LAB_ANALYSIS_THRESHOLDS.morphology.fair) score += 1;
    count++;
  }

  if (count === 0) return 'good';

  const avgScore = score / count;
  if (avgScore >= 2.5) return 'excellent';
  if (avgScore >= 1.5) return 'good';
  if (avgScore >= 0.8) return 'fair';
  return 'poor';
}

// NEW HELPER FUNCTIONS for new fields

export function getAgeAtCollectionFactor(age: number): number {
  if (age < 1) return AGE_AT_COLLECTION_FACTORS.under_12_months;
  if (age < 3) return AGE_AT_COLLECTION_FACTORS['1-3_years'];
  if (age < 5) return AGE_AT_COLLECTION_FACTORS['3-5_years'];
  return AGE_AT_COLLECTION_FACTORS['5+_years'];
}