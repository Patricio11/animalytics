import { ProgesteroneCalculationInput, ProgesteroneRating, ProgesteroneReading } from './types';
import { getMatrix } from './progesterone-matrices';

/**
 * Calculate progesterone rating based on readings and breeding parameters
 */
export function calculateProgesteroneRating(input: ProgesteroneCalculationInput): ProgesteroneRating {
  const { laboratory, unit, breedingMethod, readings } = input;

  // Validate input
  if (!readings || readings.length === 0) {
    return {
      rating: 0,
      matchedPattern: 'No readings provided',
      confidence: 0
    };
  }

  // Sort readings by day
  const sortedReadings = [...readings].sort((a, b) => a.day - b.day);

  // Extract values
  const values = sortedReadings.map(r => r.value);

  // Get appropriate matrix
  const matrix = getMatrix(laboratory, unit, breedingMethod);
  const patterns = matrix[breedingMethod];

  if (!patterns || patterns.length === 0) {
    return {
      rating: 0,
      matchedPattern: 'No patterns available for this breeding method',
      confidence: 0
    };
  }

  // Find best matching pattern
  let bestMatch = {
    pattern: patterns[0],
    score: 0,
    confidence: 0
  };

  for (const pattern of patterns) {
    const score = calculatePatternMatch(values, pattern.pattern);
    if (score > bestMatch.score) {
      bestMatch = {
        pattern,
        score,
        confidence: Math.min(score * 10, 100)
      };
    }
  }

  return {
    rating: bestMatch.pattern.rating,
    alternativeRating: bestMatch.pattern.alternativeRating,
    matchedPattern: bestMatch.pattern.description,
    confidence: bestMatch.confidence
  };
}

/**
 * Calculate how well actual readings match a pattern
 * Returns a score between 0 and 10
 */
function calculatePatternMatch(actualValues: number[], patternValues: number[]): number {
  if (actualValues.length === 0) return 0;

  // If we have fewer readings than pattern, only compare what we have
  const compareLength = Math.min(actualValues.length, patternValues.length);

  let totalDifference = 0;
  let maxPossibleDifference = 0;

  for (let i = 0; i < compareLength; i++) {
    const actual = actualValues[i];
    const expected = patternValues[i];
    const difference = Math.abs(actual - expected);

    totalDifference += difference;
    // Max possible difference is the expected value itself (assuming worst case of 0)
    maxPossibleDifference += Math.max(expected, actual);
  }

  // Calculate similarity as a percentage
  if (maxPossibleDifference === 0) return 10;

  const similarity = 1 - (totalDifference / maxPossibleDifference);
  return Math.max(0, similarity * 10);
}

/**
 * Analyze progesterone trend
 */
export function analyzeProgesteroneTrend(readings: ProgesteroneReading[]): {
  trend: 'rising' | 'falling' | 'stable' | 'insufficient';
  averageChange: number;
  isOptimal: boolean;
} {
  if (readings.length < 2) {
    return {
      trend: 'insufficient',
      averageChange: 0,
      isOptimal: false
    };
  }

  const sortedReadings = [...readings].sort((a, b) => a.day - b.day);
  let totalChange = 0;
  let changeCount = 0;

  for (let i = 1; i < sortedReadings.length; i++) {
    const change = sortedReadings[i].value - sortedReadings[i - 1].value;
    totalChange += change;
    changeCount++;
  }

  const averageChange = totalChange / changeCount;

  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  if (averageChange > 0.5) {
    trend = 'rising';
  } else if (averageChange < -0.5) {
    trend = 'falling';
  }

  // Optimal is generally a rising trend for breeding
  const isOptimal = trend === 'rising' && averageChange >= 1;

  return {
    trend,
    averageChange,
    isOptimal
  };
}

/**
 * Get breeding recommendation based on progesterone rating
 */
export function getBreedingRecommendation(rating: ProgesteroneRating): {
  recommendation: 'optimal' | 'good' | 'acceptable' | 'not_recommended';
  message: string;
  suggestedAction: string;
} {
  if (rating.rating >= 9) {
    return {
      recommendation: 'optimal',
      message: 'Excellent progesterone levels for breeding',
      suggestedAction: 'Proceed with breeding as planned'
    };
  } else if (rating.rating >= 7) {
    return {
      recommendation: 'good',
      message: 'Good progesterone levels for breeding',
      suggestedAction: 'Proceed with breeding with confidence'
    };
  } else if (rating.rating >= 5) {
    return {
      recommendation: 'acceptable',
      message: 'Acceptable progesterone levels',
      suggestedAction: 'Consider additional testing or monitoring'
    };
  } else {
    return {
      recommendation: 'not_recommended',
      message: 'Suboptimal progesterone levels',
      suggestedAction: 'Consult with veterinarian before breeding'
    };
  }
}

/**
 * Calculate optimal breeding window based on readings
 */
export function calculateOptimalBreedingWindow(
  readings: ProgesteroneReading[],
  breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen'
): {
  startDay: number;
  endDay: number;
  confidence: number;
} {
  const sortedReadings = [...readings].sort((a, b) => a.day - b.day);

  if (sortedReadings.length < 2) {
    return {
      startDay: 0,
      endDay: 0,
      confidence: 0
    };
  }

  // Find the day with optimal progesterone rise
  let optimalDay = 0;
  let maxRise = 0;

  for (let i = 1; i < sortedReadings.length; i++) {
    const rise = sortedReadings[i].value - sortedReadings[i - 1].value;
    if (rise > maxRise) {
      maxRise = rise;
      optimalDay = sortedReadings[i].day;
    }
  }

  // Adjust window based on breeding method
  let startDay = optimalDay;
  let endDay = optimalDay + 2;

  switch (breedingMethod) {
    case 'natural_ai':
    case 'tci':
      startDay = optimalDay;
      endDay = optimalDay + 3;
      break;
    case 'surgical_ai':
      startDay = optimalDay + 1;
      endDay = optimalDay + 3;
      break;
    case 'frozen':
      startDay = optimalDay + 2;
      endDay = optimalDay + 4;
      break;
  }

  const confidence = Math.min((maxRise / 5) * 100, 100);

  return {
    startDay: Math.max(0, startDay),
    endDay,
    confidence
  };
}