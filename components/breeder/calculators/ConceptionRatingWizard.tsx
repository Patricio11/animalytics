"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WizardContainer } from "@/components/breeder/calculators/wizard/WizardContainer";
import { WizardStep } from "@/components/breeder/calculators/wizard/WizardStep";
import { AnimalSelectionStep } from "@/components/breeder/calculators/wizard/steps/AnimalSelectionStep";
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
  { id: "1", title: "Animal Selection", icon: "🐕", description: "Select the breeding pair" },
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

  const handleComplete = async (wizardData: WizardData) => {
    // Helper to convert string/number to number
    const toNumber = (val: string | number | undefined): number | undefined => {
      if (val === undefined || val === null) return undefined;
      return typeof val === 'string' ? parseFloat(val) : val;
    };

    // Helper to convert to yes/no
    const toYesNo = (val: string | boolean | undefined): 'yes' | 'no' | undefined => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'boolean') return val ? 'yes' : 'no';
      return val === 'yes' ? 'yes' : 'no';
    };

    // Calculate litter statistics from litter history
    const litters = wizardData.litters || [];
    const totalLitters = litters.length;
    const totalPuppies = litters.reduce((sum, l) => sum + (l.puppyCount || 0), 0);
    const successfulLitters = litters.filter(l => !l.complications).length;
    const averageLitterSize = totalLitters > 0 ? totalPuppies / totalLitters : undefined;

    // Transform wizard data to ConceptionInputs format
    const inputs: ConceptionInputs = {
      breed: wizardData.bitchBreed,
      dogBreed: wizardData.dogBreed,
      bitchInformation: {
        age: wizardData.bitchAge,
        weight: wizardData.bitchWeight,
        bodyConditionScore: wizardData.bodyConditionScore,
        healthStatus: wizardData.generalHealth as 'excellent' | 'good' | 'fair' | 'poor' | undefined,
        // New Step 2 fields
        livingCondition: wizardData.livingCondition as 'kennels' | 'pack' | 'on_her_own' | undefined,
        positionInPack: wizardData.positionInPack as 'dominant' | 'doesnt_care' | 'bottom' | 'dont_know' | undefined,
        ageAtMating: wizardData.ageAtMating,
        runsWithOthers: wizardData.runsWithOthers as 'yes' | 'no' | 'dont_know' | undefined,
        runsWithHowMany: wizardData.runsWithHowMany,
        ranWithOthersDuringPreviousPregnancies: wizardData.ranWithOthersDuringPreviousPregnancies as 'yes' | 'no' | 'dont_know' | undefined,
      },
      bitchHistory: {
        hasBeenBred: toYesNo(wizardData.hasBeenBred),
        previousLitters: wizardData.previousLitters,
        monthsSinceLastLitter: toNumber(wizardData.lastLitterDate),
        hasComplications: wizardData.complications ? 'yes' : 'no',
      },
      litterHistory: {
        totalLitters,
        totalPuppies,
        successfulLitters,
        averageLitterSize,
      },
      dogHistory: {
        hasBeenUsed: toYesNo(wizardData.hasBeenUsed),
        previousLitters: wizardData.previousLittersCount,
        successRate: toNumber(wizardData.successRate),
      },
      breederHistory: {
        yearsExperience: toNumber(wizardData.yearsExperience),
        totalLitters: wizardData.totalLitters,
        breedFamiliarity: wizardData.breedFamiliarity as 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice' | undefined,
      },
      semenInformation: {
        type: wizardData.type as 'fresh' | 'chilled' | 'frozen' | undefined,
        shippingDuration: toNumber(wizardData.shippingDuration),
        storageTime: toNumber(wizardData.storageTime),
      },
      semenQuality: {
        quality: wizardData.quality as 'excellent' | 'good' | 'fair' | 'poor' | undefined,
        motility: toNumber(wizardData.motility),
        concentration: toNumber(wizardData.concentration),
        morphology: toNumber(wizardData.morphology),
      },
      semenAssessment: {
        type: 'full' as 'full' | 'visual' | 'none',
      },
    };

    // Calculate conception rating
    const rating = calculateConceptionRating(inputs);

    // Save to database
    try {
      const response = await fetch('/api/conception-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bitchId: wizardData.bitchId,
          dogId: wizardData.dogId,
          frozenSemenId: wizardData.frozenSemenId,
          matingDate: new Date().toISOString().split('T')[0],
          breedingMethod: wizardData.useFrozenSemen ? 'frozen' : 'natural_ai',
          calculationData: wizardData,
          ratingBreakdown: rating.breakdown,
          conceptionRating: rating.overallRating,
          overallRating: rating.overallRating,
          informationAccuracy: rating.informationAccuracy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save rating');
      }

      const result = await response.json();

      toast({
        title: "Rating saved!",
        description: `Conception rating: ${rating.overallRating.toFixed(1)}%`,
      });

      // Clear store and close wizard
      zustandStore.reset();
      onComplete(rating);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating. Please try again.",
        variant: "destructive",
      });
    }
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
            initialData={{}}
            onComplete={handleComplete}
            onCancel={handleCancel}
            saveLabel="Calculate Rating"
            showNavigation={false}
          >
            {({ currentStep, data, updateData, nextStep, prevStep }) => (
              <>
                <WizardStep isActive={currentStep === 0}>
                  <AnimalSelectionStep
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
