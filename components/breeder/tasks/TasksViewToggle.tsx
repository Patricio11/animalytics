"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, CalendarDays } from "lucide-react";

export type TasksView = "list" | "calendar";

interface TasksViewToggleProps {
  value: TasksView;
  onChange: (value: TasksView) => void;
}

export function TasksViewToggle({ value, onChange }: TasksViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as TasksView)}
      className="bg-surface shadow-card rounded-lg p-1 border border-border/40"
    >
      <ToggleGroupItem
        value="list"
        aria-label="List view"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-2"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="calendar"
        aria-label="Calendar view"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground gap-2"
      >
        <CalendarDays className="w-4 h-4" />
        <span className="hidden sm:inline">Calendar</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
