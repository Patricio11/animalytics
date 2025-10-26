/**
 * Frozen semen type definitions
 */

import type { SemenAssessment } from '../animal/semen';
import type { PhotoCategory } from '../animal/photo';

// ============================================================================
// FROZEN SEMEN TYPES
// ============================================================================

export type FrozenSemenStatus = 'available' | 'reserved' | 'used' | 'expired';

export interface FrozenSemenDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface FrozenSemenUsageHistory {
  id: string;
  date: string;
  strawsUsed: number;
  bitchId: string;
  bitchName: string;
  matingId?: string;
  notes?: string;
}

export interface FrozenSemenBatch {
  id: string;
  batchIdentifier: string;
  sourceAnimalId: string;
  sourceAnimalName: string;
  breed: string;
  registrationNumber?: string;
  collectionDate: string;
  clinicId: string;
  clinicName: string;
  numberOfStraws: number;
  strawsRemaining: number;
  storageNotes?: string;
  status: FrozenSemenStatus;
  createdAt: string;
  updatedAt: string;
  // Additional details
  semenAssessment?: SemenAssessment;
  photos?: PhotoCategory[];
  documents?: FrozenSemenDocument[];
  usageHistory?: FrozenSemenUsageHistory[];
}
