export type Laboratory = 'VIDAS' | 'IDEXX';
export type Unit = 'nanograms' | 'nanomoles';
export type BreedingMethod = 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen';
export type DayNumber = 0 | 1 | 2 | 3 | 4 | 5;

export interface ProgesteroneReading {
  day: DayNumber;
  value: number;
  date: Date;
}

export interface ProgesteroneCalculationInput {
  laboratory: Laboratory;
  unit: Unit;
  breedingMethod: BreedingMethod;
  readings: ProgesteroneReading[];
}

export interface ProgesteroneRating {
  rating: number; // 1-10
  alternativeRating?: number;
  matchedPattern: string;
  confidence: number;
}

export interface MatrixPattern {
  pattern: number[];
  rating: number;
  alternativeRating?: number;
  description: string;
}

export interface ProgesteroneMatrix {
  [key: string]: MatrixPattern[];
}