"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Baby, Utensils, AlertCircle } from "lucide-react";
import { FeedingTask } from "@/lib/mock-data/tasks";
import { Litter } from "@/lib/mock-data/animal-profile-details";
import { differenceInDays, format, addDays } from "date-fns";

interface PuppyFeedingGeneratorProps {
  litters: Litter[];
  onGenerateTasks: (tasks: Omit<FeedingTask, 'id' | 'completed'>[]) => void;
}

export function PuppyFeedingGenerator({ litters, onGenerateTasks }: PuppyFeedingGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  // Find litters with puppies that need feeding schedules
  const eligibleLitters = litters.filter(litter => {
    if (!litter.whelpingDate) return false;

    const ageInDays = differenceInDays(new Date(), new Date(litter.whelpingDate));

    // Puppies between 3-6 months (90-180 days) need scheduled feedings
    return ageInDays >= 90 && ageInDays <= 180;
  });

  const getPuppyAgeCategory = (ageInDays: number): { category: string; feedingsPerDay: number; times: string[] } => {
    if (ageInDays >= 90 && ageInDays < 120) {
      // 3-4 months: 3 feedings/day
      return {
        category: '3-4 months',
        feedingsPerDay: 3,
        times: ['07:30', '13:00', '18:30'],
      };
    } else {
      // 4-6 months: 2 feedings/day
      return {
        category: '4-6 months',
        feedingsPerDay: 2,
        times: ['08:00', '18:00'],
      };
    }
  };

  const generateFeedingTasks = () => {
    setGenerating(true);

    const tasks: Omit<FeedingTask, 'id' | 'completed'>[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    eligibleLitters.forEach(litter => {
      if (!litter.whelpingDate || !litter.puppies) return;

      const ageInDays = differenceInDays(new Date(), new Date(litter.whelpingDate));
      const schedule = getPuppyAgeCategory(ageInDays);

      // Generate tasks for each puppy
      litter.puppies.forEach(puppy => {
        // Only generate for retained or healthy puppies
        if (puppy.status === 'sold') return;

        schedule.times.forEach(time => {
          tasks.push({
            type: 'feeding',
            animalId: puppy.id,
            animalName: puppy.name || `Puppy ${puppy.id}`,
            foodType: 'Puppy Growth Food',
            amount: 200, // Default amount, can be adjusted
            unit: 'grams',
            time,
            date: today,
            notes: `Auto-generated: ${schedule.category} old puppy from ${litter.sireName} litter`,
          });
        });
      });

      // Generate for next 7 days
      for (let i = 1; i <= 7; i++) {
        const futureDate = format(addDays(new Date(), i), 'yyyy-MM-dd');

        litter.puppies.forEach(puppy => {
          if (puppy.status === 'sold') return;

          schedule.times.forEach(time => {
            tasks.push({
              type: 'feeding',
              animalId: puppy.id,
              animalName: puppy.name || `Puppy ${puppy.id}`,
              foodType: 'Puppy Growth Food',
              amount: 200,
              unit: 'grams',
              time,
              date: futureDate,
              notes: `Auto-generated: ${schedule.category} old puppy from ${litter.sireName} litter`,
            });
          });
        });
      }
    });

    setTimeout(() => {
      onGenerateTasks(tasks);
      setGenerating(false);
    }, 500);
  };

  if (eligibleLitters.length === 0) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            Puppy Feeding Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-surface-secondary">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="ml-2 text-sm text-muted-foreground">
              No puppies between 3-6 months old found. Puppy feeding schedules are automatically generated for puppies in this age range.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-primary/10 bg-gradient-subtle">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Baby className="w-5 h-5 text-primary" />
          Puppy Feeding Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-chart-3/50 bg-chart-3/10">
          <Utensils className="h-4 w-4 text-chart-3" />
          <AlertDescription className="ml-2 text-sm">
            <strong className="text-foreground">Ready to generate feeding schedules!</strong>
            <div className="mt-2 space-y-1">
              {eligibleLitters.map(litter => {
                if (!litter.whelpingDate) return null;
                const ageInDays = differenceInDays(new Date(), new Date(litter.whelpingDate));
                const schedule = getPuppyAgeCategory(ageInDays);
                const puppyCount = litter.puppies?.filter(p => p.status !== 'sold').length || 0;

                return (
                  <div key={litter.id} className="text-muted-foreground">
                    • {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'} from {litter.sireName} litter ({schedule.category}): {schedule.feedingsPerDay} feedings/day
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This will create feeding tasks for the next 7 days:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• 3-4 months old: 3 feedings per day (7:30 AM, 1:00 PM, 6:30 PM)</li>
            <li>• 4-6 months old: 2 feedings per day (8:00 AM, 6:00 PM)</li>
          </ul>
        </div>

        <Button
          onClick={generateFeedingTasks}
          disabled={generating}
          className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
        >
          <Baby className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : 'Generate Puppy Feeding Tasks'}
        </Button>

        <Alert className="border-primary/20 bg-surface-secondary">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-xs text-muted-foreground">
            Generated tasks can be edited or deleted individually. Feeding amounts and times can be adjusted per puppy as needed.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}