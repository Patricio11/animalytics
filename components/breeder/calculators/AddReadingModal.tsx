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
import { Checkbox } from '@/components/ui/checkbox';
import { Activity, AlertCircle, Loader2, TrendingUp, Calendar, Heart, Sparkles, Info, Beaker } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { getPhaseInfo } from '@/lib/utils/progesterone';
import { DatePicker } from '@/components/ui/date-picker';
import { convertToVidasStandard, PROGESTERONE_MACHINES, type ProgesteroneMachine } from '@/lib/utils/progesterone-machine-conversion';

interface AddReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycleDay: number;
  bitchName: string;
  startDate: string;
  onSubmit: (data: { 
    testDate: Date; 
    level: number; 
    laboratory?: string;
    markAsMating?: boolean;
    markAsLastMating?: boolean;
  }) => Promise<void>;
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
  const [laboratory, setLaboratory] = useState<ProgesteroneMachine>('VIDAS');
  const [markAsMating, setMarkAsMating] = useState<boolean>(false);
  const [markAsLastMating, setMarkAsLastMating] = useState<boolean>(false);

  // Calculate which day this test date represents
  const calculatedDay = testDate
    ? differenceInDays(testDate, new Date(startDate)) + 1
    : cycleDay;

  const level = parseFloat(progesteroneLevel);
  // Convert to VIDAS standard for phase detection
  const normalizedLevel = !isNaN(level) ? convertToVidasStandard(level, laboratory) : 0;
  const phaseInfo = !isNaN(level) ? getPhaseInfo(normalizedLevel, calculatedDay, testDate) : null;
  
  // Check if in breeding window (P4: 15-35 ng/mL normalized)
  const isInBreedingWindow = !isNaN(normalizedLevel) && normalizedLevel >= 15 && normalizedLevel <= 35;

  const handleSubmit = async () => {
    if (testDate && progesteroneLevel) {
      await onSubmit({
        testDate: testDate,
        level: parseFloat(progesteroneLevel),
        laboratory,
        markAsMating,
        markAsLastMating,
      });
      // Reset form
      setTestDate(addDays(new Date(startDate), cycleDay - 1));
      setProgesteroneLevel('');
      setLaboratory('VIDAS');
      setMarkAsMating(false);
      setMarkAsLastMating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
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

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
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
            <Select value={laboratory} onValueChange={(value) => setLaboratory(value as ProgesteroneMachine)}>
              <SelectTrigger id="laboratory">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDAS">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">VIDAS</div>
                      <div className="text-xs text-muted-foreground">Mini VIDAS (Reference Standard)</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="IDEXX">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">IDEXX</div>
                      <div className="text-xs text-muted-foreground">IDEXX Catalyst (In-clinic)</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="IDEXX_LAB">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">IDEXX Lab</div>
                      <div className="text-xs text-muted-foreground">IDEXX Reference Laboratory</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="IMMULITE">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">IMMULITE</div>
                      <div className="text-xs text-muted-foreground">Siemens Immulite</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="CHEMILUMINESCENCE">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Chemiluminescence</div>
                      <div className="text-xs text-muted-foreground">Generic analyzer</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="RIA">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">RIA</div>
                      <div className="text-xs text-muted-foreground">Radioimmunoassay</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="OTHER">
                  <div className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Other</div>
                      <div className="text-xs text-muted-foreground">Unknown/Other method</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {laboratory !== 'VIDAS' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Values will be normalized to VIDAS standard for consistent interpretation
              </p>
            )}
          </div>

          {/* Machine Conversion Info */}
          {laboratory !== 'VIDAS' && progesteroneLevel && !isNaN(level) && level > 0 && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="ml-2 text-sm">
                <strong>Machine Conversion:</strong> {progesteroneLevel} ng/mL on {PROGESTERONE_MACHINES[laboratory].name} = <strong>{normalizedLevel.toFixed(1)} ng/mL</strong> VIDAS equivalent
              </AlertDescription>
            </Alert>
          )}

          {/* Mating Markers - Only show in breeding window */}
          {isInBreedingWindow && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-green-600" />
                <Label className="text-base font-semibold text-green-900 dark:text-green-100">
                  Breeding Window Detected (P4: {progesteroneLevel} ng/mL)
                </Label>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Mark this reading if a mating occurred on this date
              </p>

              {/* Mark as Mating */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="markAsMating"
                  checked={markAsMating}
                  onCheckedChange={(checked) => {
                    setMarkAsMating(checked as boolean);
                    if (checked) setMarkAsLastMating(false); // Can't be both
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="markAsMating"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <Heart className="h-4 w-4 inline mr-1 text-blue-600" />
                    Mark as Mating
                  </label>
                  <p className="text-xs text-muted-foreground">
                    A breeding occurred on this date (will show as M1, M2, etc. on chart)
                  </p>
                </div>
              </div>

              {/* Mark as Last Mating */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="markAsLastMating"
                  checked={markAsLastMating}
                  onCheckedChange={(checked) => {
                    setMarkAsLastMating(checked as boolean);
                    if (checked) setMarkAsMating(false); // Can't be both
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="markAsLastMating"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 inline mr-1 text-red-600" />
                    Mark as LAST Mating
                  </label>
                  <p className="text-xs text-muted-foreground">
                    This was the final breeding in the fertility window
                  </p>
                </div>
              </div>

              {/* Last Mating Info */}
              {markAsLastMating && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                    <strong>🎯 Last Mating Countdown Starts!</strong>
                    <p className="mt-1">
                      Pregnancy screening tasks will be auto-generated:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Day 28: Ultrasound + Blood test</li>
                      <li>• Day 30: Progesterone plateau check</li>
                      <li>• Day 45, 50, 55: Pregnancy monitoring</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

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
                  {laboratory !== 'VIDAS' && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({normalizedLevel.toFixed(1)} VIDAS equiv.)
                    </span>
                  )}
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
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
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
