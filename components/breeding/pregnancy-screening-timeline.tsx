"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Stethoscope,
  Syringe,
  XCircle,
  AlertCircle,
  Sparkles,
  Activity,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PregnancyScreeningTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  taskData?: {
    pregnancyScreeningData?: {
      daysPostMating: number;
      screeningType: 'ultrasound' | 'blood_test' | 'xray' | 'checkup';
    };
  };
}

interface PregnancyScreeningTimelineProps {
  breedingRecordId: string;
  lastMatingDate: string;
  bitchName: string;
  isLastMating?: boolean;
  onTasksGenerated?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PregnancyScreeningTimeline({
  breedingRecordId,
  lastMatingDate,
  bitchName,
  isLastMating = false,
  onTasksGenerated,
}: PregnancyScreeningTimelineProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<PregnancyScreeningTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Calculate days since last mating
  const daysSinceLastMating = differenceInDays(
    new Date(),
    new Date(lastMatingDate)
  );

  // Fetch existing tasks
  useEffect(() => {
    fetchTasks();
  }, [breedingRecordId]);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?breedingRecordId=${breedingRecordId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateTasks() {
    try {
      setGenerating(true);
      const res = await fetch(
        `/api/breeding-records/${breedingRecordId}/generate-screening-tasks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAsLast: true }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tasks');
      }

      toast({
        title: '✅ Tasks Generated!',
        description: `Created ${data.tasksCreated} pregnancy screening tasks for ${bitchName}`,
      });

      // Refresh tasks
      await fetchTasks();
      onTasksGenerated?.();
    } catch (error) {
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Failed to generate tasks',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }

  // Get icon for screening type
  function getScreeningIcon(type?: string) {
    switch (type) {
      case 'ultrasound':
        return <Activity className="h-5 w-5" />;
      case 'blood_test':
        return <Syringe className="h-5 w-5" />;
      case 'xray':
        return <Stethoscope className="h-5 w-5" />;
      case 'checkup':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  }

  // Get status badge
  function getStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'skipped':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Skipped
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  }

  // Get priority color
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Pregnancy Screening Timeline
            </CardTitle>
            <CardDescription>
              From last mating: {format(new Date(lastMatingDate), 'MMM dd, yyyy')} 
              {' '}({daysSinceLastMating} days ago)
            </CardDescription>
          </div>
          {!tasks.length && (
            <Button
              onClick={handleGenerateTasks}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Tasks
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              {isLastMating ? (
                <>
                  <p className="text-lg font-medium">No screening tasks generated yet</p>
                  <p className="text-sm">
                    Click "Generate Tasks" to create pregnancy screening reminders
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Mark as Last Mating First</p>
                  <p className="text-sm">
                    This breeding must be marked as the last mating before generating screening tasks
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative space-y-4">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              {tasks.map((task, index) => {
                const daysPostMating = task.taskData?.pregnancyScreeningData?.daysPostMating || 0;
                const screeningType = task.taskData?.pregnancyScreeningData?.screeningType;
                const daysUntil = differenceInDays(new Date(task.dueDate), new Date());
                const isUpcoming = daysUntil >= 0 && daysUntil <= 7;

                return (
                  <div
                    key={task.id}
                    className={`relative pl-14 pb-4 border-l-4 ${getPriorityColor(task.priority)}`}
                  >
                    {/* Icon */}
                    <div className="absolute left-3 top-0 bg-background p-2 rounded-full border-2 border-border">
                      {getScreeningIcon(screeningType)}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            {getStatusBadge(task.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      {/* Date and countdown */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          </span>
                          {task.dueTime && (
                            <span className="text-muted-foreground">at {task.dueTime}</span>
                          )}
                        </div>

                        <div className="text-muted-foreground">
                          Day {daysPostMating} post-mating
                        </div>

                        {task.status === 'pending' && (
                          <div className={`font-medium ${isUpcoming ? 'text-orange-500' : ''}`}>
                            {daysUntil > 0 ? `In ${daysUntil} days` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days overdue`}
                          </div>
                        )}
                      </div>

                      {/* Critical info for Day 28 and 30 */}
                      {daysPostMating === 28 && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100">
                            🔴 CRITICAL: Primary pregnancy confirmation
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Ultrasound + Relaxin blood test on same day
                          </p>
                        </div>
                      )}

                      {daysPostMating === 30 && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            🟡 Progesterone Plateau Check
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            P4 plateau (21-28 ng/mL) = PREGNANT | P4 drop = NOT PREGNANT
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {tasks.filter(t => t.status === 'overdue').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
