"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateConceptionRating } from "@/lib/calculations/conception-rating";
import { Progress } from "@/components/ui/progress";
import { WizardData } from "@/lib/types/wizard";

interface ConceptionRatingStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onPrevious: () => void;
}

export function ConceptionRatingStep({ data, onUpdate, onPrevious }: ConceptionRatingStepProps) {
  // Use mock breed data from earlier steps
  const bitchBreed = data.bitchBreed || "Golden Retriever";
  const dogBreed = data.dogBreed || "Golden Retriever";

  // Calculate conception rating based on all collected data
  const fullData = {
    breed: bitchBreed,
    dogBreed: dogBreed,
    bitchInformation: {
      age: data.bitchAge,
      weight: data.bitchWeight,
      bodyConditionScore: data.bodyConditionScore,
      healthStatus: data.generalHealth
    },
    bitchHistory: {
      hasBeenBred: data.hasBeenBred as 'yes' | 'no' | undefined,
      previousLitters: data.previousLitters || 0,
      monthsSinceLastLitter: data.lastLitterDate ? parseInt(String(data.lastLitterDate)) : undefined,
      hasComplications: (data.complications ? 'yes' : 'no') as 'yes' | 'no'
    },
    litterHistory: {
      totalLitters: data.litters?.length || 0,
      totalPuppies: data.litters?.reduce((sum, l) => sum + (l.puppyCount || 0), 0) || 0,
      successfulLitters: data.litters?.filter(l => !l.complications).length || 0,
      averageLitterSize: data.litters && data.litters.length > 0
        ? data.litters.reduce((sum, l) => sum + (l.puppyCount || 0), 0) / data.litters.length
        : 0
    },
    dogHistory: {
      hasBeenUsed: data.hasBeenUsed as 'yes' | 'no' | undefined,
      previousLitters: data.previousLitters || 0,
      successRate: data.successRate ? parseFloat(String(data.successRate)) : undefined
    },
    breederHistory: {
      yearsExperience: data.yearsExperience ? parseFloat(String(data.yearsExperience)) : 0,
      totalLitters: data.totalLitters || 0,
      breedFamiliarity: (data.breedFamiliarity || 'moderate') as 'expert' | 'experienced' | 'moderate' | 'limited' | 'novice'
    },
    semenInformation: {
      type: data.type || 'fresh',
      collectionDate: data.collectionDate
    },
    semenAssessment: {
      type: (data.type || 'visual') as 'full' | 'visual' | 'none',
      quality: (data.quality || 'good') as 'excellent' | 'good' | 'fair' | 'poor',
      volume: data.volume,
      concentration: data.concentration,
      motility: data.motility,
      morphology: data.morphology
    }
  };

  const rating = calculateConceptionRating(fullData);

  const getRatingColor = (score: number) => {
    if (score >= 80) return 'text-chart-3';
    if (score >= 60) return 'text-chart-4';
    if (score >= 40) return 'text-chart-2';
    return 'text-destructive';
  };

  const getRatingBgColor = (score: number) => {
    if (score >= 80) return 'bg-chart-3';
    if (score >= 60) return 'bg-chart-4';
    if (score >= 40) return 'bg-chart-2';
    return 'bg-destructive';
  };

  const getRatingLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getRecommendation = (score: number) => {
    if (score >= 80) return 'Conditions are highly favorable for breeding. Proceed with confidence.';
    if (score >= 60) return 'Conditions are good for breeding. Monitor closely and follow best practices.';
    if (score >= 40) return 'Conditions are acceptable but not optimal. Consider addressing improvement areas.';
    return 'Conditions are not optimal for breeding. Strongly consider addressing concerns before proceeding.';
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={cn("w-32 h-32 rounded-full flex items-center justify-center", getRatingBgColor(rating.overallRating))}>
                <div className="text-white">
                  <div className="text-4xl font-bold">{Math.round(rating.overallRating)}</div>
                  <div className="text-sm">out of 100</div>
                </div>
              </div>
            </div>

            <div>
              <Badge className={cn("text-base px-4 py-1", getRatingBgColor(rating.overallRating), "text-white")}>
                {getRatingLabel(rating.overallRating)} Rating
              </Badge>
            </div>

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-6 h-6",
                    star <= rating.informationAccuracy
                      ? "text-chart-4 fill-current"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Accuracy: {rating.informationAccuracy}/5 stars (based on data completeness)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Alert className={cn(
        "border-2",
        rating.overallRating >= 60 ? "border-chart-3/50 bg-chart-3/10" : "border-chart-2/50 bg-chart-2/10"
      )}>
        <Info className={cn("h-4 w-4", rating.overallRating >= 60 ? "text-chart-3" : "text-chart-2")} />
        <AlertDescription className="ml-2">
          <strong>Recommendation:</strong> {getRecommendation(rating.overallRating)}
        </AlertDescription>
      </Alert>

      {/* Breakdown by Section */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rating.breakdown).map(([section, values]: [string, { percentage: number; maxPossible: number; score: number; filled: boolean }]) => {
            const sectionLabels: Record<string, string> = {
              breed: 'Breed Selection',
              bitchInformation: 'Bitch Health & Condition',
              bitchHistory: 'Bitch Breeding History',
              litterHistory: 'Litter History',
              dogHistory: 'Dog Breeding History',
              breederHistory: 'Breeder Experience',
              semenQuality: 'Semen Quality'
            };

            // Only show filled sections
            if (!values.filled) return null;

            return (
              <div key={section} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{sectionLabels[section]}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", getRatingColor(values.score * 100))}>
                      {Math.round(values.score * 100)}%
                    </span>
                    <span className="text-muted-foreground text-xs">
                      ({values.maxPossible}% weight)
                    </span>
                  </div>
                </div>
                <Progress value={values.score * 100} className="h-2" />
              </div>
            );
          })}

          {rating.missingWeight > 0 && (
            <Alert className="border-chart-2/50 bg-chart-2/10 mt-4">
              <Info className="h-4 w-4 text-chart-2" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Incomplete Data:</strong> {rating.missingWeight}% of factors were not provided. Complete all sections for the most accurate rating.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mating Summary */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Mating Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Bitch Breed</div>
              <div className="font-semibold text-foreground">{bitchBreed}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Dog Breed</div>
              <div className="font-semibold text-foreground">{dogBreed}</div>
            </div>
          </div>

          {data.type && (
            <div className="pt-3 border-t border-primary/10">
              <div className="text-sm text-muted-foreground mb-1">Semen Type</div>
              <Badge variant="outline" className="capitalize">
                {data.type}
              </Badge>
            </div>
          )}

          {data.quality && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Semen Quality</div>
              <Badge className={cn(
                data.quality === 'excellent' ? 'bg-chart-3' :
                data.quality === 'good' ? 'bg-chart-4' :
                data.quality === 'fair' ? 'bg-chart-2' :
                'bg-destructive',
                'text-white capitalize'
              )}>
                {data.quality}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Factors */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Key Factors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rating.overallRating >= 80 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
              <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Excellent Conditions:</strong> All major factors are optimal for successful breeding.
              </div>
            </div>
          )}

          {data.bitchAge && (data.bitchAge < 2 || data.bitchAge > 7) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
              <AlertCircle className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Age Factor:</strong> Bitch age is outside optimal range (2-7 years). Monitor closely.
              </div>
            </div>
          )}

          {data.lastLitterDate && Number(data.lastLitterDate) < 12 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Recovery Time:</strong> Less than 12 months since last litter may affect success rate.
              </div>
            </div>
          )}

          {data.quality === 'poor' && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Semen Quality:</strong> Poor semen quality significantly reduces conception probability.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Alert className="border-primary/20 bg-primary/5">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription className="ml-2 text-sm">
          <strong>Next Steps:</strong> Save this assessment to track your mating. You can update progesterone readings and monitor the breeding cycle in the mating dashboard.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
          Save Assessment
        </Button>
      </div>
    </div>
  );
}