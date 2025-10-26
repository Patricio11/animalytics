"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Baby, Calendar, AlertCircle, CheckCircle2, Heart, Loader2 } from "lucide-react";
import type { Litter } from "@/lib/types/animal";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { LitterDialog } from "./LitterDialog";
import { LitterCard } from "./LitterCard";
import { PregnancyTracker } from "./PregnancyTracker";
import { mockAnimals } from "@/data/mockData";

interface LitterDetailsTabProps {
  animalId: string;
  litters: Litter[];
}

export function LitterDetailsTab({ animalId, litters: initialLitters }: LitterDetailsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLitter, setEditingLitter] = useState<Litter | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Fetch litters from API
  const { data: littersData, isLoading } = useQuery({
    queryKey: ['litters', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/litters`);
      if (!response.ok) throw new Error('Failed to fetch litters');
      return response.json();
    },
    initialData: { success: true, data: initialLitters },
  });

  const litters = littersData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Litter, 'id'>) => {
      const response = await fetch(`/api/animals/${animalId}/litters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create litter');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Litter recorded successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record litter', variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Litter, 'id'> }) => {
      const response = await fetch(`/api/animals/${animalId}/litters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update litter');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Litter updated successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update litter', variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/animals/${animalId}/litters/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete litter');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Litter deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete litter', variant: 'destructive' });
    },
  });

  const sortedLitters = [...litters].sort(
    (a, b) => new Date(b.matingDate).getTime() - new Date(a.matingDate).getTime()
  );

  const handleCreateNew = () => {
    setEditingLitter(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (litter: Litter) => {
    setEditingLitter(litter);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (newLitter: Omit<Litter, 'id'>) => {
    if (dialogMode === 'create') {
      createMutation.mutate(newLitter);
    } else if (editingLitter) {
      updateMutation.mutate({ id: editingLitter.id, data: newLitter });
    }
  };

  const handleDelete = (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter record? This action cannot be undone.')) {
      deleteMutation.mutate(litterId);
    }
  };

  // Get available sires (all male dogs)
  const availableSires = mockAnimals
    .filter(a => a.type === 'dog')
    .map(a => ({ id: a.id, name: a.name }));

  // Get bitch name for pregnancy tracker
  const bitch = mockAnimals.find(a => a.id === animalId);
  const bitchName = bitch?.name || 'Unknown';

  const expectedLitters = litters.filter((l: Litter) => l.status === 'expected');
  const whelpedLitters = litters.filter((l: Litter) => l.status === 'whelped' || l.status === 'archived');
  const totalPuppies = whelpedLitters.reduce((sum: number, l: Litter) => sum + (l.puppyCount || 0), 0);
  const avgLitterSize = whelpedLitters.length > 0
    ? (totalPuppies / whelpedLitters.length).toFixed(1)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expected':
        return { label: 'Expected', color: 'bg-chart-2 text-white' };
      case 'whelped':
        return { label: 'Recently Whelped', color: 'bg-chart-3 text-white' };
      case 'archived':
        return { label: 'Archived', color: 'bg-muted text-muted-foreground' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const getDaysUntilWhelping = (expectedDate: string) => {
    const days = differenceInDays(new Date(expectedDate), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  // Find current pregnancy (expected litter without whelping date)
  const currentPregnancy = expectedLitters.find((l: Litter) => !l.whelpingDate);

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
      {/* Pregnancy Tracker - Show for current pregnancies */}
      {currentPregnancy && (
        <PregnancyTracker litter={currentPregnancy} bitchName={bitchName} />
      )}

      {/* Summary Statistics */}
      {litters.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{litters.length}</div>
                <div className="text-sm text-muted-foreground">Total Litters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{totalPuppies}</div>
                <div className="text-sm text-muted-foreground">Total Puppies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">{avgLitterSize}</div>
                <div className="text-sm text-muted-foreground">Avg Per Litter</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {litters.filter((l: Litter) => !l.complications).length}
                </div>
                <div className="text-sm text-muted-foreground">No Complications</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Litters List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Litter History
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
              onClick={handleCreateNew}
            >
              <Plus className="w-3 h-3 mr-2" />
              Record New Litter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedLitters.length > 0 ? (
            <div className="space-y-4">
              {sortedLitters.map((litter) => (
                <LitterCard
                  key={litter.id}
                  litter={litter}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No litters recorded yet</p>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:border-primary"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record First Litter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Litter Tracking Info */}
      <Card className="shadow-card border-primary/10 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <strong className="text-foreground">Litter Tracking:</strong>
              <span className="text-muted-foreground"> Comprehensive litter records help track breeding success rates and are automatically used in conception rating calculations for future matings.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Litter Dialog */}
      <LitterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingLitter={editingLitter}
        mode={dialogMode}
        availableSires={availableSires}
      />
    </div>
  );
}