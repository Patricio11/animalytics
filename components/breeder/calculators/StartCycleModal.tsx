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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimalCombobox } from '@/components/ui/animal-combobox';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface Animal {
  id: string;
  name: string;
  registeredName?: string;
  breed?: string | { name: string };
  profileImageUrl?: string | null;
  sex?: string;
  dateOfBirth?: string;
}

interface StartCycleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals: Animal[];
  onStartCycle: (data: {
    bitchId: string;
    startDate: string;
    breedingMethod: string;
  }) => void;
  isLoading?: boolean;
}

export function StartCycleModal({
  open,
  onOpenChange,
  animals,
  onStartCycle,
  isLoading = false,
}: StartCycleModalProps) {
  const [selectedBitch, setSelectedBitch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [breedingMethod, setBreedingMethod] = useState<string>('natural_ai');
  const selectedAnimal = animals.find((a) => a.id === selectedBitch);
  const firstTestDate = startDate ? addDays(new Date(startDate), 4) : null;
  const daysSinceStart = startDate
    ? differenceInDays(new Date(), new Date(startDate)) + 1
    : 0;
  const isOverdue = daysSinceStart >= 5;

  const handleSubmit = () => {
    if (selectedBitch && startDate) {
      onStartCycle({
        bitchId: selectedBitch,
        startDate: startDate,
        breedingMethod,
      });
      // Reset form
      setSelectedBitch('');
      setStartDate('');
      setBreedingMethod('natural_ai');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Start New Heat Cycle
          </DialogTitle>
          <DialogDescription>
            Track progesterone levels and optimal breeding timing for your bitch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bitch Selection */}
          <div className="space-y-2">
            <Label htmlFor="bitch">Select Bitch *</Label>
            <AnimalCombobox
              animals={animals.map((a) => ({
                id: a.id,
                name: a.name,
                registeredName: a.registeredName,
                breed: typeof a.breed === 'string' ? a.breed : a.breed?.name,
                profileImageUrl: a.profileImageUrl,
                sex: a.sex,
              }))}
              value={selectedBitch}
              onValueChange={setSelectedBitch}
              placeholder="Search and select a bitch..."
              emptyText="No female dogs found."
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Heat Start Date (Day 1) *</Label>
            <DatePicker
              date={startDate ? new Date(startDate + 'T00:00:00') : undefined}
              onDateChange={(d) => setStartDate(d ? format(d, 'yyyy-MM-dd') : '')}
              maxDate={new Date()}
            />
            <p className="text-xs text-muted-foreground">
              Select the first day you noticed heat signs (bleeding, swelling)
            </p>
          </div>

          {/* Breeding Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Breeding Method *</Label>
            <Select value={breedingMethod} onValueChange={setBreedingMethod}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural_ai">Natural / Fresh AI</SelectItem>
                <SelectItem value="chilled_ai">Chilled AI</SelectItem>
                <SelectItem value="frozen_ai">Frozen AI</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {breedingMethod === 'natural_ai' &&
                'Optimal window: 15-25 ng/mL progesterone'}
              {breedingMethod === 'chilled_ai' &&
                'Optimal window: 20-30 ng/mL progesterone'}
              {breedingMethod === 'frozen_ai' &&
                'Optimal window: 25-40 ng/mL progesterone'}
            </p>
          </div>

          {/* Information Alert */}
          {startDate && firstTestDate && (
            <Alert className={isOverdue ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}>
              <AlertCircle className={isOverdue ? 'h-4 w-4 text-amber-600' : 'h-4 w-4 text-blue-600'} />
              <AlertDescription className={isOverdue ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}>
                <strong>First Test Schedule:</strong>
                <div className="mt-1 text-sm">
                  Day 5 test due: {format(firstTestDate, 'EEEE, MMMM d, yyyy')}
                </div>
                {isOverdue && (
                  <div className="mt-2 text-sm font-semibold">
                    ⚠️ Note: {daysSinceStart} calendar days have passed since{' '}
                    {format(new Date(startDate), 'MMM d')}. You can still record
                    the Day 5 test now (delayed recording).
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedBitch || !startDate || isLoading}
            className="bg-gradient-brand"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Cycle...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Start Heat Cycle
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
