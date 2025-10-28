"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Heart, Info, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays } from "date-fns";

interface HeatCycleStartCardProps {
  animals: any[];
  onStartCycle: (data: { bitchId: string; startDate: string; breedingMethod: string }) => void;
  isLoading?: boolean;
}

export function HeatCycleStartCard({ animals, onStartCycle, isLoading }: HeatCycleStartCardProps) {
  const [selectedBitch, setSelectedBitch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [breedingMethod, setBreedingMethod] = useState<string>("natural_ai");

  const selectedAnimal = animals.find(a => a.id === selectedBitch);
  const firstTestDate = startDate ? addDays(new Date(startDate), 4) : null;
  const currentDay = startDate ? differenceInDays(new Date(), new Date(startDate)) + 1 : 0;
  const isOverdue = currentDay >= 5;

  const handleSubmit = () => {
    if (selectedBitch && startDate) {
      onStartCycle({
        bitchId: selectedBitch,
        startDate: startDate, // Keep as YYYY-MM-DD string
        breedingMethod
      });
    }
  };

  const isValid = selectedBitch && startDate;

  return (
    <Card className="shadow-card border-primary/10 bg-gradient-subtle overflow-hidden">
      <CardHeader className="border-b border-primary/10 bg-gradient-brand/5">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl">Start New Heat Cycle</div>
            <div className="text-sm font-normal text-muted-foreground mt-1">
              Track progesterone levels and optimal breeding timing
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {animals.length === 0 ? (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="ml-2">
              All your female dogs currently have active heat cycles. You can start a new cycle once an existing cycle is completed or cancelled.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Bitch Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Select Bitch *</Label>
              <Select value={selectedBitch} onValueChange={setSelectedBitch}>
                <SelectTrigger className={cn(
                  "bg-background border-primary/20 hover:border-primary transition-colors",
                  selectedBitch && "border-chart-3"
                )}>
                  <SelectValue placeholder="Choose a female dog..." />
                </SelectTrigger>
                <SelectContent>
                  {animals.filter(a => a.sex === 'female').map(animal => (
                <SelectItem key={animal.id} value={animal.id}>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="w-8 h-8 border-2 border-primary/20">
                      <AvatarImage src={animal.profilePhotoUrl} alt={animal.name} />
                      <AvatarFallback className="bg-gradient-brand text-white text-xs">
                        {animal.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{animal.name}</div>
                      <div className="text-xs text-muted-foreground">{animal.breed}</div>
                    </div>
                    {animal.registeredName && (
                      <Badge variant="outline" className="text-xs">
                        Registered
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAnimal && (
            <div className="p-3 bg-chart-3/10 border border-chart-3/20 rounded-lg flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-chart-3/30">
                <AvatarImage src={selectedAnimal.profilePhotoUrl} alt={selectedAnimal.name} />
                <AvatarFallback className="bg-gradient-brand text-white">
                  {selectedAnimal.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{selectedAnimal.name}</div>
                <div className="text-sm text-muted-foreground">{selectedAnimal.breed}</div>
                {selectedAnimal.registeredName && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedAnimal.registeredName}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Heat Start Date */}
        <div className="space-y-3">
          <Label htmlFor="start-date" className="text-sm font-semibold">
            Day 1 - Heat Start Date *
          </Label>
          <p className="text-xs text-muted-foreground">
            When did you first notice bleeding/discharge? (You can select past dates if you forgot to record)
          </p>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Allow up to 30 days back
            className={cn(
              "bg-background border-primary/20 hover:border-primary transition-colors",
              startDate && "border-chart-3"
            )}
          />
          {startDate && firstTestDate && (
            <>
              <Alert className={cn(
                "border-primary/50 bg-gradient-subtle",
                isOverdue && "border-amber-500/50 bg-amber-500/10"
              )}>
                {isOverdue ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <Calendar className="h-4 w-4 text-primary" />
                )}
                <AlertDescription className="ml-2">
                  <strong>Current Status:</strong>
                  <div className="mt-1 text-sm">
                    Today is <strong>Day {currentDay}</strong> of the heat cycle
                  </div>
                  {isOverdue ? (
                    <div className="mt-2 text-sm font-semibold text-amber-600">
                      ⚠️ First progesterone test was due on {format(firstTestDate, "MMM d")} (Day 5). 
                      You can add it immediately after starting the cycle.
                    </div>
                  ) : (
                    <div className="mt-2 text-sm">
                      First test due: {format(firstTestDate, "EEEE, MMMM d, yyyy")} (Day 5)
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        {/* Breeding Method */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Planned Breeding Method *</Label>
          <p className="text-xs text-muted-foreground">
            This helps calculate optimal breeding timing
          </p>
          <Select value={breedingMethod} onValueChange={setBreedingMethod}>
            <SelectTrigger className="bg-background border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural_ai">
                <div className="py-1">
                  <div className="font-medium">Natural / AI (Fresh or Chilled)</div>
                  <div className="text-xs text-muted-foreground">Breed 2-4 days after ovulation</div>
                </div>
              </SelectItem>
              <SelectItem value="frozen">
                <div className="py-1">
                  <div className="font-medium">AI / TCI (Frozen Semen)</div>
                  <div className="text-xs text-muted-foreground">Breed 3-5 days after ovulation</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Info Alert */}
        <Alert className="border-chart-2/50 bg-chart-2/10">
          <Info className="h-4 w-4 text-chart-2" />
          <AlertDescription className="ml-2 text-sm">
            <strong>What happens next:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Day 1 marks the start of the heat cycle (no test needed)</li>
              <li>• You'll be reminded on Day 5 for the first progesterone test</li>
              <li>• System will guide you on when to test next based on results</li>
              <li>• You'll receive alerts when breeding window opens</li>
            </ul>
          </AlertDescription>
        </Alert>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="w-full bg-gradient-brand hover:opacity-90 shadow-card h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Starting Cycle...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Start Heat Cycle Tracking
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
