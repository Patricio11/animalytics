import { addDays, format } from "date-fns";

/**
 * Phase information for progesterone levels
 */
export interface PhaseInfo {
  phase: string;
  color: string;
  icon: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

/**
 * Next test recommendation
 */
export interface NextTestRecommendation {
  days: number;
  date: Date;
  reason: string;
}

/**
 * Detect phase based on progesterone level (VIDAS ng/mL)
 * Calibrated to reference chart:
 *   LH Rise = 3 ng/mL | OV = 10 ng/mL | 1st Fresh = 15–18 | Optimal Frozen = 25–40 (peak 28)
 */
export function detectPhase(level: number): PhaseInfo {
  if (level < 3) {
    return {
      phase: "Baseline",
      color: "#9ca3af",
      icon: "⚪",
      description: "Before LH rise — not yet in fertile phase",
      bgClass: "bg-gray-500/10",
      borderClass: "border-gray-500/20",
      textClass: "text-gray-700"
    };
  } else if (level < 10) {
    return {
      phase: "LH Rise",
      color: "#a855f7",
      icon: "🟣",
      description: "LH surge detected — ovulation approaching",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/20",
      textClass: "text-purple-700"
    };
  } else if (level < 15) {
    return {
      phase: "Ovulation (OV)",
      color: "#ef4444",
      icon: "🔴",
      description: "Ovulation occurring (OV = 10 ng/mL) — eggs maturing",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/20",
      textClass: "text-red-700"
    };
  } else if (level < 18) {
    return {
      phase: "1st Mating – Fresh",
      color: "#10b981",
      icon: "🟢",
      description: "Optimal for natural breeding or fresh AI",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/20",
      textClass: "text-green-700"
    };
  } else if (level < 25) {
    return {
      phase: "Fertile Window",
      color: "#22c55e",
      icon: "🟢",
      description: "Fertile window — consider 2nd fresh mating",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/20",
      textClass: "text-green-700"
    };
  } else {
    return {
      phase: "Optimal – Frozen AI",
      color: "#0ea5e9",
      icon: "❄️",
      description: "Optimal for frozen semen AI — peak fertility at 28 ng/mL",
      bgClass: "bg-sky-500/10",
      borderClass: "border-sky-500/20",
      textClass: "text-sky-700"
    };
  }
}

/**
 * Calculate next test recommendation based on progesterone level
 * Based on Mini VIDAS Progesterone Timing Chart
 */
export function calculateNextTest(
  progesteroneLevel: number,
  currentDate: Date
): NextTestRecommendation {
  if (progesteroneLevel < 3) {
    return {
      days: 3,
      date: addDays(currentDate, 3),
      reason: "Below LH rise threshold — test in 3 days"
    };
  } else if (progesteroneLevel < 10) {
    return {
      days: 2,
      date: addDays(currentDate, 2),
      reason: "LH rise detected — test every 2 days until OV (10 ng/mL)"
    };
  } else {
    return {
      days: 1,
      date: addDays(currentDate, 1),
      reason: "Ovulation / fertile range — test daily"
    };
  }
}

/**
 * Check if progesterone level indicates breeding window is open
 */
export function isBreedingWindowOpen(progesteroneLevel: number): boolean {
  return progesteroneLevel >= 15 && progesteroneLevel <= 40;
}

/**
 * Check if progesterone level indicates optimal breeding time
 */
export function isOptimalBreedingTime(
  progesteroneLevel: number,
  breedingMethod: 'natural_ai' | 'frozen'
): boolean {
  if (breedingMethod === 'natural_ai') {
    // Optimal for natural/AI fresh/chilled: 15-25 ng/mL
    return progesteroneLevel >= 15 && progesteroneLevel < 25;
  } else {
    // Optimal for frozen semen: 25-40 ng/mL
    return progesteroneLevel >= 25 && progesteroneLevel <= 40;
  }
}

/**
 * Estimate ovulation day based on progesterone readings
 * Per VIDAS reference chart: OV = 10 ng/mL (VIDAS 33 nmol, IDEXX 15-25 nmol)
 * LH rise at 3 ng/mL → ovulation ~2-3 days later at 10 ng/mL
 */
export function estimateOvulationDay(
  readings: Array<{ day: number; progesteroneLevel: number }>
): number | null {
  // OV occurs at ~10 ng/mL — find the first reading that reaches this threshold
  const ovulationReading = readings.find(r => r.progesteroneLevel >= 10);
  if (ovulationReading) return ovulationReading.day;

  // Fallback: find when level first crosses LH rise threshold (3 ng/mL)
  const lhReading = readings.find(r => r.progesteroneLevel >= 3);
  return lhReading?.day ?? null;
}

/**
 * Calculate estimated whelping date
 * Whelping typically occurs 63 days (±2) from ovulation
 */
export function calculateWhelpingDate(ovulationDate: Date): Date {
  return addDays(ovulationDate, 63);
}

/**
 * Calculate breeding window dates based on ovulation and method
 */
export function calculateBreedingWindow(
  ovulationDate: Date,
  breedingMethod: 'natural_ai' | 'frozen'
): { start: Date; end: Date; description: string } {
  if (breedingMethod === 'natural_ai') {
    // Natural/AI fresh/chilled: 2-4 days after ovulation
    return {
      start: addDays(ovulationDate, 2),
      end: addDays(ovulationDate, 4),
      description: "Breed 2-4 days after ovulation"
    };
  } else {
    // Frozen semen: 3-5 days after ovulation
    return {
      start: addDays(ovulationDate, 3),
      end: addDays(ovulationDate, 5),
      description: "Breed 3-5 days after ovulation"
    };
  }
}

/**
 * Get urgency level for next test
 */
export function getTestUrgency(daysUntilTest: number): {
  level: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  message: string;
} {
  if (daysUntilTest < 0) {
    return {
      level: 'urgent',
      color: 'destructive',
      message: 'Test overdue!'
    };
  } else if (daysUntilTest === 0) {
    return {
      level: 'urgent',
      color: 'destructive',
      message: 'Test due today!'
    };
  } else if (daysUntilTest === 1) {
    return {
      level: 'high',
      color: 'chart-2',
      message: 'Test due tomorrow'
    };
  } else if (daysUntilTest === 2) {
    return {
      level: 'medium',
      color: 'chart-2',
      message: 'Test due in 2 days'
    };
  } else {
    return {
      level: 'low',
      color: 'primary',
      message: `Test due in ${daysUntilTest} days`
    };
  }
}

/**
 * Convert nanomoles to nanograms (1 nmol/L = 0.314 ng/mL)
 */
export function nmolToNg(nmol: number): number {
  return nmol * 0.314;
}

/**
 * Convert nanograms to nanomoles (1 ng/mL = 3.18 nmol/L)
 */
export function ngToNmol(ng: number): number {
  return ng * 3.18;
}

/**
 * Validate progesterone level based on unit
 */
export function validateProgesteroneLevel(
  level: number,
  unit: 'nanograms' | 'nanomoles'
): { valid: boolean; message?: string } {
  if (unit === 'nanograms') {
    if (level < 0 || level > 50) {
      return {
        valid: false,
        message: 'Progesterone level must be between 0 and 50 ng/mL'
      };
    }
  } else {
    if (level < 0 || level > 160) {
      return {
        valid: false,
        message: 'Progesterone level must be between 0 and 160 nmol/L'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Format progesterone level with unit
 */
export function formatProgesteroneLevel(
  level: number,
  unit: 'nanograms' | 'nanomoles'
): string {
  const unitLabel = unit === 'nanograms' ? 'ng/mL' : 'nmol/L';
  return `${level.toFixed(1)} ${unitLabel}`;
}

/**
 * Get detailed phase information with styling and recommendations
 * Used in modals and forms for progesterone reading entry
 * @param level - Progesterone level in ng/mL
 * @param day - Cycle day number
 * @param testDate - Optional date of the test to calculate next action date
 */
export function getPhaseInfo(level: number, day: number, testDate?: Date) {
  // Helper to format next action with date
  const formatNextAction = (daysToAdd: number, action: string): string => {
    if (!testDate) {
      return action;
    }
    const nextDate = addDays(testDate, daysToAdd);
    const dayName = format(nextDate, 'EEEE'); // e.g., "Friday"
    const dateStr = format(nextDate, 'MMM dd'); // e.g., "Oct 29"
    return `${action} (${dayName}, ${dateStr})`;
  };

  // Phases calibrated to VIDAS reference chart:
  // LH Rise = 3 ng/mL | OV = 10 ng/mL | 1st Fresh = 15–18 | Optimal Frozen = 25–40 (peak 28)
  if (level < 3) {
    return {
      phase: 'Baseline',
      color: 'text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      icon: '⚪',
      description: 'Before LH rise — monitor every few days',
      nextAction: formatNextAction(3, 'Next test in 3 days'),
    };
  } else if (level < 10) {
    return {
      phase: 'LH Rise',
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: '🟣',
      description: 'LH surge detected (LH Rise = 3 ng/mL) — ovulation approaching in 2-3 days',
      nextAction: formatNextAction(2, 'Test every 2 days'),
    };
  } else if (level < 15) {
    return {
      phase: 'Ovulation (OV)',
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: '🔴',
      description: 'Ovulation occurring (OV = 10 ng/mL) — eggs maturing, 1st mating in ~3 days',
      nextAction: formatNextAction(1, 'Test daily — 1st mating window approaching'),
    };
  } else if (level < 18) {
    return {
      phase: '1st Mating – Fresh',
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: '🟢',
      description: 'Optimal for natural breeding or fresh AI (VIDAS 15–18 ng/mL)',
      nextAction: formatNextAction(1, 'Test daily — Breed now with fresh semen'),
    };
  } else if (level < 25) {
    return {
      phase: 'Fertile Window',
      color: 'text-green-700',
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: '🟢',
      description: 'Fertile window — 2nd fresh mating or continue monitoring for frozen',
      nextAction: formatNextAction(1, 'Test daily — Consider 2nd mating'),
    };
  } else if (level <= 40) {
    return {
      phase: 'Optimal – Frozen AI',
      color: 'text-sky-600',
      bg: 'bg-sky-100 dark:bg-sky-900/20',
      icon: '❄️',
      description: 'Optimal for frozen semen AI — peak fertility at 28 ng/mL (VIDAS 89 nmol)',
      nextAction: formatNextAction(1, 'Test daily — Breed within 24-48 hours with frozen'),
    };
  } else {
    return {
      phase: 'Post-Optimal',
      color: 'text-pink-600',
      bg: 'bg-pink-100 dark:bg-pink-900/20',
      icon: '🌸',
      description: 'Past optimal breeding window — above 40 ng/mL',
      nextAction: 'Continue monitoring if breeding occurred',
    };
  }
}
