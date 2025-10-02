// Mock data for conception rating calculations

// Type for conception rating input data
export interface ConceptionRatingData {
  bitchBreed?: string;
  dogBreed?: string;
  bitchAge?: number;
  dogAge?: number;
  bodyCondition?: number;
  healthStatus?: string;
  previousLitters?: number;
  timeSinceLastLitter?: number;
  dogSuccessRate?: number;
  breederExperience?: number;
  semenType?: string;
  semenQuality?: string;
  [key: string]: string | number | undefined;
}

export const mockConceptionFactors = {
  // Breed success ratings (1-3: 1=difficult, 2=moderate, 3=easy)
  breedRatings: {
    'Labrador Retriever': 3,
    'Golden Retriever': 3,
    'German Shepherd': 2,
    'French Bulldog': 1,
    'Bulldog': 1,
    'Poodle': 3,
    'Beagle': 3,
    'Rottweiler': 2,
    'Yorkshire Terrier': 2,
    'Boxer': 2,
    'Dachshund': 2,
    'Siberian Husky': 2,
    'Default': 2 // Default for breeds not in list
  },

  // Age factor multipliers
  ageFactors: {
    '1-2': 0.8,  // Too young
    '2-3': 1.0,  // Optimal
    '3-5': 1.0,  // Optimal
    '5-7': 0.9,  // Good
    '7-9': 0.7,  // Declining
    '9+': 0.5    // High risk
  },

  // Body condition score factors (1-9 scale)
  bodyConditionFactors: {
    '1': 0.3,  // Emaciated
    '2': 0.5,  // Very thin
    '3': 0.7,  // Thin
    '4': 0.9,  // Underweight
    '5': 1.0,  // Ideal
    '6': 0.95, // Slightly overweight
    '7': 0.8,  // Overweight
    '8': 0.6,  // Obese
    '9': 0.4   // Severely obese
  },

  // Breeder experience factors (years)
  experienceFactors: {
    '0-1': 0.7,   // Novice
    '1-2': 0.8,   // Beginner
    '2-3': 0.85,  // Learning
    '3-5': 0.95,  // Intermediate
    '5-10': 1.0,  // Experienced
    '10+': 1.05   // Expert
  },

  // Semen type factors
  semenTypeFactors: {
    'fresh': 1.0,
    'chilled': 0.8,
    'frozen': 0.6
  },

  // Semen quality factors
  semenQualityFactors: {
    'excellent': 1.0,
    'good': 0.85,
    'fair': 0.65,
    'poor': 0.4
  },

  // Time since last litter factors (months)
  timeSinceLastLitterFactors: {
    '0-6': 0.5,    // Too soon
    '6-12': 0.8,   // Recovering
    '12-18': 1.0,  // Optimal
    '18-24': 1.0,  // Optimal
    '24-36': 0.95, // Good
    '36+': 0.9     // Long gap
  },

  // Section weight contributions (must sum to 100)
  sectionWeights: {
    breed: 10,
    bitchInformation: 20,
    bitchHistory: 15,
    litterHistory: 10,
    dogHistory: 10,
    breederHistory: 10,
    semenQuality: 25
  }
};

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  const years = today.getFullYear() - dob.getFullYear();
  const months = today.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    return years - 1;
  }

  return years;
}

// Get age factor
export function getAgeFactor(age: number): number {
  if (age < 2) return mockConceptionFactors.ageFactors['1-2'];
  if (age < 3) return mockConceptionFactors.ageFactors['2-3'];
  if (age < 5) return mockConceptionFactors.ageFactors['3-5'];
  if (age < 7) return mockConceptionFactors.ageFactors['5-7'];
  if (age < 9) return mockConceptionFactors.ageFactors['7-9'];
  return mockConceptionFactors.ageFactors['9+'];
}

// Get breed rating
export function getBreedRating(breed: string): number {
  const ratings = mockConceptionFactors.breedRatings as Record<string, number>;
  return ratings[breed] || ratings['Default'];
}

// Calculate overall conception rating
export function calculateConceptionRating(data: ConceptionRatingData): {
  overall: number;
  accuracy: number;
  breakdown: Record<string, { percentage: number; contribution: number }>;
} {
  const weights = mockConceptionFactors.sectionWeights;
  let totalScore = 0;
  let totalWeight = 0;
  const breakdown: Record<string, { percentage: number; contribution: number }> = {};

  // Breed contribution
  if (data.breed) {
    const breedRating = getBreedRating(data.breed);
    const breedScore = (breedRating / 3) * 100; // Normalize to 0-100
    breakdown.breed = {
      percentage: breedScore,
      contribution: weights.breed
    };
    totalScore += breedScore * (weights.breed / 100);
    totalWeight += weights.breed;
  }

  // Bitch information contribution
  if (data.bitchInformation && typeof data.bitchInformation === 'object') {
    const bitchInfo = data.bitchInformation as { age?: number; bodyConditionScore?: number };
    const ageFactor = bitchInfo.age ? getAgeFactor(bitchInfo.age) : 1;
    const bcsScore = bitchInfo.bodyConditionScore
      ? mockConceptionFactors.bodyConditionFactors[bitchInfo.bodyConditionScore.toString() as keyof typeof mockConceptionFactors.bodyConditionFactors] || 1
      : 1;
    const bitchScore = (ageFactor * bcsScore) * 100;
    breakdown.bitchInformation = {
      percentage: bitchScore,
      contribution: weights.bitchInformation
    };
    totalScore += bitchScore * (weights.bitchInformation / 100);
    totalWeight += weights.bitchInformation;
  }

  // Semen quality contribution
  if (data.semenQuality && typeof data.semenQuality === 'object') {
    const semenQuality = data.semenQuality as { quality?: string };
    const semenInfo = data.semenInformation as { type?: string } | undefined;
    const qualityFactor = (semenQuality.quality && mockConceptionFactors.semenQualityFactors[semenQuality.quality as keyof typeof mockConceptionFactors.semenQualityFactors]) || 0.7;
    const typeFactor = (semenInfo?.type && mockConceptionFactors.semenTypeFactors[semenInfo.type as keyof typeof mockConceptionFactors.semenTypeFactors]) || 1;
    const semenScore = (qualityFactor * typeFactor) * 100;
    breakdown.semenQuality = {
      percentage: semenScore,
      contribution: weights.semenQuality
    };
    totalScore += semenScore * (weights.semenQuality / 100);
    totalWeight += weights.semenQuality;
  }

  // Calculate accuracy (how many sections were filled)
  const maxSections = 7;
  const filledSections = Object.keys(breakdown).length;
  const accuracy = Math.min(5, Math.floor((filledSections / maxSections) * 5));

  // Normalize overall score
  const overall = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;

  return {
    overall: Math.min(100, Math.max(0, overall)),
    accuracy,
    breakdown
  };
}