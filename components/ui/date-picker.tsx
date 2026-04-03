"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  maxDate,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const today = new Date();

  // Viewing month/year (independent of selected date)
  const [viewMonth, setViewMonth] = React.useState(date?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = React.useState(date?.getFullYear() ?? today.getFullYear());

  // Sync view when date changes externally
  React.useEffect(() => {
    if (date) {
      setViewMonth(date.getMonth());
      setViewYear(date.getFullYear());
    }
  }, [date]);

  // Reset view when popover opens
  React.useEffect(() => {
    if (open && date) {
      setViewMonth(date.getMonth());
      setViewYear(date.getFullYear());
    }
  }, [open, date]);

  // Year range for dropdown
  const currentYear = today.getFullYear();
  const minYear = minDate?.getFullYear() ?? currentYear - 30;
  const maxYear = maxDate?.getFullYear() ?? currentYear + 5;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Navigation
  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Check if a day is disabled
  const isDayDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (maxDate && d > maxDate) return true;
    if (minDate && d < minDate) return true;
    return false;
  };

  // Check if a day is today
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  // Check if a day is the selected date
  const isSelected = (day: number) =>
    date?.getDate() === day && date?.getMonth() === viewMonth && date?.getFullYear() === viewYear;

  // Select a day
  const selectDay = (day: number) => {
    if (isDayDisabled(day)) return;
    const selected = new Date(viewYear, viewMonth, day);
    onDateChange(selected);
    setOpen(false);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays: { day: number; current: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, current: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, current: true });
  }
  // Next month leading days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, current: false });
  }

  // Split into weeks
  const weeks: typeof calendarDays[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date ? format(date, "MMMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 w-[308px]">
          {/* Header — Month/Year selectors + nav arrows */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5">
              <Select
                value={String(viewMonth)}
                onValueChange={(v) => setViewMonth(parseInt(v))}
              >
                <SelectTrigger className="h-8 w-[120px] text-sm font-medium border-0 bg-transparent hover:bg-accent focus:ring-0 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, i) => (
                    <SelectItem key={month} value={String(i)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(viewYear)}
                onValueChange={(v) => setViewYear(parseInt(v))}
              >
                <SelectTrigger className="h-8 w-[80px] text-sm font-medium border-0 bg-transparent hover:bg-accent focus:ring-0 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="h-9 flex items-center justify-center text-xs font-medium text-muted-foreground uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((cell, ci) => {
                  if (!cell.current) {
                    return (
                      <div
                        key={ci}
                        className="h-9 flex items-center justify-center text-sm text-muted-foreground/30"
                      >
                        {cell.day}
                      </div>
                    );
                  }

                  const dayDisabled = isDayDisabled(cell.day);
                  const daySelected = isSelected(cell.day);
                  const dayToday = isToday(cell.day);

                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => selectDay(cell.day)}
                      className={cn(
                        "h-9 w-full flex items-center justify-center text-sm rounded-md transition-colors relative",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        dayDisabled && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                        daySelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold",
                        dayToday && !daySelected && "font-bold text-primary",
                      )}
                    >
                      {cell.day}
                      {dayToday && !daySelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer — Today button */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                const now = new Date();
                setViewMonth(now.getMonth());
                setViewYear(now.getFullYear());
              }}
            >
              Today
            </Button>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  onDateChange(undefined);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
