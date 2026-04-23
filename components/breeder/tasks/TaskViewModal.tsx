"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Check,
  Clock,
  AlertCircle,
  Utensils,
  Dumbbell,
  Scissors,
  Scale,
  Sparkles,
  Calendar as CalendarIcon,
  Edit,
  X,
  Cake,
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { stripUUIDs } from "@/lib/utils/sanitize-text";
import type { TaskType, TaskStatus, TaskPriority } from "@/lib/types/task";

interface TaskViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  onEdit?: (task: any) => void;
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

export function TaskViewModal({ open, onOpenChange, task, onEdit }: TaskViewModalProps) {
  if (!task) return null;

  // Get task status
  const status: TaskStatus = task.completed ? 'completed' : 
                             (task.status === 'overdue' ? 'overdue' : 'pending');
  
  // Get task priority
  const priority: TaskPriority = task.priority || 'medium';
  
  // Get config with fallback
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
      };
    }
    if (status === 'overdue') {
      return {
        icon: AlertCircle,
        label: 'Overdue',
        color: 'bg-destructive text-white',
      };
    }
    return {
      icon: Clock,
      label: 'Pending',
      color: 'bg-chart-4 text-white',
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

  const handleEdit = () => {
    onOpenChange(false);
    onEdit?.(task);
  };

  const renderTaskDetails = () => {
    // Helper to get value from either direct property or taskData
    const getValue = (key: string) => task[key] || task.taskData?.[key];
    
    switch (task.type) {
      case 'feeding':
      case 'puppy_feeding':
        return (
          <div className="space-y-4">
            <DetailRow label="Food Type" value={getValue('foodType') || 'Not specified'} />
            <DetailRow label="Amount" value={getValue('amount') ? `${getValue('amount')} ${getValue('unit') || ''}` : 'Not specified'} />
            <DetailRow label="Time" value={getValue('time') || task.dueTime || 'Not specified'} />
          </div>
        );
      case 'exercise':
        return (
          <div className="space-y-4">
            <DetailRow label="Exercise Type" value={getValue('exerciseType') || 'Not specified'} className="capitalize" />
            <DetailRow label="Duration" value={getValue('duration') ? `${getValue('duration')} minutes` : 'Not specified'} />
          </div>
        );
      case 'grooming':
        return (
          <div className="space-y-4">
            <DetailRow label="Grooming Type" value={getValue('groomingType') || 'Not specified'} className="capitalize" />
            <DetailRow label="Frequency" value={getValue('frequency') || task.recurringPattern || 'Not specified'} className="capitalize" />
          </div>
        );
      case 'weight':
        return (
          <div className="space-y-4">
            <DetailRow 
              label="Weight" 
              value={getValue('weight') ? `${getValue('weight')} ${getValue('weightUnit') || 'kg'}` : 'To be recorded'} 
            />
          </div>
        );
      case 'cleaning':
        return (
          <div className="space-y-4">
            <DetailRow 
              label="Area" 
              value={getValue('area') ? getValue('area').toString().replace(/-/g, ' ') : 'Not specified'} 
              className="capitalize" 
            />
            <DetailRow 
              label="Cleaning Type" 
              value={getValue('cleaningType') ? getValue('cleaningType').toString().replace(/-/g, ' ') : 'Not specified'} 
              className="capitalize" 
            />
            <DetailRow label="Frequency" value={getValue('frequency') || task.recurringPattern || 'Not specified'} className="capitalize" />
          </div>
        );
      case 'event':
      case 'misc':
        return (
          <div className="space-y-4">
            <DetailRow label="Title" value={task.title || 'Event'} />
            <DetailRow 
              label="Event Type" 
              value={getValue('eventType') ? getValue('eventType').toString().replace(/-/g, ' ') : 'Not specified'} 
              className="capitalize" 
            />
            <DetailRow label="Time" value={getValue('time') || task.dueTime || 'Not specified'} />
            {(task.recurring || task.recurringPattern) && (
              <DetailRow 
                label="Recurring" 
                value={<Badge variant="outline" className="text-xs">Yes</Badge>} 
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                config.bgColor,
                `border-2 ${config.borderColor}`
              )}>
                <TaskIcon className={cn("w-7 h-7", config.color)} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold mb-2">Task Details</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
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
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Date */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <DetailRow 
              label="Date" 
              value={format(new Date(task.date || task.dueDate), 'EEEE, MMMM dd, yyyy')} 
            />
          </div>

          {/* Animal and Details in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animal Card */}
            {task.animalName && task.animalName !== 'N/A' && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Animal
                </h3>
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <Avatar className="h-16 w-16 border-2 border-primary/30">
                    <AvatarImage 
                      src={task.animal?.profileImageUrl || task.animal?.photos?.[0]?.fileUrl} 
                      alt={task.animalName} 
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
                      {task.animalName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Name and Age */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground mb-1">{task.animalName}</p>
                    {task.animal?.dateOfBirth && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Cake className="w-3.5 h-3.5" />
                        <span>
                          {(() => {
                            const birthDate = new Date(task.animal.dateOfBirth);
                            const years = differenceInYears(new Date(), birthDate);
                            const months = differenceInMonths(new Date(), birthDate) % 12;
                            
                            if (years === 0) {
                              return `${months} month${months !== 1 ? 's' : ''} old`;
                            } else if (months === 0) {
                              return `${years} year${years !== 1 ? 's' : ''} old`;
                            } else {
                              return `${years}y ${months}m old`;
                            }
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Task-specific details */}
            <div className={cn(
              "bg-muted/30 border border-muted p-4 rounded-lg",
              task.animalName && task.animalName !== 'N/A' ? "" : "md:col-span-2"
            )}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-4"></div>
                Details
              </h3>
              {renderTaskDetails()}
            </div>
          </div>

          {/* Notes */}
          {task.notes && stripUUIDs(task.notes) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                  Notes
                </h3>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-muted">
                  {stripUUIDs(task.notes)}
                </p>
              </div>
            </>
          )}

          {/* Description (for old task format) */}
          {task.description && !task.notes && stripUUIDs(task.description) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                  Description
                </h3>
                <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-muted">
                  {stripUUIDs(task.description)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={handleEdit}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for detail rows
function DetailRow({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{label}:</span>
      <span className={cn("text-sm text-foreground font-medium text-right flex-1", className)}>
        {value}
      </span>
    </div>
  );
}
