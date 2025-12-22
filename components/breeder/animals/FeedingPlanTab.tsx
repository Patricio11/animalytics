"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Utensils, Loader2, Calendar, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedingDialog } from "./FeedingDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeedingPlan {
  id: string;
  foodType: string;
  mealTimes: Array<{
    time: string;
    amount: string;
    unit: string;
  }>;
  specialNotes?: string;
  isActive: boolean;
}

interface FeedingSchedule {
  id: string;
  time: string;
  foodType: string;
  amount: string;
  notes?: string;
}

interface FeedingPlanTabProps {
  animalId: string;
  animalName: string;
  feedingPlans: FeedingPlan[];
}

export function FeedingPlanTab({ animalId, animalName, feedingPlans: initialPlans }: FeedingPlanTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeedingPlan | null>(null);

  // Fetch feeding plans from API
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['feeding-plans', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/feeding-plans`);
      if (!response.ok) throw new Error('Failed to fetch feeding plans');
      return response.json();
    },
    placeholderData: { success: true, data: initialPlans },
  });

  const feedingPlans = plansData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/animals/${animalId}/feeding-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create feeding plan');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feeding-plans', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks if created
      toast({ 
        title: 'Success', 
        description: data.tasksCreated 
          ? `Feeding plan created and ${data.tasksCreated} task(s) added!`
          : 'Feeding plan created successfully'
      });
      setDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/animals/${animalId}/feeding-plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update feeding plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding-plans', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Feeding plan updated successfully' });
      setDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/animals/${animalId}/feeding-plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete feeding plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding-plans', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Feeding plan deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete feeding plan', variant: 'destructive' });
    },
  });

  const handleSave = (data: any) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (plan: FeedingPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm('Are you sure you want to delete this feeding plan? This will remove all associated meal times.')) {
      deleteMutation.mutate(planId);
    }
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  // Transform API feeding plans into flat schedule array for the design
  const schedule: FeedingSchedule[] = useMemo(() => {
    const activePlan = feedingPlans.find((plan: FeedingPlan) => plan.isActive);
    if (!activePlan) return [];
    
    return activePlan.mealTimes.map((meal: any, index: number) => ({
      id: `${activePlan.id}-meal-${index}`,
      time: meal.time,
      foodType: activePlan.foodType,
      amount: `${meal.amount} ${meal.unit}`,
      notes: index === 0 ? activePlan.specialNotes : undefined,
    }));
  }, [feedingPlans]);
  
  const activePlan = feedingPlans.find((p: FeedingPlan) => p.isActive);
  const specialDietaryNotes = activePlan?.specialNotes;
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Info Alert */}
        {feedingPlans.length === 0 && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Create a feeding plan to track your animal's diet and automatically generate daily feeding tasks.
            </AlertDescription>
          </Alert>
        )}

        {/* Feeding Schedule */}
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-chart-4" />
                Daily Feeding Schedule
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:border-primary"
                onClick={handleCreateNew}
              >
                <Plus className="w-3 h-3 mr-2" />
                {feedingPlans.length > 0 ? "New Plan" : "Create Plan"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sortedSchedule.length > 0 ? (
              <div className="space-y-3">
                {sortedSchedule.map((feeding, index) => (
                  <div
                    key={feeding.id}
                    className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-gradient-brand text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            {feeding.time}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Meal #{index + 1}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Food Type</div>
                            <div className="font-semibold text-foreground">{feeding.foodType}</div>
                          </div>

                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Amount</div>
                            <div className="font-semibold text-foreground">{feeding.amount}</div>
                          </div>
                        </div>

                        {feeding.notes && (
                          <div className="pt-2 border-t border-primary/10">
                            <div className="text-xs text-muted-foreground mb-1">Notes</div>
                            <p className="text-sm text-foreground">{feeding.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10"
                          onClick={() => activePlan && handleEdit(activePlan)}
                          disabled={!activePlan}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => activePlan && handleDelete(activePlan.id)}
                          disabled={!activePlan || deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No feeding schedule set up yet</p>
                <Button 
                  variant="outline" 
                  className="hover:bg-primary/10 hover:border-primary"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Feeding Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Dietary Notes */}
        {specialDietaryNotes && (
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Special Dietary Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-foreground whitespace-pre-wrap">{specialDietaryNotes}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feeding Dialog */}
      <FeedingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingPlan={editingPlan}
        animalName={animalName}
      />
    </>
  );
}