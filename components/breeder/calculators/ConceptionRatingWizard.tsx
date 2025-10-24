"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WizardContainer } from "@/components/breeder/calculators/wizard/WizardContainer";
import { WizardStep } from "@/components/breeder/calculators/wizard/WizardStep";
import { BreedSelectionStep } from "@/components/breeder/calculators/wizard/steps/BreedSelectionStep";
import { BitchInformationStep } from "@/components/breeder/calculators/wizard/steps/BitchInformationStep";
import { BitchHistoryStep } from "@/components/breeder/calculators/wizard/steps/BitchHistoryStep";
import { LitterHistoryStep } from "@/components/breeder/calculators/wizard/steps/LitterHistoryStep";
import { DogHistoryStep } from "@/components/breeder/calculators/wizard/steps/DogHistoryStep";
import { BreederHistoryStep } from "@/components/breeder/calculators/wizard/steps/BreederHistoryStep";
import { SemenInformationStep } from "@/components/breeder/calculators/wizard/steps/SemenInformationStep";
import { SemenAssessmentStep } from "@/components/breeder/calculators/wizard/steps/SemenAssessmentStep";
import { useConceptionWizardStore } from "@/lib/stores/conception-wizard-store";
import { useToast } from "@/hooks/use-toast";
import { WizardData } from "@/lib/types/wizard";
import { calculateConceptionRating } from "@/lib/calculations/conception-rating";
import { ConceptionInputs, ConceptionRating } from "@/lib/calculations/conception-types";

const wizardSteps = [
  { id: "1", title: "Breed Selection", icon: "🐕", description: "Select the breed for assessment" },
  { id: "2", title: "Bitch Information", icon: "🐾", description: "Basic information about the female" },
  { id: "3", title: "Bitch History", icon: "📋", description: "Breeding history and health" },
  { id: "4", title: "Litter History", icon: "🐶", description: "Previous litter outcomes" },
  { id: "5", title: "Dog History", icon: "👑", description: "Stud dog breeding record" },
  { id: "6", title: "Breeder History", icon: "👤", description: "Your breeding experience" },
  { id: "7", title: "Semen Information", icon: "💉", description: "Semen type and handling" },
  { id: "8", title: "Semen Assessment", icon: "🔬", description: "Laboratory analysis results" },
];

interface ConceptionRatingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (rating: ConceptionRating) => void;
}

export function ConceptionRatingWizard({
  open,
  onOpenChange,
  onComplete,
}: ConceptionRatingWizardProps) {
  const { toast } = useToast();
  const zustandStore = useConceptionWizardStore();

  const handleComplete = (wizardData: WizardData) => {
    // Transform wizard data to ConceptionInputs format
    const inputs: ConceptionInputs = {
      breed: wizardData.bitchBreed,
      dogBreed: wizardData.dogBreed,
      bitchInformation: {
        age: wizardData.bitchAge,
        weight: wizardData.bitchWeight,
        bodyConditionScore: wizardData.bodyConditionScore,
        healthStatus: wizardData.healthStatus,
      },
      bitchHistory: {
        hasBeenBred: wizardData.hasBeenBred,
        previousLitters: wizardData.previousLitters,
        monthsSinceLastLitter: wizardData.monthsSinceLastLitter,
        hasComplications: wizardData.hasComplications,
      },
      litterHistory: {
        totalLitters: wizardData.totalLitters,
        successfulLitters: wizardData.successfulLitters,
        averageLitterSize: wizardData.averageLitterSize,
      },
      dogHistory: {
        hasBeenUsed: wizardData.hasBeenUsedForBreeding,
        previousLitters: wizardData.dogPreviousLitters,
        successRate: wizardData.dogSuccessRate,
      },
      breederHistory: {
        yearsExperience: wizardData.yearsOfExperience,
        totalLitters: wizardData.breederTotalLitters,
        breedFamiliarity: wizardData.breedFamiliarity,
      },
      semenInformation: {
        type: wizardData.semenType,
        shippingDuration: wizardData.shippingDuration,
        storageTime: wizardData.storageTime,
      },
      semenQuality: {
        quality: wizardData.semenQuality,
        motility: wizardData.motility,
        concentration: wizardData.concentration,
        morphology: wizardData.morphology,
      },
      semenAssessment: {
        type: wizardData.assessmentType,
      },
    };

    // Calculate conception rating
    const rating = calculateConceptionRating(inputs);

    toast({
      title: "Calculation complete!",
      description: `Conception rating: ${rating.overallRating.toFixed(1)}%`,
    });

    // Clear store and close wizard
    zustandStore.reset();
    onComplete(rating);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Conception Rating Calculator
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <WizardContainer
            steps={wizardSteps}
            onComplete={handleComplete}
            onCancel={handleCancel}
            saveLabel="Calculate Rating"
            showNavigation={false}
          >
            {({ currentStep, data, updateData, nextStep, prevStep }) => (
              <>
                <WizardStep isActive={currentStep === 0}>
                  <BreedSelectionStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 1}>
                  <BitchInformationStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 2}>
                  <BitchHistoryStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 3}>
                  <LitterHistoryStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 4}>
                  <DogHistoryStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 5}>
                  <BreederHistoryStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 6}>
                  <SemenInformationStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>

                <WizardStep isActive={currentStep === 7}>
                  <SemenAssessmentStep
                    data={data}
                    onUpdate={updateData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                  />
                </WizardStep>
              </>
            )}
          </WizardContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
