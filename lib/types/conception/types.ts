/**
 * Conception rating type definitions
 */

// ============================================================================
// CONCEPTION RATING TYPES
// ============================================================================

export interface ConceptionRatingData {
  bitchBreed?: string;
  dogBreed?: string;
  bitchAge?: number;
  dogAge?: number;
  bodyCondition?: number;
  healthStatus?: string;
  previousLitters?: number;
  timeSinceLastLitter?: number;
  dogSuccessRate?: number;
  breederExperience?: number;
  semenType?: string;
  semenQuality?: string;
  [key: string]: string | number | undefined;
}

export interface ConceptionFactors {
  breedRatings: Record<string, number>;
  ageFactors: Record<string, number>;
  bodyConditionFactors: Record<string, number>;
  experienceFactors: Record<string, number>;
  semenTypeFactors: Record<string, number>;
  semenQualityFactors: Record<string, number>;
}
