/**
 * Vaccination Schedule Calculator for South Africa (2019 Guidelines)
 * Based on WSAVA and South African Veterinary Guidelines
 */

import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export interface VaccinationSchedule {
  nextDueDate: Date;
  interval: string;
  notes: string;
}

/**
 * Calculate next due date for dog vaccinations based on SA guidelines
 */
export function calculateDogVaccinationDueDate(
  vaccinationType: string,
  recordDate: Date,
  animalAge?: number // Age in weeks
): VaccinationSchedule | null {
  const vaccineType = vaccinationType.toUpperCase();

  // Core vaccines: CPV (Parvovirus), CDV (Distemper), CAV-2 (Adenovirus)
  if (vaccineType.includes('CPV') || vaccineType.includes('PARVOVIRUS') || 
      vaccineType.includes('CDV') || vaccineType.includes('DISTEMPER') ||
      vaccineType.includes('CAV') || vaccineType.includes('ADENOVIRUS') ||
      vaccineType.includes('DHPP') || vaccineType.includes('DA2PP')) {
    
    if (animalAge && animalAge < 16) {
      // Puppy series: 3 weeks apart until 12-16 weeks
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Puppy series - continue until 12-16 weeks of age, then booster at 6-12 months'
      };
    } else if (animalAge && animalAge >= 16 && animalAge < 52) {
      // Booster at 6-12 months
      return {
        nextDueDate: addMonths(recordDate, 6),
        interval: '6 months',
        notes: 'Booster vaccination, then every 3 years'
      };
    } else {
      // Adult: Every 3 years
      return {
        nextDueDate: addYears(recordDate, 3),
        interval: '3 years',
        notes: 'Core vaccine - triennial booster recommended'
      };
    }
  }

  // Rabies
  if (vaccineType.includes('RABIES')) {
    if (animalAge && animalAge < 16) {
      // Initial at 12 weeks, booster at 4-12 months
      return {
        nextDueDate: addMonths(recordDate, 4),
        interval: '4 months',
        notes: 'Initial rabies series - booster required, then every 3 years'
      };
    } else {
      // Every 3 years (or annually if traveling)
      return {
        nextDueDate: addYears(recordDate, 3),
        interval: '3 years',
        notes: 'Triennial booster (annual if pet travels frequently)'
      };
    }
  }

  // Parainfluenza (PI)
  if (vaccineType.includes('PARAINFLUENZA') || vaccineType.includes('PI')) {
    if (animalAge && animalAge < 16) {
      // Puppy series: 3 weeks apart
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Puppy series - continue until 12-16 weeks, then annually'
      };
    } else {
      // Annual for at-risk pets
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster recommended for pets at risk'
      };
    }
  }

  // Bordetella bronchiseptica (Kennel Cough)
  if (vaccineType.includes('BORDETELLA') || vaccineType.includes('KENNEL COUGH')) {
    if (animalAge && animalAge < 16) {
      // Two doses 3 weeks apart or single intranasal
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Second dose required (if not intranasal), then annually'
      };
    } else {
      // Annual for at-risk pets
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for pets at risk (kennels, dog parks)'
      };
    }
  }

  // Leptospirosis
  if (vaccineType.includes('LEPTOSPIROSIS') || vaccineType.includes('LEPTO')) {
    if (animalAge && animalAge < 12) {
      // Initial at 8+ weeks, second dose 3 weeks later
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Second dose required, then annually if at risk'
      };
    } else {
      // Annual for at-risk pets
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for pets at risk or traveling'
      };
    }
  }

  // Canine Herpes (for breeding)
  if (vaccineType.includes('HERPES')) {
    return {
      nextDueDate: addDays(recordDate, 30),
      interval: '30-40 days',
      notes: 'Second dose at day 30-40 of gestation (breeding bitches only)'
    };
  }

  return null;
}

/**
 * Calculate next due date for cat vaccinations based on SA guidelines
 */
export function calculateCatVaccinationDueDate(
  vaccinationType: string,
  recordDate: Date,
  animalAge?: number // Age in weeks
): VaccinationSchedule | null {
  const vaccineType = vaccinationType.toUpperCase();

  // Core vaccines: FPV (Panleukopenia), FHV-1 (Herpes), FCV (Calicivirus)
  if (vaccineType.includes('FPV') || vaccineType.includes('PANLEUKOPENIA') ||
      vaccineType.includes('FHV') || vaccineType.includes('HERPES') ||
      vaccineType.includes('FCV') || vaccineType.includes('CALICIVIRUS') ||
      vaccineType.includes('FVRCP')) {
    
    if (animalAge && animalAge < 16) {
      // Kitten series: 3 weeks apart until 12-16 weeks
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Kitten series - continue until 12-16 weeks, then booster at 6-12 months'
      };
    } else if (animalAge && animalAge >= 16 && animalAge < 52) {
      // Booster at 6-12 months
      return {
        nextDueDate: addMonths(recordDate, 6),
        interval: '6 months',
        notes: 'Booster vaccination, then annually (high risk) or every 3 years (low risk)'
      };
    } else {
      // Adult: Annual (high risk) or every 3 years (low risk)
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual for high-risk cats, every 3 years for low-risk (with owner consent)'
      };
    }
  }

  // Rabies
  if (vaccineType.includes('RABIES')) {
    if (animalAge && animalAge < 16) {
      // Initial at 12 weeks, booster at 4-12 months
      return {
        nextDueDate: addMonths(recordDate, 4),
        interval: '4 months',
        notes: 'Initial rabies series - booster required'
      };
    } else {
      // 1-3 years depending on travel
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: '1-3 years',
        notes: 'Annual if traveling, otherwise every 3 years'
      };
    }
  }

  // Feline Leukemia Virus (FeLV)
  if (vaccineType.includes('FELV') || vaccineType.includes('LEUKEMIA') || vaccineType.includes('LEUKAEMIA')) {
    if (animalAge && animalAge < 12) {
      // Two doses 3 weeks apart
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Second dose required, then booster at 6-12 months'
      };
    } else if (animalAge && animalAge >= 12 && animalAge < 52) {
      // Booster at 6-12 months
      return {
        nextDueDate: addMonths(recordDate, 6),
        interval: '6 months',
        notes: 'Booster vaccination, then annually for at-risk cats'
      };
    } else {
      // Annual for at-risk cats
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for cats with sustained risk'
      };
    }
  }

  // Bordetella bronchiseptica
  if (vaccineType.includes('BORDETELLA')) {
    if (animalAge && animalAge < 8) {
      // Single intranasal dose as early as 4 weeks
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for cats with sustained risk'
      };
    } else {
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for cats with sustained risk'
      };
    }
  }

  // Chlamydia felis
  if (vaccineType.includes('CHLAMYDIA') || vaccineType.includes('CHLAMYDOPHILA')) {
    if (animalAge && animalAge < 12) {
      // Two doses 3 weeks apart
      return {
        nextDueDate: addWeeks(recordDate, 3),
        interval: '3 weeks',
        notes: 'Second dose required, then annually if at risk'
      };
    } else {
      // Annual for at-risk cats
      return {
        nextDueDate: addYears(recordDate, 1),
        interval: 'Annual',
        notes: 'Annual booster for cats with sustained risk'
      };
    }
  }

  return null;
}

/**
 * Main function to calculate next due date based on animal species
 */
export function calculateVaccinationDueDate(
  vaccinationType: string,
  recordDate: Date,
  animalSpecies: 'dog' | 'cat',
  animalAge?: number // Age in weeks
): VaccinationSchedule | null {
  if (animalSpecies === 'dog') {
    return calculateDogVaccinationDueDate(vaccinationType, recordDate, animalAge);
  } else {
    return calculateCatVaccinationDueDate(vaccinationType, recordDate, animalAge);
  }
}
