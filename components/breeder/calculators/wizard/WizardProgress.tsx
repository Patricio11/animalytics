"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep } from "@/lib/hooks/use-wizard-state";

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgress({ steps, currentStep, onStepClick }: WizardProgressProps) {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const canClickStep = (index: number) => {
    if (index === currentStep) return false;
    if (index > currentStep) {
      // Check if all previous steps are valid
      for (let i = 0; i < index; i++) {
        const step = steps[i];
        if (step.isValid === false && !step.isOptional) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />

        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-brand transition-all duration-500 ease-out"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const clickable = canClickStep(index);

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <button
                  onClick={() => clickable && onStepClick?.(index)}
                  disabled={!clickable}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    "border-2 font-semibold text-sm",
                    status === 'completed' && "bg-gradient-brand border-primary text-white shadow-md",
                    status === 'current' && "bg-primary border-primary text-white shadow-lg scale-110",
                    status === 'upcoming' && "bg-background border-muted-foreground/30 text-muted-foreground",
                    clickable && status !== 'current' && "hover:scale-105 hover:shadow-md cursor-pointer",
                    !clickable && "cursor-not-allowed opacity-60"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Step Title */}
                <div className="mt-3 text-center max-w-[120px]">
                  <div
                    className={cn(
                      "text-xs font-medium transition-colors",
                      status === 'current' && "text-foreground font-semibold",
                      status === 'completed' && "text-primary",
                      status === 'upcoming' && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>

                  {/* Optional badge */}
                  {step.isOptional && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Optional
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Counter */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}