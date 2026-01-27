/**
 * Progesterone Reference Values and Phase Correlations
 * Based on clinical breeding chart showing VIDAS and IDEXX correlations
 */

import type { ProgesteroneMachine } from './progesterone-machine-conversion';

// ============================================================================
// PHASE DEFINITIONS WITH MACHINE-SPECIFIC VALUES
// ============================================================================

export interface PhaseReferenceValues {
  phase: string;
  description: string;
  vidasNgMl: { min: number; max: number };
  vidasNmolL: { min: number; max: number };
  idexxNmolL: { min: number; max: number };
  color: string;
  icon: string;
  breedingAction?: string;
  daysFromStart?: string;
}

export const PROGESTERONE_PHASES: PhaseReferenceValues[] = [
  {
    phase: 'Start of Season',
    description: 'Day 1 - First blood observed',
    vidasNgMl: { min: 0, max: 1 },
    vidasNmolL: { min: 0, max: 3 },
    idexxNmolL: { min: 0, max: 3 },
    color: '#9ca3af',
    icon: '🔵',
    daysFromStart: 'Day 1',
  },
  {
    phase: 'Day 5-6',
    description: 'First progesterone test recommended',
    vidasNgMl: { min: 1, max: 2 },
    vidasNmolL: { min: 3, max: 6 },
    idexxNmolL: { min: 3, max: 6 },
    color: '#60a5fa',
    icon: '🔵',
    daysFromStart: 'Day 5-6',
  },
  {
    phase: 'LH Rise',
    description: 'Luteinizing hormone surge beginning',
    vidasNgMl: { min: 3, max: 5 },
    vidasNmolL: { min: 10, max: 16 },
    idexxNmolL: { min: 6, max: 7 },
    color: '#a855f7',
    icon: '🟣',
    breedingAction: 'Test every 2-3 days',
  },
  {
    phase: 'Day 2-3',
    description: 'Approaching ovulation',
    vidasNgMl: { min: 5, max: 8 },
    vidasNmolL: { min: 16, max: 25 },
    idexxNmolL: { min: 10, max: 15 },
    color: '#ec4899',
    icon: '🟣',
    daysFromStart: 'Day 2-3 before OV',
  },
  {
    phase: 'OV - Ovulation',
    description: 'Ovulation occurring',
    vidasNgMl: { min: 10, max: 10 },
    vidasNmolL: { min: 33, max: 33 },
    idexxNmolL: { min: 15, max: 25 },
    color: '#ef4444',
    icon: '🔴',
    breedingAction: 'Test daily',
  },
  {
    phase: '3 Days Post-OV',
    description: 'Eggs maturing - approaching fertile window',
    vidasNgMl: { min: 12, max: 15 },
    vidasNmolL: { min: 38, max: 47 },
    idexxNmolL: { min: 30, max: 38 },
    color: '#f59e0b',
    icon: '🟡',
    daysFromStart: '3 days after OV',
  },
  {
    phase: '1st Mating Fresh',
    description: 'Optimal for natural breeding or fresh AI',
    vidasNgMl: { min: 15, max: 18 },
    vidasNmolL: { min: 47, max: 57 },
    idexxNmolL: { min: 38, max: 48 },
    color: '#10b981',
    icon: '🟢',
    breedingAction: '1st mating with fresh semen',
  },
  {
    phase: 'Fertile - Peak',
    description: 'Peak fertility - optimal for all breeding methods',
    vidasNgMl: { min: 28, max: 28 },
    vidasNmolL: { min: 89, max: 89 },
    idexxNmolL: { min: 70, max: 100 },
    color: '#059669',
    icon: '🟢',
    breedingAction: 'Optimal breeding window',
  },
  {
    phase: 'Optimal - Frozen Semen',
    description: 'Best time for frozen semen AI',
    vidasNgMl: { min: 25, max: 35 },
    vidasNmolL: { min: 80, max: 110 },
    idexxNmolL: { min: 70, max: 120 },
    color: '#0ea5e9',
    icon: '❄️',
    breedingAction: '1x Mating - Frozen Semen, 2nd mating fresh semen',
  },
];

// ============================================================================
// BREEDING RECOMMENDATIONS BY PHASE
// ============================================================================

export interface BreedingRecommendation {
  phase: string;
  vidasRange: string;
  idexxRange: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
}

export const BREEDING_RECOMMENDATIONS: BreedingRecommendation[] = [
  {
    phase: 'LH Rise',
    vidasRange: '3 ng/mL (10 nmol/L)',
    idexxRange: '6-7 nmol/L',
    recommendation: 'Test every 2-3 days',
    priority: 'medium',
    color: '#a855f7',
  },
  {
    phase: 'Ovulation',
    vidasRange: '10 ng/mL (33 nmol/L)',
    idexxRange: '15-25 nmol/L',
    recommendation: 'Test daily - Ovulation occurring',
    priority: 'high',
    color: '#ef4444',
  },
  {
    phase: '1st Mating Fresh',
    vidasRange: '15-18 ng/mL (47-57 nmol/L)',
    idexxRange: '38-48 nmol/L',
    recommendation: 'Breed with fresh semen or natural mating',
    priority: 'urgent',
    color: '#10b981',
  },
  {
    phase: 'Fertile Peak',
    vidasRange: '28 ng/mL (89 nmol/L)',
    idexxRange: '70+ nmol/L',
    recommendation: 'Peak fertility - All breeding methods optimal',
    priority: 'urgent',
    color: '#059669',
  },
  {
    phase: 'Optimal Frozen',
    vidasRange: '25-35 ng/mL',
    idexxRange: '70-120 nmol/L',
    recommendation: '1x Frozen semen, 2nd mating fresh',
    priority: 'urgent',
    color: '#0ea5e9',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get phase information based on progesterone level (VIDAS ng/mL)
 */
export function getPhaseByLevel(vidasNgMl: number): PhaseReferenceValues | null {
  return PROGESTERONE_PHASES.find(
    phase => vidasNgMl >= phase.vidasNgMl.min && vidasNgMl <= phase.vidasNgMl.max
  ) || null;
}

/**
 * Get breeding recommendation based on progesterone level
 */
export function getBreedingRecommendation(vidasNgMl: number): BreedingRecommendation | null {
  if (vidasNgMl >= 3 && vidasNgMl < 5) return BREEDING_RECOMMENDATIONS[0]; // LH Rise
  if (vidasNgMl >= 10 && vidasNgMl < 12) return BREEDING_RECOMMENDATIONS[1]; // Ovulation
  if (vidasNgMl >= 15 && vidasNgMl <= 18) return BREEDING_RECOMMENDATIONS[2]; // 1st Mating Fresh
  if (vidasNgMl >= 28 && vidasNgMl <= 30) return BREEDING_RECOMMENDATIONS[3]; // Fertile Peak
  if (vidasNgMl >= 25 && vidasNgMl <= 35) return BREEDING_RECOMMENDATIONS[4]; // Optimal Frozen
  return null;
}

/**
 * Get equivalent value for a specific machine
 */
export function getEquivalentValue(
  vidasNgMl: number,
  targetMachine: 'VIDAS_NMOL' | 'IDEXX_NMOL'
): number {
  if (targetMachine === 'VIDAS_NMOL') {
    // Convert ng/mL to nmol/L: multiply by 3.18
    return vidasNgMl * 3.18;
  } else {
    // IDEXX reads in nmol/L, roughly 2-2.5x VIDAS nmol/L at higher ranges
    const vidasNmol = vidasNgMl * 3.18;
    // Approximate IDEXX correlation based on reference chart
    if (vidasNgMl <= 3) return vidasNmol * 2.0; // LH Rise: VIDAS 10 nmol → IDEXX 6-7 nmol (close)
    if (vidasNgMl <= 10) return vidasNmol * 0.6; // OV: VIDAS 33 nmol → IDEXX 15-25 nmol
    if (vidasNgMl <= 18) return vidasNmol * 0.85; // Fresh: VIDAS 47-57 nmol → IDEXX 38-48 nmol
    return vidasNmol * 0.8; // Fertile: VIDAS 89 nmol → IDEXX 70+ nmol
  }
}

/**
 * Format phase values for display
 */
export function formatPhaseValues(phase: PhaseReferenceValues): {
  vidas: string;
  vidasNmol: string;
  idexx: string;
} {
  const vidasNg = phase.vidasNgMl.min === phase.vidasNgMl.max
    ? `${phase.vidasNgMl.min}`
    : `${phase.vidasNgMl.min}-${phase.vidasNgMl.max}`;
  
  const vidasNmol = phase.vidasNmolL.min === phase.vidasNmolL.max
    ? `${phase.vidasNmolL.min}`
    : `${phase.vidasNmolL.min}-${phase.vidasNmolL.max}`;
  
  const idexxNmol = phase.idexxNmolL.min === phase.idexxNmolL.max
    ? `${phase.idexxNmolL.min}`
    : `${phase.idexxNmolL.min}-${phase.idexxNmolL.max}`;

  return {
    vidas: `VIDAS ${vidasNg} N/G`,
    vidasNmol: `VIDAS ${vidasNmol} N/Mols`,
    idexx: `IDEXX ${idexxNmol} N/Mols`,
  };
}
