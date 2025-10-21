"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Activity, TrendingUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Season } from "@/lib/mock-data/animal-profile-details";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { SeasonDialog } from "./SeasonDialog";
import { SeasonCard } from "./SeasonCard";

interface SeasonsTabProps {
  animalId: string;
  seasons: Season[];
}

export function SeasonsTab({ animalId, seasons: initialSeasons }: SeasonsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Fetch seasons from API
  const { data: seasonsData, isLoading } = useQuery({
    queryKey: ['seasons', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/seasons`);
      if (!response.ok) throw new Error('Failed to fetch seasons');
      return response.json();
    },
    initialData: { success: true, data: initialSeasons },
  });

  const seasons = seasonsData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Season, 'id'>) => {
      const response = await fetch(`/api/animals/${animalId}/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create season');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Heat cycle recorded successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record heat cycle', variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Season, 'id'> }) => {
      const response = await fetch(`/api/animals/${animalId}/seasons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update season');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Heat cycle updated successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update heat cycle', variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/animals/${animalId}/seasons/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete season');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Heat cycle deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete heat cycle', variant: 'destructive' });
    },
  });

  const sortedSeasons = [...seasons].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleCreateNew = () => {
    setEditingSeason(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (newSeason: Omit<Season, 'id'>) => {
    if (dialogMode === 'create') {
      createMutation.mutate(newSeason);
    } else if (editingSeason) {
      updateMutation.mutate({ id: editingSeason.id, data: newSeason });
    }
  };

  const handleDelete = (seasonId: string) => {
    if (confirm('Are you sure you want to delete this heat cycle? This action cannot be undone.')) {
      deleteMutation.mutate(seasonId);
    }
  };

  // Calculate average cycle length
  const completedSeasons = seasons.filter((s: Season) => s.endDate);
  const avgCycleLength = completedSeasons.length > 0
    ? Math.round(
        completedSeasons.reduce((sum: number, s: Season) => {
          return sum + differenceInDays(new Date(s.endDate!), new Date(s.startDate));
        }, 0) / completedSeasons.length
      )
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {seasons.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{seasons.length}</div>
                <div className="text-sm text-muted-foreground">Total Seasons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{avgCycleLength}</div>
                <div className="text-sm text-muted-foreground">Avg Cycle (days)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">
                  {seasons[0]?.startDate ? format(new Date(seasons[0].startDate), 'MMM yyyy') : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Last Season</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {seasons.filter((s: Season) => !s.endDate).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heat Cycles List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Heat Cycles
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
              onClick={handleCreateNew}
            >
              <Plus className="w-3 h-3 mr-2" />
              Record New Season
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedSeasons.length > 0 ? (
            <div className="space-y-4">
              {sortedSeasons.map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No heat cycles recorded yet</p>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:border-primary"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record First Season
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Info */}
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground">Season Tracking:</strong>
              <span className="text-muted-foreground"> Recording heat cycles helps predict future seasons and optimal breeding times. Progesterone readings from the mating calculator are automatically linked here.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Season Dialog */}
      <SeasonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingSeason={editingSeason}
        mode={dialogMode}
      />
    </div>
  );
}