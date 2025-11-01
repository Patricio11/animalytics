"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit, Trash2, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RemindersTabProps {
  animalId: string;
  reminders: any[];
}

const REMINDER_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: '💉' },
  { value: 'deworming', label: 'Deworming', icon: '💊' },
  { value: 'vet_checkup', label: 'Vet Checkup', icon: '🏥' },
  { value: 'grooming', label: 'Grooming', icon: '✂️' },
  { value: 'medication', label: 'Medication', icon: '💊' },
  { value: 'heat_cycle', label: 'Heat Cycle', icon: '🌡️' },
  { value: 'breeding', label: 'Breeding', icon: '🐕' },
  { value: 'custom', label: 'Custom', icon: '📝' },
];

export function RemindersTab({ animalId, reminders: initialReminders }: RemindersTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reminders from API
  const { data: remindersData, isLoading } = useQuery({
    queryKey: ['animal-reminders', animalId],
    queryFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/reminders`);
      if (!response.ok) throw new Error('Failed to fetch reminders');
      return response.json();
    },
    initialData: { success: true, data: initialReminders },
  });

  const reminders = remindersData?.data || [];

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await fetch(`/api/animals/${animalId}/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal-reminders', animalId] });
      toast({ title: 'Success', description: 'Reminder deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete reminder', variant: 'destructive' });
    },
  });

  // Toggle completion mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ reminderId, isCompleted }: { reminderId: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/animals/${animalId}/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      });
      if (!response.ok) throw new Error('Failed to update reminder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animal-reminders', animalId] });
    },
  });

  const getReminderTypeInfo = (type: string) => {
    return REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[REMINDER_TYPES.length - 1];
  };

  const upcomingReminders = reminders.filter((r: any) => !r.isCompleted && new Date(r.dueDate) >= new Date());
  const overdueReminders = reminders.filter((r: any) => !r.isCompleted && new Date(r.dueDate) < new Date());
  const completedReminders = reminders.filter((r: any) => r.isCompleted);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reminders</h2>
          <p className="text-sm text-muted-foreground">
            {reminders.length} total • {upcomingReminders.length} upcoming • {overdueReminders.length} overdue
          </p>
        </div>
        <Button className="bg-gradient-brand hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <Card className="shadow-card border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Overdue Reminders ({overdueReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueReminders.map((reminder: any) => {
              const typeInfo = getReminderTypeInfo(reminder.reminderType);
              return (
                <div
                  key={reminder.id}
                  className="p-4 rounded-lg border border-destructive/20 bg-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <div className="font-semibold text-foreground">{reminder.title}</div>
                        <Badge variant="destructive" className="text-xs">Overdue</Badge>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCompleteMutation.mutate({ reminderId: reminder.id, isCompleted: reminder.isCompleted })}
                        disabled={toggleCompleteMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => deleteMutation.mutate(reminder.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Reminders ({upcomingReminders.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReminders.map((reminder: any) => {
              const typeInfo = getReminderTypeInfo(reminder.reminderType);
              return (
                <div
                  key={reminder.id}
                  className="p-4 rounded-lg border border-primary/10 bg-background hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <div className="font-semibold text-foreground">{reminder.title}</div>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCompleteMutation.mutate({ reminderId: reminder.id, isCompleted: reminder.isCompleted })}
                        disabled={toggleCompleteMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(reminder.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <Card className="shadow-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">
              Completed Reminders ({completedReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedReminders.slice(0, 5).map((reminder: any) => {
              const typeInfo = getReminderTypeInfo(reminder.reminderType);
              return (
                <div
                  key={reminder.id}
                  className="p-4 rounded-lg border border-primary/10 bg-muted/30 opacity-60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <div className="font-semibold text-foreground line-through">{reminder.title}</div>
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Completed: {format(new Date(reminder.completedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteMutation.mutate(reminder.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <Card className="shadow-card border-primary/10">
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Reminders Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first reminder to keep track of important dates
              </p>
              <Button className="bg-gradient-brand hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create First Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
