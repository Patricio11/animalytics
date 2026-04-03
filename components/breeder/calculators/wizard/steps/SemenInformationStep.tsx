"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplet, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { WizardData } from "@/lib/types/wizard";

interface SemenInformationStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function SemenInformationStep({ data, onUpdate, onNext, onPrevious }: SemenInformationStepProps) {
  const selectedDog = data?.selectedDog;

  // Auto-calculate dog age from DOB
  const calculateAge = (dateOfBirth: string | Date | null | undefined) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(ageInYears * 10) / 10;
  };

  const autoDogAge = selectedDog?.dateOfBirth ? calculateAge(selectedDog.dateOfBirth) : 0;
  const hasAutoDogAge = !!selectedDog?.dateOfBirth;

  const [semenType, setSemenType] = useState(data?.type || 'fresh');
  const [collectionDate, setCollectionDate] = useState(data?.collectionDate || '');
  const [storageTime, setStorageTime] = useState(data?.storageTime || '');
  const [shippingDuration, setShippingDuration] = useState(data?.shippingDuration || '');
  
  // New Step 7 fields
  const [timeBetweenCollectionAndInsemination, setTimeBetweenCollectionAndInsemination] = useState<'less_than_24hrs' | '24-48hrs' | 'more_than_48hrs' | ''>(data?.timeBetweenCollectionAndInsemination || '');
  const [ageOfDogAtCollection, setAgeOfDogAtCollection] = useState(data?.ageOfDogAtCollection || autoDogAge);
  const [batchUsedPreviously, setBatchUsedPreviously] = useState<'yes' | 'no' | 'dont_know' | ''>(data?.batchUsedPreviously || '');
  const [didProducePups, setDidProducePups] = useState<'yes' | 'no' | 'dont_know' | ''>(data?.didProducePups || '');
  const [pupsProduced, setPupsProduced] = useState<'1-3' | '4-6' | '7+' | ''>(data?.pupsProduced || '');

  const isChilledOrFrozen = semenType === 'chilled' || semenType === 'frozen';

  const handleContinue = () => {
    onUpdate({
      type: semenType,
      collectionDate,
      storageTime: semenType === 'frozen' ? storageTime : '',
      shippingDuration: semenType === 'chilled' ? shippingDuration : '',
      // New fields
      timeBetweenCollectionAndInsemination,
      ageOfDogAtCollection,
      batchUsedPreviously,
      didProducePups,
      pupsProduced,
    });
    onNext();
  };

  const getDaysSinceCollection = () => {
    if (!collectionDate) return null;
    const collection = new Date(collectionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - collection.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceCollection = getDaysSinceCollection();

  return (
    <div className="space-y-6">
      {/* Semen Type Selection */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Semen Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>What type of semen will be used?</Label>
            <RadioGroup value={semenType} onValueChange={(val) => setSemenType(val as 'fresh' | 'chilled' | 'frozen')}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="fresh" id="semen-fresh" />
                <Label htmlFor="semen-fresh" className="flex-1 cursor-pointer">
                  <div className="font-medium">Fresh</div>
                  <div className="text-xs text-muted-foreground">Natural breeding or immediate use (highest success rate)</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="chilled" id="semen-chilled" />
                <Label htmlFor="semen-chilled" className="flex-1 cursor-pointer">
                  <div className="font-medium">Chilled/Cooled</div>
                  <div className="text-xs text-muted-foreground">Shipped overnight, viable for 24-48 hours (good success rate)</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
                <RadioGroupItem value="frozen" id="semen-frozen" />
                <Label htmlFor="semen-frozen" className="flex-1 cursor-pointer">
                  <div className="font-medium">Frozen</div>
                  <div className="text-xs text-muted-foreground">Cryopreserved, can be stored indefinitely (moderate success rate)</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Collection Date & Storage Information - Only for chilled/frozen */}
      {isChilledOrFrozen && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Collection & Handling Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection-date">Collection Date</Label>
              <Input
                id="collection-date"
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="bg-background border-primary/20"
              />
              {daysSinceCollection !== null && (
                <p className="text-xs text-muted-foreground">
                  {daysSinceCollection} day{daysSinceCollection !== 1 ? 's' : ''} since collection
                </p>
              )}
            </div>

            {semenType === 'frozen' && (
              <div className="space-y-2">
                <Label htmlFor="storage-time">Storage Time (months)</Label>
                <Input
                  id="storage-time"
                  type="number"
                  min="0"
                  max="120"
                  value={storageTime}
                  onChange={(e) => setStorageTime(parseInt(e.target.value) || '')}
                  placeholder="Enter storage duration"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  How long has the semen been frozen?
                </p>
              </div>
            )}

            {semenType === 'chilled' && (
              <div className="space-y-2">
                <Label htmlFor="shipping-duration">Shipping Duration (hours)</Label>
                <Input
                  id="shipping-duration"
                  type="number"
                  min="0"
                  max="72"
                  value={shippingDuration}
                  onChange={(e) => setShippingDuration(parseInt(e.target.value) || '')}
                  placeholder="Enter shipping time"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Time from collection to arrival (optimal: under 24 hours)
                </p>
                {Number(shippingDuration) > 48 && (
                  <Alert className="border-destructive/50 bg-destructive/10 mt-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="ml-2 text-sm">
                      <strong>Warning:</strong> Chilled semen viability decreases significantly after 48 hours.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Semen Type Impact Info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2 text-sm">
          <strong>Success Rates by Type:</strong> Fresh semen typically achieves 80-95% conception rate, chilled semen 60-80%, and frozen semen 50-70%. Proper timing and handling are critical for all types.
        </AlertDescription>
      </Alert>

      {/* Additional Semen Information - Only for chilled/frozen */}
      {isChilledOrFrozen && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Additional Semen Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {semenType === 'chilled' && (
              <div className="space-y-2">
                <Label htmlFor="time-between-collection">Time between collection and insemination</Label>
                <Select value={timeBetweenCollectionAndInsemination} onValueChange={(val) => setTimeBetweenCollectionAndInsemination(val as 'less_than_24hrs' | '24-48hrs' | 'more_than_48hrs')}>
                  <SelectTrigger id="time-between-collection" className="bg-background border-primary/20">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_than_24hrs">Less than 24 Hours</SelectItem>
                    <SelectItem value="24-48hrs">24-48 Hours</SelectItem>
                    <SelectItem value="more_than_48hrs">More than 48 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="age-at-collection">Age of dog at collection date (years)</Label>
              <div className="relative">
                <Input
                  id="age-at-collection"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={hasAutoDogAge ? autoDogAge : ageOfDogAtCollection}
                  onChange={(e) => setAgeOfDogAtCollection(parseFloat(e.target.value) || 0)}
                  placeholder="Enter age at collection"
                  className="bg-background border-primary/20"
                  readOnly={hasAutoDogAge}
                />
                {hasAutoDogAge && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-chart-3 font-medium">Auto from profile</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Age impacts semen quality: &lt;12 months (poor), 1-3 years (excellent), 3-5 years (good), 5+ years (fair)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-used-previously">Has the batch been used previously?</Label>
              <Select value={batchUsedPreviously} onValueChange={(val) => setBatchUsedPreviously(val as 'yes' | 'no' | 'dont_know')}>
                <SelectTrigger id="batch-used-previously" className="bg-background border-primary/20">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="dont_know">Don&apos;t know</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {batchUsedPreviously === 'yes' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="did-produce-pups">Did it produce pups?</Label>
                  <Select value={didProducePups} onValueChange={(val) => setDidProducePups(val as 'yes' | 'no' | 'dont_know')}>
                    <SelectTrigger id="did-produce-pups" className="bg-background border-primary/20">
                      <SelectValue placeholder="Did it produce pups?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="dont_know">Don&apos;t know</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {didProducePups === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor="pups-produced">How many pups did it produce?</Label>
                    <Select value={pupsProduced} onValueChange={(val) => setPupsProduced(val as '1-3' | '4-6' | '7+')}>
                      <SelectTrigger id="pups-produced" className="bg-background border-primary/20">
                        <SelectValue placeholder="How many pups did it produce?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1-3</SelectItem>
                        <SelectItem value="4-6">4-6</SelectItem>
                        <SelectItem value="7+">7+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2 text-xs">
                Previous batch success helps predict conception rates. Age at collection significantly impacts semen quality.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

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