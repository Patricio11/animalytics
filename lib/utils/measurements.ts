/**
 * Measurement Unit Conversion Utilities
 *
 * Best Practices:
 * - Store all measurements in METRIC (kg, cm, °C) in the database
 * - Convert to Imperial (lbs, inches, °F) for display based on user preference
 * - This ensures consistency and enables accurate comparisons
 */

export type MeasurementSystem = 'metric' | 'imperial';

// ==================== WEIGHT CONVERSIONS ====================

/**
 * Convert kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds
 */
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

/**
 * Convert pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms
 */
export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

/**
 * Format weight according to user's preferred system
 * @param kg - Weight in kilograms (stored value)
 * @param system - Measurement system preference
 * @param decimals - Number of decimal places
 * @returns Formatted weight string with unit
 */
export function formatWeight(
  kg: number,
  system: MeasurementSystem = 'metric',
  decimals: number = 2
): string {
  if (system === 'imperial') {
    const lbs = kgToLbs(kg);
    return `${lbs.toFixed(decimals)} lbs`;
  }
  return `${kg.toFixed(decimals)} kg`;
}

/**
 * Parse weight string to kilograms (for storage)
 * @param value - Weight string (e.g., "25 kg", "55 lbs")
 * @param system - Measurement system of input
 * @returns Weight in kilograms
 */
export function parseWeightToKg(
  value: string | number,
  system: MeasurementSystem = 'metric'
): number {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

  if (isNaN(numValue)) {
    return 0;
  }

  return system === 'imperial' ? lbsToKg(numValue) : numValue;
}

// ==================== HEIGHT/LENGTH CONVERSIONS ====================

/**
 * Convert centimeters to inches
 * @param cm - Length in centimeters
 * @returns Length in inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Convert inches to centimeters
 * @param inches - Length in inches
 * @returns Length in centimeters
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

/**
 * Convert centimeters to feet and inches
 * @param cm - Length in centimeters
 * @returns Object with feet and inches
 */
export function cmToFeetAndInches(cm: number): { feet: number; inches: number } {
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

/**
 * Convert feet and inches to centimeters
 * @param feet - Number of feet
 * @param inches - Number of inches
 * @returns Length in centimeters
 */
export function feetAndInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return inchesToCm(totalInches);
}

/**
 * Format height according to user's preferred system
 * @param cm - Height in centimeters (stored value)
 * @param system - Measurement system preference
 * @param decimals - Number of decimal places
 * @returns Formatted height string with unit
 */
export function formatHeight(
  cm: number,
  system: MeasurementSystem = 'metric',
  decimals: number = 1
): string {
  if (system === 'imperial') {
    const { feet, inches } = cmToFeetAndInches(cm);
    return `${feet}' ${inches.toFixed(decimals)}"`;
  }
  return `${cm.toFixed(decimals)} cm`;
}

/**
 * Parse height string to centimeters (for storage)
 * @param value - Height string (e.g., "50 cm", "5' 10\"")
 * @param system - Measurement system of input
 * @returns Height in centimeters
 */
export function parseHeightToCm(
  value: string | number,
  system: MeasurementSystem = 'metric'
): number {
  if (typeof value === 'number') {
    return system === 'imperial' ? inchesToCm(value) : value;
  }

  // Handle imperial format (e.g., "5' 10\"" or "5 feet 10 inches")
  if (system === 'imperial') {
    const feetMatch = value.match(/(\d+)(?:['ft]|feet)/);
    const inchesMatch = value.match(/(\d+(?:\.\d+)?)(?:[\"in]|inches)/);

    const feet = feetMatch ? parseInt(feetMatch[1]) : 0;
    const inches = inchesMatch ? parseFloat(inchesMatch[1]) : 0;

    return feetAndInchesToCm(feet, inches);
  }

  // Handle metric format
  const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(numValue) ? 0 : numValue;
}

// ==================== TEMPERATURE CONVERSIONS ====================

/**
 * Convert Celsius to Fahrenheit
 * @param celsius - Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit - Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Format temperature according to user's preferred system
 * @param celsius - Temperature in Celsius (stored value)
 * @param system - Measurement system preference
 * @param decimals - Number of decimal places
 * @returns Formatted temperature string with unit
 */
export function formatTemperature(
  celsius: number,
  system: MeasurementSystem = 'metric',
  decimals: number = 1
): string {
  if (system === 'imperial') {
    const fahrenheit = celsiusToFahrenheit(celsius);
    return `${fahrenheit.toFixed(decimals)}°F`;
  }
  return `${celsius.toFixed(decimals)}°C`;
}

/**
 * Parse temperature string to Celsius (for storage)
 * @param value - Temperature string (e.g., "38.5°C", "101.3°F")
 * @param system - Measurement system of input
 * @returns Temperature in Celsius
 */
export function parseTemperatureToCelsius(
  value: string | number,
  system: MeasurementSystem = 'metric'
): number {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;

  if (isNaN(numValue)) {
    return 0;
  }

  return system === 'imperial' ? fahrenheitToCelsius(numValue) : numValue;
}

// ==================== DISTANCE CONVERSIONS ====================

/**
 * Convert kilometers to miles
 * @param km - Distance in kilometers
 * @returns Distance in miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/**
 * Convert miles to kilometers
 * @param miles - Distance in miles
 * @returns Distance in kilometers
 */
export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

/**
 * Format distance according to user's preferred system
 * @param km - Distance in kilometers (stored value)
 * @param system - Measurement system preference
 * @param decimals - Number of decimal places
 * @returns Formatted distance string with unit
 */
export function formatDistance(
  km: number,
  system: MeasurementSystem = 'metric',
  decimals: number = 2
): string {
  if (system === 'imperial') {
    const miles = kmToMiles(km);
    return `${miles.toFixed(decimals)} mi`;
  }
  return `${km.toFixed(decimals)} km`;
}

// ==================== VOLUME CONVERSIONS (for liquid measurements) ====================

/**
 * Convert milliliters to fluid ounces
 * @param ml - Volume in milliliters
 * @returns Volume in fluid ounces
 */
export function mlToFlOz(ml: number): number {
  return ml / 29.5735;
}

/**
 * Convert fluid ounces to milliliters
 * @param flOz - Volume in fluid ounces
 * @returns Volume in milliliters
 */
export function flOzToMl(flOz: number): number {
  return flOz * 29.5735;
}

/**
 * Format volume according to user's preferred system
 * @param ml - Volume in milliliters (stored value)
 * @param system - Measurement system preference
 * @param decimals - Number of decimal places
 * @returns Formatted volume string with unit
 */
export function formatVolume(
  ml: number,
  system: MeasurementSystem = 'metric',
  decimals: number = 1
): string {
  if (system === 'imperial') {
    const flOz = mlToFlOz(ml);
    return `${flOz.toFixed(decimals)} fl oz`;
  }
  return `${ml.toFixed(decimals)} ml`;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Validate measurement value
 * @param value - Value to validate
 * @returns True if valid, false otherwise
 */
export function isValidMeasurement(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= 0;
}

/**
 * Get unit symbol for measurement type
 * @param type - Measurement type
 * @param system - Measurement system
 * @returns Unit symbol
 */
export function getUnitSymbol(
  type: 'weight' | 'height' | 'temperature' | 'distance' | 'volume',
  system: MeasurementSystem = 'metric'
): string {
  const symbols = {
    metric: {
      weight: 'kg',
      height: 'cm',
      temperature: '°C',
      distance: 'km',
      volume: 'ml',
    },
    imperial: {
      weight: 'lbs',
      height: 'in',
      temperature: '°F',
      distance: 'mi',
      volume: 'fl oz',
    },
  };

  return symbols[system][type];
}
