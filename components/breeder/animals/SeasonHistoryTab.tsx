"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Bell,
  Trash2,
  Edit
} from "lucide-react";
import { format, differenceInDays, addDays, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AddSeasonDialog } from "./AddSeasonDialog";

interface Season {
  id: string;
  startDate: string;
  endDate?: string;
  status: string;
  durationDays?: number;
  notes?: string;
  createdAt: string;
}

interface SeasonHistoryTabProps {
  animalId: string;
  animalName: string;
  animalSex: 'male' | 'female';
}

export function SeasonHistoryTab({ animalId, animalName, animalSex }: SeasonHistoryTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  // Only show for female animals
  if (animalSex !== 'female') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Heat cycle tracking is only available for female animals.
        </AlertDescription>
      </Alert>
    );
  }

  // Fetch seasons
  const { data: seasons, isLoading } = useQuery({
    queryKey: ['seasons', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/seasons`);
      if (!response.ok) throw new Error('Failed to fetch seasons');
      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const response = await fetch(`/api/animals/${animalId}/seasons/${seasonId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete season');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons', animalId] });
      toast({
        title: "Season Deleted",
        description: "Heat cycle record has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate cycle statistics
  const calculateStats = () => {
    if (!seasons?.seasons || seasons.seasons.length < 2) return null;

    const completedSeasons = seasons.seasons
      .filter((s: Season) => s.endDate)
      .sort((a: Season, b: Season) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

    if (completedSeasons.length < 2) return null;

    // Calculate average cycle length (days between start dates)
    const intervals: number[] = [];
    for (let i = 0; i < completedSeasons.length - 1; i++) {
      const current = parseISO(completedSeasons[i].startDate);
      const next = parseISO(completedSeasons[i + 1].startDate);
      intervals.push(differenceInDays(current, next));
    }

    const avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    
    // Calculate average duration
    const durations = completedSeasons
      .filter((s: Season) => s.durationDays)
      .map((s: Season) => s.durationDays!);
    
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    // Predict next season
    const lastSeason = completedSeasons[0];
    const lastStartDate = parseISO(lastSeason.startDate);
    const predictedNextDate = addDays(lastStartDate, avgInterval);
    const daysUntilNext = differenceInDays(predictedNextDate, new Date());

    return {
      avgInterval,
      avgDuration,
      predictedNextDate,
      daysUntilNext,
      totalSeasons: completedSeasons.length,
    };
  };

  const stats = calculateStats();

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setShowAddDialog(true);
  };

  const handleDelete = (seasonId: string) => {
    if (confirm('Are you sure you want to delete this heat cycle record?')) {
      deleteMutation.mutate(seasonId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Heat Cycle History</h3>
          <p className="text-sm text-muted-foreground">
            Track and predict heat cycles for {animalName}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingSeason(null);
            setShowAddDialog(true);
          }}
          className="bg-gradient-brand hover:opacity-90 shadow-card"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Season
        </Button>
      </div>

      {/* Statistics Card */}
      {stats && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cycle Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Cycle Length</p>
                <p className="text-2xl font-bold">{stats.avgInterval} days</p>
                <p className="text-xs text-muted-foreground">
                  Between heat cycles
                </p>
              </div>
              
              {stats.avgDuration && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Duration</p>
                  <p className="text-2xl font-bold">{stats.avgDuration} days</p>
                  <p className="text-xs text-muted-foreground">
                    Length of heat
                  </p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Recorded</p>
                <p className="text-2xl font-bold">{stats.totalSeasons}</p>
                <p className="text-xs text-muted-foreground">
                  Heat cycles
                </p>
              </div>
            </div>

            {/* Next Predicted Season */}
            <Alert className={`border-2 ${
              stats.daysUntilNext <= 7 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                : 'border-primary/20 bg-primary/5'
            }`}>
              <Bell className={`h-4 w-4 ${stats.daysUntilNext <= 7 ? 'text-orange-500' : 'text-primary'}`} />
              <AlertDescription className="ml-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Next Expected Heat:</strong>{' '}
                    {format(stats.predictedNextDate, 'MMM dd, yyyy')}
                    <span className="block text-xs mt-1">
                      {stats.daysUntilNext > 0 
                        ? `In ${stats.daysUntilNext} days` 
                        : `${Math.abs(stats.daysUntilNext)} days overdue`}
                    </span>
                  </div>
                  {stats.daysUntilNext <= 7 && stats.daysUntilNext > 0 && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {stats.daysUntilNext <= 14 && stats.daysUntilNext > 0 && (
              <Alert className="border-blue-500/20 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="ml-2 text-sm">
                  <strong>Reminder:</strong> {animalName} may be coming into season soon. 
                  Keep an eye out for early signs and consider scheduling progesterone testing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Season History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Season Records ({seasons?.seasons?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!seasons?.seasons || seasons.seasons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No heat cycles recorded yet</p>
              <p className="text-xs mt-1">
                Start tracking to predict future cycles and get reminders
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {seasons.seasons
                .sort((a: Season, b: Season) => 
                  new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                )
                .map((season: Season) => {
                  const startDate = parseISO(season.startDate);
                  const endDate = season.endDate ? parseISO(season.endDate) : null;
                  const duration = endDate 
                    ? differenceInDays(endDate, startDate)
                    : season.durationDays;
                  const daysAgo = differenceInDays(new Date(), startDate);

                  return (
                    <Card key={season.id} className="border-primary/10">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={season.status === 'active' ? 'default' : 'secondary'}>
                                {season.status === 'active' ? 'Active' : 'Completed'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  <strong>Started:</strong> {format(startDate, 'MMM dd, yyyy')}
                                </span>
                              </div>
                              
                              {endDate && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    <strong>Ended:</strong> {format(endDate, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              )}
                              
                              {duration && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>Duration: {duration} days</span>
                                </div>
                              )}
                              
                              {season.notes && (
                                <p className="text-muted-foreground mt-2 text-xs">
                                  {season.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(season)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(season.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Season Dialog */}
      <AddSeasonDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        animalId={animalId}
        animalName={animalName}
        existingSeason={editingSeason}
      />
    </div>
  );
}
