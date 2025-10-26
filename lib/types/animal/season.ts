/**
 * Season (heat cycle) type definitions
 */

// ============================================================================
// SEASON TYPES
// ============================================================================

export type ProgesteroneUnit = 'ng/mL' | 'nmol/L';

export interface ProgesteroneReading {
  date: string;
  value: number;
  unit: ProgesteroneUnit;
}

export interface Season {
  id: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  progesteroneReadings?: ProgesteroneReading[];
}
