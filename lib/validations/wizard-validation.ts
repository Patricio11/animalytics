/**
 * Validation utilities for Conception Rating Wizard
 * 
 * Provides validation functions for each step and overall wizard completion
 */

import { WizardData } from '@/lib/types/wizard';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Step 1: Animal Selection
 */
export function validateAnimalSelection(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.bitchId) {
    errors.push('Please select a bitch');
  }

  if (!data.dogId) {
    errors.push('Please select a dog');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Step 2: Bitch Information
 */
export function validateBitchInformation(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Age is critical (using ageAtMating from Step 2)
  if (data.ageAtMating === undefined || data.ageAtMating === null) {
    errors.push('Age is required');
  } else {
    const age = typeof data.ageAtMating === 'string' ? parseFloat(data.ageAtMating) : data.ageAtMating;
    if (!isNaN(age)) {
      if (age < 1) {
        warnings.push('Bitch is under 1 year old - breeding not recommended');
      }
      if (age > 9) {
        warnings.push('Bitch is over 9 years old - high risk breeding');
      }
    }
  }

  // Weight should be provided
  if (!data.weight) {
    warnings.push('Weight is recommended for accurate assessment');
  }

  // Body condition score is important
  if (!data.bodyConditionScore) {
    warnings.push('Body condition score is recommended');
  } else {
    if (data.bodyConditionScore <= 3 || data.bodyConditionScore >= 7) {
      warnings.push('Body condition score is not ideal (optimal: 4-6)');
    }
  }

  // Health status is critical
  if (!data.healthStatus) {
    errors.push('Health status is required');
  } else if (data.healthStatus === 'poor') {
    warnings.push('Poor health status significantly reduces conception chances');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Step 3: Bitch History
 */
export function validateBitchHistory(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.hasBeenBred) {
    errors.push('Breeding history is required');
  }

  // If has been bred, check for additional info
  if (data.hasBeenBred === 'yes') {
    if (data.previousLitters === undefined) {
      warnings.push('Number of previous litters is recommended');
    }

    if (data.lastLitterDate) {
      const monthsSince = typeof data.lastLitterDate === 'string' ? parseInt(data.lastLitterDate) : data.lastLitterDate;
      if (!isNaN(monthsSince) && monthsSince < 6) {
        warnings.push('Less than 6 months since last litter - health risk');
      }
    }

    if (data.complications) {
      warnings.push('Previous complications may affect this breeding');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Step 5: Dog History
 */
export function validateDogHistory(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.hasBeenUsed) {
    errors.push('Dog breeding history is required');
  }

  // Check for concerning patterns
  if (data.recentLitterDate === 'more_than_18_months') {
    warnings.push('More than 18 months since last breeding - consider semen analysis');
  }

  if (data.pupsInMostRecentSire === '0') {
    warnings.push('No pups in most recent sire - fertility concern');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Step 7: Semen Information
 */
export function validateSemenInformation(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.type) {
    errors.push('Semen type is required');
  }

  // Chilled semen specific validation
  if (data.type === 'chilled') {
    if (!data.timeBetweenCollectionAndInsemination) {
      warnings.push('Time between collection and insemination is recommended for chilled semen');
    } else if (data.timeBetweenCollectionAndInsemination === 'more_than_48hrs') {
      warnings.push('More than 48 hours reduces chilled semen viability significantly');
    }
  }

  // Age at collection validation
  if (data.ageOfDogAtCollection !== undefined) {
    if (data.ageOfDogAtCollection < 1) {
      warnings.push('Dog under 12 months at collection - poor semen quality expected');
    }
    if (data.ageOfDogAtCollection > 10) {
      warnings.push('Dog over 10 years at collection - declining semen quality');
    }
  }

  // Batch history validation
  if (data.batchUsedPreviously === 'yes' && data.didProducePups === 'no') {
    warnings.push('Batch previously failed to produce pups - significant concern');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Step 8: Semen Assessment
 */
export function validateSemenAssessment(data: WizardData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.semenAssessed) {
    errors.push('Semen assessment status is required');
  }

  if (data.semenAssessed === 'no') {
    warnings.push('No semen assessment significantly increases breeding risk');
  }

  // If assessed, check for quality data
  if (data.semenAssessed === 'yes') {
    if (!data.assessmentType) {
      warnings.push('Assessment type is recommended');
    }

    if (data.assessmentType === 'full') {
      // Check for lab values
      if (!data.motility && !data.concentration && !data.morphology) {
        warnings.push('Laboratory values are recommended for full assessment');
      }

      // Validate lab values if provided
      if (data.motility !== undefined && Number(data.motility) < 50) {
        warnings.push('Motility below 50% significantly reduces conception chances');
      }

      if (data.concentration !== undefined && Number(data.concentration) < 200) {
        warnings.push('Concentration below 200 million/mL may indicate fertility issues');
      }
    }

    if (data.assessmentType === 'general' && !data.quality) {
      warnings.push('Quality rating is required for general assessment');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate entire wizard data
 */
export function validateWizardData(data: WizardData): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate each step
  const step1 = validateAnimalSelection(data);
  const step2 = validateBitchInformation(data);
  const step3 = validateBitchHistory(data);
  const step5 = validateDogHistory(data);
  const step7 = validateSemenInformation(data);
  const step8 = validateSemenAssessment(data);

  // Collect all errors and warnings
  allErrors.push(...step1.errors, ...step2.errors, ...step3.errors, ...step5.errors, ...step7.errors, ...step8.errors);
  allWarnings.push(...step1.warnings, ...step2.warnings, ...step3.warnings, ...step5.warnings, ...step7.warnings, ...step8.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Get completion percentage for wizard
 */
export function getWizardCompletionPercentage(data: WizardData): number {
  let completed = 0;
  let total = 8; // 8 steps

  // Step 1: Animal Selection
  if (data.bitchId && data.dogId) completed++;

  // Step 2: Bitch Information
  if (data.ageAtMating !== undefined && data.healthStatus) completed++;

  // Step 3: Bitch History
  if (data.hasBeenBred) completed++;

  // Step 4: Litter History (optional but counts if provided)
  if (data.litterHistory && Array.isArray(data.litterHistory) && data.litterHistory.length > 0) completed++;

  // Step 5: Dog History
  if (data.hasBeenUsed) completed++;

  // Step 6: Breeder History (optional but counts if provided)
  if (data.yearsExperience !== undefined) completed++;

  // Step 7: Semen Information
  if (data.type) completed++;

  // Step 8: Semen Assessment
  if (data.semenAssessed) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Get required fields for current step
 */
export function getRequiredFieldsForStep(step: number): string[] {
  switch (step) {
    case 1:
      return ['bitchId', 'dogId'];
    case 2:
      return ['age', 'healthStatus'];
    case 3:
      return ['hasBeenBred'];
    case 4:
      return []; // Optional step
    case 5:
      return ['hasBeenUsed'];
    case 6:
      return []; // Optional step
    case 7:
      return ['type'];
    case 8:
      return ['semenAssessed'];
    default:
      return [];
  }
}
