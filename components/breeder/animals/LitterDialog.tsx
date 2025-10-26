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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Baby, AlertCircle, Calendar } from "lucide-react";
import type { Litter } from "@/lib/types/animal";
import { format, addDays, differenceInDays } from "date-fns";

interface LitterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (litter: Omit<Litter, 'id'>) => void;
  existingLitter?: Litter;
  mode?: 'create' | 'edit';
  availableSires: { id: string; name: string }[];
}

export function LitterDialog({
  open,
  onOpenChange,
  onSave,
  existingLitter,
  mode = 'create',
  availableSires,
}: LitterDialogProps) {
  const [matingDate, setMatingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sireId, setSireId] = useState('');
  const [sireName, setSireName] = useState('');
  const [actualWhelpingDate, setActualWhelpingDate] = useState('');
  const [puppyCount, setPuppyCount] = useState('');
  const [survivingPuppies, setSurvivingPuppies] = useState('');
  const [complications, setComplications] = useState(false);
  const [complicationNotes, setComplicationNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing litter data when editing
  useEffect(() => {
    if (existingLitter && mode === 'edit') {
      setMatingDate(existingLitter.matingDate);
      setSireId(existingLitter.sireId);
      setSireName(existingLitter.sireName);
      setActualWhelpingDate(existingLitter.whelpingDate || '');
      setPuppyCount(existingLitter.puppyCount?.toString() || '');
      setSurvivingPuppies(existingLitter.survivingPuppies?.toString() || '');
      setComplications(existingLitter.complications);
      setComplicationNotes(existingLitter.complicationNotes || '');
      setNotes(existingLitter.notes || '');
    }
  }, [existingLitter, mode]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 200);
    }
  }, [open]);

  const resetForm = () => {
    setMatingDate(format(new Date(), 'yyyy-MM-dd'));
    setSireId('');
    setSireName('');
    setActualWhelpingDate('');
    setPuppyCount('');
    setSurvivingPuppies('');
    setComplications(false);
    setComplicationNotes('');
    setNotes('');
    setErrors({});
  };

  // Auto-calculate expected whelping date (mating date + 63 days)
  const getExpectedWhelpingDate = () => {
    if (!matingDate) return '';
    const matingDateObj = new Date(matingDate);
    const expectedDate = addDays(matingDateObj, 63);
    return format(expectedDate, 'yyyy-MM-dd');
  };

  // Calculate days since mating
  const getDaysSinceMating = () => {
    if (!matingDate) return 0;
    return differenceInDays(new Date(), new Date(matingDate));
  };

  // Calculate days until expected whelping
  const getDaysUntilWhelping = () => {
    const expectedDate = getExpectedWhelpingDate();
    if (!expectedDate) return 0;
    return differenceInDays(new Date(expectedDate), new Date());
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!matingDate) {
      newErrors.matingDate = 'Mating date is required';
    }

    if (!sireId) {
      newErrors.sireId = 'Sire selection is required';
    }

    // Mating date shouldn't be in the future
    if (matingDate) {
      const matingDateObj = new Date(matingDate);
      if (matingDateObj > new Date()) {
        newErrors.matingDate = 'Mating date cannot be in the future';
      }
    }

    // If whelped, validate puppy counts
    if (actualWhelpingDate) {
      if (!puppyCount || parseInt(puppyCount) <= 0) {
        newErrors.puppyCount = 'Puppy count is required when litter is whelped';
      }

      if (survivingPuppies && parseInt(survivingPuppies) > parseInt(puppyCount || '0')) {
        newErrors.survivingPuppies = 'Surviving puppies cannot exceed total puppy count';
      }

      // Actual whelping date should be close to expected date (within 5 days typically)
      const expectedDate = new Date(getExpectedWhelpingDate());
      const actualDate = new Date(actualWhelpingDate);
      const daysDiff = Math.abs(differenceInDays(actualDate, expectedDate));
      if (daysDiff > 10) {
        newErrors.actualWhelpingDate = `Whelping date is ${daysDiff} days from expected date. Please verify.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSireChange = (value: string) => {
    setSireId(value);
    const selectedSire = availableSires.find(s => s.id === value);
    if (selectedSire) {
      setSireName(selectedSire.name);
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const expectedWhelpingDate = getExpectedWhelpingDate();
    const isWhelped = !!actualWhelpingDate;

    const litter: Omit<Litter, 'id'> = {
      matingDate,
      sireId,
      sireName,
      expectedWhelpingDate,
      whelpingDate: actualWhelpingDate || undefined,
      puppyCount: puppyCount ? parseInt(puppyCount) : undefined,
      survivingPuppies: survivingPuppies ? parseInt(survivingPuppies) : undefined,
      complications,
      complicationNotes: complicationNotes || undefined,
      notes: notes || undefined,
      status: isWhelped ? 'archived' : 'expected',
      puppies: existingLitter?.puppies || undefined,
    };

    onSave(litter);
    onOpenChange(false);
  };

  const expectedWhelpingDate = getExpectedWhelpingDate();
  const daysSinceMating = getDaysSinceMating();
  const daysUntilWhelping = getDaysUntilWhelping();
  const isWhelped = !!actualWhelpingDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary" />
            {mode === 'edit' ? 'Edit Litter Record' : 'New Litter Record'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update litter information and breeding details'
              : 'Record a new litter for this bitch'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sire Selection */}
          <div className="space-y-2">
            <Label htmlFor="sire">
              Sire <span className="text-destructive">*</span>
            </Label>
            <Select value={sireId} onValueChange={handleSireChange}>
              <SelectTrigger id="sire" className="bg-background border-primary/20">
                <SelectValue placeholder="Select sire..." />
              </SelectTrigger>
              <SelectContent>
                {availableSires.map((sire) => (
                  <SelectItem key={sire.id} value={sire.id}>
                    {sire.name}
                  </SelectItem>
                ))}
                <SelectItem value="frozen">Frozen Semen (Specify in notes)</SelectItem>
              </SelectContent>
            </Select>
            {errors.sireId && (
              <p className="text-sm text-destructive">{errors.sireId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select the father of this litter from your dogs or frozen semen
            </p>
          </div>

          {/* Mating Date */}
          <div className="space-y-2">
            <Label htmlFor="mating-date">
              Mating Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mating-date"
              type="date"
              value={matingDate}
              onChange={(e) => setMatingDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="bg-background border-primary/20"
            />
            {errors.matingDate && (
              <p className="text-sm text-destructive">{errors.matingDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              When was the breeding performed?
            </p>
          </div>

          {/* Expected Whelping Date Display */}
          {matingDate && (
            <Alert className="border-primary/20 bg-primary/5">
              <Calendar className="h-4 w-4 text-primary" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Expected Whelping Date:</strong>{' '}
                {format(new Date(expectedWhelpingDate), 'MMM dd, yyyy')} (63 days from mating)
                {!isWhelped && daysUntilWhelping > 0 && (
                  <span className="block mt-1 text-muted-foreground">
                    {daysUntilWhelping} days until expected whelping • Day {daysSinceMating} of pregnancy
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actual Whelping Date */}
          <div className="space-y-2">
            <Label htmlFor="whelping-date">Actual Whelping Date (Optional)</Label>
            <Input
              id="whelping-date"
              type="date"
              value={actualWhelpingDate}
              onChange={(e) => setActualWhelpingDate(e.target.value)}
              min={matingDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="bg-background border-primary/20"
            />
            {errors.actualWhelpingDate && (
              <p className="text-sm text-destructive">{errors.actualWhelpingDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave empty if litter has not whelped yet
            </p>
          </div>

          {/* Puppy Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="puppy-count">
                Number of Puppies {isWhelped && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="puppy-count"
                type="number"
                min="0"
                step="1"
                value={puppyCount}
                onChange={(e) => setPuppyCount(e.target.value)}
                placeholder="e.g., 6"
                className="bg-background border-primary/20"
              />
              {errors.puppyCount && (
                <p className="text-sm text-destructive">{errors.puppyCount}</p>
              )}
              <p className="text-xs text-muted-foreground">Total puppies born</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surviving-puppies">Surviving Puppies</Label>
              <Input
                id="surviving-puppies"
                type="number"
                min="0"
                step="1"
                value={survivingPuppies}
                onChange={(e) => setSurvivingPuppies(e.target.value)}
                placeholder="e.g., 6"
                className="bg-background border-primary/20"
              />
              {errors.survivingPuppies && (
                <p className="text-sm text-destructive">{errors.survivingPuppies}</p>
              )}
              <p className="text-xs text-muted-foreground">Puppies that survived</p>
            </div>
          </div>

          {/* Complications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="complications"
                checked={complications}
                onChange={(e) => setComplications(e.target.checked)}
                className="w-4 h-4 rounded border-primary/20"
              />
              <Label htmlFor="complications" className="cursor-pointer">
                Were there any complications?
              </Label>
            </div>

            {complications && (
              <Textarea
                id="complication-notes"
                value={complicationNotes}
                onChange={(e) => setComplicationNotes(e.target.value)}
                placeholder="Describe any complications during pregnancy or whelping..."
                rows={3}
                className="bg-background border-primary/20"
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this litter..."
              rows={3}
              className="bg-background border-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              General observations, breeding quality, special considerations, etc.
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="border-primary/20 bg-surface-secondary">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="ml-2 text-sm">
              <strong>Gestation Period:</strong> Normal gestation for dogs is 58-68 days, with 63 days being average. Record actual whelping date once puppies are born.
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
            {mode === 'edit' ? 'Save Changes' : 'Save Litter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}