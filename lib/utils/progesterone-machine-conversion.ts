/**
 * Progesterone Machine Conversion Utilities
 * 
 * Different progesterone testing machines use different calibrations and methodologies,
 * resulting in different numerical values for the same biological progesterone level.
 * This module provides conversion utilities to normalize all readings to a standard scale.
 * 
 * Standard Reference: Mini VIDAS (bioMérieux) - ng/mL
 */

// ============================================================================
// MACHINE TYPES
// ============================================================================

export type ProgesteroneMachine = 
  | 'VIDAS'           // Mini VIDAS (bioMérieux) - Standard reference
  | 'IDEXX'           // IDEXX Catalyst
  | 'IDEXX_LAB'       // IDEXX Reference Laboratory
  | 'IMMULITE'        // Siemens Immulite
  | 'CHEMILUMINESCENCE' // Generic chemiluminescence
  | 'RIA'             // Radioimmunoassay
  | 'OTHER';          // Other/Unknown

export interface MachineInfo {
  id: ProgesteroneMachine;
  name: string;
  manufacturer?: string;
  description: string;
  unit: 'ng/mL' | 'nmol/L';
  isReference: boolean;
}

// ============================================================================
// MACHINE DEFINITIONS
// ============================================================================

export const PROGESTERONE_MACHINES: Record<ProgesteroneMachine, MachineInfo> = {
  VIDAS: {
    id: 'VIDAS',
    name: 'Mini VIDAS',
    manufacturer: 'bioMérieux',
    description: 'Mini VIDAS Progesterone - Industry standard reference',
    unit: 'ng/mL',
    isReference: true,
  },
  IDEXX: {
    id: 'IDEXX',
    name: 'IDEXX Catalyst',
    manufacturer: 'IDEXX',
    description: 'IDEXX Catalyst Progesterone - In-clinic analyzer',
    unit: 'ng/mL',
    isReference: false,
  },
  IDEXX_LAB: {
    id: 'IDEXX_LAB',
    name: 'IDEXX Reference Lab',
    manufacturer: 'IDEXX',
    description: 'IDEXX Reference Laboratory - Send-out testing',
    unit: 'ng/mL',
    isReference: false,
  },
  IMMULITE: {
    id: 'IMMULITE',
    name: 'Immulite',
    manufacturer: 'Siemens',
    description: 'Siemens Immulite Progesterone Analyzer',
    unit: 'ng/mL',
    isReference: false,
  },
  CHEMILUMINESCENCE: {
    id: 'CHEMILUMINESCENCE',
    name: 'Chemiluminescence',
    description: 'Generic chemiluminescence immunoassay',
    unit: 'ng/mL',
    isReference: false,
  },
  RIA: {
    id: 'RIA',
    name: 'RIA',
    description: 'Radioimmunoassay',
    unit: 'ng/mL',
    isReference: false,
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other/Unknown',
    description: 'Other or unknown testing method',
    unit: 'ng/mL',
    isReference: false,
  },
};

// ============================================================================
// CONVERSION FACTORS
// ============================================================================

/**
 * Conversion factors to normalize readings to VIDAS standard (ng/mL)
 * 
 * Formula: VIDAS_ng/mL = machine_value * conversionFactor
 * 
 * Based on reference chart correlations:
 * - LH Rise: VIDAS 3 ng/mL = IDEXX 6-7 nmol/L
 * - Ovulation: VIDAS 10 ng/mL = IDEXX 15-25 nmol/L  
 * - Fertile: VIDAS 15-18 ng/mL = IDEXX 38-48 nmol/L
 * - Optimal: VIDAS 28 ng/mL = IDEXX 70+ nmol/L
 * 
 * Note: IDEXX values in chart are in nmol/L, need conversion to ng/mL first
 * 1 nmol/L = 0.314 ng/mL, so IDEXX nmol/L * 0.314 = ng/mL
 */
export const CONVERSION_TO_VIDAS: Record<ProgesteroneMachine, number> = {
  VIDAS: 1.0,              // Reference standard (ng/mL)
  IDEXX: 0.67,             // IDEXX in nmol/L: convert to ng/mL then normalize
                           // Example: IDEXX 15 nmol/L = 4.7 ng/mL, VIDAS 3 ng/mL → 3/4.7 = 0.64
                           // Average across range: ~0.67
  IDEXX_LAB: 0.95,         // IDEXX Lab is closer to VIDAS but still slightly higher
  IMMULITE: 0.85,          // Immulite tends to read higher
  CHEMILUMINESCENCE: 0.90, // Generic estimate
  RIA: 1.0,                // RIA is generally comparable to VIDAS
  OTHER: 1.0,              // No conversion for unknown
};

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert a progesterone reading from any machine to VIDAS standard
 * 
 * @param value - The progesterone value from the machine
 * @param machine - The machine type that produced the reading
 * @returns Normalized value in VIDAS-equivalent ng/mL
 */
export function convertToVidasStandard(
  value: number,
  machine: ProgesteroneMachine
): number {
  const factor = CONVERSION_TO_VIDAS[machine];
  return value * factor;
}

/**
 * Convert a VIDAS standard value to a specific machine's scale
 * 
 * @param vidasValue - The VIDAS-standard progesterone value
 * @param targetMachine - The machine type to convert to
 * @returns Value in the target machine's scale
 */
export function convertFromVidasStandard(
  vidasValue: number,
  targetMachine: ProgesteroneMachine
): number {
  const factor = CONVERSION_TO_VIDAS[targetMachine];
  return vidasValue / factor;
}

/**
 * Convert between any two machine types
 * 
 * @param value - The progesterone value
 * @param fromMachine - Source machine type
 * @param toMachine - Target machine type
 * @returns Converted value
 */
export function convertBetweenMachines(
  value: number,
  fromMachine: ProgesteroneMachine,
  toMachine: ProgesteroneMachine
): number {
  // Convert to VIDAS standard first, then to target
  const vidasValue = convertToVidasStandard(value, fromMachine);
  return convertFromVidasStandard(vidasValue, toMachine);
}

// ============================================================================
// READING NORMALIZATION
// ============================================================================

export interface ProgesteroneReading {
  rawValue: number;
  machine: ProgesteroneMachine;
  unit: 'ng/mL' | 'nmol/L';
}

export interface NormalizedReading extends ProgesteroneReading {
  normalizedValue: number; // Always in VIDAS-equivalent ng/mL
  conversionFactor: number;
  machineInfo: MachineInfo;
}

/**
 * Normalize a progesterone reading to VIDAS standard
 * 
 * @param reading - The raw reading with machine info
 * @returns Normalized reading with both raw and standardized values
 */
export function normalizeReading(reading: ProgesteroneReading): NormalizedReading {
  const machineInfo = PROGESTERONE_MACHINES[reading.machine];
  const conversionFactor = CONVERSION_TO_VIDAS[reading.machine];
  
  // Convert from nmol/L to ng/mL if needed (1 nmol/L = 0.314 ng/mL)
  let valueInNgMl = reading.rawValue;
  if (reading.unit === 'nmol/L') {
    valueInNgMl = reading.rawValue * 0.314;
  }
  
  // Apply machine-specific conversion
  const normalizedValue = valueInNgMl * conversionFactor;
  
  return {
    ...reading,
    normalizedValue,
    conversionFactor,
    machineInfo,
  };
}

/**
 * Normalize multiple readings from potentially different machines
 * 
 * @param readings - Array of readings from various machines
 * @returns Array of normalized readings, all on VIDAS-equivalent scale
 */
export function normalizeReadings(
  readings: ProgesteroneReading[]
): NormalizedReading[] {
  return readings.map(normalizeReading);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a progesterone reading based on machine type
 * 
 * @param value - The progesterone value
 * @param machine - The machine type
 * @param unit - The unit of measurement
 * @returns Validation result with message if invalid
 */
export function validateReading(
  value: number,
  machine: ProgesteroneMachine,
  unit: 'ng/mL' | 'nmol/L'
): { valid: boolean; message?: string } {
  if (value < 0) {
    return {
      valid: false,
      message: 'Progesterone value cannot be negative',
    };
  }
  
  // Set reasonable upper limits based on unit
  const maxValue = unit === 'ng/mL' ? 100 : 320; // 100 ng/mL ≈ 320 nmol/L
  
  if (value > maxValue) {
    return {
      valid: false,
      message: `Value ${value} ${unit} exceeds typical maximum (${maxValue} ${unit})`,
    };
  }
  
  // Machine-specific warnings
  if (machine === 'IDEXX' && value < 0.5 && unit === 'ng/mL') {
    return {
      valid: false,
      message: 'IDEXX Catalyst has a lower detection limit of ~0.5 ng/mL',
    };
  }
  
  return { valid: true };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Format a reading for display with machine context
 * 
 * @param reading - The normalized reading
 * @param showBoth - Whether to show both raw and normalized values
 * @returns Formatted string
 */
export function formatReading(
  reading: NormalizedReading,
  showBoth: boolean = false
): string {
  if (showBoth && reading.machine !== 'VIDAS') {
    return `${reading.rawValue.toFixed(1)} ${reading.unit} (${reading.machine}) = ${reading.normalizedValue.toFixed(1)} ng/mL (VIDAS equiv.)`;
  }
  return `${reading.rawValue.toFixed(1)} ${reading.unit}`;
}

/**
 * Get machine options for dropdown/select
 */
export function getMachineOptions(): Array<{ value: ProgesteroneMachine; label: string; description: string }> {
  return Object.values(PROGESTERONE_MACHINES).map(machine => ({
    value: machine.id,
    label: machine.name,
    description: machine.description,
  }));
}

// ============================================================================
// CORRELATION HELPERS
// ============================================================================

/**
 * Generate a correlation table showing equivalent values across machines
 * 
 * @param vidasValues - Array of VIDAS reference values
 * @returns Table of equivalent values for each machine
 */
export function generateCorrelationTable(
  vidasValues: number[]
): Record<ProgesteroneMachine, number[]> {
  const table: Record<ProgesteroneMachine, number[]> = {} as any;
  
  Object.keys(PROGESTERONE_MACHINES).forEach(machineKey => {
    const machine = machineKey as ProgesteroneMachine;
    table[machine] = vidasValues.map(vidasValue =>
      convertFromVidasStandard(vidasValue, machine)
    );
  });
  
  return table;
}

/**
 * Example correlation table for common breeding decision points
 */
export const BREEDING_DECISION_CORRELATIONS = generateCorrelationTable([
  1.5,  // LH surge threshold
  4.0,  // Ovulation beginning
  9.0,  // Ovulation peak
  15.0, // Breeding window start (natural/AI)
  25.0, // Breeding window start (frozen)
  35.0, // Breeding window end
]);
