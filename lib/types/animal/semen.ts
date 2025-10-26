/**
 * Semen assessment type definitions
 */

// ============================================================================
// SEMEN ASSESSMENT TYPES
// ============================================================================

export type SemenQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface SemenAssessment {
  id: string;
  date: string;
  volume: number; // mL
  concentration: number; // million/mL
  motility: number; // percentage
  morphology: number; // percentage
  quality: SemenQuality;
  notes?: string;
  technician?: string;
}
