"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStep } from "../WizardStep";
import { Dna, Star, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { getBreedRating } from "@/lib/mock-data/conception-factors";
import { Animal } from "@/types";
import { cn } from "@/lib/utils";

interface BreedSelectionStepProps {
  bitch: Animal;
  dog: Animal;
  onComplete: () => void;
}

export function BreedSelectionStep({ bitch, dog, onComplete }: BreedSelectionStepProps) {
  const bitchBreedRating = getBreedRating(bitch.breed);
  const dogBreedRating = getBreedRating(dog.breed);
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

  const hasRequiredData = bitch.dateOfBirth && bitch.weight && dog.dateOfBirth;

  return (
    <WizardStep
      title="Breed Selection & Verification"
      description="Confirm breed details and check for missing information"
      icon={<Dna className="w-5 h-5 text-white" />}
    >
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
              <div className="text-lg font-semibold text-foreground">{bitch.breed}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Success Rating</div>
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

            <Link href={`/animals/${bitch.id}`}>
              <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary">
                <ExternalLink className="w-3 h-3 mr-2" />
                View {bitch.name}'s Profile
              </Button>
            </Link>
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
              <div className="text-lg font-semibold text-foreground">{dog.breed}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Success Rating</div>
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

            <Link href={`/animals/${dog.id}`}>
              <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary">
                <ExternalLink className="w-3 h-3 mr-2" />
                View {dog.name}'s Profile
              </Button>
            </Link>
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
        </CardContent>
      </Card>

      {/* Missing Data Warning */}
      {!hasRequiredData && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2">
            <div className="font-semibold mb-2">Missing Required Information</div>
            <div className="space-y-1 text-sm">
              {!bitch.dateOfBirth && (
                <div className="flex items-center gap-2">
                  • Missing date of birth for {bitch.name}
                  <Link href={`/animals/${bitch.id}`}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80">
                      Update
                    </Button>
                  </Link>
                </div>
              )}
              {!bitch.weight && (
                <div className="flex items-center gap-2">
                  • Missing weight for {bitch.name}
                  <Link href={`/animals/${bitch.id}`}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80">
                      Update
                    </Button>
                  </Link>
                </div>
              )}
              {!dog.dateOfBirth && (
                <div className="flex items-center gap-2">
                  • Missing date of birth for {dog.name}
                  <Link href={`/animals/${dog.id}`}>
                    <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80">
                      Update
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {hasRequiredData && (
        <Alert className="border-chart-3/50 bg-chart-3/10">
          <CheckCircle2 className="h-4 w-4 text-chart-3" />
          <AlertDescription className="ml-2">
            All required breed information is present. You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </WizardStep>
  );
}