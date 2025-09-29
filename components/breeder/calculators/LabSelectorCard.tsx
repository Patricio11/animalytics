"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope, Beaker } from "lucide-react";
import { Laboratory, Unit, BreedingMethod } from "@/lib/calculations";

interface LabSelectorCardProps {
  laboratory: Laboratory;
  unit: Unit;
  breedingMethod: BreedingMethod;
  onLaboratoryChange: (lab: Laboratory) => void;
  onUnitChange: (unit: Unit) => void;
  onBreedingMethodChange: (method: BreedingMethod) => void;
}

export function LabSelectorCard({
  laboratory,
  unit,
  breedingMethod,
  onLaboratoryChange,
  onUnitChange,
  onBreedingMethodChange
}: LabSelectorCardProps) {
  return (
    <Card className="shadow-card border-primary/10 bg-surface">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
            <Microscope className="w-4 h-4 text-white" />
          </div>
          Testing Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Laboratory Selection */}
        <div className="space-y-2">
          <Label htmlFor="laboratory" className="text-sm font-medium flex items-center gap-2">
            <Beaker className="w-4 h-4 text-primary" />
            Laboratory
          </Label>
          <Select value={laboratory} onValueChange={onLaboratoryChange}>
            <SelectTrigger
              id="laboratory"
              className="bg-background border-primary/20 focus:border-primary transition-colors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDAS">VIDAS</SelectItem>
              <SelectItem value="IDEXX">IDEXX</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select the laboratory that performed the test
          </p>
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-sm font-medium">
            Measurement Unit
          </Label>
          <Select value={unit} onValueChange={onUnitChange}>
            <SelectTrigger
              id="unit"
              className="bg-background border-primary/20 focus:border-primary transition-colors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nanograms">
                <div className="flex flex-col items-start">
                  <span className="font-medium">ng/mL</span>
                  <span className="text-xs text-muted-foreground">Nanograms per milliliter</span>
                </div>
              </SelectItem>
              <SelectItem value="nanomoles">
                <div className="flex flex-col items-start">
                  <span className="font-medium">nmol/L</span>
                  <span className="text-xs text-muted-foreground">Nanomoles per liter</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Breeding Method Selection */}
        <div className="space-y-2">
          <Label htmlFor="breeding-method" className="text-sm font-medium">
            Breeding Method
          </Label>
          <Select value={breedingMethod} onValueChange={onBreedingMethodChange}>
            <SelectTrigger
              id="breeding-method"
              className="bg-background border-primary/20 focus:border-primary transition-colors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural_ai">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Natural/Fresh AI</span>
                  <span className="text-xs text-muted-foreground">Natural breeding or fresh semen</span>
                </div>
              </SelectItem>
              <SelectItem value="tci">
                <div className="flex flex-col items-start">
                  <span className="font-medium">TCI</span>
                  <span className="text-xs text-muted-foreground">Transcervical insemination</span>
                </div>
              </SelectItem>
              <SelectItem value="surgical_ai">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Surgical AI</span>
                  <span className="text-xs text-muted-foreground">Surgical insemination</span>
                </div>
              </SelectItem>
              <SelectItem value="frozen">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Frozen Semen</span>
                  <span className="text-xs text-muted-foreground">Frozen/thawed semen</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Different methods have different optimal timing windows
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Tip:</span> Each laboratory uses different
            reference ranges. Ensure your settings match your test results for accurate calculations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}