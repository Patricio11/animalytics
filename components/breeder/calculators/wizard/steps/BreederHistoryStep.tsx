"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Award, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardData } from "@/lib/types/wizard";

interface BreederHistoryStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function BreederHistoryStep({ data, onUpdate, onNext, onPrevious }: BreederHistoryStepProps) {
  const [yearsExperience, setYearsExperience] = useState(data?.yearsExperience || '');
  const [totalLitters, setTotalLitters] = useState(data?.totalLitters || 0);
  const [breedFamiliarity, setBreedFamiliarity] = useState(data?.breedFamiliarity || 'moderate');

  const handleContinue = () => {
    onUpdate({
      yearsExperience,
      totalLitters,
      breedFamiliarity
    });
    onNext();
  };

  const getExperienceLevel = (years: number): string => {
    if (years < 1) return 'Novice';
    if (years < 3) return 'Beginner';
    if (years < 5) return 'Intermediate';
    if (years < 10) return 'Experienced';
    return 'Expert';
  };

  return (
    <div className="space-y-6">
      {/* Experience Information */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Breeding Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years-experience">Years of Breeding Experience</Label>
              <Input
                id="years-experience"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || '')}
                placeholder="Enter years of experience"
                className="bg-background border-primary/20"
              />
              {yearsExperience && (
                <p className="text-xs text-chart-3 font-medium">
                  Level: {getExperienceLevel(Number(yearsExperience))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-litters">Total Litters Produced</Label>
              <Input
                id="total-litters"
                type="number"
                min="0"
                max="500"
                value={totalLitters}
                onChange={(e) => setTotalLitters(parseInt(e.target.value) || 0)}
                placeholder="Enter total litters"
                className="bg-background border-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Across all breeds and years
              </p>
            </div>
          </div>

          {yearsExperience && totalLitters > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Average Litters Per Year</div>
              <div className="text-xl font-bold text-foreground">
                {(totalLitters / Number(yearsExperience)).toFixed(1)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breed Familiarity */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Breed Familiarity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>How familiar are you with this specific breed?</Label>
            <RadioGroup value={breedFamiliarity} onValueChange={setBreedFamiliarity}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="expert" id="breed-expert" />
                <Label htmlFor="breed-expert" className="flex-1 cursor-pointer">
                  <div className="font-medium">Expert</div>
                  <div className="text-xs text-muted-foreground">Bred this breed for many years, deep knowledge of breed-specific needs</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="experienced" id="breed-experienced" />
                <Label htmlFor="breed-experienced" className="flex-1 cursor-pointer">
                  <div className="font-medium">Experienced</div>
                  <div className="text-xs text-muted-foreground">Several litters with this breed, good understanding of characteristics</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="moderate" id="breed-moderate" />
                <Label htmlFor="breed-moderate" className="flex-1 cursor-pointer">
                  <div className="font-medium">Moderate</div>
                  <div className="text-xs text-muted-foreground">Some experience with this breed, still learning specific traits</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="limited" id="breed-limited" />
                <Label htmlFor="breed-limited" className="flex-1 cursor-pointer">
                  <div className="font-medium">Limited</div>
                  <div className="text-xs text-muted-foreground">First time or very few breedings with this breed</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="novice" id="breed-novice" />
                <Label htmlFor="breed-novice" className="flex-1 cursor-pointer">
                  <div className="font-medium">Novice</div>
                  <div className="text-xs text-muted-foreground">First time breeding this specific breed</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Experience Impact Info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2 text-sm">
          <strong>Experience Matters:</strong> Breeder experience and breed familiarity significantly impact breeding success rates. Experienced breeders are better at timing, handling complications, and providing optimal care.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleContinue} className="bg-gradient-brand hover:opacity-90 shadow-card">
          Continue
        </Button>
      </div>
    </div>
  );
}