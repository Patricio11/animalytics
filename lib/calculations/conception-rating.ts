/**
 * Conception Rating Calculation Engine
 *
 * This module combines all breeding factors into a comprehensive conception rating.
 * The rating is a weighted average of multiple factors including breed, age, health,
 * breeding history, semen quality, and breeder experience.
 */

import {
  ConceptionInputs,
  ConceptionRating,
  SectionContribution,
  FactorCalculation,
} from './conception-types';

import {
  SECTION_WEIGHTS,
  HEALTH_STATUS_FACTORS,
  BREEDING_HISTORY_FACTORS,
  LITTER_SUCCESS_FACTORS,
  DOG_HISTORY_FACTORS,
  BREEDER_EXPERIENCE_FACTORS,
  BREED_FAMILIARITY_FACTORS,
  SEMEN_TYPE_FACTORS,
  SEMEN_QUALITY_FACTORS,
  SEMEN_ASSESSMENT_FACTORS,
  getAgeFactor,
  getBodyConditionFactor,
  getBreedRating,
  getTimeSinceLastLitterFactor,
  getDogSuccessRateFactor,
  getBreederExperienceFactor,
  calculateLabQuality,
} from './conception-factors';

/**
 * Main calculation function that combines all factors into a conception rating
 */
export function calculateConceptionRating(inputs: ConceptionInputs): ConceptionRating {
  // Calculate each section
  const breedFactor = calculateBreedFactor(inputs);
  const bitchInfoFactor = calculateBitchInformationFactor(inputs);
  const bitchHistoryFactor = calculateBitchHistoryFactor(inputs);
  const litterHistoryFactor = calculateLitterHistoryFactor(inputs);
  const dogHistoryFactor = calculateDogHistoryFactor(inputs);
  const breederHistoryFactor = calculateBreederHistoryFactor(inputs);
  const semenQualityFactor = calculateSemenQualityFactor(inputs);

  // Create section contributions
  const breakdown = {
    breed: createSectionContribution(breedFactor, SECTION_WEIGHTS.breed),
    bitchInformation: createSectionContribution(bitchInfoFactor, SECTION_WEIGHTS.bitchInformation),
    bitchHistory: createSectionContribution(bitchHistoryFactor, SECTION_WEIGHTS.bitchHistory),
    litterHistory: createSectionContribution(litterHistoryFactor, SECTION_WEIGHTS.litterHistory),
    dogHistory: createSectionContribution(dogHistoryFactor, SECTION_WEIGHTS.dogHistory),
    breederHistory: createSectionContribution(breederHistoryFactor, SECTION_WEIGHTS.breederHistory),
    semenQuality: createSectionContribution(semenQualityFactor, SECTION_WEIGHTS.semenQuality),
  };

  // Calculate overall rating
  const filledSections = Object.values(breakdown).filter(s => s.filled);
  const totalWeight = filledSections.reduce((sum, s) => sum + s.maxPossible, 0);
  const missingWeight = 100 - totalWeight;

  // Overall rating is the weighted average of filled sections, normalized to 100%
  let overallRating = 0;
  if (totalWeight > 0) {
    const weightedSum = filledSections.reduce((sum, s) => sum + s.percentage, 0);
    overallRating = (weightedSum / totalWeight) * 100;
  }

  // Calculate information accuracy (0-5 stars based on completion)
  const maxSections = 7;
  const informationAccuracy = Math.min(5, Math.floor((filledSections.length / maxSections) * 5));

  return {
    overallRating: Math.min(100, Math.max(0, overallRating)),
    informationAccuracy,
    breakdown,
    totalWeight,
    missingWeight,
  };
}

/**
 * Helper function to create section contribution object
 */
function createSectionContribution(
  factor: FactorCalculation,
  weight: number
): SectionContribution {
  return {
    percentage: factor.contribution,
    maxPossible: weight,
    score: factor.score,
    filled: factor.filled,
  };
}

/**
 * Calculate breed factor (based on combined breed ratings)
 */
function calculateBreedFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.breed;

  if (!inputs.breed && !inputs.dogBreed) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const bitchRating = inputs.breed ? getBreedRating(inputs.breed) : 2;
  const dogRating = inputs.dogBreed ? getBreedRating(inputs.dogBreed) : 2;

  // Average the two breed ratings and normalize to 0-1 (3 = max rating)
  const averageRating = (bitchRating + dogRating) / 2;
  const score = averageRating / 3;
  const contribution = score * weight;

  return { score, weight, contribution, filled: true };
}

/**
 * Calculate bitch information factor (age, weight, body condition, health)
 */
function calculateBitchInformationFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.bitchInformation;

  if (!inputs.bitchInformation) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const info = inputs.bitchInformation;
  let totalScore = 0;
  let factorCount = 0;

  // Age factor (most important)
  if (info.age !== undefined) {
    totalScore += getAgeFactor(info.age) * 2; // Double weight
    factorCount += 2;
  }

  // Body condition score
  if (info.bodyConditionScore !== undefined) {
    totalScore += getBodyConditionFactor(info.bodyConditionScore) * 1.5; // 1.5x weight
    factorCount += 1.5;
  }

  // Health status
  if (info.healthStatus) {
    totalScore += HEALTH_STATUS_FACTORS[info.healthStatus];
    factorCount += 1;
  }

  // Weight (minor factor - just check if provided)
  if (info.weight !== undefined) {
    totalScore += 0.5;
    factorCount += 0.5;
  }

  const score = factorCount > 0 ? totalScore / factorCount : 0;
  const contribution = score * weight;

  return { score, weight, contribution, filled: factorCount > 0 };
}

/**
 * Calculate bitch breeding history factor
 */
function calculateBitchHistoryFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.bitchHistory;

  if (!inputs.bitchHistory || !inputs.bitchHistory.hasBeenBred) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const history = inputs.bitchHistory;
  let score = 0;

  if (history.hasBeenBred === 'no') {
    // First time breeding - slight penalty
    score = BREEDING_HISTORY_FACTORS.firstTime;
  } else {
    // Has been bred before
    score = BREEDING_HISTORY_FACTORS.experienced;

    // Apply complications penalty if applicable
    if (history.hasComplications === 'yes') {
      score *= BREEDING_HISTORY_FACTORS.hasComplications;
    }

    // Apply time since last litter factor
    if (history.monthsSinceLastLitter !== undefined) {
      const timeFactor = getTimeSinceLastLitterFactor(history.monthsSinceLastLitter);
      score *= timeFactor;
    }
  }

  const contribution = score * weight;
  return { score, weight, contribution, filled: true };
}

/**
 * Calculate litter history factor (previous success)
 */
function calculateLitterHistoryFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.litterHistory;

  if (!inputs.litterHistory) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const history = inputs.litterHistory;

  if (!history.totalLitters || history.totalLitters === 0) {
    // No litter history - slight penalty
    const score = LITTER_SUCCESS_FACTORS.noHistory;
    const contribution = score * weight;
    return { score, weight, contribution, filled: true };
  }

  // Calculate success rate
  const successRate = history.successfulLitters && history.totalLitters > 0
    ? (history.successfulLitters / history.totalLitters) * 100
    : 50; // Default to moderate if not specified

  let score = LITTER_SUCCESS_FACTORS.moderateSuccess;
  if (successRate >= 80) {
    score = LITTER_SUCCESS_FACTORS.highSuccess;
  } else if (successRate >= 50) {
    score = LITTER_SUCCESS_FACTORS.moderateSuccess;
  } else {
    score = LITTER_SUCCESS_FACTORS.lowSuccess;
  }

  // Bonus for consistent litter sizes
  if (history.averageLitterSize && history.averageLitterSize >= 5) {
    score *= 1.05; // 5% bonus
  }

  const contribution = score * weight;
  return { score, weight, contribution, filled: true };
}

/**
 * Calculate dog breeding history factor
 */
function calculateDogHistoryFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.dogHistory;

  if (!inputs.dogHistory || !inputs.dogHistory.hasBeenUsed) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const history = inputs.dogHistory;
  let score = 0;

  if (history.hasBeenUsed === 'no') {
    // First time stud - slight penalty
    score = DOG_HISTORY_FACTORS.firstTime;
  } else {
    // Has been used before
    score = DOG_HISTORY_FACTORS.proven;

    // Apply success rate factor
    const successRateFactor = getDogSuccessRateFactor(history.successRate);
    score *= successRateFactor;

    // Age at first use consideration (optional refinement)
    if (history.ageAtFirstUse !== undefined) {
      if (history.ageAtFirstUse < 1.5) {
        score *= 0.95; // Too young penalty
      } else if (history.ageAtFirstUse > 8) {
        score *= 0.95; // Too old penalty
      }
    }
  }

  const contribution = score * weight;
  return { score, weight, contribution, filled: true };
}

/**
 * Calculate breeder experience factor
 */
function calculateBreederHistoryFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.breederHistory;

  if (!inputs.breederHistory) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  const history = inputs.breederHistory;
  let score = 0;
  let factorCount = 0;

  // Years of experience
  if (history.yearsExperience !== undefined) {
    const experienceLevel = getBreederExperienceFactor(history.yearsExperience);
    score += BREEDER_EXPERIENCE_FACTORS[experienceLevel] * 1.5; // 1.5x weight
    factorCount += 1.5;
  }

  // Breed familiarity
  if (history.breedFamiliarity) {
    score += BREED_FAMILIARITY_FACTORS[history.breedFamiliarity];
    factorCount += 1;
  }

  // Total litters (minor factor - just check if experienced)
  if (history.totalLitters !== undefined) {
    if (history.totalLitters > 10) {
      score += 0.5; // Bonus for experience
    }
    factorCount += 0.5;
  }

  const finalScore = factorCount > 0 ? score / factorCount : 0;
  const contribution = finalScore * weight;

  return { score: finalScore, weight, contribution, filled: factorCount > 0 };
}

/**
 * Calculate semen quality factor (most important for success)
 */
function calculateSemenQualityFactor(inputs: ConceptionInputs): FactorCalculation {
  const weight = SECTION_WEIGHTS.semenQuality;

  if (!inputs.semenQuality && !inputs.semenInformation) {
    return { score: 0, weight, contribution: 0, filled: false };
  }

  let score = 0;
  let factorCount = 0;

  // Semen type factor
  if (inputs.semenInformation?.type) {
    const typeFactor = SEMEN_TYPE_FACTORS[inputs.semenInformation.type];
    score += typeFactor * 1.5; // 1.5x weight
    factorCount += 1.5;

    // Shipping duration penalty for chilled semen
    if (inputs.semenInformation.type === 'chilled' && inputs.semenInformation.shippingDuration) {
      if (inputs.semenInformation.shippingDuration > 48) {
        score *= 0.8; // 20% penalty for long shipping
      } else if (inputs.semenInformation.shippingDuration > 24) {
        score *= 0.95; // 5% penalty
      }
    }

    // Storage time consideration for frozen semen
    if (inputs.semenInformation.type === 'frozen' && inputs.semenInformation.storageTime) {
      // Frozen semen quality doesn't degrade much over time if stored properly
      // Minor penalty for very old samples
      if (inputs.semenInformation.storageTime > 60) {
        score *= 0.95;
      }
    }
  }

  // Semen quality factor (most important)
  if (inputs.semenQuality) {
    const quality = inputs.semenQuality;

    // If lab analysis available, calculate quality from parameters
    if (quality.motility !== undefined || quality.concentration !== undefined || quality.morphology !== undefined) {
      const calculatedQuality = calculateLabQuality(
        quality.motility,
        quality.concentration,
        quality.morphology
      );
      const qualityFactor = SEMEN_QUALITY_FACTORS[calculatedQuality];
      score += qualityFactor * 2; // 2x weight (very important)
      factorCount += 2;
    } else if (quality.quality) {
      // Use provided quality rating
      const qualityFactor = SEMEN_QUALITY_FACTORS[quality.quality];
      score += qualityFactor * 2; // 2x weight
      factorCount += 2;
    }
  }

  // Assessment type factor
  if (inputs.semenAssessment?.type) {
    const assessmentFactor = SEMEN_ASSESSMENT_FACTORS[inputs.semenAssessment.type];
    score += assessmentFactor;
    factorCount += 1;
  }

  const finalScore = factorCount > 0 ? score / factorCount : 0;
  const contribution = finalScore * weight;

  return { score: finalScore, weight, contribution, filled: factorCount > 0 };
}

/**
 * Export helper functions for individual factor calculations
 * (useful for debugging and testing)
 */
export const factorCalculators = {
  breed: calculateBreedFactor,
  bitchInformation: calculateBitchInformationFactor,
  bitchHistory: calculateBitchHistoryFactor,
  litterHistory: calculateLitterHistoryFactor,
  dogHistory: calculateDogHistoryFactor,
  breederHistory: calculateBreederHistoryFactor,
  semenQuality: calculateSemenQualityFactor,
};