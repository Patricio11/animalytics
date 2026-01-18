"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronRight, ChevronLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isComplete: boolean;
  isOptional?: boolean;
}

interface VerificationWizardProps {
  userRole: 'breeder' | 'pet_owner';
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (stepIndex: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export function VerificationWizard({
  userRole,
  steps,
  currentStepIndex,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  canGoNext = true,
  canGoPrevious = true,
}: VerificationWizardProps) {
  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = (completedSteps / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow clicking on previous steps or current step
    if (index <= currentStepIndex) {
      onStepChange(index);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {userRole === 'breeder' ? 'Breeder' : 'Pet Owner'} Verification
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete all steps to verify your account
          </p>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">
          Step {currentStepIndex + 1} of {steps.length}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">{completedSteps}/{steps.length} completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = step.isComplete;
            const isPast = index < currentStepIndex;
            const isClickable = index <= currentStepIndex;

            return (
              <div key={step.id} className="flex-1 relative">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex flex-col items-center gap-2 transition-all",
                    isClickable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all border-2",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      isActive && !isCompleted && "bg-primary border-primary text-white",
                      !isActive && !isCompleted && isPast && "bg-muted border-muted-foreground/30",
                      !isActive && !isCompleted && !isPast && "bg-background border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center hidden sm:block">
                    <p className={cn(
                      "text-xs font-medium",
                      isActive && "text-primary",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    {step.isOptional && (
                      <Badge variant="secondary" className="text-xs mt-1">Optional</Badge>
                    )}
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 -z-10",
                      isCompleted ? "bg-green-500" : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentStep.title}</span>
            {currentStep.isComplete && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep.component}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious || currentStepIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex-1 text-center text-sm text-muted-foreground">
          {currentStep.isOptional && "This step is optional"}
        </div>

        {!isLastStep ? (
          <Button
            onClick={handleNext}
            disabled={!canGoNext || (!currentStep.isComplete && !currentStep.isOptional) || isSubmitting}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={!canGoNext || isSubmitting}
            className="bg-gradient-brand hover:opacity-90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> You can save your progress and return later. Your information is automatically saved as you complete each step.
        </p>
      </div>
    </div>
  );
}
