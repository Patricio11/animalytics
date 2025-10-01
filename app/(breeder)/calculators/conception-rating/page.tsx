"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ConceptionRatingStep } from "@/components/breeder/calculators/wizard/steps/ConceptionRatingStep";
import { ArrowLeft, Beaker } from "lucide-react";

interface WizardData {
  // Step 1: Breed Selection
  breed?: string;

  // Step 2: Bitch Information
  bitchAge?: number;
  bitchWeight?: number;
  bodyConditionScore?: number;
  generalHealth?: 'excellent' | 'good' | 'fair' | 'poor';

  // Step 3: Bitch History
  previousLitters?: number;
  previousPuppies?: number;
  complications?: boolean;
  complicationDetails?: string;
  lastLitterDate?: string;

  // Step 4: Litter History
  averageLitterSize?: number;
  liveBirthRate?: number;
  weaningSuccessRate?: number;

  // Step 5: Dog History
  dogAge?: number;
  provednSire?: boolean;
  previousLittersCount?: number;
  averageProgenyLitterSize?: number;

  // Step 6: Breeder History
  yearsExperience?: number;
  totalLittersProduced?: number;
  breedingSuccessRate?: number;

  // Step 7: Semen Information
  semenType?: 'fresh' | 'chilled' | 'frozen';
  collectionDate?: string;
  storageConditions?: 'optimal' | 'good' | 'adequate';

  // Step 8: Semen Assessment
  volume?: number;
  concentration?: number;
  motility?: number;
  morphology?: number;
}

const wizardSteps = [
  { id: "1", title: "Breed Selection", icon: "🐕", description: "Select the breed for assessment" },
  { id: "2", title: "Bitch Information", icon: "🐾", description: "Basic information about the female" },
  { id: "3", title: "Bitch History", icon: "📋", description: "Breeding history and health" },
  { id: "4", title: "Litter History", icon: "🐶", description: "Previous litter outcomes" },
  { id: "5", title: "Dog History", icon: "👑", description: "Stud dog breeding record" },
  { id: "6", title: "Breeder History", icon: "👤", description: "Your breeding experience" },
  { id: "7", title: "Semen Information", icon: "💉", description: "Semen type and handling" },
  { id: "8", title: "Semen Assessment", icon: "🔬", description: "Laboratory analysis results" },
  { id: "9", title: "Results", icon: "📊", description: "Conception rating calculation" },
];

export default function ConceptionRatingWizardPage() {
  const router = useRouter();
  const [wizardData, setWizardData] = useState<WizardData>({});

  // Clear wizard progress on mount to start fresh
  useEffect(() => {
    localStorage.removeItem('wizard-progress');
  }, []);

  const handleComplete = () => {
    console.log('Wizard completed with data:', wizardData);
    // Here you would normally save the data and navigate to results
    // For now, we'll just show an alert
    alert('Conception Rating Wizard completed! Rating will be calculated based on the provided data.');
    router.push('/calculators');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      localStorage.removeItem('wizard-progress');
      router.push('/calculators');
    }
  };

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/calculators')}
              className="hover:bg-primary/10 hover:border-primary shadow-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conception Rating Wizard</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive assessment for breeding potential
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Beaker className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Wizard Steps Overview */}
        <Card className="shadow-card bg-surface border-0">
          <CardHeader>
            <CardTitle className="text-lg">Wizard Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wizardSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary hover:bg-surface-secondary/80 transition-colors"
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">
                      {step.id}. {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wizard Container */}
        <WizardContainer
          steps={wizardSteps}
          initialData={wizardData}
          onComplete={handleComplete}
          onCancel={handleCancel}
          saveLabel="Calculate Rating"
          showNavigation={false}
        >
          {({ currentStep, data, updateData, nextStep, prevStep }) => (
            <>
              <WizardStep stepNumber={1} title="Breed Selection" isActive={currentStep === 0}>
                <BreedSelectionStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                />
              </WizardStep>

              <WizardStep stepNumber={2} title="Bitch Information" isActive={currentStep === 1}>
                <BitchInformationStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={3} title="Bitch History" isActive={currentStep === 2}>
                <BitchHistoryStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={4} title="Litter History" isActive={currentStep === 3}>
                <LitterHistoryStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={5} title="Dog History" isActive={currentStep === 4}>
                <DogHistoryStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={6} title="Breeder History" isActive={currentStep === 5}>
                <BreederHistoryStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={7} title="Semen Information" isActive={currentStep === 6}>
                <SemenInformationStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={8} title="Semen Assessment" isActive={currentStep === 7}>
                <SemenAssessmentStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              </WizardStep>

              <WizardStep stepNumber={9} title="Results" isActive={currentStep === 8}>
                <ConceptionRatingStep
                  data={data}
                  onUpdate={(stepData) => {
                    updateData(stepData);
                    updateWizardData(stepData);
                  }}
                  onPrevious={prevStep}
                />
              </WizardStep>
            </>
          )}
        </WizardContainer>
      </div>
    </div>
  );
}