"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface ActiveCycleCardProps {
  cycle: {
    id: string;
    bitchId: string;
    bitchName: string;
    bitchBreed: string;
    bitchPhotoUrl?: string;
    startDate: Date;
    currentDay: number;
    nextTestDate: Date | null;
    lastReading?: {
      day: number;
      level: number;
      phase: string;
      phaseColor: string;
    };
    breedingMethod: string;
    status: 'active' | 'completed';
  };
  onAddReading: () => void;
  onViewDetails: () => void;
}

export function ActiveCycleCard({ cycle, onAddReading, onViewDetails }: ActiveCycleCardProps) {
  const daysUntilNextTest = cycle.nextTestDate 
    ? differenceInDays(cycle.nextTestDate, new Date())
    : null;

  const isTestDue = daysUntilNextTest !== null && daysUntilNextTest <= 0;
  const isTestSoon = daysUntilNextTest !== null && daysUntilNextTest <= 1 && daysUntilNextTest > 0;

  // Calculate progress (assume 15 day cycle)
  const progress = Math.min((cycle.currentDay / 15) * 100, 100);

  return (
    <Card className={cn(
      "shadow-card border-2 transition-all duration-300 overflow-hidden",
      isTestDue && "border-destructive/50 bg-destructive/5",
      isTestSoon && "border-chart-2/50 bg-chart-2/5",
      !isTestDue && !isTestSoon && "border-primary/10 bg-gradient-subtle"
    )}>
      <CardHeader className="border-b border-primary/10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {cycle.bitchPhotoUrl ? (
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-200 shadow-sm">
                <img src={cycle.bitchPhotoUrl} alt={cycle.bitchName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <Avatar className="w-12 h-12 border-2 border-pink-200 shadow-sm">
                <AvatarFallback className="bg-pink-100 text-pink-700 font-semibold">
                  {cycle.bitchName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1">{cycle.bitchName}</CardTitle>
              <p className="text-sm text-muted-foreground">{cycle.bitchBreed}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Day {cycle.currentDay}
                </Badge>
                {cycle.lastReading && (
                  <Badge 
                    className={cn(
                      "text-xs",
                      cycle.lastReading.phaseColor === 'pink' && "bg-pink-500/10 text-pink-700 border-pink-500/20",
                      cycle.lastReading.phaseColor === 'red' && "bg-red-500/10 text-red-700 border-red-500/20",
                      cycle.lastReading.phaseColor === 'yellow' && "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
                      cycle.lastReading.phaseColor === 'lightgreen' && "bg-green-500/10 text-green-700 border-green-500/20",
                      cycle.lastReading.phaseColor === 'darkgreen' && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                    )}
                  >
                    {cycle.lastReading.phase}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-xs hover:bg-primary/10"
          >
            View Details
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Cycle Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cycle Progress</span>
            <span className="font-medium">Day {cycle.currentDay} of ~15</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Started {format(cycle.startDate, "MMM d, yyyy")}
          </p>
        </div>

        {/* Last Reading */}
        {cycle.lastReading && (
          <div className="p-3 bg-muted/50 rounded-lg border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Last Reading</span>
              <Badge variant="outline" className="text-xs">
                Day {cycle.lastReading.day}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-lg">{cycle.lastReading.level}</span>
              <span className="text-sm text-muted-foreground">ng/mL</span>
            </div>
          </div>
        )}

        {/* Next Test Alert */}
        {cycle.nextTestDate && (
          <div className={cn(
            "p-3 rounded-lg border-2 transition-all",
            isTestDue && "bg-destructive/10 border-destructive/50",
            isTestSoon && "bg-chart-2/10 border-chart-2/50",
            !isTestDue && !isTestSoon && "bg-primary/5 border-primary/20"
          )}>
            <div className="flex items-start gap-3">
              {isTestDue ? (
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              ) : (
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold text-sm mb-1",
                  isTestDue && "text-destructive",
                  isTestSoon && "text-chart-2"
                )}>
                  {isTestDue ? "Test Due Today!" : isTestSoon ? "Test Due Tomorrow" : "Next Test Scheduled"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(cycle.nextTestDate, "EEEE, MMMM d, yyyy")}
                </p>
                {daysUntilNextTest !== null && daysUntilNextTest > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    In {daysUntilNextTest} days
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onAddReading}
          className={cn(
            "w-full shadow-sm",
            isTestDue && "bg-destructive hover:bg-destructive/90",
            !isTestDue && "bg-gradient-brand hover:opacity-90"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isTestDue ? "Enter Test Results Now" : "Add New Reading"}
        </Button>
      </CardContent>
    </Card>
  );
}
