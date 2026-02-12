"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConceptionRating } from "@/lib/calculations/conception-types";
import { 
  Heart, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface Animal {
  id: string;
  name: string;
  registrationNumber?: string | null;
  avatarUrl?: string | null;
  breed?: {
    name: string;
  };
}

interface ConceptionRatingCardProps {
  rating: ConceptionRating;
  createdAt?: Date;
  bitch?: Animal;
  dog?: Animal;
  frozenSemen?: {
    id: string;
    dogName: string;
    registrationNumber?: string | null;
  };
  onDelete?: () => void;
}

export function ConceptionRatingCard({ rating, createdAt, bitch, dog, frozenSemen, onDelete }: ConceptionRatingCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Determine rating category
  const getRatingCategory = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 65) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 50) return { label: "Fair", color: "text-yellow-600", bg: "bg-yellow-50" };
    if (score >= 35) return { label: "Poor", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Very Poor", color: "text-red-600", bg: "bg-red-50" };
  };

  const category = getRatingCategory(rating.overallRating);

  // Get section display info
  const sections = [
    { key: "breed", label: "Breed Factors", icon: "🐕" },
    { key: "bitchInformation", label: "Bitch Information", icon: "🐾" },
    { key: "bitchHistory", label: "Bitch History", icon: "📋" },
    { key: "litterHistory", label: "Litter History", icon: "🐶" },
    { key: "dogHistory", label: "Dog History", icon: "👑" },
    { key: "breederHistory", label: "Breeder Experience", icon: "👤" },
    { key: "semenQuality", label: "Semen Quality", icon: "🔬" },
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 rounded-full ${category.bg}`}>
                <Heart className={`w-6 h-6 ${category.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl">Conception Rating</CardTitle>
                {createdAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(createdAt, "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Animals Involved */}
        {(bitch || dog || frozenSemen) && (
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-primary/20 rounded-lg">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Breeding Pair</p>
            <div className="flex items-center justify-center gap-4">
              {/* Bitch */}
              {bitch && (
                <Link href={`/animals/${bitch.id}`} className="flex-1">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    {bitch.avatarUrl ? (
                      <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-pink-200">
                        <img src={bitch.avatarUrl} alt={bitch.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Avatar className="h-12 w-12 border-2 border-pink-200">
                        <AvatarFallback className="bg-pink-100 text-pink-700">
                          {bitch.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {bitch.name}
                      </p>
                      {bitch.breed && (
                        <p className="text-xs text-muted-foreground truncate">{bitch.breed.name}</p>
                      )}
                      {bitch.registrationNumber && (
                        <p className="text-xs text-muted-foreground truncate">{bitch.registrationNumber}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-xs">♀ Dam</Badge>
                  </div>
                </Link>
              )}

              {/* Arrow */}
              <div className="flex-shrink-0">
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Dog or Frozen Semen */}
              {dog ? (
                <Link href={`/animals/${dog.id}`} className="flex-1">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer group">
                    {dog.avatarUrl ? (
                      <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-200">
                        <img src={dog.avatarUrl} alt={dog.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Avatar className="h-12 w-12 border-2 border-blue-200">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {dog.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {dog.name}
                      </p>
                      {dog.breed && (
                        <p className="text-xs text-muted-foreground truncate">{dog.breed.name}</p>
                      )}
                      {dog.registrationNumber && (
                        <p className="text-xs text-muted-foreground truncate">{dog.registrationNumber}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">♂ Sire</Badge>
                  </div>
                </Link>
              ) : frozenSemen ? (
                <div className="flex-1">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Avatar className="h-12 w-12 border-2 border-purple-200">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {frozenSemen.dogName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {frozenSemen.dogName}
                      </p>
                      {frozenSemen.registrationNumber && (
                        <p className="text-xs text-muted-foreground truncate">{frozenSemen.registrationNumber}</p>
                      )}
                      <p className="text-xs text-purple-600">Frozen Semen</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">♂ Sire</Badge>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Overall Rating Display */}
        <div className={`p-6 rounded-lg ${category.bg} border-2 border-${category.color.replace('text-', '')}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Rating</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${category.color}`}>
                  {rating.overallRating.toFixed(1)}%
                </span>
                <Badge variant="secondary" className={`${category.color} ${category.bg}`}>
                  {category.label}
                </Badge>
              </div>
            </div>

            {/* Information Accuracy Stars */}
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground mb-2">Data Accuracy</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating.informationAccuracy
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {rating.informationAccuracy}/5 stars
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={rating.overallRating} className="h-3" />
        </div>

        {/* Data Completeness */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Data Completeness</p>
              <p className="text-xs text-muted-foreground">
                {rating.totalWeight.toFixed(0)}% of factors provided
              </p>
            </div>
          </div>
          {rating.missingWeight > 0 && (
            <Badge variant="outline" className="text-orange-600">
              {rating.missingWeight.toFixed(0)}% missing
            </Badge>
          )}
        </div>

        {/* Factor Breakdown Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Factor Breakdown
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Factor Breakdown
            </>
          )}
        </Button>

        {/* Detailed Breakdown */}
        {showBreakdown && (
          <div className="space-y-3 pt-2">
            <p className="text-sm font-semibold text-muted-foreground">Contributing Factors</p>
            {sections.map((section) => {
              const data = rating.breakdown[section.key as keyof typeof rating.breakdown];
              if (!data || !data.filled) return null;

              const percentage = (data.score * 100).toFixed(1);
              const contribution = data.percentage.toFixed(1);

              return (
                <div key={section.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Score: {percentage}%
                      </span>
                      <Badge variant="secondary" className="min-w-[60px] justify-center">
                        +{contribution}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={parseFloat(percentage)} className="h-2" />
                </div>
              );
            })}

            {/* Missing Factors */}
            {rating.missingWeight > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Incomplete Data
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Some factors were not provided. Adding more information could improve
                      the accuracy of this rating.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interpretation Guide */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            What does this rating mean?
          </p>
          <p className="text-xs text-blue-700">
            This rating estimates the likelihood of successful conception based on the provided
            breeding factors. Higher ratings indicate more favorable conditions. Remember that
            this is a statistical estimate and individual results may vary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
