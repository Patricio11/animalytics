"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Sparkles,
  ArrowRight,
  Beaker
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
  type ProgesteroneMachine,
  PROGESTERONE_MACHINES,
  convertToVidasStandard,
  getMachineOptions,
} from "@/lib/utils/progesterone-machine-conversion";

interface ProgesteroneTestFormProps {
  cycleDay: number;
  bitchName: string;
  onSubmit: (data: { 
    testDate: Date; 
    level: number; 
    normalizedLevel: number;
    machine: ProgesteroneMachine;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface PhaseInfo {
  phase: string;
  color: string;
  icon: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

function getPhaseInfo(level: number): PhaseInfo {
  if (level < 1.5) {
    return {
      phase: "Anestrus",
      color: "gray",
      icon: "⚪",
      description: "Out of heat",
      bgClass: "bg-gray-500/10",
      borderClass: "border-gray-500/20",
      textClass: "text-gray-700"
    };
  } else if (level >= 1.5 && level < 4) {
    return {
      phase: "LH Surge",
      color: "pink",
      icon: "🟣",
      description: "Hormone surge beginning",
      bgClass: "bg-pink-500/10",
      borderClass: "border-pink-500/20",
      textClass: "text-pink-700"
    };
  } else if (level >= 4 && level < 9) {
    return {
      phase: "Estimated Ovulation",
      color: "red",
      icon: "🔴",
      description: "Ovulation occurring",
      bgClass: "bg-red-500/10",
      borderClass: "border-red-500/20",
      textClass: "text-red-700"
    };
  } else if (level >= 9 && level < 15) {
    return {
      phase: "Egg Maturation",
      color: "yellow",
      icon: "🟡",
      description: "Eggs maturing",
      bgClass: "bg-yellow-500/10",
      borderClass: "border-yellow-500/20",
      textClass: "text-yellow-700"
    };
  } else if (level >= 15 && level < 25) {
    return {
      phase: "Fertile Range",
      color: "lightgreen",
      icon: "🟢",
      description: "Optimal breeding time",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/20",
      textClass: "text-green-700"
    };
  } else {
    return {
      phase: "Late Stage Fertility",
      color: "darkgreen",
      icon: "🟢",
      description: "Breeding window closing",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
      textClass: "text-emerald-700"
    };
  }
}

function calculateNextTest(level: number, currentDate: Date): { days: number; date: Date; reason: string } {
  if (level < 4) {
    return {
      days: 3,
      date: addDays(currentDate, 3),
      reason: "Level below 4 ng/mL - test in 3 days"
    };
  } else if (level >= 4 && level < 10) {
    return {
      days: 2,
      date: addDays(currentDate, 2),
      reason: "Approaching ovulation - test every 2 days"
    };
  } else {
    return {
      days: 1,
      date: addDays(currentDate, 1),
      reason: "Fertile range - test daily"
    };
  }
}

export function ProgesteroneTestForm({ 
  cycleDay, 
  bitchName, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: ProgesteroneTestFormProps) {
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [level, setLevel] = useState<string>("");
  const [machine, setMachine] = useState<ProgesteroneMachine>('VIDAS');
  const [normalizedLevel, setNormalizedLevel] = useState<number>(0);
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);
  const [nextTest, setNextTest] = useState<{ days: number; date: Date; reason: string } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const numLevel = parseFloat(level);
    if (!isNaN(numLevel) && numLevel >= 0 && numLevel <= 100) {
      // Convert to VIDAS standard for phase detection
      const normalized = convertToVidasStandard(numLevel, machine);
      setNormalizedLevel(normalized);
      setPhaseInfo(getPhaseInfo(normalized));
      setNextTest(calculateNextTest(normalized, new Date(testDate)));
      setError("");
    } else if (level && (isNaN(numLevel) || numLevel < 0 || numLevel > 100)) {
      setError("Please enter a value between 0 and 100 ng/mL");
      setPhaseInfo(null);
      setNextTest(null);
    } else {
      setPhaseInfo(null);
      setNextTest(null);
    }
  }, [level, machine, testDate]);

  const handleSubmit = () => {
    const numLevel = parseFloat(level);
    if (isNaN(numLevel) || numLevel < 0 || numLevel > 100) {
      setError("Please enter a valid progesterone level");
      return;
    }
    if (!testDate) {
      setError("Please select a test date");
      return;
    }
    if (!machine) {
      setError("Please select a testing machine");
      return;
    }
    onSubmit({ 
      testDate: new Date(testDate), 
      level: numLevel,
      normalizedLevel,
      machine
    });
  };

  const isValid = testDate && level && machine && !error && phaseInfo;

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader className="border-b border-primary/10 bg-gradient-subtle">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-brand shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl">Day {cycleDay} Progesterone Test</div>
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {bitchName}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Day Info Alert */}
        {cycleDay < 5 && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Note:</strong> Day 1 is the start of season (first blood). The first progesterone test should be on Day 5, which is 5 days after Day 1.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Date */}
        <div className="space-y-2">
          <Label htmlFor="test-date" className="text-sm font-semibold">
            Test Date *
          </Label>
          <Input
            id="test-date"
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-background border-primary/20"
          />
        </div>

        {/* Testing Machine */}
        <div className="space-y-2">
          <Label htmlFor="machine" className="text-sm font-semibold flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            Testing Machine *
          </Label>
          <Select value={machine} onValueChange={(value) => setMachine(value as ProgesteroneMachine)}>
            <SelectTrigger className="bg-background border-primary/20">
              <SelectValue placeholder="Select testing machine" />
            </SelectTrigger>
            <SelectContent>
              {getMachineOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {machine !== 'VIDAS' && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Values will be normalized to VIDAS standard for consistent interpretation
            </p>
          )}
        </div>

        {/* Progesterone Level */}
        <div className="space-y-2">
          <Label htmlFor="level" className="text-sm font-semibold">
            Progesterone Level *
          </Label>
          <div className="relative">
            <Input
              id="level"
              type="number"
              step="0.1"
              min="0.5"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="0.5"
              className={cn(
                "bg-background pr-16 transition-colors",
                error && "border-destructive",
                phaseInfo && "border-chart-3"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              ng/mL
            </span>
          </div>
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
          {!error && (
            <p className="text-xs text-muted-foreground">
              Valid range: 0.5-100 ng/mL (values below 0.5 are typically measurement errors)
            </p>
          )}
        </div>

        {/* Machine Conversion Info */}
        {machine !== 'VIDAS' && level && !error && normalizedLevel > 0 && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Machine Conversion:</strong> {level} ng/mL on {PROGESTERONE_MACHINES[machine].name} = <strong>{normalizedLevel.toFixed(1)} ng/mL</strong> VIDAS equivalent
            </AlertDescription>
          </Alert>
        )}

        {/* Phase Detection */}
        {phaseInfo && (
          <>
            <Separator />
            <div className={cn(
              "p-4 rounded-lg border-2 transition-all",
              phaseInfo.bgClass,
              phaseInfo.borderClass
            )}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{phaseInfo.icon}</span>
                <div className="flex-1">
                  <h4 className={cn("font-semibold text-lg mb-1", phaseInfo.textClass)}>
                    {phaseInfo.phase}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {phaseInfo.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className={cn(phaseInfo.bgClass, phaseInfo.borderClass, phaseInfo.textClass)}>
                    {level} ng/mL
                  </Badge>
                  {machine !== 'VIDAS' && (
                    <span className="text-xs text-muted-foreground">
                      ({normalizedLevel.toFixed(1)} VIDAS)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Next Test Recommendation */}
        {nextTest && (
          <>
            <Separator />
            <Alert className="border-primary/50 bg-gradient-subtle">
              <Calendar className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2">
                <strong className="block mb-2">Next Test Recommendation:</strong>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>Test again in <strong>{nextTest.days} day{nextTest.days > 1 ? 's' : ''}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{format(nextTest.date, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {nextTest.reason}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Info Alert for First Test */}
        {cycleDay === 5 && (
          <Alert className="border-chart-2/50 bg-chart-2/10">
            <Info className="h-4 w-4 text-chart-2" />
            <AlertDescription className="ml-2 text-sm">
              <strong>First Test:</strong> This baseline reading will help determine your testing schedule going forward.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-gradient-brand hover:opacity-90 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save & Schedule Next Test
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
