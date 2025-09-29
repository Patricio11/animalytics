"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Star,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgesteroneRating } from "@/lib/calculations";

interface ProgesteroneRatingDisplayProps {
  rating: ProgesteroneRating | null;
  trend?: {
    trend: 'rising' | 'falling' | 'stable' | 'insufficient';
    averageChange: number;
    isOptimal: boolean;
  };
  recommendation?: {
    recommendation: 'optimal' | 'good' | 'acceptable' | 'not_recommended';
    message: string;
    suggestedAction: string;
  };
  breedingWindow?: {
    startDay: number;
    endDay: number;
    confidence: number;
  };
  hasReadings: boolean;
}

export function ProgesteroneRatingDisplay({
  rating,
  trend,
  recommendation,
  breedingWindow,
  hasReadings
}: ProgesteroneRatingDisplayProps) {
  if (!hasReadings) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Enter progesterone readings to see the calculated rating
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rating) {
    return null;
  }

  // Rating color logic
  const getRatingColor = () => {
    if (rating.rating >= 9) return 'text-chart-3';
    if (rating.rating >= 7) return 'text-chart-4';
    if (rating.rating >= 5) return 'text-chart-2';
    return 'text-destructive';
  };

  const getRatingBgGradient = () => {
    if (rating.rating >= 9) return 'from-chart-3/20 to-chart-3/5';
    if (rating.rating >= 7) return 'from-chart-4/20 to-chart-4/5';
    if (rating.rating >= 5) return 'from-chart-2/20 to-chart-2/5';
    return 'from-destructive/20 to-destructive/5';
  };

  const getRecommendationStyle = () => {
    if (!recommendation) return {};

    switch (recommendation.recommendation) {
      case 'optimal':
        return {
          border: 'border-chart-3',
          bg: 'bg-chart-3/10',
          icon: <CheckCircle2 className="h-5 w-5 text-chart-3" />
        };
      case 'good':
        return {
          border: 'border-chart-4',
          bg: 'bg-chart-4/10',
          icon: <CheckCircle2 className="h-5 w-5 text-chart-4" />
        };
      case 'acceptable':
        return {
          border: 'border-chart-2',
          bg: 'bg-chart-2/10',
          icon: <AlertCircle className="h-5 w-5 text-chart-2" />
        };
      default:
        return {
          border: 'border-destructive',
          bg: 'bg-destructive/10',
          icon: <AlertCircle className="h-5 w-5 text-destructive" />
        };
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.trend) {
      case 'rising':
        return <TrendingUp className="w-5 h-5 text-chart-3" />;
      case 'falling':
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-chart-2" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const recStyle = getRecommendationStyle();

  return (
    <div className="space-y-4">
      {/* Main Rating Card */}
      <Card className="shadow-card border-primary/10 overflow-hidden">
        <div className={cn("bg-gradient-to-br p-6", getRatingBgGradient())}>
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Star className={cn("w-6 h-6", getRatingColor())} />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Progesterone Rating
              </h3>
            </div>

            <div className={cn("text-7xl font-bold", getRatingColor())}>
              {rating.rating.toFixed(1)}
              <span className="text-3xl text-muted-foreground">/10</span>
            </div>

            <Badge
              variant="outline"
              className="text-sm font-semibold bg-background/80 backdrop-blur-sm"
            >
              {rating.matchedPattern}
            </Badge>

            {/* Confidence Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span className="font-semibold">{rating.confidence.toFixed(0)}%</span>
              </div>
              <Progress value={rating.confidence} className="h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Trend Analysis */}
      {trend && (
        <Card className="shadow-card border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getTrendIcon()}
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pattern</span>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  trend.trend === 'rising' && "border-chart-3 text-chart-3",
                  trend.trend === 'falling' && "border-destructive text-destructive",
                  trend.trend === 'stable' && "border-chart-2 text-chart-2"
                )}
              >
                {trend.trend}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Change</span>
              <span className="text-sm font-semibold">
                {trend.averageChange > 0 ? '+' : ''}{trend.averageChange.toFixed(2)} per day
              </span>
            </div>

            {trend.isOptimal && (
              <div className="mt-3 p-2 bg-chart-3/10 border border-chart-3/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chart-3 flex-shrink-0" />
                <span className="text-xs text-chart-3 font-medium">
                  Optimal rising pattern detected
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Breeding Window */}
      {breedingWindow && breedingWindow.confidence > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Optimal Breeding Window</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recommended Days</span>
              <Badge className="bg-gradient-brand text-white font-semibold">
                Day {breedingWindow.startDay} - {breedingWindow.endDay}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Window Confidence</span>
              <span className="text-sm font-semibold">
                {breedingWindow.confidence.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Alert */}
      {recommendation && (
        <Alert className={cn("shadow-sm", recStyle.border, recStyle.bg)}>
          <div className="flex gap-3">
            {recStyle.icon}
            <div className="flex-1">
              <AlertDescription>
                <div className="font-semibold mb-1">{recommendation.message}</div>
                <div className="text-sm opacity-90">{recommendation.suggestedAction}</div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}