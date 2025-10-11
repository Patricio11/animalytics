import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProgesteroneReading {
  day: number;
  value: number;
  date: Date;
}

interface ProgesteroneState {
  laboratory: 'VIDAS' | 'IDEXX' | null;
  unit: 'nanograms' | 'nanomoles' | null;
  breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen' | null;
  readings: ProgesteroneReading[];
  matingId: string | null;

  setLaboratory: (lab: 'VIDAS' | 'IDEXX') => void;
  setUnit: (unit: 'nanograms' | 'nanomoles') => void;
  setBreedingMethod: (method: string) => void;
  addReading: (reading: ProgesteroneReading) => void;
  updateReading: (day: number, reading: ProgesteroneReading) => void;
  removeReading: (day: number) => void;
  setMatingId: (id: string) => void;
  reset: () => void;
}

export const useProgesteroneStore = create<ProgesteroneState>()(
  persist(
    (set) => ({
      laboratory: null,
      unit: null,
      breedingMethod: null,
      readings: [],
      matingId: null,

      setLaboratory: (lab) => set({ laboratory: lab }),
      setUnit: (unit) => set({ unit }),
      setBreedingMethod: (method) => set({ breedingMethod: method as any }),

      addReading: (reading) =>
        set((state) => ({
          readings: [...state.readings, reading].sort((a, b) => a.day - b.day),
        })),

      updateReading: (day, reading) =>
        set((state) => ({
          readings: state.readings.map((r) =>
            r.day === day ? reading : r
          ),
        })),

      removeReading: (day) =>
        set((state) => ({
          readings: state.readings.filter((r) => r.day !== day),
        })),

      setMatingId: (id) => set({ matingId: id }),

      reset: () =>
        set({
          laboratory: null,
          unit: null,
          breedingMethod: null,
          readings: [],
          matingId: null,
        }),
    }),
    {
      name: 'progesterone-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
