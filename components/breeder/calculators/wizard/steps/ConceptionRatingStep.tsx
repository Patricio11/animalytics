"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardStep } from "../WizardStep";
import { TrendingUp, Star, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateConceptionRating } from "@/lib/calculations/conception-rating";
import { Progress } from "@/components/ui/progress";

interface ConceptionRatingStepProps {
  data: any;
  bitch: any;
  dog: any;
}

export function ConceptionRatingStep({ data, bitch, dog }: ConceptionRatingStepProps) {
  // Calculate conception rating based on all collected data
  const fullData = {
    breed: bitch.breed,
    dogBreed: dog.breed,
    bitchInformation: data.bitchInformation,
    bitchHistory: data.bitchHistory,
    litterHistory: data.litterHistory,
    dogHistory: data.dogHistory,
    breederHistory: data.breederHistory,
    semenInformation: data.semenInformation,
    semenQuality: data.semenQuality,
    semenAssessment: data.semenAssessment,
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
    <WizardStep
      title="Conception Rating"
      description="Your comprehensive breeding assessment results"
      icon={<TrendingUp className="w-5 h-5 text-white" />}
    >
      {/* Overall Rating Card */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={cn("w-32 h-32 rounded-full flex items-center justify-center", getRatingBgColor(rating.overall))}>
                <div className="text-white">
                  <div className="text-4xl font-bold">{Math.round(rating.overall)}</div>
                  <div className="text-sm">out of 100</div>
                </div>
              </div>
            </div>

            <div>
              <Badge className={cn("text-base px-4 py-1", getRatingBgColor(rating.overall), "text-white")}>
                {getRatingLabel(rating.overall)} Rating
              </Badge>
            </div>

            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-6 h-6",
                    star <= rating.accuracy
                      ? "text-chart-4 fill-current"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Accuracy: {rating.accuracy}/5 stars (based on data completeness)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Alert className={cn(
        "border-2",
        rating.overall >= 60 ? "border-chart-3/50 bg-chart-3/10" : "border-chart-2/50 bg-chart-2/10"
      )}>
        <Info className={cn("h-4 w-4", rating.overall >= 60 ? "text-chart-3" : "text-chart-2")} />
        <AlertDescription className="ml-2">
          <strong>Recommendation:</strong> {getRecommendation(rating.overall)}
        </AlertDescription>
      </Alert>

      {/* Breakdown by Section */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rating.breakdown).map(([section, values]: [string, any]) => {
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
              <div className="text-sm text-muted-foreground mb-1">Bitch</div>
              <div className="font-semibold text-foreground">{bitch.name}</div>
              <div className="text-xs text-muted-foreground">{bitch.breed}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Dog</div>
              <div className="font-semibold text-foreground">{dog.name}</div>
              <div className="text-xs text-muted-foreground">{dog.breed}</div>
            </div>
          </div>

          {data.semenInformation?.type && (
            <div className="pt-3 border-t border-primary/10">
              <div className="text-sm text-muted-foreground mb-1">Semen Type</div>
              <Badge variant="outline" className="capitalize">
                {data.semenInformation.type}
              </Badge>
            </div>
          )}

          {data.semenQuality?.quality && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Semen Quality</div>
              <Badge className={cn(
                data.semenQuality.quality === 'excellent' ? 'bg-chart-3' :
                data.semenQuality.quality === 'good' ? 'bg-chart-4' :
                data.semenQuality.quality === 'fair' ? 'bg-chart-2' :
                'bg-destructive',
                'text-white capitalize'
              )}>
                {data.semenQuality.quality}
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
          {rating.overall >= 80 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
              <CheckCircle2 className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Excellent Conditions:</strong> All major factors are optimal for successful breeding.
              </div>
            </div>
          )}

          {data.bitchInformation?.age && (data.bitchInformation.age < 2 || data.bitchInformation.age > 7) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
              <AlertCircle className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Age Factor:</strong> Bitch age is outside optimal range (2-7 years). Monitor closely.
              </div>
            </div>
          )}

          {data.bitchHistory?.monthsSinceLastLitter && data.bitchHistory.monthsSinceLastLitter < 12 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Recovery Time:</strong> Less than 12 months since last litter may affect success rate.
              </div>
            </div>
          )}

          {data.semenQuality?.quality === 'poor' && (
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
    </WizardStep>
  );
}