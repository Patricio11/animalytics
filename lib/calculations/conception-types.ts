/**
 * Type definitions for conception rating calculations
 */

// Input types for each section of the wizard
export interface BitchInformationInputs {
  age?: number;
  weight?: number;
  bodyConditionScore?: number; // 1-9 scale
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BitchHistoryInputs {
  hasBeenBred?: 'yes' | 'no';
  previousLitters?: number;
  monthsSinceLastLitter?: number;
  hasComplications?: 'yes' | 'no';
  complications?: string;
}

export interface LitterHistoryInputs {
  totalLitters?: number;
  totalPuppies?: number;
  successfulLitters?: number; // Litters without complications
  averageLitterSize?: number;
}

export interface DogHistoryInputs {
  hasBeenUsed?: 'yes' | 'no';
  previousLitters?: number;
  successRate?: number; // Percentage
  ageAtFirstUse?: number;
}

export interface BreederHistoryInputs {
  yearsExperience?: number;
  totalLitters?: number;
  breedFamiliarity?: 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice';
}

export interface SemenInformationInputs {
  type?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  storageTime?: number; // For frozen
  shippingDuration?: number; // For chilled
}

export interface SemenQualityInputs {
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  volume?: number;
  concentration?: number;
  motility?: number;
  morphology?: number;
  visualNotes?: string;
}

export interface SemenAssessmentInputs {
  type?: 'full' | 'visual' | 'none';
}

// Complete input structure for calculation
export interface ConceptionInputs {
  breed?: string;
  dogBreed?: string;
  bitchInformation?: BitchInformationInputs;
  bitchHistory?: BitchHistoryInputs;
  litterHistory?: LitterHistoryInputs;
  dogHistory?: DogHistoryInputs;
  breederHistory?: BreederHistoryInputs;
  semenInformation?: SemenInformationInputs;
  semenQuality?: SemenQualityInputs;
  semenAssessment?: SemenAssessmentInputs;
}

// Section contribution breakdown
export interface SectionContribution {
  percentage: number; // Actual contribution (0-100)
  maxPossible: number; // Maximum possible contribution (weight)
  score: number; // Raw score before weighting (0-1)
  filled: boolean; // Whether section was filled
}

// Overall rating result
export interface ConceptionRating {
  overallRating: number; // 0-100%
  informationAccuracy: number; // 0-5 stars
  breakdown: {
    breed: SectionContribution;
    bitchInformation: SectionContribution;
    bitchHistory: SectionContribution;
    litterHistory: SectionContribution;
    dogHistory: SectionContribution;
    breederHistory: SectionContribution;
    semenQuality: SectionContribution;
  };
  totalWeight: number; // Total weight of filled sections
  missingWeight: number; // Total weight of unfilled sections
}

// Factor calculation results
export interface FactorCalculation {
  score: number; // 0-1 normalized score
  weight: number; // Section weight
  contribution: number; // Final contribution to overall rating
  filled: boolean; // Whether data was provided
}