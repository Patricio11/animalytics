"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle, Activity } from "lucide-react";
import type { Season } from "@/lib/types/animal";
import { format, differenceInDays } from "date-fns";

interface SeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (season: Omit<Season, 'id'>) => void;
  existingSeason?: Season;
  mode?: 'create' | 'edit';
}

export function SeasonDialog({
  open,
  onOpenChange,
  onSave,
  existingSeason,
  mode = 'create',
}: SeasonDialogProps) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing season data when editing
  useEffect(() => {
    if (existingSeason && mode === 'edit') {
      setStartDate(existingSeason.startDate);
      setEndDate(existingSeason.endDate || '');
      setNotes(existingSeason.notes || '');
    }
  }, [existingSeason, mode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 200);
    }
  }, [open]);

  const resetForm = () => {
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setNotes('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!startDate) {
      newErrors.startDate = 'Season start date is required';
    }

    // End date must be after start date if provided
    if (endDate && startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Warn if season is unusually long
      const daysDiff = differenceInDays(end, start);
      if (daysDiff > 30) {
        newErrors.endDate = 'Season duration seems unusually long (>30 days). Please verify.';
      }
    }

    // Start date shouldn't be in the future
    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      if (start > today) {
        newErrors.startDate = 'Start date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const season: Omit<Season, 'id'> = {
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
      progesteroneReadings: existingSeason?.progesteroneReadings || [],
    };

    onSave(season);
    onOpenChange(false);
  };

  const getDuration = () => {
    if (!startDate) return null;
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(startDate);
    const days = differenceInDays(end, start);
    return days >= 0 ? days : null;
  };

  const duration = getDuration();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {mode === 'edit' ? 'Edit Heat Cycle' : 'New Heat Cycle'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update heat cycle information'
              : 'Record a new heat cycle for this bitch'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <DatePicker
              date={startDate ? new Date(startDate + 'T00:00:00') : undefined}
              onDateChange={(d) => setStartDate(d ? format(d, 'yyyy-MM-dd') : '')}
              maxDate={new Date()}
              className="bg-background border-primary/20"
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              When did the heat cycle begin?
            </p>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date (Optional)</Label>
            <DatePicker
              date={endDate ? new Date(endDate + 'T00:00:00') : undefined}
              onDateChange={(d) => setEndDate(d ? format(d, 'yyyy-MM-dd') : '')}
              minDate={startDate ? new Date(startDate + 'T00:00:00') : undefined}
              maxDate={new Date()}
              className="bg-background border-primary/20"
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty if the heat cycle is still ongoing
            </p>
          </div>

          {/* Duration Display */}
          {duration !== null && duration >= 0 && (
            <Alert className="border-primary/20 bg-primary/5">
              <Activity className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Cycle Duration:</strong> {duration} day{duration !== 1 ? 's' : ''}
                {!endDate && ' (ongoing)'}
                {duration >= 14 && duration <= 21 && ' - Normal duration'}
              </AlertDescription>
            </Alert>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations, breeding activities, or other notes about this cycle..."
              rows={4}
              className="bg-background border-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Example: Bred on day 12, progesterone levels peaked at 15 ng/mL
            </p>
          </div>

          {/* Progesterone Info */}
          {existingSeason?.progesteroneReadings && existingSeason.progesteroneReadings.length > 0 && (
            <Alert className="border-chart-3/50 bg-chart-3/10">
              <Activity className="h-4 w-4 text-chart-3" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Progesterone Readings:</strong> This cycle has {existingSeason.progesteroneReadings.length} progesterone reading{existingSeason.progesteroneReadings.length !== 1 ? 's' : ''} recorded.
              </AlertDescription>
            </Alert>
          )}

          {/* Season Guidelines */}
          <Alert className="border-primary/20 bg-surface-secondary">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Heat Cycle Guidelines:</strong> Normal heat cycles last 14-21 days. Progesterone readings from the mating calculator will automatically link to seasons.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {mode === 'edit' ? 'Save Changes' : 'Save Heat Cycle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}