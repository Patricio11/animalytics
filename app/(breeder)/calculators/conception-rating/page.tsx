"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useConceptionWizardStore } from "@/lib/stores/conception-wizard-store";
import { useCalculateMating } from "@/lib/api/queries/matings";
import { useToast } from "@/hooks/use-toast";
import { WizardData } from "@/lib/types/wizard";
import { ArrowLeft, Beaker, Info, RotateCcw, Play } from "lucide-react";

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
  const { toast } = useToast();
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Zustand store
  const zustandStore = useConceptionWizardStore();
  const calculateMutation = useCalculateMating();

  // Check for saved progress on mount
  useEffect(() => {
    const hasSavedProgress = zustandStore.breed !== null ||
                            zustandStore.bitchInfo !== null ||
                            zustandStore.bitchHistory !== null;

    if (hasSavedProgress) {
      setShowResumePrompt(true);
    }
  }, []);

  const handleResumeProgress = () => {
    // Load data from Zustand store
    const savedData = zustandStore.getAllData();
    setWizardData(savedData);
    setShowResumePrompt(false);

    toast({
      title: "Progress restored",
      description: `Resuming from step ${zustandStore.currentStep + 1}`,
    });
  };

  const handleStartFresh = () => {
    zustandStore.reset();
    setShowResumePrompt(false);
    setWizardData({});

    toast({
      title: "Starting fresh",
      description: "Previous progress cleared",
    });
  };

  const handleComplete = async () => {
    const allData = zustandStore.getAllData();

    // TODO: Call API to calculate conception rating
    // For now, just show completion message
    console.log('Wizard completed with data:', allData);

    toast({
      title: "Calculation complete!",
      description: "Conception rating has been calculated",
    });

    // Clear Zustand store after successful completion
    zustandStore.reset();

    router.push('/calculators');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Progress will be saved and you can resume later.')) {
      // Keep Zustand store intact for resume later
      router.push('/calculators');
    }
  };

  const updateWizardData = (stepData: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }));

    // Update Zustand store based on current step
    if (stepData.bitchBreed || stepData.dogBreed) {
      zustandStore.updateBreed(stepData);
    }
    if (stepData.bitchAge !== undefined || stepData.bitchWeight !== undefined) {
      zustandStore.updateBitchInfo(stepData);
    }
    if (stepData.hasBeenBred !== undefined) {
      zustandStore.updateBitchHistory(stepData);
    }
    if (stepData.totalLitters !== undefined) {
      zustandStore.updateLitterHistory(stepData);
    }
    if (stepData.hasBeenUsedForBreeding !== undefined) {
      zustandStore.updateDogHistory(stepData);
    }
    if (stepData.yearsOfExperience !== undefined) {
      zustandStore.updateBreederHistory(stepData);
    }
    if (stepData.semenType) {
      zustandStore.updateSemenInfo(stepData);
    }
    if (stepData.assessmentType) {
      zustandStore.updateSemenAssessment(stepData);
    }
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

        {/* Resume Progress Banner */}
        {showResumePrompt && (
          <Alert className="border-primary/50 bg-gradient-brand/10 shadow-card">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Saved Progress Found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have unfinished wizard progress from step {zustandStore.currentStep + 1}.
                  Would you like to continue where you left off?
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartFresh}
                  className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Start Fresh
                </Button>
                <Button
                  size="sm"
                  onClick={handleResumeProgress}
                  className="bg-gradient-brand hover:opacity-90 shadow-card"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Resume
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Wizard Steps Overview */}
        {!showResumePrompt && (
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
        )}

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