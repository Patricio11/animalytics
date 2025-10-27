"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Baby,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface BreedingWindowAlertProps {
  bitchName: string;
  currentDay: number;
  progesteroneLevel: number;
  phase: string;
  breedingMethod: 'natural_ai' | 'frozen';
  estimatedOvulationDay: number;
  estimatedWhelpingDate: Date;
  onRecordBreeding: () => void;
  onDismiss: () => void;
}

export function BreedingWindowAlert({
  bitchName,
  currentDay,
  progesteroneLevel,
  phase,
  breedingMethod,
  estimatedOvulationDay,
  estimatedWhelpingDate,
  onRecordBreeding,
  onDismiss
}: BreedingWindowAlertProps) {
  
  const isOptimal = progesteroneLevel >= 15 && progesteroneLevel < 25;
  const isLateStage = progesteroneLevel >= 25;
  const isFrozenSemen = breedingMethod === 'frozen';

  // Calculate breeding days
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  return (
    <Card className={cn(
      "shadow-xl border-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500",
      isOptimal && "border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      isLateStage && "border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
    )}>
      {/* Header */}
      <div className={cn(
        "p-6 text-center border-b-4",
        isOptimal && "bg-gradient-to-r from-green-500 to-emerald-500 border-green-600",
        isLateStage && "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-600"
      )}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-white animate-pulse" />
          <h2 className="text-2xl font-bold text-white">
            {isOptimal ? "BREEDING WINDOW OPEN!" : "BREEDING WINDOW CLOSING"}
          </h2>
          <Heart className="w-8 h-8 text-white animate-pulse" />
        </div>
        <p className="text-white/90 text-sm">
          {bitchName} is in the optimal breeding period
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">Current Day</div>
            <div className="text-2xl font-bold text-foreground">Day {currentDay}</div>
          </div>
          <div className="p-4 bg-background rounded-lg border-2 border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">Progesterone</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{progesteroneLevel}</span>
              <span className="text-sm text-muted-foreground">ng/mL</span>
            </div>
          </div>
        </div>

        {/* Phase Badge */}
        <div className="flex items-center justify-center">
          <Badge className={cn(
            "text-base px-4 py-2",
            isOptimal && "bg-green-500/10 text-green-700 border-green-500/20",
            isLateStage && "bg-amber-500/10 text-amber-700 border-amber-500/20"
          )}>
            🟢 {phase}
          </Badge>
        </div>

        <Separator />

        {/* Breeding Recommendations */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Breeding Recommendations
          </h3>

          {isOptimal ? (
            <Alert className="border-green-500/50 bg-green-500/10">
              <Heart className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2">
                <strong className="text-green-700">OPTIMAL TIME TO BREED</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Breed <strong>TODAY</strong> ({format(today, "MMM d")})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Breed <strong>TOMORROW</strong> ({format(tomorrow, "MMM d")})</span>
                  </li>
                  {!isFrozenSemen && (
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>Last optimal day: {format(dayAfter, "MMM d")}</span>
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="ml-2">
                <strong className="text-amber-700">LATE STAGE - ACT QUICKLY</strong>
                <p className="mt-2 text-sm">
                  {isFrozenSemen 
                    ? "For frozen semen, this is still within the optimal window. Breed today if possible."
                    : "Breeding window is closing. Breed today for best results."}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Method-Specific Info */}
          <div className="p-3 bg-muted/50 rounded-lg border border-primary/10">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Method: {isFrozenSemen ? "AI/TCI (Frozen Semen)" : "Natural/AI (Fresh or Chilled)"}
            </div>
            <p className="text-sm text-foreground">
              {isFrozenSemen 
                ? "Optimal breeding: 3-5 days after ovulation (Day " + (estimatedOvulationDay + 3) + "-" + (estimatedOvulationDay + 5) + ")"
                : "Optimal breeding: 2-4 days after ovulation (Day " + (estimatedOvulationDay + 2) + "-" + (estimatedOvulationDay + 4) + ")"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Whelping Date */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-chart-3/10 rounded-lg border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <Baby className="w-6 h-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">Expected Whelping Date</h4>
              <p className="text-2xl font-bold text-primary mb-1">
                {format(estimatedWhelpingDate, "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                ±2 days • ~63 days from ovulation (Day {estimatedOvulationDay})
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="h-12"
          >
            Dismiss
          </Button>
          <Button
            onClick={onRecordBreeding}
            className={cn(
              "h-12 shadow-md",
              isOptimal && "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
              isLateStage && "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            )}
          >
            <Heart className="w-5 h-5 mr-2" />
            Record Breeding
          </Button>
        </div>

        {/* Additional Info */}
        <Alert className="border-primary/50 bg-gradient-subtle">
          <TrendingUp className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-xs">
            <strong>Tip:</strong> Continue daily progesterone testing to confirm optimal timing and track the breeding window.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
