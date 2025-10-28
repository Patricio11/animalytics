"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dog, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardData } from "@/lib/types/wizard";

interface DogHistoryStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function DogHistoryStep({ data, onUpdate, onNext, onPrevious }: DogHistoryStepProps) {
  const [hasBeenUsed, setHasBeenUsed] = useState(data?.hasBeenUsed || 'no');
  const [previousLitters, setPreviousLitters] = useState(data?.previousLitters || 0);
  const [successRate, setSuccessRate] = useState(data?.successRate || '');
  const [ageAtFirstUse, setAgeAtFirstUse] = useState(data?.ageAtFirstUse || '');
  
  // New Step 5 fields
  const [littersSired, setLittersSired] = useState<'0' | '1-2' | '3-5' | '5+' | ''>(data?.littersSired || '');
  const [fathersLittersSired, setFathersLittersSired] = useState<'1-3' | '4-10' | '11+' | ''>(data?.fathersLittersSired || '');
  const [recentLitterDate, setRecentLitterDate] = useState<'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months' | ''>(data?.recentLitterDate || '');
  const [pupsInMostRecentSire, setPupsInMostRecentSire] = useState<'0' | '1-3' | '4-6' | '7+' | ''>(data?.pupsInMostRecentSire || '');

  const handleContinue = () => {
    onUpdate({
      hasBeenUsed,
      previousLitters: hasBeenUsed === 'yes' ? previousLitters : 0,
      successRate: hasBeenUsed === 'yes' ? successRate : '',
      ageAtFirstUse: hasBeenUsed === 'yes' ? ageAtFirstUse : '',
      // New fields
      littersSired,
      fathersLittersSired,
      recentLitterDate,
      pupsInMostRecentSire,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Has Been Used for Breeding */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Breeding Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Has this dog been used for breeding before?</Label>
            <RadioGroup value={hasBeenUsed} onValueChange={setHasBeenUsed}>
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPreviousLitters(value);
                      
                      // Auto-populate the dropdown in Additional Dog History
                      if (value === 0) {
                        setLittersSired('0');
                      } else if (value >= 1 && value <= 2) {
                        setLittersSired('1-2');
                      } else if (value >= 3 && value <= 5) {
                        setLittersSired('3-5');
                      } else if (value > 5) {
                        setLittersSired('5+');
                      }
                    }}
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
                    onChange={(e) => setSuccessRate(parseInt(e.target.value) || '')}
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
                  onChange={(e) => setAgeAtFirstUse(parseFloat(e.target.value) || '')}
                  placeholder="Enter age at first breeding"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Optimal: 1.5-2 years or older depending on breed
                </p>
              </div>

              {successRate && Number(successRate) < 50 && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Low Success Rate:</strong> Success rate below 50% may indicate fertility issues or poor semen quality.
                  </AlertDescription>
                </Alert>
              )}

              {successRate && Number(successRate) >= 75 && (
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

      {/* Additional Dog History */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Additional Dog History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="litters-sired">Number of litters sired?</Label>
              <Select value={littersSired} onValueChange={(val) => setLittersSired(val as '0' | '1-2' | '3-5' | '5+')}>
                <SelectTrigger id="litters-sired" className="bg-background border-primary/20">
                  <SelectValue placeholder="Amount Sired" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1-2">1-2</SelectItem>
                  <SelectItem value="3-5">3-5</SelectItem>
                  <SelectItem value="5+">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fathers-litters-sired">Father&apos;s number of litters sired?</Label>
              <Select value={fathersLittersSired} onValueChange={(val) => setFathersLittersSired(val as '1-3' | '4-10' | '11+')}>
                <SelectTrigger id="fathers-litters-sired" className="bg-background border-primary/20">
                  <SelectValue placeholder="Father amount Sired" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3">1-3</SelectItem>
                  <SelectItem value="4-10">4-10</SelectItem>
                  <SelectItem value="11+">11+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recent-litter-date">Date of most recent litter sired?</Label>
            <Select value={recentLitterDate} onValueChange={(val) => setRecentLitterDate(val as 'less_than_1_month' | '1-6_months' | '6-18_months' | 'more_than_18_months')}>
              <SelectTrigger id="recent-litter-date" className="bg-background border-primary/20">
                <SelectValue placeholder="How long since the most recent litter sired" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_than_1_month">Less than 1 Month</SelectItem>
                <SelectItem value="1-6_months">Between 1-6 Months</SelectItem>
                <SelectItem value="6-18_months">Between 6-18 Months</SelectItem>
                <SelectItem value="more_than_18_months">More than 18 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pups-recent-sire">Pups in most recent sire</Label>
            <Select value={pupsInMostRecentSire} onValueChange={(val) => setPupsInMostRecentSire(val as '0' | '1-3' | '4-6' | '7+')}>
              <SelectTrigger id="pups-recent-sire" className="bg-background border-primary/20">
                <SelectValue placeholder="How many pups in most recent litter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1-3">1-3</SelectItem>
                <SelectItem value="4-6">4-6</SelectItem>
                <SelectItem value="7+">7+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recentLitterDate === 'more_than_18_months' && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Important:</strong> More than 18 months since last breeding may indicate low sperm count. Consider upgrading mating method and conducting semen analysis.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 text-xs">
              This information helps assess the dog&apos;s proven fertility and genetic potential.
            </AlertDescription>
          </Alert>
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