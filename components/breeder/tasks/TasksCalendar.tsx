"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  format,
  isWeekend,
  isBefore,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";

interface TasksCalendarProps {
  tasks: any[];
  onSelectDay: (date: Date) => void;
  onTaskMoved: (taskId: string, newDate: Date) => Promise<void> | void;
}

// Type → tailwind classes for task pills
const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  feeding: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-900 dark:text-amber-200", dot: "bg-amber-500" },
  exercise: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-900 dark:text-blue-200", dot: "bg-blue-500" },
  grooming: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-900 dark:text-pink-200", dot: "bg-pink-500" },
  weight: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-900 dark:text-purple-200", dot: "bg-purple-500" },
  cleaning: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-900 dark:text-cyan-200", dot: "bg-cyan-500" },
  event: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-900 dark:text-indigo-200", dot: "bg-indigo-500" },
  puppy_feeding: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-900 dark:text-rose-200", dot: "bg-rose-500" },
  misc: { bg: "bg-slate-100 dark:bg-slate-800/40", text: "text-slate-900 dark:text-slate-200", dot: "bg-slate-500" },
};

function getTypeStyle(type?: string) {
  return TYPE_STYLES[type || "misc"] || TYPE_STYLES.misc;
}

export function TasksCalendar({ tasks, onSelectDay, onTaskMoved }: TasksCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  // Build the grid: full weeks covering the visible month
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  // Bucket tasks by yyyy-MM-dd key
  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const key = format(new Date(t.dueDate), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, dayKey: string, day: Date) => {
    // Block drop on past dates — show "no-drop" cursor
    if (isBefore(startOfDay(day), startOfDay(new Date()))) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDay(dayKey);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
  };

  const handleDrop = async (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    setDraggingTaskId(null);
    setDragOverDay(null);
    if (!taskId) return;

    // Block drop on past dates
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return;

    // Don't fire if dropped on the same day
    const task = tasks.find((t) => t.id === taskId);
    if (task && isSameDay(new Date(task.dueDate), day)) return;

    await onTaskMoved(taskId, day);
  };

  return (
    <Card className="shadow-card border-0 bg-surface">
      <CardContent className="p-4 sm:p-6">
        {/* Header — month nav + today button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">{format(viewDate, "MMMM yyyy")}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date())}
              className="text-xs"
            >
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewDate(subMonths(viewDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setViewDate(addMonths(viewDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(dayKey) ?? [];
            const inMonth = isSameMonth(day, viewDate);
            const isCurrentDay = isToday(day);
            const isWk = isWeekend(day);
            const isDragTarget = dragOverDay === dayKey;

            const visibleTasks = dayTasks.slice(0, 3);
            const overflowCount = Math.max(0, dayTasks.length - 3);

            return (
              <motion.button
                key={dayKey}
                onClick={() => onSelectDay(day)}
                onDragOver={(e) => handleDragOver(e, dayKey, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "group min-h-[88px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-lg border text-left transition-colors flex flex-col gap-1",
                  inMonth ? "bg-background border-border/40" : "bg-muted/20 border-transparent",
                  isWk && inMonth && "bg-muted/30",
                  isCurrentDay && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
                  isDragTarget && "bg-primary/10 border-primary border-2 scale-[1.02]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium",
                      !inMonth && "text-muted-foreground/40",
                      isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && !isCurrentDay && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">{dayTasks.length}</span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                  {visibleTasks.map((task) => {
                    const style = getTypeStyle(task.type);
                    const isCompleted = !!task.completedAt;
                    return (
                      <div
                        key={task.id}
                        draggable={!isCompleted}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, task.id);
                        }}
                        onClick={(e) => {
                          // Prevent button onClick (which would open the day sheet)
                          // when the user is just trying to read the pill
                        }}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] truncate cursor-grab active:cursor-grabbing",
                          style.bg,
                          style.text,
                          isCompleted && "opacity-50 line-through",
                          draggingTaskId === task.id && "opacity-30"
                        )}
                        title={task.title}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                        <span className="truncate">{task.title || task.type}</span>
                      </div>
                    );
                  })}
                  {overflowCount > 0 && (
                    <span className="text-[10px] text-muted-foreground px-1.5">+{overflowCount} more</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">Legend:</span>
          {Object.entries(TYPE_STYLES).slice(0, 6).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", style.dot)} />
              <span className="capitalize">{type.replace("_", " ")}</span>
            </div>
          ))}
          <span className="ml-auto italic">Drag a task pill to another day to reschedule</span>
        </div>
      </CardContent>
    </Card>
  );
}
