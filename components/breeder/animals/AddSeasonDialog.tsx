"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle, Bell } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";

interface AddSeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
  existingSeason?: {
    id: string;
    startDate: string;
    endDate?: string;
    status: string;
    notes?: string;
  } | null;
}

export function AddSeasonDialog({
  open,
  onOpenChange,
  animalId,
  animalName,
  existingSeason,
}: AddSeasonDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [createReminder, setCreateReminder] = useState(true);

  // Load existing season data
  useEffect(() => {
    if (existingSeason) {
      setStartDate(new Date(existingSeason.startDate));
      setEndDate(existingSeason.endDate ? new Date(existingSeason.endDate) : undefined);
      setIsActive(existingSeason.status === 'active');
      setNotes(existingSeason.notes || '');
      setCreateReminder(false); // Don't create reminder for edits
    } else {
      resetForm();
    }
  }, [existingSeason, open]);

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(undefined);
    setIsActive(true);
    setNotes('');
    setCreateReminder(true);
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = existingSeason
        ? `/api/animals/${animalId}/seasons/${existingSeason.id}`
        : `/api/animals/${animalId}/seasons`;
      
      const method = existingSeason ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Season save error:', error);
        throw new Error(error.error || error.message || 'Failed to save season');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons', animalId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks if reminder created
      
      toast({
        title: existingSeason ? "Season Updated" : "Season Added",
        description: existingSeason 
          ? "Heat cycle record has been updated"
          : createReminder
            ? "Heat cycle recorded and reminder created for next cycle"
            : "Heat cycle recorded successfully",
      });
      
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!startDate) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }

    if (endDate && endDate < startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const duration = endDate ? differenceInDays(endDate, startDate) : null;

    const data = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
      status: isActive ? 'active' : 'completed',
      durationDays: duration,
      notes: notes || null,
      createReminder: !existingSeason && createReminder, // Only for new seasons
    };

    saveMutation.mutate(data);
  };

  const duration = startDate && endDate 
    ? differenceInDays(endDate, startDate)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {existingSeason ? 'Edit Heat Cycle' : 'Record Heat Cycle'}
          </DialogTitle>
          <DialogDescription>
            {existingSeason 
              ? `Update heat cycle information for ${animalName}`
              : `Track a heat cycle for ${animalName} and get reminders for the next one`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Fields in Same Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>
                Start Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Select start date"
                maxDate={new Date()}
              />
              <p className="text-xs text-muted-foreground">
                First day of visible heat signs
              </p>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="Select end date"
                minDate={startDate}
                maxDate={new Date()}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if still in season
              </p>
            </div>
          </div>

          {/* Duration Display */}
          {duration !== null && (
            <Alert className="border-primary/20 bg-primary/5">
              <Calendar className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Duration:</strong> {duration} days
                {duration < 7 && (
                  <span className="block mt-1 text-orange-600">
                    Note: Typical heat duration is 7-21 days
                  </span>
                )}
                {duration > 21 && (
                  <span className="block mt-1 text-orange-600">
                    Note: This is longer than typical - consider veterinary consultation
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Status Toggle */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Currently in Heat</Label>
              <p className="text-xs text-muted-foreground">
                Is {animalName} currently in season?
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Create Reminder Toggle (only for new seasons) */}
          {!existingSeason && (
            <div className="flex items-center justify-between space-x-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Create Reminder
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified 7 days before the predicted next heat cycle
                </p>
              </div>
              <Switch
                checked={createReminder}
                onCheckedChange={setCreateReminder}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations, breeding plans, or special notes..."
              rows={3}
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2 text-xs">
              <strong>Tip:</strong> Recording multiple heat cycles helps predict future cycles more accurately. 
              Average cycle length is 18-24 days, but varies by individual.
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
            disabled={saveMutation.isPending}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {saveMutation.isPending ? 'Saving...' : existingSeason ? 'Update' : 'Save & Create Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
