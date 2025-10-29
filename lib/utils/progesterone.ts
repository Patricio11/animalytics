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
 * Detect phase based on progesterone level (ng/mL)
 * Based on Mini VIDAS Progesterone Timing Chart
 */
export function detectPhase(level: number): PhaseInfo {
  if (level < 1.5) {
    return {
      phase: "Anestrus",
      color: "gray",
      icon: "⚪",
      description: "Out of heat",
      bgClass: "bg-gray-500/10",
      borderClass: "border-gray-500/20",
      textClass: "text-gray-700"
    };
  } else if (level >= 1.5 && level < 4) {
    return {
      phase: "LH Surge",
      color: "pink",
      icon: "🟣",
      description: "Hormone surge beginning",
      bgClass: "bg-pink-500/10",
      borderClass: "border-pink-500/20",
      textClass: "text-pink-700"
    };
  } else if (level >= 4 && level < 9) {
    return {
      phase: "Estimated Ovulation",
      color: "red",
      icon: "🔴",
      description: "Ovulation occurring",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/20",
      textClass: "text-red-700"
    };
  } else if (level >= 9 && level < 15) {
    return {
      phase: "Egg Maturation",
      color: "yellow",
      icon: "🟡",
      description: "Eggs maturing",
      bgClass: "bg-yellow-500/10",
      borderClass: "border-yellow-500/20",
      textClass: "text-yellow-700"
    };
  } else if (level >= 15 && level < 25) {
    return {
      phase: "Fertile Range",
      color: "lightgreen",
      icon: "🟢",
      description: "Optimal breeding time",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/20",
      textClass: "text-green-700"
    };
  } else {
    return {
      phase: "Late Stage Fertility",
      color: "darkgreen",
      icon: "🟢",
      description: "Breeding window closing",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
      textClass: "text-emerald-700"
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
  if (progesteroneLevel < 4) {
    return {
      days: 3,
      date: addDays(currentDate, 3),
      reason: "Level below 4 ng/mL - test in 3 days"
    };
  } else if (progesteroneLevel >= 4 && progesteroneLevel < 10) {
    return {
      days: 2,
      date: addDays(currentDate, 2),
      reason: "Approaching ovulation - test every 2 days"
    };
  } else {
    return {
      days: 1,
      date: addDays(currentDate, 1),
      reason: "Fertile range - test daily"
    };
  }
}

/**
 * Check if progesterone level indicates breeding window is open
 */
export function isBreedingWindowOpen(progesteroneLevel: number): boolean {
  return progesteroneLevel >= 15 && progesteroneLevel <= 35;
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
    // Optimal for frozen semen: 25-35 ng/mL
    return progesteroneLevel >= 25 && progesteroneLevel <= 35;
  }
}

/**
 * Estimate ovulation day based on progesterone readings
 * Ovulation typically occurs when progesterone crosses 4-9 ng/mL
 */
export function estimateOvulationDay(
  readings: Array<{ day: number; progesteroneLevel: number }>
): number | null {
  // Find the first reading that crosses into ovulation range (4-9 ng/mL)
  const ovulationReading = readings.find(
    r => r.progesteroneLevel >= 4 && r.progesteroneLevel < 9
  );
  
  if (ovulationReading) {
    return ovulationReading.day;
  }
  
  // If no exact match, find when it crosses 4 ng/mL
  const crossingReading = readings.find(r => r.progesteroneLevel >= 4);
  return crossingReading?.day ?? null;
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

  if (level < 1.5) {
    return {
      phase: 'Anestrus',
      color: 'text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      icon: '⚪',
      description: 'Out of heat - Not yet started',
      nextAction: formatNextAction(2, 'Retest in 2-3 days'),
    };
  } else if (level < 4) {
    return {
      phase: 'Early Heat',
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      icon: '🔵',
      description: 'Baseline established',
      nextAction: formatNextAction(3, 'Next test in 3 days'),
    };
  } else if (level < 10) {
    return {
      phase: 'LH has been reached',
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      icon: '🟣',
      description: 'LH has been reached and therefore it is rising',
      nextAction: formatNextAction(2, 'Test every 2 days'),
    };
  } else if (level < 15) {
    return {
      phase: 'Rising Fast',
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      icon: '🟠',
      description: 'Approaching ovulation',
      nextAction: formatNextAction(1, 'Test daily - Ovulation imminent'),
    };
  } else if (level < 25) {
    return {
      phase: 'Breeding Window - Natural/Fresh AI',
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: '🟢',
      description: 'Optimal range for natural breeding or fresh AI',
      nextAction: formatNextAction(1, 'Test daily - Consider breeding now'),
    };
  } else if (level < 35) {
    return {
      phase: 'Peak - Frozen AI',
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: '🔴',
      description: 'Optimal range for frozen semen AI',
      nextAction: formatNextAction(1, 'Test daily - Breed within 24-48 hours'),
    };
  } else {
    return {
      phase: 'Post-Ovulation',
      color: 'text-pink-600',
      bg: 'bg-pink-100 dark:bg-pink-900/20',
      icon: '🌸',
      description: 'Past optimal breeding window',
      nextAction: testDate ? 'Continue monitoring if breeding occurred' : 'Continue monitoring if breeding occurred',
    };
  }
}
