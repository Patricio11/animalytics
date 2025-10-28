'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertCircle, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface AddReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleDay: number;
  bitchName: string;
  startDate: string;
  onSubmit: (data: { testDate: Date; level: number; laboratory?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddReadingModal({
  open,
  onOpenChange,
  cycleDay,
  bitchName,
  startDate,
  onSubmit,
  isSubmitting = false,
}: AddReadingModalProps) {
  const [testDate, setTestDate] = useState<string>(
    format(addDays(new Date(startDate), cycleDay - 1), 'yyyy-MM-dd')
  );
  const [progesteroneLevel, setProgesteroneLevel] = useState<string>('');
  const [laboratory, setLaboratory] = useState<string>('VIDAS');

  // Calculate which day this test date represents
  const calculatedDay = testDate
    ? differenceInDays(new Date(testDate), new Date(startDate)) + 1
    : cycleDay;

  // Determine phase based on level
  const getPhaseInfo = (level: number) => {
    if (level < 1.5) {
      return {
        phase: 'Anestrus',
        color: 'text-gray-600',
        bg: 'bg-gray-100 dark:bg-gray-900/20',
        icon: '⚪',
        description: 'Out of heat',
      };
    } else if (level < 4) {
      return {
        phase: 'Early Heat',
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: '🔵',
        description: 'Test again in 3 days',
      };
    } else if (level < 10) {
      return {
        phase: 'LH Surge',
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: '🟣',
        description: 'Test every 2 days',
      };
    } else if (level < 15) {
      return {
        phase: 'Rising',
        color: 'text-orange-600',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: '🟠',
        description: 'Test daily',
      };
    } else if (level < 25) {
      return {
        phase: 'Breeding Window',
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: '🟢',
        description: 'Optimal for natural/fresh AI',
      };
    } else if (level < 35) {
      return {
        phase: 'Peak',
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/20',
        icon: '🔴',
        description: 'Optimal for frozen AI',
      };
    } else {
      return {
        phase: 'Post-Ovulation',
        color: 'text-pink-600',
        bg: 'bg-pink-100 dark:bg-pink-900/20',
        icon: '🌸',
        description: 'Past breeding window',
      };
    }
  };

  const level = parseFloat(progesteroneLevel);
  const phaseInfo = !isNaN(level) ? getPhaseInfo(level) : null;

  const handleSubmit = async () => {
    if (testDate && progesteroneLevel) {
      await onSubmit({
        testDate: new Date(testDate),
        level: parseFloat(progesteroneLevel),
        laboratory,
      });
      // Reset form
      setTestDate(format(addDays(new Date(startDate), cycleDay - 1), 'yyyy-MM-dd'));
      setProgesteroneLevel('');
      setLaboratory('VIDAS');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Add Progesterone Reading
          </DialogTitle>
          <DialogDescription>
            Record progesterone test results for <strong>{bitchName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Test Date */}
          <div className="space-y-2">
            <Label htmlFor="testDate">Test Date *</Label>
            <Input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              This will be recorded as <strong>Day {calculatedDay}</strong>
            </p>
          </div>

          {/* Progesterone Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Progesterone Level (ng/mL) *</Label>
            <Input
              id="level"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={progesteroneLevel}
              onChange={(e) => setProgesteroneLevel(e.target.value)}
              placeholder="e.g., 2.5"
            />
            <p className="text-xs text-muted-foreground">
              Enter the progesterone value from your lab results
            </p>
          </div>

          {/* Laboratory */}
          <div className="space-y-2">
            <Label htmlFor="laboratory">Laboratory Method</Label>
            <Select value={laboratory} onValueChange={setLaboratory}>
              <SelectTrigger id="laboratory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDAS">VIDAS</SelectItem>
                <SelectItem value="IDEXX">IDEXX</SelectItem>
                <SelectItem value="IMMULITE">IMMULITE</SelectItem>
                <SelectItem value="RIA">RIA</SelectItem>
                <SelectItem value="ELISA">ELISA</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phase Preview */}
          {phaseInfo && (
            <Alert className={`border-2 ${phaseInfo.bg}`}>
              <TrendingUp className={`h-4 w-4 ${phaseInfo.color}`} />
              <AlertDescription>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{phaseInfo.icon}</span>
                  <strong className={phaseInfo.color}>{phaseInfo.phase}</strong>
                </div>
                <p className="text-sm text-muted-foreground">
                  {phaseInfo.description}
                </p>
                <div className="mt-2 text-sm">
                  <strong>Level:</strong> {progesteroneLevel} ng/mL on Day {calculatedDay}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Alert */}
          {testDate && calculatedDay < 1 && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Test date cannot be before the heat cycle start date
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!testDate || !progesteroneLevel || calculatedDay < 1 || isSubmitting}
            className="bg-gradient-brand"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Save Reading
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
