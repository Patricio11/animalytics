"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayNumber, Unit } from "@/lib/calculations";

interface DailyReadingInputProps {
  day: DayNumber;
  value: string;
  date: Date | undefined;
  unit: Unit;
  onChange: (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  hasValue: boolean;
  isValid: boolean;
  validationMessage?: string;
}

export function DailyReadingInput({
  day,
  value,
  date,
  unit,
  onChange,
  onDateChange,
  hasValue,
  isValid,
  validationMessage
}: DailyReadingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getValidationRanges = () => {
    if (unit === 'nanograms') {
      return { min: 0, max: 50 };
    } else {
      return { min: 0, max: 160 };
    }
  };

  const ranges = getValidationRanges();
  const unitLabel = unit === 'nanograms' ? 'ng/mL' : 'nmol/L';

  // Visual state based on validation
  const getInputBorderClass = () => {
    if (!hasValue || !value) return 'border-primary/20';
    if (!isValid) return 'border-destructive';
    return 'border-chart-3';
  };

  const getCardBorderClass = () => {
    if (!hasValue || !value) return 'border-primary/10';
    if (!isValid) return 'border-destructive/30';
    return 'border-chart-3/30';
  };

  const getCardBgClass = () => {
    if (!hasValue || !value) return 'bg-surface';
    if (!isValid) return 'bg-destructive/5';
    return 'bg-chart-3/5';
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all duration-300",
        getCardBorderClass(),
        getCardBgClass(),
        isFocused && "shadow-md",
        hasValue && isValid && "shadow-sm"
      )}
    >
      {/* Day Badge */}
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant={hasValue && isValid ? "default" : "outline"}
          className={cn(
            "font-semibold transition-all duration-300",
            hasValue && isValid && "bg-gradient-brand text-white shadow-sm"
          )}
        >
          Day {day}{day === 1 && " (Start of Heat)"}
        </Badge>

        {/* Status Indicator */}
        {hasValue && value && (
          <div className="flex items-center gap-1">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-chart-3" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor={`date-${day}`} className="text-xs font-medium text-muted-foreground">
            Test Date
          </Label>
          <DatePicker
            date={date}
            onDateChange={(d) => onDateChange(d)}
            className={cn(
              "bg-background transition-all duration-300",
              getInputBorderClass()
            )}
          />
        </div>

        {/* Value Input */}
        <div className="space-y-2">
          <Label htmlFor={`value-${day}`} className="text-xs font-medium text-muted-foreground">
            Progesterone Level
          </Label>
          <div className="relative">
            <Input
              id={`value-${day}`}
              type="number"
              step="0.1"
              min={ranges.min}
              max={ranges.max}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="0.0"
              className={cn(
                "bg-background transition-all duration-300 pr-16",
                getInputBorderClass(),
                isFocused && "ring-2 ring-primary/20"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
              {unitLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Message or Range Info */}
      <div className="mt-2">
        {validationMessage && !isValid && value ? (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {validationMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Valid range: {ranges.min} - {ranges.max} {unitLabel}
          </p>
        )}
      </div>

      {/* Success Message */}
      {hasValue && isValid && value && (
        <div className="mt-2 p-2 bg-chart-3/10 border border-chart-3/20 rounded text-xs text-chart-3 flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3" />
          Reading recorded successfully
        </div>
      )}
    </div>
  );
}