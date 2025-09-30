"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, CheckCircle2 } from "lucide-react";
import { getBreedRating } from "@/lib/mock-data/conception-factors";
import { cn } from "@/lib/utils";
import { WizardData } from "@/lib/types/wizard";

interface BreedSelectionStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
}

export function BreedSelectionStep({ data, onUpdate, onNext }: BreedSelectionStepProps) {
  // For now, use mock breed data until we integrate animal selection
  const bitchBreed = data.bitchBreed || "Golden Retriever";
  const dogBreed = data.dogBreed || "Golden Retriever";

  const bitchBreedRating = getBreedRating(bitchBreed);
  const dogBreedRating = getBreedRating(dogBreed);
  const averageRating = (bitchBreedRating + dogBreedRating) / 2;

  const getRatingColor = (rating: number) => {
    if (rating >= 2.5) return 'text-chart-3';
    if (rating >= 1.5) return 'text-chart-4';
    return 'text-destructive';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 2.5) return 'Easy Breeder';
    if (rating >= 1.5) return 'Moderate Difficulty';
    return 'Challenging Breed';
  };

  const handleContinue = () => {
    // Save breed data and move to next step
    onUpdate({
      bitchBreed,
      dogBreed,
      breedRating: averageRating
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Breed Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bitch Breed */}
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Bitch Breed</span>
              <Badge variant="outline" className="text-xs">Female</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Breed</div>
              <div className="text-lg font-semibold text-foreground">{bitchBreed}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Conception Success Rating</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= bitchBreedRating
                          ? "text-chart-4 fill-current"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className={cn("text-sm font-medium", getRatingColor(bitchBreedRating))}>
                  {getRatingLabel(bitchBreedRating)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dog Breed */}
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Dog Breed</span>
              <Badge variant="outline" className="text-xs">Male</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Breed</div>
              <div className="text-lg font-semibold text-foreground">{dogBreed}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Conception Success Rating</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5",
                        star <= dogBreedRating
                          ? "text-chart-4 fill-current"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className={cn("text-sm font-medium", getRatingColor(dogBreedRating))}>
                  {getRatingLabel(dogBreedRating)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Breed Rating */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Combined Breed Rating</div>
              <div className={cn("text-2xl font-bold", getRatingColor(averageRating))}>
                {getRatingLabel(averageRating)}
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-7 h-7",
                    star <= Math.round(averageRating)
                      ? "text-chart-4 fill-current"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This rating is based on typical conception success rates for these breeds.
            Individual factors will be considered in the following steps.
          </p>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Alert className="border-chart-3/50 bg-chart-3/10">
        <CheckCircle2 className="h-4 w-4 text-chart-3" />
        <AlertDescription className="ml-2">
          Breed information loaded. Continue to provide more details about the bitch and dog.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleContinue} className="bg-gradient-brand hover:opacity-90 shadow-card">
          Continue
        </Button>
      </div>
    </div>
  );
}