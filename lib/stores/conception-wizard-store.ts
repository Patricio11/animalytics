import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConceptionWizardState {
  // Current step
  currentStep: number;

  // Form data for all steps
  breed: any;
  bitchInfo: any;
  bitchHistory: any;
  litterHistory: any;
  dogHistory: any;
  breederHistory: any;
  semenInfo: any;
  semenAssessment: any;

  // Mating context
  matingId: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  updateBreed: (data: any) => void;
  updateBitchInfo: (data: any) => void;
  updateBitchHistory: (data: any) => void;
  updateLitterHistory: (data: any) => void;
  updateDogHistory: (data: any) => void;
  updateBreederHistory: (data: any) => void;
  updateSemenInfo: (data: any) => void;
  updateSemenAssessment: (data: any) => void;
  setMatingId: (id: string) => void;
  reset: () => void;
  getAllData: () => any;
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
