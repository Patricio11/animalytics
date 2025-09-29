"use client";

import { useState, useCallback, useEffect } from 'react';

export interface WizardStep {
  id: string;
  title: string;
  isValid?: boolean;
  isOptional?: boolean;
}

export interface WizardStateOptions<T = any> {
  initialData: T;
  storageKey?: string;
  steps: WizardStep[];
  onStepChange?: (step: number) => void;
  onComplete?: (data: T) => void;
}

export interface WizardState<T = any> {
  currentStep: number;
  data: T;
  steps: WizardStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateData: (updates: Partial<T>) => void;
  setStepValid: (stepIndex: number, isValid: boolean) => void;
  saveProgress: () => void;
  loadProgress: () => void;
  clearProgress: () => void;
  reset: () => void;
  complete: () => void;
}

export function useWizardState<T = any>(
  options: WizardStateOptions<T>
): WizardState<T> {
  const {
    initialData,
    storageKey = 'wizard-progress',
    steps: initialSteps,
    onStepChange,
    onComplete
  } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<T>(initialData);
  const [steps, setSteps] = useState<WizardStep[]>(initialSteps);

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Computed properties
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const canGoNext = currentStepData?.isValid !== false || currentStepData?.isOptional === true;
  const canGoPrevious = currentStep > 0;

  // Update data
  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  // Set step validation
  const setStepValid = useCallback((stepIndex: number, isValid: boolean) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (newSteps[stepIndex]) {
        newSteps[stepIndex] = { ...newSteps[stepIndex], isValid };
      }
      return newSteps;
    });
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (!canGoNext) return;

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
      onStepChange?.(nextStepIndex);
      saveProgress();
    } else {
      complete();
    }
  }, [currentStep, steps.length, canGoNext, onStepChange]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (!canGoPrevious) return;

    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);
    onStepChange?.(prevStepIndex);
  }, [currentStep, canGoPrevious, onStepChange]);

  // Go to specific step (only if all previous steps are valid)
  const goToStep = useCallback((targetStep: number) => {
    if (targetStep < 0 || targetStep >= steps.length) return;
    if (targetStep === currentStep) return;

    // Check if we can navigate to this step
    // All steps before target must be valid (unless optional)
    if (targetStep > currentStep) {
      for (let i = currentStep; i < targetStep; i++) {
        const step = steps[i];
        if (step.isValid === false && !step.isOptional) {
          return; // Cannot skip invalid required steps
        }
      }
    }

    setCurrentStep(targetStep);
    onStepChange?.(targetStep);
  }, [currentStep, steps, onStepChange]);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (!storageKey) return;

    try {
      const progress = {
        currentStep,
        data,
        steps: steps.map(s => ({ id: s.id, isValid: s.isValid })),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save wizard progress:', error);
    }
  }, [storageKey, currentStep, data, steps]);

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    if (!storageKey) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const progress = JSON.parse(saved);

        // Restore data
        setData(progress.data || initialData);

        // Restore current step
        if (typeof progress.currentStep === 'number') {
          setCurrentStep(progress.currentStep);
        }

        // Restore step validity
        if (progress.steps) {
          setSteps(prev => prev.map((step, index) => {
            const savedStep = progress.steps.find((s: any) => s.id === step.id);
            return savedStep ? { ...step, isValid: savedStep.isValid } : step;
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load wizard progress:', error);
    }
  }, [storageKey, initialData]);

  // Clear progress from localStorage
  const clearProgress = useCallback(() => {
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear wizard progress:', error);
    }
  }, [storageKey]);

  // Reset wizard to initial state
  const reset = useCallback(() => {
    setCurrentStep(0);
    setData(initialData);
    setSteps(initialSteps);
    clearProgress();
  }, [initialData, initialSteps, clearProgress]);

  // Complete wizard
  const complete = useCallback(() => {
    onComplete?.(data);
    clearProgress();
  }, [data, onComplete, clearProgress]);

  return {
    currentStep,
    data,
    steps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    nextStep,
    prevStep,
    goToStep,
    updateData,
    setStepValid,
    saveProgress,
    loadProgress,
    clearProgress,
    reset,
    complete
  };
}