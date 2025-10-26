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
  // New Step 3 fields
  previousPregnancies?: 'yes' | 'no' | 'dont_know' | '';
  numberOfSiblings?: '0' | '1-3' | '4-5' | '6+' | '';
  numberOfBreedings?: number;
  hadMatingThatDidNotProduce?: 'yes' | 'no' | 'dont_know' | '';
  timesDidNotProduce?: '1' | '2' | '3+' | '';

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
  // New Step 5 fields
  littersSired?: '0' | '1-2' | '3-5' | '5+' | '';
  fathersLittersSired?: '1-3' | '4-10' | '11+' | '';
  recentLitterDate?: 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months' | '';
  pupsInMostRecentSire?: '0' | '1-3' | '4-6' | '7+' | '';

  // Step 6: Breeder History
  yearsExperience?: string | number;
  totalLitters?: number;
  breedFamiliarity?: string;

  // Step 7: Semen Information
  type?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  storageTime?: string | number;
  shippingDuration?: string | number;
  // New Step 7 fields
  timeBetweenCollectionAndInsemination?: 'less_than_24hrs' | '24-48hrs' | 'more_than_48hrs' | '';
  ageOfDogAtCollection?: number;
  batchUsedPreviously?: 'yes' | 'no' | 'dont_know' | '';
  didProducePups?: 'yes' | 'no' | 'dont_know' | '';
  pupsProduced?: '1-3' | '4-6' | '7+' | '';

  // Step 8: Semen Assessment
  inseminatorName?: string;
  semenAssessed?: 'yes' | 'no' | 'dont_know' | '';
  assessmentType?: 'general' | 'full' | ''; // general = visual, full = full
  quality?: 'excellent' | 'good' | 'poor' | '';
  volume?: string | number;
  concentration?: string | number;
  motility?: string | number;
  morphology?: string | number;
  visualNotes?: string;
}