"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { useWizardState, WizardStateOptions } from "@/lib/hooks/use-wizard-state";
import { Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardContainerProps<T = any> extends WizardStateOptions<T> {
  children: ReactNode | ((wizardState: ReturnType<typeof useWizardState<T>>) => ReactNode);
  className?: string;
  showProgress?: boolean;
  showNavigation?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  saveLabel?: string;
  errorMessage?: string;
  infoMessage?: string;
}

export function WizardContainer<T = any>({
  children,
  className,
  showProgress = true,
  showNavigation = true,
  onSave,
  onCancel,
  nextLabel,
  previousLabel,
  saveLabel,
  errorMessage,
  infoMessage,
  ...wizardOptions
}: WizardContainerProps<T>) {
  const wizardState = useWizardState<T>(wizardOptions);

  const {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    nextStep,
    prevStep,
    goToStep,
    saveProgress
  } = wizardState;

  const handleSave = () => {
    saveProgress();
    onSave?.();
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Progress Indicator */}
      {showProgress && (
        <Card className="shadow-card border-primary/10">
          <CardContent className="pt-6">
            <WizardProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </CardContent>
        </Card>
      )}

      {/* Info Message */}
      {infoMessage && (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-sm">
            {infoMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2 text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {typeof children === 'function' ? children(wizardState) : children}
      </div>

      {/* Navigation */}
      {showNavigation && (
        <Card className="shadow-card border-primary/10 sticky bottom-4 z-10">
          <CardContent className="py-4">
            <WizardNavigation
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onPrevious={prevStep}
              onNext={nextStep}
              onSave={onSave ? handleSave : undefined}
              onCancel={onCancel}
              nextLabel={nextLabel}
              previousLabel={previousLabel}
              saveLabel={saveLabel}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}