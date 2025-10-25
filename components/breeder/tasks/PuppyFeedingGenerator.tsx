"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Baby, Utensils, AlertCircle, Loader2 } from "lucide-react";
import { useAnimals } from "@/lib/api/queries/animals";
import { differenceInDays, format, addDays } from "date-fns";

interface PuppyFeedingGeneratorProps {
  onGenerateTasks: (tasks: any[]) => void;
}

export function PuppyFeedingGenerator({ onGenerateTasks }: PuppyFeedingGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  // Fetch all animals
  const { data: allAnimals, isLoading } = useAnimals({ isActive: true });

  // Find puppies that need feeding schedules (2-6 months old)
  const eligiblePuppies = (allAnimals || []).filter((animal: any) => {
    if (!animal.dateOfBirth) return false;

    const ageInDays = differenceInDays(new Date(), new Date(animal.dateOfBirth));

    // Puppies between 2-6 months (60-180 days) need scheduled feedings
    return ageInDays >= 60 && ageInDays <= 180;
  });

  const getPuppyAgeCategory = (ageInDays: number): { category: string; feedingsPerDay: number; times: string[] } => {
    if (ageInDays >= 60 && ageInDays < 90) {
      // 2-3 months: 4 feedings/day
      return {
        category: '2-3 months',
        feedingsPerDay: 4,
        times: ['07:00', '12:00', '17:00', '21:00'],
      };
    } else if (ageInDays >= 90 && ageInDays < 120) {
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

    const tasks: any[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    eligiblePuppies.forEach((puppy: any) => {
      if (!puppy.dateOfBirth) return;

      const ageInDays = differenceInDays(new Date(), new Date(puppy.dateOfBirth));
      const schedule = getPuppyAgeCategory(ageInDays);

      // Generate tasks for today
      schedule.times.forEach(time => {
        tasks.push({
          type: 'feeding',
          title: `Feed ${puppy.name} - ${schedule.category}`,
          animalId: puppy.id,
          dueDate: today,
          dueTime: time,
          taskData: {
            foodType: 'Puppy Growth Food',
            amount: 200,
            unit: 'grams',
            time,
          },
          notes: `Auto-generated: ${schedule.category} old puppy`,
        });
      });

      // Generate for next 6 days (7 days total)
      for (let i = 1; i <= 6; i++) {
        const futureDate = format(addDays(new Date(), i), 'yyyy-MM-dd');

        schedule.times.forEach(time => {
          tasks.push({
            type: 'feeding',
            title: `Feed ${puppy.name} - ${schedule.category}`,
            animalId: puppy.id,
            dueDate: futureDate,
            dueTime: time,
            taskData: {
              foodType: 'Puppy Growth Food',
              amount: 200,
              unit: 'grams',
              time,
            },
            notes: `Auto-generated: ${schedule.category} old puppy`,
          });
        });
      }
    });

    setTimeout(() => {
      onGenerateTasks(tasks);
      setGenerating(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            Puppy Feeding Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading puppies...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (eligiblePuppies.length === 0) {
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
              No puppies between 2-6 months old found. Puppy feeding schedules are automatically generated for puppies in this age range.
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
              {eligiblePuppies.map((puppy: any) => {
                if (!puppy.dateOfBirth) return null;
                const ageInDays = differenceInDays(new Date(), new Date(puppy.dateOfBirth));
                const schedule = getPuppyAgeCategory(ageInDays);

                return (
                  <div key={puppy.id} className="text-muted-foreground">
                    • {puppy.name} ({schedule.category}): {schedule.feedingsPerDay} feedings/day
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
            <li>• 2-3 months old: 4 feedings per day (7:00 AM, 12:00 PM, 5:00 PM, 9:00 PM)</li>
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