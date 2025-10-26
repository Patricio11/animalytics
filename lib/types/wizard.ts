export interface WizardData extends Record<string, unknown> {
  // Step 1: Animal Selection
  bitchId?: string;
  dogId?: string;
  frozenSemenId?: string;
  useFrozenSemen?: boolean;
  selectedBitch?: {
    id: string;
    name: string;
    dateOfBirth?: string | Date | null;
    weight?: string | number | null;
    healthStatus?: 'excellent' | 'good' | 'fair' | 'poor' | null;
    breed?: {
      name: string;
    };
  };
  selectedDog?: {
    id: string;
    name: string;
    breed?: {
      name: string;
    };
  };
  
  // Step 1: Breed Selection
  bitchBreed?: string;
  dogBreed?: string;
  breedRating?: number;

  // Step 2: Bitch Information
  bitchAge?: number;
  bitchWeight?: number;
  bodyConditionScore?: number;
  generalHealth?: 'excellent' | 'good' | 'fair' | 'poor';
  // New Step 2 fields
  livingCondition?: 'kennels' | 'pack' | 'on_her_own' | '';
  positionInPack?: 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know' | '';
  ageAtMating?: number;
  runsWithOthers?: 'yes' | 'no' | 'dont_know' | '';
  runsWithHowMany?: number;
  ranWithOthersDuringPreviousPregnancies?: 'yes' | 'no' | 'dont_know' | '';

  // Step 3: Bitch History
  hasBeenBred?: string;
  previousLitters?: number;
  lastLitterDate?: string | number;
  complications?: boolean;
  complicationDetails?: string;

  // Step 4: Litter History
  litters?: Array<{
    id: string;
    date: string;
    sireId: string;
    sireName: string;
    puppyCount: number;
    complications: boolean;
  }>;

  // Step 5: Dog History
  hasBeenUsed?: string;
  previousLittersCount?: number;
  successRate?: string | number;
  ageAtFirstUse?: string | number;

  // Step 6: Breeder History
  yearsExperience?: string | number;
  totalLitters?: number;
  breedFamiliarity?: string;

  // Step 7: Semen Information
  type?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  storageTime?: string | number;
  shippingDuration?: string | number;

  // Step 8: Semen Assessment
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  volume?: string | number;
  concentration?: string | number;
  motility?: string | number;
  morphology?: string | number;
  visualNotes?: string;
}