"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Calendar, Heart, AlertCircle, Stethoscope } from "lucide-react";
import { Litter } from "@/lib/mock-data/animal-profile-details";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface PregnancyTrackerProps {
  litter: Litter;
  bitchName: string;
}

interface Milestone {
  day: number;
  label: string;
  description: string;
  icon: typeof Calendar;
  passed: boolean;
}

export function PregnancyTracker({ litter, bitchName }: PregnancyTrackerProps) {
  // Only show for expected litters (pregnancies in progress)
  if (litter.status !== 'expected' || litter.whelpingDate) {
    return null;
  }

  const matingDate = new Date(litter.matingDate);
  const expectedWhelpingDate = new Date(litter.expectedWhelpingDate);
  const today = new Date();

  // Calculate pregnancy progress
  const totalDays = 63; // Standard gestation period
  const daysSinceMating = differenceInDays(today, matingDate);
  const daysUntilWhelping = differenceInDays(expectedWhelpingDate, today);
  const progressPercentage = Math.min(Math.max((daysSinceMating / totalDays) * 100, 0), 100);

  // Define pregnancy milestones
  const milestones: Milestone[] = [
    {
      day: 21,
      label: 'Early Ultrasound',
      description: 'First ultrasound can confirm pregnancy',
      icon: Stethoscope,
      passed: daysSinceMating >= 21,
    },
    {
      day: 30,
      label: 'Confirmed Pregnancy',
      description: 'Pregnancy clearly visible on ultrasound',
      icon: Heart,
      passed: daysSinceMating >= 30,
    },
    {
      day: 45,
      label: 'X-ray for Puppy Count',
      description: 'Skeletal structures visible, can count puppies',
      icon: Stethoscope,
      passed: daysSinceMating >= 45,
    },
    {
      day: 58,
      label: 'Prepare Whelping Area',
      description: 'Set up whelping box and supplies',
      icon: Baby,
      passed: daysSinceMating >= 58,
    },
    {
      day: 63,
      label: 'Expected Whelping',
      description: 'Average whelping day',
      icon: Calendar,
      passed: daysSinceMating >= 63,
    },
  ];

  // Get upcoming milestone
  const upcomingMilestone = milestones.find(m => !m.passed);
  const lastMilestone = milestones.filter(m => m.passed).pop();

  // Determine status color
  const getStatusColor = () => {
    if (daysUntilWhelping < 0) return 'text-destructive';
    if (daysUntilWhelping <= 7) return 'text-chart-4';
    return 'text-chart-3';
  };

  return (
    <Card className="shadow-card border-primary/10 bg-gradient-subtle">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            Current Pregnancy
          </CardTitle>
          <Badge className="bg-chart-4 text-white">
            Day {daysSinceMating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pregnancy Summary */}
        <div className="p-4 rounded-lg bg-background border border-primary/10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bitch</span>
              <span className="font-semibold text-foreground">{bitchName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sire</span>
              <span className="font-semibold text-foreground">{litter.sireName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mating Date</span>
              <span className="font-semibold text-foreground">
                {format(matingDate, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expected Whelping</span>
              <span className={cn("font-semibold", getStatusColor())}>
                {format(expectedWhelpingDate, 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gestation Progress</span>
            <span className="font-semibold text-foreground">
              {daysSinceMating} / 63 days
            </span>
          </div>
          <div className="relative w-full h-3 bg-surface-secondary rounded-full overflow-hidden border border-primary/10">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-brand transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span className={cn("font-medium", getStatusColor())}>
              {daysUntilWhelping > 0
                ? `${daysUntilWhelping} days remaining`
                : daysUntilWhelping === 0
                ? 'Due today!'
                : `${Math.abs(daysUntilWhelping)} days overdue`}
            </span>
            <span>Expected</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <div className="text-sm">
              {daysUntilWhelping > 7 ? (
                <>
                  <strong className="text-foreground">Pregnancy Progressing</strong>
                  <p className="text-muted-foreground">
                    {upcomingMilestone
                      ? `Next milestone: ${upcomingMilestone.label} on day ${upcomingMilestone.day}`
                      : 'All milestones passed, ready for whelping'}
                  </p>
                </>
              ) : daysUntilWhelping >= 0 ? (
                <>
                  <strong className="text-chart-4">Whelping Imminent</strong>
                  <p className="text-muted-foreground">
                    Monitor closely for signs of labor. Ensure whelping area is prepared.
                  </p>
                </>
              ) : (
                <>
                  <strong className="text-destructive">Overdue</strong>
                  <p className="text-muted-foreground">
                    Contact veterinarian if no signs of labor. Gestation can vary 58-68 days.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground mb-3">Pregnancy Milestones</div>
          <div className="space-y-2">
            {milestones.map((milestone) => {
              const MilestoneIcon = milestone.icon;
              const milestoneDate = addDays(matingDate, milestone.day);
              const isCurrent = upcomingMilestone?.day === milestone.day;

              return (
                <div
                  key={milestone.day}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all",
                    milestone.passed
                      ? "bg-surface-secondary border-primary/10 opacity-60"
                      : isCurrent
                      ? "bg-chart-4/10 border-chart-4/30 shadow-sm"
                      : "bg-background border-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      milestone.passed
                        ? "bg-chart-3 text-white"
                        : isCurrent
                        ? "bg-chart-4 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <MilestoneIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          milestone.passed
                            ? "text-muted-foreground"
                            : isCurrent
                            ? "text-chart-4"
                            : "text-foreground"
                        )}
                      >
                        {milestone.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Day {milestone.day} • {format(milestoneDate, 'MMM dd')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    {isCurrent && differenceInDays(milestoneDate, today) > 0 && (
                      <p className="text-xs text-chart-4 mt-1">
                        {differenceInDays(milestoneDate, today)} days until this milestone
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning for overdue */}
        {daysUntilWhelping < -3 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong className="text-destructive">Veterinary Attention Recommended</strong>
                <p className="text-muted-foreground mt-1">
                  This pregnancy is {Math.abs(daysUntilWhelping)} days overdue. While gestation can vary,
                  please consult with your veterinarian to ensure the health of the dam and puppies.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}