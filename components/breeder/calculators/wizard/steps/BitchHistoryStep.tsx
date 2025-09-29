"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { WizardStep } from "../WizardStep";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BitchHistoryStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function BitchHistoryStep({ data, onChange }: BitchHistoryStepProps) {
  const hasBeenBred = data.bitchHistory?.hasBeenBred || 'no';
  const previousLitters = data.bitchHistory?.previousLitters || 0;
  const monthsSinceLastLitter = data.bitchHistory?.monthsSinceLastLitter || '';
  const complications = data.bitchHistory?.complications || '';
  const hasComplications = data.bitchHistory?.hasComplications || 'no';

  const handleChange = (field: string, value: any) => {
    onChange({
      bitchHistory: {
        ...data.bitchHistory,
        [field]: value
      }
    });
  };

  return (
    <WizardStep
      title="Bitch Breeding History"
      description="Information about previous breeding experiences"
      icon={<FileText className="w-5 h-5 text-white" />}
    >
      {/* Has Been Bred */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Breeding Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Has this bitch been bred before?</Label>
            <RadioGroup value={hasBeenBred} onValueChange={(value) => handleChange('hasBeenBred', value)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="yes" id="bred-yes" />
                <Label htmlFor="bred-yes" className="flex-1 cursor-pointer font-medium">
                  Yes, she has been bred before
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="no" id="bred-no" />
                <Label htmlFor="bred-no" className="flex-1 cursor-pointer font-medium">
                  No, this will be her first breeding
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Previous Litters (only if has been bred) */}
      {hasBeenBred === 'yes' && (
        <>
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Previous Litter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="previous-litters">Number of Previous Litters</Label>
                  <Input
                    id="previous-litters"
                    type="number"
                    min="0"
                    max="20"
                    value={previousLitters}
                    onChange={(e) => handleChange('previousLitters', parseInt(e.target.value) || 0)}
                    placeholder="Enter number of litters"
                    className="bg-background border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="months-since">Months Since Last Litter</Label>
                  <Input
                    id="months-since"
                    type="number"
                    min="0"
                    max="120"
                    value={monthsSinceLastLitter}
                    onChange={(e) => handleChange('monthsSinceLastLitter', parseInt(e.target.value) || '')}
                    placeholder="Enter months"
                    className="bg-background border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optimal: 12-24 months between litters
                  </p>
                </div>
              </div>

              {monthsSinceLastLitter && monthsSinceLastLitter < 12 && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Warning:</strong> Less than 12 months since last litter may significantly reduce conception rates and increase health risks.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Complications */}
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Breeding Complications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Were there any complications in previous breedings?</Label>
                <RadioGroup
                  value={hasComplications}
                  onValueChange={(value) => handleChange('hasComplications', value)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                    <RadioGroupItem value="no" id="complications-no" />
                    <Label htmlFor="complications-no" className="flex-1 cursor-pointer font-medium">
                      No complications
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                    <RadioGroupItem value="yes" id="complications-yes" />
                    <Label htmlFor="complications-yes" className="flex-1 cursor-pointer font-medium">
                      Yes, there were complications
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {hasComplications === 'yes' && (
                <div className="space-y-2">
                  <Label htmlFor="complications-detail">Describe Complications</Label>
                  <Textarea
                    id="complications-detail"
                    value={complications}
                    onChange={(e) => handleChange('complications', e.target.value)}
                    placeholder="Please describe any complications experienced during previous breedings..."
                    rows={4}
                    className="bg-background border-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: Difficult delivery, c-section required, low puppy survival rate, etc.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* First Time Breeding Info */}
      {hasBeenBred === 'no' && (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-sm">
            <strong>First Time Breeding:</strong> First-time mothers typically have slightly lower conception rates but often have successful pregnancies with proper care and monitoring.
          </AlertDescription>
        </Alert>
      )}
    </WizardStep>
  );
}