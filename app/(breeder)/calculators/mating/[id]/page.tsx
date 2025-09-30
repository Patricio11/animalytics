"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Heart,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProgesteroneInputForm } from "@/components/breeder/calculators/ProgesteroneInputForm";
import { mockMatingRecords, mockAnimals } from "@/data/mockData";

export default function MatingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Get mating record
  const mating = mockMatingRecords.find(m => m.id === id);
  const bitch = mating ? mockAnimals.find(a => a.id === mating.bitchId) : null;
  const dog = mating ? mockAnimals.find(a => a.id === mating.dogId) : null;

  if (!mating || !bitch || !dog) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Card className="shadow-card max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">Mating record not found</p>
            <Link href="/calculators/mating">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Mating Calculator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rating color logic
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-chart-3';
    if (rating >= 60) return 'text-chart-4';
    if (rating >= 40) return 'text-chart-2';
    return 'text-destructive';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 80) return 'bg-chart-3';
    if (rating >= 60) return 'bg-chart-4';
    if (rating >= 40) return 'bg-chart-2';
    return 'bg-destructive';
  };

  const getStatusStyle = () => {
    switch (mating.status) {
      case 'completed':
      case 'successful':
        return {
          bg: 'bg-chart-3/10',
          border: 'border-chart-3/30',
          text: 'text-chart-3',
          icon: <CheckCircle2 className="w-4 h-4" />
        };
      case 'planned':
        return {
          bg: 'bg-chart-4/10',
          border: 'border-chart-4/30',
          text: 'text-chart-4',
          icon: <Clock className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-muted/50',
          border: 'border-muted',
          text: 'text-muted-foreground',
          icon: <Clock className="w-4 h-4" />
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/calculators/mating">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mating Record Details
            </h1>
            <p className="text-muted-foreground mt-1">
              {bitch.name} × {dog.name}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "capitalize font-medium",
              statusStyle.bg,
              statusStyle.border,
              statusStyle.text
            )}
          >
            <span className="flex items-center gap-1.5">
              {statusStyle.icon}
              {mating.status}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Animal Info & Ratings */}
          <div className="space-y-6">
            {/* Animals Card */}
            <Card className="shadow-card border-primary/10 bg-gradient-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  Breeding Pair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bitch */}
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-primary/10">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={bitch.photos[0]} alt={bitch.name} />
                    <AvatarFallback>{bitch.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {bitch.name}
                      </span>
                      <Badge variant="outline" className="text-xs">Bitch</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{bitch.breed}</p>
                  </div>
                </div>

                {/* Dog */}
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-primary/10">
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={dog.photos[0]} alt={dog.name} />
                    <AvatarFallback>{dog.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {dog.name}
                      </span>
                      <Badge variant="outline" className="text-xs">Dog</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{dog.breed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Card */}
            <Card className="shadow-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Breeding Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progesterone Cycle Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progesterone Cycle</span>
                    <span className={cn("font-semibold", getRatingColor(mating.progesteroneCycleRating))}>
                      {mating.progesteroneCycleRating.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={mating.progesteroneCycleRating} className="h-2.5" />
                </div>

                {/* Conception Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Conception Rating</span>
                    <span className={cn("font-semibold", getRatingColor(mating.conceptionRating))}>
                      {mating.conceptionRating.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={mating.conceptionRating} className="h-2.5" />
                </div>

                <Separator />

                {/* Overall Rating */}
                <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg border border-primary/10">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Overall Rating</div>
                    <div className={cn("text-3xl font-bold", getRatingColor(mating.overallRating))}>
                      {mating.overallRating.toFixed(1)}%
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "font-semibold text-white text-sm px-3 py-1",
                      getRatingBgColor(mating.overallRating)
                    )}
                  >
                    {mating.overallRating >= 80 ? 'Excellent' :
                     mating.overallRating >= 60 ? 'Good' :
                     mating.overallRating >= 40 ? 'Fair' : 'Poor'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mating Info Card */}
            <Card className="shadow-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  Mating Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mating Date:</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(mating.matingDate), "MMM dd, yyyy")}
                  </span>
                </div>

                {mating.expectedWhelping && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Whelping:</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(mating.expectedWhelping), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}

                {mating.progesteroneLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progesterone Level:</span>
                    <span className="font-medium text-foreground">
                      {mating.progesteroneLevel.toFixed(1)} ng/mL
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            {mating.notes && (
              <Card className="shadow-card border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-4 h-4 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mating.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Progesterone Form */}
          <div className="lg:col-span-2">
            <ProgesteroneInputForm />
          </div>
        </div>
      </div>
    </div>
  );
}