"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Microscope, TrendingUp, Loader2 } from "lucide-react";
import { SemenAssessment } from "@/lib/mock-data/animal-profile-details";
import { SemenAssessmentDialog } from "./SemenAssessmentDialog";
import { SemenAssessmentCard } from "./SemenAssessmentCard";
import { format } from "date-fns";

interface SemenTabProps {
  animalId: string;
  assessments: SemenAssessment[];
}

export function SemenTab({ animalId, assessments: initialAssessments }: SemenTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<SemenAssessment | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  // Fetch semen assessments from API
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['semen-assessments', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/semen-assessments`);
      if (!response.ok) throw new Error('Failed to fetch semen assessments');
      return response.json();
    },
    initialData: { success: true, data: initialAssessments },
  });

  const assessments = assessmentsData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<SemenAssessment, 'id'>) => {
      const response = await fetch(`/api/animals/${animalId}/semen-assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semen-assessments', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Semen assessment created successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create assessment', variant: 'destructive' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<SemenAssessment, 'id'> }) => {
      const response = await fetch(`/api/animals/${animalId}/semen-assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semen-assessments', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Assessment updated successfully' });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update assessment', variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/animals/${animalId}/semen-assessments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semen-assessments', animalId] });
      queryClient.invalidateQueries({ queryKey: ['animal', animalId] });
      toast({ title: 'Success', description: 'Assessment deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete assessment', variant: 'destructive' });
    },
  });

  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCreateNew = () => {
    setEditingAssessment(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (assessment: SemenAssessment) => {
    setEditingAssessment(assessment);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (newAssessment: Omit<SemenAssessment, 'id'>) => {
    if (dialogMode === 'create') {
      createMutation.mutate(newAssessment);
    } else if (editingAssessment) {
      updateMutation.mutate({ id: editingAssessment.id, data: newAssessment });
    }
  };

  const handleDelete = (assessmentId: string) => {
    if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      deleteMutation.mutate(assessmentId);
    }
  };

  // Calculate average quality over time
  const averageMotility = assessments.length > 0
    ? (assessments.reduce((sum: number, a: SemenAssessment) => sum + a.motility, 0) / assessments.length).toFixed(1)
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
      {assessments.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-gradient-subtle">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{assessments.length}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{averageMotility}%</div>
                <div className="text-sm text-muted-foreground">Avg Motility</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-4">
                  {assessments[0]?.quality ? assessments[0].quality.charAt(0).toUpperCase() + assessments[0].quality.slice(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Latest Quality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {assessments[0]?.date ? format(new Date(assessments[0].date), 'MMM yyyy') : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Last Assessment</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <Card className="shadow-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Microscope className="w-5 h-5 text-primary" />
              Semen Assessments
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary"
              onClick={handleCreateNew}
            >
              <Plus className="w-3 h-3 mr-2" />
              New Assessment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAssessments.length > 0 ? (
            <div className="space-y-4">
              {sortedAssessments.map((assessment) => (
                <SemenAssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
              <Microscope className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No semen assessments recorded yet</p>
              <Button
                variant="outline"
                className="hover:bg-primary/10 hover:border-primary"
                onClick={handleCreateNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record First Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quality Trend Info */}
      {assessments.length > 0 && (
        <Card className="shadow-card border-primary/10 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <strong className="text-foreground">Fertility Tracking:</strong>
                <span className="text-muted-foreground"> Regular semen assessments help track fertility over time and can be linked to mating calculations for accurate conception ratings.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semen Assessment Dialog */}
      <SemenAssessmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        existingAssessment={editingAssessment}
        mode={dialogMode}
      />
    </div>
  );
}