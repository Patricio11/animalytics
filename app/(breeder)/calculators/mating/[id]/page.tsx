"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Heart,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calculator,
  Activity,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProgesteroneInputForm } from "@/components/breeder/calculators/ProgesteroneInputForm";
import { MatingDetailSkeleton } from "@/components/breeder/calculators/MatingDetailSkeleton";
import { DeleteMatingDialog } from "@/components/breeder/calculators/DeleteMatingDialog";
import { useMating, useDeleteMating, useCalculateMating } from "@/lib/api/queries/matings";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function MatingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch mating record from API
  const { data: mating, isLoading, isError, refetch: refetchMating } = useMating(id);
  const deleteMatingMutation = useDeleteMating();
  const calculateMatingMutation = useCalculateMating();
  
  // Fetch progesterone tests for the bitch
  const { data: progTests } = useQuery({
    queryKey: ['progesterone-tests', mating?.bitchId],
    queryFn: async () => {
      if (!mating?.bitchId) return [];
      const res = await fetch(`/api/progesterone-tests?animalId=${mating.bitchId}`);
      if (!res.ok) throw new Error('Failed to fetch progesterone tests');
      const data = await res.json();
      return data.tests || [];
    },
    enabled: !!mating?.bitchId
  });

  // Loading state
  if (isLoading) {
    return <MatingDetailSkeleton />;
  }

  // Error state
  if (isError || !mating) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <Card className="shadow-card max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">
              {isError ? "Failed to load mating record" : "Mating record not found"}
            </p>
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

  const bitch = mating.bitch;
  const dog = mating.dog;
  
  // Get most recent progesterone test
  const latestProgTest = progTests?.[0];

  // Convert string/number ratings to numbers
  const progesteroneRating = typeof mating.progesteroneRating === 'number' 
    ? mating.progesteroneRating 
    : parseFloat(mating.progesteroneRating || '0');
  const conceptionRating = typeof mating.conceptionRating === 'number'
    ? mating.conceptionRating
    : parseFloat(mating.conceptionRating || '0');
  const overallRating = typeof mating.overallRating === 'number'
    ? mating.overallRating
    : parseFloat(mating.overallRating || '0');
  
  // Calculate ratings using mutation hook
  const handleCalculateRatings = async () => {
    try {
      await calculateMatingMutation.mutateAsync({
        id,
        data: {
          progesterone: latestProgTest ? {
            laboratory: latestProgTest.laboratory,
            unit: latestProgTest.unit,
            breedingMethod: latestProgTest.breedingMethod,
            readings: latestProgTest.readings
          } : undefined,
          conception: mating.calculationData
        }
      });
      
      toast({
        title: "Ratings calculated",
        description: "Overall rating has been updated successfully."
      });
    } catch (error) {
      console.error('Error calculating ratings:', error);
      toast({
        variant: "destructive",
        title: "Calculation failed",
        description: "Could not calculate ratings. Please try again."
      });
    }
  };

  // Delete mating handler
  const handleDeleteConfirm = async () => {
    try {
      await deleteMatingMutation.mutateAsync(id);

      toast({
        title: "Mating deleted",
        description: "The mating record has been permanently deleted."
      });

      router.push('/calculators/mating');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete the mating record. Please try again."
      });
    }
  };

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
              {bitch?.name || 'Unknown'} × {dog?.name || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
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
                <Link href={`/animals/${bitch?.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-primary/10 hover:bg-accent hover:border-primary/30 transition-colors cursor-pointer mb-2">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src={bitch?.profileImageUrl || undefined} alt={bitch?.name} />
                      <AvatarFallback className="bg-gradient-brand text-white">
                        {bitch?.name?.[0]?.toUpperCase() || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {bitch?.name || 'Unknown'}
                        </span>
                        <Badge variant="outline" className="text-xs bg-pink-100 dark:bg-pink-900">Bitch</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{bitch?.breed?.name || 'Unknown breed'}</p>
                    </div>
                  </div>
                </Link>

                {/* Dog */}
                <Link href={`/animals/${dog?.id}`}>
                  <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-primary/10 hover:bg-accent hover:border-primary/30 transition-colors cursor-pointer">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src={dog?.profileImageUrl || undefined} alt={dog?.name} />
                      <AvatarFallback className="bg-gradient-brand text-white">
                        {dog?.name?.[0]?.toUpperCase() || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {dog?.name || 'Unknown'}
                        </span>
                        <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900">Dog</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{dog?.breed?.name || 'Unknown breed'}</p>
                    </div>
                  </div>
                </Link>
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
                    <span className={cn("font-semibold", getRatingColor(progesteroneRating))}>
                      {progesteroneRating.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={progesteroneRating} className="h-2.5" />
                </div>

                {/* Conception Rating */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Conception Rating</span>
                    <span className={cn("font-semibold", getRatingColor(conceptionRating))}>
                      {conceptionRating.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={conceptionRating} className="h-2.5" />
                </div>

                <Separator />

                {/* Overall Rating */}
                <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg border border-primary/10">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Overall Rating</div>
                    <div className={cn("text-3xl font-bold", getRatingColor(overallRating))}>
                      {overallRating.toFixed(1)}%
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "font-semibold text-white text-sm px-3 py-1",
                      getRatingBgColor(overallRating)
                    )}
                  >
                    {overallRating >= 80 ? 'Excellent' :
                     overallRating >= 60 ? 'Good' :
                     overallRating >= 40 ? 'Fair' : 'Poor'}
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

            {/* Progesterone Tests Card */}
            <Card className="shadow-card border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-4 h-4 text-primary" />
                  Progesterone Tests ({progTests?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progTests && progTests.length > 0 ? (
                  <div className="space-y-3">
                    {progTests.map((test: any) => (
                      <div key={test.id} className="p-3 border border-primary/10 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {format(new Date(test.testDate), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {test.readings.length} readings • {test.laboratory} • {test.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-chart-3">
                              {test.rating || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rating
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No progesterone tests found for {bitch?.name}</p>
                    <p className="text-sm mt-1">Add tests using the form below</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calculate Ratings Button */}
            <Card className="shadow-card border-primary/10 bg-gradient-subtle">
              <CardContent className="pt-6">
                <Button
                  onClick={handleCalculateRatings}
                  disabled={calculateMatingMutation.isPending || (!latestProgTest && !mating.calculationData)}
                  className="w-full bg-gradient-brand hover:opacity-90 shadow-card"
                  size="lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  {calculateMatingMutation.isPending ? 'Calculating...' : 'Calculate Overall Rating'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Combines progesterone (40%) and conception (60%) ratings
                </p>
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

        {/* Delete Mating Dialog */}
        <DeleteMatingDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          matingInfo={{
            bitchName: bitch?.name || 'Unknown',
            dogName: dog?.name || 'Unknown',
            matingDate: format(new Date(mating.matingDate), 'MMMM dd, yyyy')
          }}
          isDeleting={deleteMatingMutation.isPending}
        />
      </div>
    </div>
  );
}