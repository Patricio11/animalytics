'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Droplet
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks, useCompleteTask } from '@/lib/api/queries/tasks';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function ProgesteroneTasksWidget() {
  const router = useRouter();
  const { toast } = useToast();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Fetch progesterone tasks
  const { data: tasks, isLoading } = useTasks({
    status: 'pending',
  });

  const completeTaskMutation = useCompleteTask();

  // Filter for progesterone test tasks
  const progesteroneTasks = tasks?.filter((task: any) => {
    try {
      const taskData = typeof task.taskData === 'string' 
        ? JSON.parse(task.taskData) 
        : task.taskData;
      return taskData?.eventType === 'progesterone_test';
    } catch {
      return false;
    }
  }).slice(0, 5) || []; // Show max 5 tasks

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    try {
      await completeTaskMutation.mutateAsync(taskId);
      toast({
        title: "Task completed",
        description: "Progesterone test marked as complete",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to complete task",
        description: "Please try again",
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleViewTask = (task: any) => {
    try {
      const taskData = typeof task.taskData === 'string' 
        ? JSON.parse(task.taskData) 
        : task.taskData;
      
      if (taskData?.progesteroneTestData?.heatCycleId) {
        router.push(`/calculators/progesterone/${taskData.progesteroneTestData.heatCycleId}`);
      }
    } catch (error) {
      console.error('Error navigating to heat cycle:', error);
    }
  };

  const getTaskUrgency = (dueDate: string) => {
    const date = new Date(dueDate);
    const days = differenceInDays(date, new Date());

    if (isPast(date) && !isToday(date)) {
      return {
        label: 'Overdue',
        color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
      };
    } else if (isToday(date)) {
      return {
        label: 'Due Today',
        color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        icon: Clock,
        iconColor: 'text-orange-600 dark:text-orange-400',
      };
    } else if (isTomorrow(date)) {
      return {
        label: 'Due Tomorrow',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        icon: Calendar,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
      };
    } else if (days <= 3) {
      return {
        label: `In ${days} days`,
        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        icon: Calendar,
        iconColor: 'text-blue-600 dark:text-blue-400',
      };
    } else {
      return {
        label: `In ${days} days`,
        color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
        icon: Calendar,
        iconColor: 'text-gray-600 dark:text-gray-400',
      };
    }
  };

  const getTaskData = (task: any) => {
    try {
      const taskData = typeof task.taskData === 'string' 
        ? JSON.parse(task.taskData) 
        : task.taskData;
      return taskData?.progesteroneTestData || {};
    } catch {
      return {};
    }
  };

  // Don't render widget if loading or no tasks
  if (isLoading || progesteroneTasks.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card border-primary/10 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Progesterone Tests</CardTitle>
              <CardDescription className="text-sm">
                {progesteroneTasks.length} upcoming {progesteroneTasks.length === 1 ? 'test' : 'tests'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tasks?filter=progesterone')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {progesteroneTasks.map((task: any) => {
            const urgency = getTaskUrgency(task.dueDate);
            const taskData = getTaskData(task);
            const UrgencyIcon = urgency.icon;

            return (
              <div
                key={task.id}
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleViewTask(task)}
              >
                <div className="flex items-start gap-4">
                  {/* Animal Avatar */}
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={task.animal?.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white font-semibold">
                      {task.animal?.name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("shrink-0 font-medium", urgency.color)}
                      >
                        <UrgencyIcon className="w-3 h-3 mr-1" />
                        {urgency.label}
                      </Badge>
                    </div>

                    {/* Task Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      {task.dueTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.dueTime}</span>
                        </div>
                      )}
                      {taskData.cycleDay && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Day {taskData.cycleDay}</span>
                        </div>
                      )}
                      {taskData.previousLevel && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          <span>{taskData.previousLevel.toFixed(1)} ng/mL</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTask(task);
                        }}
                        className="text-xs h-7"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Add Reading
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                        disabled={completingTaskId === task.id}
                        className="text-xs h-7"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {completingTaskId === task.id ? 'Completing...' : 'Mark Done'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
