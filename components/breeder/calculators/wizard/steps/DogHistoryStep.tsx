"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WizardStep } from "../WizardStep";
import { Dog, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DogHistoryStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function DogHistoryStep({ data, onChange }: DogHistoryStepProps) {
  const hasBeenUsed = data.dogHistory?.hasBeenUsed || 'no';
  const previousLitters = data.dogHistory?.previousLitters || 0;
  const successRate = data.dogHistory?.successRate || '';
  const ageAtFirstUse = data.dogHistory?.ageAtFirstUse || '';

  const handleChange = (field: string, value: any) => {
    onChange({
      dogHistory: {
        ...data.dogHistory,
        [field]: value
      }
    });
  };

  return (
    <WizardStep
      title="Dog Breeding History"
      description="Information about the stud's breeding experience"
      icon={<Dog className="w-5 h-5 text-white" />}
    >
      {/* Has Been Used for Breeding */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Breeding Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Has this dog been used for breeding before?</Label>
            <RadioGroup value={hasBeenUsed} onValueChange={(value) => handleChange('hasBeenUsed', value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="yes" id="used-yes" />
                <Label htmlFor="used-yes" className="flex-1 cursor-pointer font-medium">
                  Yes, he has been used for breeding
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="no" id="used-no" />
                <Label htmlFor="used-no" className="flex-1 cursor-pointer font-medium">
                  No, this will be his first breeding
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Previous Breeding Information (only if has been used) */}
      {hasBeenUsed === 'yes' && (
        <>
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Breeding Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous-litters">Number of Litters Sired</Label>
                  <Input
                    id="previous-litters"
                    type="number"
                    min="0"
                    max="100"
                    value={previousLitters}
                    onChange={(e) => handleChange('previousLitters', parseInt(e.target.value) || 0)}
                    placeholder="Enter number of litters"
                    className="bg-background border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="success-rate">Success Rate (%)</Label>
                  <Input
                    id="success-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={successRate}
                    onChange={(e) => handleChange('successRate', parseInt(e.target.value) || '')}
                    placeholder="Enter success rate"
                    className="bg-background border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of successful pregnancies
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age-first-use">Age at First Use (years)</Label>
                <Input
                  id="age-first-use"
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={ageAtFirstUse}
                  onChange={(e) => handleChange('ageAtFirstUse', parseFloat(e.target.value) || '')}
                  placeholder="Enter age at first breeding"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Optimal: 1.5-2 years or older depending on breed
                </p>
              </div>

              {successRate && successRate < 50 && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Low Success Rate:</strong> Success rate below 50% may indicate fertility issues or poor semen quality.
                  </AlertDescription>
                </Alert>
              )}

              {successRate && successRate >= 75 && (
                <Alert className="border-chart-3/50 bg-chart-3/10">
                  <Info className="h-4 w-4 text-chart-3" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Excellent Track Record:</strong> High success rate indicates proven fertility and good semen quality.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* First Time Breeding Info */}
      {hasBeenUsed === 'no' && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-sm">
            <strong>First Time Stud:</strong> First-time studs may require patience and proper handling. Semen quality assessment is especially important.
          </AlertDescription>
        </Alert>
      )}
    </WizardStep>
  );
}