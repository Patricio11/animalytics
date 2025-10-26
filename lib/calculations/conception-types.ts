/**
 * Type definitions for conception rating calculations
 */

// Input types for each section of the wizard
export interface BitchInformationInputs {
  age?: number;
  weight?: number;
  bodyConditionScore?: number; // 1-9 scale
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  // New Step 2 fields
  livingCondition?: 'kennels' | 'pack' | 'on_her_own';
  positionInPack?: 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know';
  ageAtMating?: number;
  runsWithOthers?: 'yes' | 'no' | 'dont_know';
  runsWithHowMany?: number;
  ranWithOthersDuringPreviousPregnancies?: 'yes' | 'no' | 'dont_know';
}

export interface BitchHistoryInputs {
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

export interface LitterHistoryInputs {
  totalLitters?: number;
  totalPuppies?: number;
  successfulLitters?: number; // Litters without complications
  averageLitterSize?: number;
}

export interface DogHistoryInputs {
  // Original fields
  hasBeenUsed?: 'yes' | 'no';
  previousLitters?: number;
  successRate?: number; // Percentage
  ageAtFirstUse?: number;
  // New fields from Step 5
  littersSired?: '0' | '1-2' | '3-5' | '5+';
  fathersLittersSired?: '1-3' | '4-10' | '11+';
  recentLitterDate?: 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months';
  pupsInMostRecentSire?: '0' | '1-3' | '4-6' | '7+';
}

export interface BreederHistoryInputs {
  yearsExperience?: number;
  totalLitters?: number;
  breedFamiliarity?: 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice';
}

export interface SemenInformationInputs {
  // Original fields
  type?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  storageTime?: number; // For frozen
  shippingDuration?: number; // For chilled
  // New fields from Step 7
  timeBetweenCollectionAndInsemination?: 'less_than_24hrs' | '24-48hrs' | 'more_than_48hrs'; // Chilled only
  ageOfDogAtCollection?: number; // Years
  batchUsedPreviously?: 'yes' | 'no' | 'dont_know';
  didProducePups?: 'yes' | 'no' | 'dont_know';
  pupsProduced?: '1-3' | '4-6' | '7+';
}

export interface SemenQualityInputs {
  quality?: 'excellent' | 'good' | 'poor'; // Updated to match HTML
  volume?: number;
  concentration?: number;
  motility?: number;
  morphology?: number;
  visualNotes?: string;
}

export interface SemenAssessmentInputs {
  // New fields from Step 8
  inseminatorName?: string;
  semenAssessed?: 'yes' | 'no' | 'dont_know';
  // Original fields
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