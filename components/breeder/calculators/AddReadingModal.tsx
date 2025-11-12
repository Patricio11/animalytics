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
import { getPhaseInfo } from '@/lib/utils/progesterone';
import { DatePicker } from '@/components/ui/date-picker';

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
  const [testDate, setTestDate] = useState<Date>(
    addDays(new Date(startDate), cycleDay - 1)
  );
  const [progesteroneLevel, setProgesteroneLevel] = useState<string>('');
  const [laboratory, setLaboratory] = useState<string>('VIDAS');

  // Calculate which day this test date represents
  const calculatedDay = testDate
    ? differenceInDays(testDate, new Date(startDate)) + 1
    : cycleDay;

  const level = parseFloat(progesteroneLevel);
  const phaseInfo = !isNaN(level) ? getPhaseInfo(level, calculatedDay, testDate) : null;

  const handleSubmit = async () => {
    if (testDate && progesteroneLevel) {
      await onSubmit({
        testDate: testDate,
        level: parseFloat(progesteroneLevel),
        laboratory,
      });
      // Reset form
      setTestDate(addDays(new Date(startDate), cycleDay - 1));
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
            <DatePicker
              date={testDate}
              onDateChange={(date) => setTestDate(date || new Date())}
              placeholder="Select test date"
              maxDate={new Date()}
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{phaseInfo.icon}</span>
                  <strong className={phaseInfo.color}>{phaseInfo.phase}</strong>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {phaseInfo.description}
                </p>
                <div className="text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                  <strong>Reading:</strong> {progesteroneLevel} ng/mL on Day {calculatedDay}
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  📅 Next Action: {phaseInfo.nextAction}
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
