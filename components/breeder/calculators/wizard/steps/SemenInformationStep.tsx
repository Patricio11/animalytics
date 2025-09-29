"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WizardStep } from "../WizardStep";
import { Droplet, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface SemenInformationStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export function SemenInformationStep({ data, onChange }: SemenInformationStepProps) {
  const semenType = data.semenInformation?.type || 'fresh';
  const collectionDate = data.semenInformation?.collectionDate || '';
  const storageTime = data.semenInformation?.storageTime || '';
  const shippingDuration = data.semenInformation?.shippingDuration || '';

  const handleChange = (field: string, value: any) => {
    onChange({
      semenInformation: {
        ...data.semenInformation,
        [field]: value
      }
    });
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
    <WizardStep
      title="Semen Information"
      description="Details about semen type and handling"
      icon={<Droplet className="w-5 h-5 text-white" />}
    >
      {/* Semen Type Selection */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Semen Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>What type of semen will be used?</Label>
            <RadioGroup value={semenType} onValueChange={(value) => handleChange('type', value)}>
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

      {/* Collection Date & Storage Information */}
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
              onChange={(e) => handleChange('collectionDate', e.target.value)}
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
                onChange={(e) => handleChange('storageTime', parseInt(e.target.value) || '')}
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
                onChange={(e) => handleChange('shippingDuration', parseInt(e.target.value) || '')}
                placeholder="Enter shipping time"
                className="bg-background border-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Time from collection to arrival (optimal: under 24 hours)
              </p>
              {shippingDuration > 48 && (
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

      {/* Semen Type Impact Info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2 text-sm">
          <strong>Success Rates by Type:</strong> Fresh semen typically achieves 80-95% conception rate, chilled semen 60-80%, and frozen semen 50-70%. Proper timing and handling are critical for all types.
        </AlertDescription>
      </Alert>
    </WizardStep>
  );
}