import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  BitchInformationInputs,
  BitchHistoryInputs,
  LitterHistoryInputs,
  DogHistoryInputs,
  BreederHistoryInputs,
  SemenInformationInputs,
  SemenAssessmentInputs,
  SemenQualityInputs,
} from '@/lib/calculations/conception-types';

interface BreedData {
  bitchBreed?: string;
  dogBreed?: string;
}

interface SemenData extends SemenInformationInputs {
  quality?: SemenQualityInputs;
}

interface ConceptionWizardData {
  breed: BreedData | null;
  bitchInfo: BitchInformationInputs | null;
  bitchHistory: BitchHistoryInputs | null;
  litterHistory: LitterHistoryInputs | null;
  dogHistory: DogHistoryInputs | null;
  breederHistory: BreederHistoryInputs | null;
  semenInfo: SemenData | null;
  semenAssessment: SemenAssessmentInputs | null;
}

interface ConceptionWizardState extends ConceptionWizardData {
  // Current step
  currentStep: number;

  // Mating context
  matingId: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  updateBreed: (data: BreedData) => void;
  updateBitchInfo: (data: BitchInformationInputs) => void;
  updateBitchHistory: (data: BitchHistoryInputs) => void;
  updateLitterHistory: (data: LitterHistoryInputs) => void;
  updateDogHistory: (data: DogHistoryInputs) => void;
  updateBreederHistory: (data: BreederHistoryInputs) => void;
  updateSemenInfo: (data: SemenData) => void;
  updateSemenAssessment: (data: SemenAssessmentInputs) => void;
  setMatingId: (id: string) => void;
  reset: () => void;
  getAllData: () => ConceptionWizardData;
}

const initialState = {
  currentStep: 0,
  breed: null,
  bitchInfo: null,
  bitchHistory: null,
  litterHistory: null,
  dogHistory: null,
  breederHistory: null,
  semenInfo: null,
  semenAssessment: null,
  matingId: null,
};

export const useConceptionWizardStore = create<ConceptionWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      updateBreed: (data) => set({ breed: data }),
      updateBitchInfo: (data) => set({ bitchInfo: data }),
      updateBitchHistory: (data) => set({ bitchHistory: data }),
      updateLitterHistory: (data) => set({ litterHistory: data }),
      updateDogHistory: (data) => set({ dogHistory: data }),
      updateBreederHistory: (data) => set({ breederHistory: data }),
      updateSemenInfo: (data) => set({ semenInfo: data }),
      updateSemenAssessment: (data) => set({ semenAssessment: data }),

      setMatingId: (id) => set({ matingId: id }),

      reset: () => set(initialState),

      getAllData: () => ({
        breed: get().breed,
        bitchInfo: get().bitchInfo,
        bitchHistory: get().bitchHistory,
        litterHistory: get().litterHistory,
        dogHistory: get().dogHistory,
        breederHistory: get().breederHistory,
        semenInfo: get().semenInfo,
        semenAssessment: get().semenAssessment,
      }),
    }),
    {
      name: 'conception-wizard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
