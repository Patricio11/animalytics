"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  saveLabel?: string;
  className?: string;
}

export function WizardNavigation({
  canGoPrevious,
  canGoNext,
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onSave,
  onCancel,
  nextLabel,
  previousLabel,
  saveLabel = "Save & Exit",
  className
}: WizardNavigationProps) {
  const getNextButtonLabel = () => {
    if (nextLabel) return nextLabel;
    if (isLastStep) return "Complete";
    return "Next";
  };

  const getPreviousButtonLabel = () => {
    if (previousLabel) return previousLabel;
    return "Previous";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Cancel Button (optional) */}
      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      )}

      {/* Save & Exit Button (optional) */}
      {onSave && (
        <Button
          variant="outline"
          onClick={onSave}
          className="hover:bg-primary/10 hover:border-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveLabel}
        </Button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Previous Button */}
      {!isFirstStep && (
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            "hover:bg-primary/10 hover:border-primary",
            !canGoPrevious && "opacity-50 cursor-not-allowed"
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {getPreviousButtonLabel()}
        </Button>
      )}

      {/* Next / Complete Button */}
      <Button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          "bg-gradient-brand hover:opacity-90 shadow-card min-w-[120px]",
          !canGoNext && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLastStep ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {getNextButtonLabel()}
          </>
        ) : (
          <>
            {getNextButtonLabel()}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}