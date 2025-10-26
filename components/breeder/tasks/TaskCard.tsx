"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2, Check, Clock, AlertCircle, Utensils, Dumbbell, Scissors, Scale, Sparkles, Calendar as CalendarIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TaskType, TaskStatus, TaskPriority } from "@/lib/types/task";

interface TaskCardProps {
  task: any; // Using any for now since transformed task has additional properties
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onView?: (task: any) => void;
}

type TaskTypeConfigKey = Extract<TaskType, 'feeding' | 'exercise' | 'grooming' | 'weight' | 'cleaning' | 'event'>;

const taskTypeConfig: Record<TaskTypeConfigKey, { icon: any; label: string; color: string; bgColor: string; borderColor: string }> = {
  feeding: { icon: Utensils, label: 'Feeding', color: 'text-chart-3', bgColor: 'bg-chart-3/10', borderColor: 'border-chart-3/20' },
  exercise: { icon: Dumbbell, label: 'Exercise', color: 'text-chart-4', bgColor: 'bg-chart-4/10', borderColor: 'border-chart-4/20' },
  grooming: { icon: Scissors, label: 'Grooming', color: 'text-chart-2', bgColor: 'bg-chart-2/10', borderColor: 'border-chart-2/20' },
  weight: { icon: Scale, label: 'Weight', color: 'text-chart-1', bgColor: 'bg-chart-1/10', borderColor: 'border-chart-1/20' },
  cleaning: { icon: Sparkles, label: 'Cleaning', color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/20' },
  event: { icon: CalendarIcon, label: 'Event', color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive/20' },
};

export function TaskCard({ task, onEdit, onDelete, onToggleComplete, onView }: TaskCardProps) {
  // Get task status
  const status: TaskStatus = task.completed ? 'completed' : 
                             (task.status === 'overdue' ? 'overdue' : 'pending');
  
  // Get task priority
  const priority: TaskPriority = task.priority || 'medium';
  
  // Get config with fallback for puppy_feeding and misc types
  const taskTypeKey = (task.type === 'puppy_feeding' ? 'feeding' : 
                       task.type === 'misc' ? 'event' : 
                       task.type) as TaskTypeConfigKey;
  const config = taskTypeConfig[taskTypeKey] || taskTypeConfig.event;
  const TaskIcon = config.icon;

  const getStatusConfig = () => {
    if (task.completed) {
      return {
        icon: Check,
        label: 'Completed',
        color: 'bg-chart-3 text-white',
        cardClass: 'opacity-60',
      };
    }
    if (status === 'overdue') {
      return {
        icon: AlertCircle,
        label: 'Overdue',
        color: 'bg-destructive text-white',
        cardClass: 'border-destructive/50',
      };
    }
    return {
      icon: Clock,
      label: 'Pending',
      color: 'bg-chart-4 text-white',
      cardClass: '',
    };
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'low': return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getTaskDetails = () => {
    switch (task.type) {
      case 'feeding':
        return (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {task.foodType || 'Feeding'}
            </div>
            <div className="flex items-center gap-4 text-sm">
              {(task.amount) && (
                <span className="font-medium text-foreground">
                  {task.amount} {task.unit}
                </span>
              )}
              {(task.time) && (
                <span className="text-muted-foreground">at {task.time}</span>
              )}
            </div>
          </div>
        );
      case 'exercise':
        return (
          <div className="space-y-1">
            <div className="text-sm capitalize text-muted-foreground">
              {task.exerciseType || 'Exercise'}
            </div>
            {(task.duration) && (
              <div className="text-sm">
                <span className="font-medium text-foreground">{task.duration} minutes</span>
              </div>
            )}
          </div>
        );
      case 'grooming':
        return (
          <div className="space-y-1">
            <div className="text-sm capitalize text-muted-foreground">
              {task.groomingType || 'grooming'}
            </div>
            {(task.frequency) && (
              <div className="text-sm">
                <Badge variant="outline" className="text-xs capitalize">
                  {task.frequency}
                </Badge>
              </div>
            )}
          </div>
        );
      case 'weight':
        return (
          <div className="space-y-1">
            {(task.weight) ? (
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {task.weight} {task.weightUnit || 'kg'}
                </span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                To be recorded
              </div>
            )}
          </div>
        );
      case 'cleaning':
        return (
          <div className="space-y-1">
            <div className="text-sm capitalize text-muted-foreground">
              {(task.area || 'area')?.toString().replace(/-/g, ' ')} - {(task.cleaningType || 'cleaning')?.toString().replace(/-/g, ' ')}
            </div>
            {(task.frequency) && (
              <div className="text-sm">
                <Badge variant="outline" className="text-xs capitalize">
                  {task.frequency}
                </Badge>
              </div>
            )}
          </div>
        );
      case 'event':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {task.title || 'Event'}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {(task.eventType) && (
                <span className="capitalize">{(task.eventType)?.toString().replace(/-/g, ' ')}</span>
              )}
              {(task.time) && <span>• {task.time}</span>}
              {(task.recurring) && (
                <Badge variant="outline" className="text-xs">
                  Recurring
                </Badge>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn(
      "shadow-card border-primary/10 hover:shadow-elevated transition-all duration-200",
      statusConfig.cardClass,
      task.completed && "bg-surface-secondary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Task Type Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            config.bgColor,
            `border ${config.borderColor}`
          )}>
            <TaskIcon className={cn("w-5 h-5", config.color)} />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={cn(statusConfig.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs capitalize", getPriorityColor())}>
                    {priority} priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {config.label}
                  </Badge>
                </div>

                {('animalName' in task) && task.animalName && task.animalName !== 'N/A' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-7 w-7 border border-primary/30">
                      <AvatarImage 
                        src={task.animal?.profileImageUrl || task.animal?.photos?.[0]?.fileUrl} 
                        alt={task.animalName} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {task.animalName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground">{task.animalName}</span>
                  </div>
                )}

                {getTaskDetails()}

                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(task.date), 'MMM dd, yyyy')}
                </div>

                {task.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {task.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hover:bg-chart-3/10 hover:text-chart-3",
                    task.completed && "text-chart-3"
                  )}
                  onClick={() => onToggleComplete(task.id)}
                  title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  <Check className="w-4 h-4" />
                </Button>
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => onView(task)}
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => onEdit(task)}
                  title="Edit task"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(task.id)}
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}