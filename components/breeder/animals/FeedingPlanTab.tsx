"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, Utensils, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedingPlan {
  id: string;
  foodType: string;
  mealTimes: Array<{
    time: string;
    amount: string;
    unit: string;
  }>;
  specialInstructions?: string;
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
  feedingPlans: FeedingPlan[];
}

export function FeedingPlanTab({ animalId, feedingPlans: initialPlans }: FeedingPlanTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for Quick Add
  const [formData, setFormData] = useState({
    time: '',
    foodType: '',
    amount: '',
    notes: '',
  });

  // Fetch feeding plans from API
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['feeding-plans', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/feeding-plans`);
      if (!response.ok) throw new Error('Failed to fetch feeding plans');
      return response.json();
    },
    initialData: { success: true, data: initialPlans },
  });

  const feedingPlans = plansData?.data || [];

  // Create mutation (placeholder - would need proper implementation)
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // This is a simplified version - real implementation would create a proper feeding plan
      const response = await fetch(`/api/animals/${animalId}/feeding-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodType: data.foodType,
          mealTimes: [{ time: data.time, amount: data.amount, unit: 'cups' }],
          specialInstructions: data.notes,
          isActive: true,
          startDate: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to create feeding plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding-plans', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Feeding added successfully' });
      setFormData({ time: '', foodType: '', amount: '', notes: '' });
      setShowAddForm(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add feeding', variant: 'destructive' });
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

  const handleSubmit = () => {
    if (!formData.time || !formData.foodType || !formData.amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleClear = () => {
    setFormData({ time: '', foodType: '', amount: '', notes: '' });
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
      notes: index === 0 ? activePlan.specialInstructions : undefined,
    }));
  }, [feedingPlans]);
  
  const activePlan = feedingPlans.find((p: FeedingPlan) => p.isActive);
  const specialDietaryNotes = activePlan?.specialInstructions;
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
    <div className="space-y-6">
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
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Feeding
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
                        <span className="text-sm text-muted-foreground">Feeding #{index + 1}</span>
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
                        onClick={() => setEditingPlanId(activePlan?.id || null)}
                        disabled={!activePlan}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (activePlan && confirm('Are you sure you want to delete this feeding plan?')) {
                            deleteMutation.mutate(activePlan.id);
                          }
                        }}
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
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Feeding Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Dietary Notes */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Special Dietary Notes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
              onClick={() => toast({ title: 'Coming Soon', description: 'Edit notes dialog will be implemented' })}
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit Notes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specialDietaryNotes ? (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-foreground whitespace-pre-wrap">{specialDietaryNotes}</p>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-lg">
              <p className="text-muted-foreground mb-4">No special dietary notes</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-primary/10 hover:border-primary"
                onClick={() => toast({ title: 'Coming Soon', description: 'Add notes dialog will be implemented' })}
              >
                Add Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Feeding Form (placeholder) */}
      <Card className="shadow-card border-primary/10 bg-surface-secondary">
        <CardHeader>
          <CardTitle className="text-lg">Quick Add Feeding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                className="bg-background border-primary/20"
                placeholder="09:00"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="food-type">Food Type</Label>
              <Input
                id="food-type"
                className="bg-background border-primary/20"
                placeholder="e.g., Royal Canin Adult"
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                className="bg-background border-primary/20"
                placeholder="e.g., 2 cups"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              className="bg-background border-primary/20"
              placeholder="Any special instructions or notes..."
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              className="bg-gradient-brand hover:opacity-90 shadow-card"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add to Schedule
            </Button>
            <Button 
              variant="outline"
              onClick={handleClear}
              disabled={createMutation.isPending}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}