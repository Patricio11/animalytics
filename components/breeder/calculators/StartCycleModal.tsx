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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface Animal {
  id: string;
  name: string;
  registeredName?: string;
  breed?: {
    name: string;
  };
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
  const [bitchComboboxOpen, setBitchComboboxOpen] = useState(false);

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
          {/* Bitch Selection - Searchable */}
          <div className="space-y-2">
            <Label htmlFor="bitch">Select Bitch *</Label>
            <Popover open={bitchComboboxOpen} onOpenChange={setBitchComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bitchComboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedBitch
                    ? animals.find((animal) => animal.id === selectedBitch)?.name
                    : "Search and select a bitch..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search bitches..." />
                  <CommandList>
                    <CommandEmpty>No female dogs found.</CommandEmpty>
                    <CommandGroup>
                      {animals.map((animal) => (
                        <CommandItem
                          key={animal.id}
                          value={animal.name}
                          onSelect={() => {
                            setSelectedBitch(animal.id);
                            setBitchComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedBitch === animal.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{animal.name}</span>
                            {animal.breed && (
                              <span className="text-xs text-muted-foreground">
                                {animal.breed.name}
                              </span>
                            )}
                            {animal.registeredName && (
                              <span className="text-xs text-muted-foreground">
                                {animal.registeredName}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedAnimal && (
              <p className="text-xs text-muted-foreground">
                {selectedAnimal.registeredName && (
                  <>Registered: {selectedAnimal.registeredName}</>
                )}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Heat Start Date (Day 1) *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
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
                'Optimal window: 25-35 ng/mL progesterone'}
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
