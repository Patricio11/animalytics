/**
 * Litter type definitions
 */

import type { Sex } from './types';

// ============================================================================
// LITTER TYPES
// ============================================================================

export type LitterStatus = 'expected' | 'whelped' | 'archived';

export type PuppyStatus = 'healthy' | 'sold' | 'retained' | 'available' | 'reserved' | 'deceased';

export interface Puppy {
  id: string;
  name?: string;
  sex: Sex;
  weight: number;
  color: string;
  status: PuppyStatus;
  markings?: string;
  birthWeight?: number;
  currentWeight?: number;
}

export interface Litter {
  id: string;
  matingDate: string;
  sireId: string;
  sireName: string;
  whelpingDate?: string;
  expectedWhelpingDate: string;
  actualWhelpingDate?: string; // Database field name
  puppyCount?: number;
  survivingPuppies?: number;
  maleCount?: number;
  femaleCount?: number;
  complications: boolean;
  complicationNotes?: string;
  notes?: string;
  status: LitterStatus;
  puppies?: Puppy[];
}
