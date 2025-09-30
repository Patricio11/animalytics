"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BitchInformationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function BitchInformationStep({ data, onUpdate, onNext, onPrevious }: BitchInformationStepProps) {
  // Use mock data or existing wizard data
  const [age, setAge] = useState(data.bitchAge || 3);
  const [weight, setWeight] = useState(data.bitchWeight || 25);
  const [bodyConditionScore, setBodyConditionScore] = useState(data.bodyConditionScore || 5);
  const [healthStatus, setHealthStatus] = useState(data.generalHealth || 'excellent');

  const handleContinue = () => {
    onUpdate({
      bitchAge: age,
      bitchWeight: weight,
      bodyConditionScore,
      generalHealth: healthStatus
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Age Section */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Age Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Bitch Age (years)</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={age}
              onChange={(e) => setAge(parseFloat(e.target.value))}
              className="bg-background border-primary/20"
            />
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 text-xs">
              Optimal breeding age is 2-7 years. Age significantly impacts conception rates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Weight & Body Condition */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Physical Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                placeholder="Enter current weight"
                className="bg-background border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body-condition">Body Condition Score (1-9)</Label>
              <Select
                value={bodyConditionScore.toString()}
                onValueChange={(value) => setBodyConditionScore(parseInt(value))}
              >
                <SelectTrigger id="body-condition" className="bg-background border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Emaciated</SelectItem>
                  <SelectItem value="2">2 - Very Thin</SelectItem>
                  <SelectItem value="3">3 - Thin</SelectItem>
                  <SelectItem value="4">4 - Underweight</SelectItem>
                  <SelectItem value="5">5 - Ideal</SelectItem>
                  <SelectItem value="6">6 - Slightly Overweight</SelectItem>
                  <SelectItem value="7">7 - Overweight</SelectItem>
                  <SelectItem value="8">8 - Obese</SelectItem>
                  <SelectItem value="9">9 - Severely Obese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 text-xs">
              Body Condition Score of 5 (ideal) provides the best conception rates. Scores below 4 or above 6 may reduce fertility.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Health Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Overall Health Condition</Label>
            <RadioGroup value={healthStatus} onValueChange={setHealthStatus}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="excellent" id="health-excellent" />
                <Label htmlFor="health-excellent" className="flex-1 cursor-pointer">
                  <div className="font-medium">Excellent</div>
                  <div className="text-xs text-muted-foreground">No health issues, regular vet checks, all vaccinations current</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="good" id="health-good" />
                <Label htmlFor="health-good" className="flex-1 cursor-pointer">
                  <div className="font-medium">Good</div>
                  <div className="text-xs text-muted-foreground">Minor health issues managed, vaccinations current</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="fair" id="health-fair" />
                <Label htmlFor="health-fair" className="flex-1 cursor-pointer">
                  <div className="font-medium">Fair</div>
                  <div className="text-xs text-muted-foreground">Some health concerns, under veterinary care</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="poor" id="health-poor" />
                <Label htmlFor="health-poor" className="flex-1 cursor-pointer">
                  <div className="font-medium">Poor</div>
                  <div className="text-xs text-muted-foreground">Significant health issues, breeding not recommended</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

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