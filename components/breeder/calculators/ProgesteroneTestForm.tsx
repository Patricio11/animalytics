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
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface ProgesteroneTestFormProps {
  cycleDay: number;
  bitchName: string;
  onSubmit: (data: { testDate: Date; level: number }) => void;
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
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);
  const [nextTest, setNextTest] = useState<{ days: number; date: Date; reason: string } | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const numLevel = parseFloat(level);
    if (!isNaN(numLevel) && numLevel >= 0 && numLevel <= 50) {
      setPhaseInfo(getPhaseInfo(numLevel));
      setNextTest(calculateNextTest(numLevel, new Date(testDate)));
      setError("");
    } else if (level && (isNaN(numLevel) || numLevel < 0 || numLevel > 50)) {
      setError("Please enter a value between 0 and 50 ng/mL");
      setPhaseInfo(null);
      setNextTest(null);
    } else {
      setPhaseInfo(null);
      setNextTest(null);
    }
  }, [level, testDate]);

  const handleSubmit = () => {
    const numLevel = parseFloat(level);
    if (isNaN(numLevel) || numLevel < 0 || numLevel > 50) {
      setError("Please enter a valid progesterone level");
      return;
    }
    if (!testDate) {
      setError("Please select a test date");
      return;
    }
    onSubmit({ testDate: testDate, level: numLevel });
  };

  const isValid = testDate && level && !error && phaseInfo;

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
        {/* Test Date */}
        <div className="space-y-2">
          <Label htmlFor="test-date" className="text-sm font-semibold">
            Test Date *
          </Label>
          <DatePicker
            date={testDate}
            onDateChange={(date) => setTestDate(date || new Date())}
            placeholder="Select test date"
            maxDate={new Date()}
            className="bg-background border-primary/20"
          />
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
              min="0"
              max="50"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="0.0"
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
              Valid range: 0-50 ng/mL
            </p>
          )}
        </div>

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
                <Badge className={cn(phaseInfo.bgClass, phaseInfo.borderClass, phaseInfo.textClass)}>
                  {level} ng/mL
                </Badge>
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
