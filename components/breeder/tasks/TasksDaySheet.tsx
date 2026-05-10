"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/breeder/tasks/TaskCard";
import { Calendar, Plus } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";

interface TasksDaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  tasks: any[];
  transformTask: (task: any) => any;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string | { id: string }) => void;
  onView: (task: any) => void;
  onCreateTask?: (defaultDate: Date) => void;
}

export function TasksDaySheet({
  open,
  onOpenChange,
  date,
  tasks,
  transformTask,
  onEdit,
  onDelete,
  onToggleComplete,
  onView,
  onCreateTask,
}: TasksDaySheetProps) {
  if (!date) return null;

  const todayLabel = isToday(date) ? " (today)" : "";
  const isPastDay = isBefore(startOfDay(date), startOfDay(new Date()));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {format(date, "EEEE, MMMM d")}
            <span className="text-muted-foreground font-normal text-sm">{todayLabel}</span>
          </SheetTitle>
          <SheetDescription>
            {tasks.length === 0
              ? "Nothing scheduled for this day."
              : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} scheduled`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 mt-6">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={transformTask(task)}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                onView={onView}
              />
            ))
          ) : (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/60">
              <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {isPastDay ? "Nothing was scheduled for this day." : "No tasks for this day yet."}
              </p>
              {onCreateTask && !isPastDay && (
                <Button variant="outline" size="sm" onClick={() => onCreateTask(date)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add a task
                </Button>
              )}
              {isPastDay && (
                <p className="text-xs text-muted-foreground/70">You can't add tasks to past dates.</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
