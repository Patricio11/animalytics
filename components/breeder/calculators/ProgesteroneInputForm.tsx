"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DailyReadingInput } from './DailyReadingInput';
import { LabSelectorCard } from './LabSelectorCard';
import { ProgesteroneRatingDisplay } from './ProgesteroneRatingDisplay';
import { Calculator, Save, RotateCcw, Info, Clock, Plus, Database, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProgesteroneStore } from '@/lib/stores/progesterone-store';
import { useCreateProgesteroneTest } from '@/lib/api/queries/progesterone-tests';
import { useAnimals } from '@/lib/api/queries/animals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Laboratory,
  Unit,
  BreedingMethod,
  DayNumber,
  ProgesteroneReading,
  calculateProgesteroneRating,
  analyzeProgesteroneTrend,
  getBreedingRecommendation,
  calculateOptimalBreedingWindow
} from '@/lib/calculations';

interface DailyReading {
  day: DayNumber;
  value: string;
  date: Date | undefined;
}

export function ProgesteroneInputForm() {
  const { toast } = useToast();

  // Zustand progesterone store
  const progesteroneStore = useProgesteroneStore();

  // Initialize from Zustand store or use defaults
  const [laboratory, setLaboratory] = useState<Laboratory>(progesteroneStore.laboratory || 'VIDAS');
  const [unit, setUnit] = useState<Unit>(progesteroneStore.unit || 'nanograms');
  const [breedingMethod, setBreedingMethod] = useState<BreedingMethod>(progesteroneStore.breedingMethod || 'natural_ai');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Database mutation
  const createTestMutation = useCreateProgesteroneTest();
  
  // Fetch animals (female only for progesterone tests)
  const { data: animalsData } = useAnimals();
  const femaleAnimals = animalsData?.filter((a: any) => a.sex === 'female') || [];

  // Convert Zustand readings to local state format
  const initializeReadings = (): DailyReading[] => {
    if (progesteroneStore.readings.length > 0) {
      // Create array with saved days
      const savedDays: DailyReading[] = [];
      
      progesteroneStore.readings.forEach(reading => {
        if (reading.day >= 1 && reading.day <= 15) {
          savedDays.push({
            day: reading.day as DayNumber,
            value: reading.value.toString(),
            date: new Date(reading.date)
          });
        }
      });

      // Sort by day
      savedDays.sort((a, b) => a.day - b.day);
      
      // If no Day 1, add it
      if (savedDays.length === 0 || savedDays[0].day !== 1) {
        savedDays.unshift({ day: 1, value: '', date: undefined });
      }

      return savedDays;
    }

    // Start with just Day 1 (start of heat cycle)
    return [
      { day: 1, value: '', date: undefined },
    ];
  };

  // Daily readings state (dynamic: start with Day 1, add as needed)
  const [readings, setReadings] = useState<DailyReading[]>(initializeReadings);
  
  // Add a new day
  const addDay = () => {
    const nextDay = (readings[readings.length - 1]?.day || 0) + 1;
    if (nextDay <= 15) {
      setReadings([...readings, { day: nextDay as DayNumber, value: '', date: undefined }]);
    }
  };
  
  // Remove a day (only if it's the last day and empty)
  const removeDay = (day: DayNumber) => {
    if (day === readings[readings.length - 1]?.day && day > 1) {
      const reading = readings.find(r => r.day === day);
      if (!reading?.value || reading.value.trim() === '') {
        setReadings(readings.filter(r => r.day !== day));
      }
    }
  };
  
  const canAddDay = readings.length < 15 && (readings[readings.length - 1]?.day || 0) < 15;
  const canRemoveLastDay = readings.length > 1 && (!readings[readings.length - 1].value || readings[readings.length - 1].value.trim() === '');

  // Calculation results state
  const [calculationResult, setCalculationResult] = useState<{
    rating: {
      rating: number;
      alternativeRating?: number;
      matchedPattern: string;
      confidence: number;
    };
    trend: {
      trend: 'rising' | 'falling' | 'stable' | 'insufficient';
      averageChange: number;
      isOptimal: boolean;
    };
    recommendation: {
      recommendation: 'optimal' | 'good' | 'acceptable' | 'not_recommended';
      message: string;
      suggestedAction: string;
    };
    breedingWindow: {
      startDay: number;
      endDay: number;
      confidence: number;
    };
  } | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  // Real-time calculation as readings are entered
  useEffect(() => {
    calculateRating();
  }, [readings, laboratory, unit, breedingMethod]);

  // Sync changes to Zustand store with auto-save
  useEffect(() => {
    const syncToStore = () => {
      progesteroneStore.setLaboratory(laboratory);
      progesteroneStore.setUnit(unit);
      progesteroneStore.setBreedingMethod(breedingMethod);
      setLastSaved(new Date());
    };

    const debounce = setTimeout(syncToStore, 500);
    return () => clearTimeout(debounce);
  }, [laboratory, unit, breedingMethod]);

  const validateReading = (value: string, day: DayNumber): { isValid: boolean; message?: string } => {
    if (!value || value.trim() === '') {
      return { isValid: true }; // Empty is valid (optional reading)
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { isValid: false, message: 'Please enter a valid number' };
    }

    // Range validation based on unit
    const ranges = unit === 'nanograms'
      ? { min: 0, max: 50 }
      : { min: 0, max: 160 };

    if (numValue < ranges.min) {
      return { isValid: false, message: `Value must be at least ${ranges.min}` };
    }

    if (numValue > ranges.max) {
      return { isValid: false, message: `Value must not exceed ${ranges.max}` };
    }

    return { isValid: true };
  };

  const updateReading = (day: DayNumber, value: string) => {
    const newReadings = readings.map(r =>
      r.day === day ? { ...r, value } : r
    );
    setReadings(newReadings);

    // Validate
    const validation = validateReading(value, day);
    if (!validation.isValid && validation.message) {
      setValidationErrors(prev => ({ ...prev, [day]: validation.message! }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[day];
        return newErrors;
      });
    }
  };

  const updateReadingDate = (day: DayNumber, date: Date | undefined) => {
    const newReadings = readings.map(r =>
      r.day === day ? { ...r, date } : r
    );
    setReadings(newReadings);

    // Auto-save to Zustand when date is set and value exists
    const reading = newReadings.find(r => r.day === day);
    if (reading && reading.value && reading.date) {
      const numValue = parseFloat(reading.value);
      if (!isNaN(numValue)) {
        progesteroneStore.addReading({
          day: reading.day,
          value: numValue,
          date: reading.date
        });
        setLastSaved(new Date());
      }
    }
  };

  const calculateRating = () => {
    // Filter readings that have values
    const validReadings: ProgesteroneReading[] = readings
      .filter(r => r.value && r.value.trim() !== '' && r.date)
      .map(r => ({
        day: r.day,
        value: parseFloat(r.value),
        date: r.date!
      }));

    if (validReadings.length === 0) {
      setCalculationResult(null);
      return;
    }

    // Check if all values are valid
    const hasErrors = validReadings.some(r => {
      const validation = validateReading(r.value.toString(), r.day);
      return !validation.isValid;
    });

    if (hasErrors) {
      setCalculationResult(null);
      return;
    }

    // Calculate rating
    const rating = calculateProgesteroneRating({
      laboratory,
      unit,
      breedingMethod,
      readings: validReadings
    });

    const trend = analyzeProgesteroneTrend(validReadings);
    const recommendation = getBreedingRecommendation(rating);
    const breedingWindow = calculateOptimalBreedingWindow(validReadings, breedingMethod);

    setCalculationResult({
      rating,
      trend,
      recommendation,
      breedingWindow
    });
  };

  const handleSaveReadings = async () => {
    const filledReadings = readings.filter(r => r.value && r.value.trim() !== '' && r.date);

    if (filledReadings.length === 0) {
      toast({
        variant: "destructive",
        title: "No readings to save",
        description: "Please enter at least one progesterone reading with a date."
      });
      return;
    }

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation errors",
        description: "Please fix validation errors before saving."
      });
      return;
    }

    // Check if animal is selected
    if (!selectedAnimal) {
      toast({
        variant: "destructive",
        title: "No animal selected",
        description: "Please select an animal to save progesterone tests."
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare readings data
      const readingsData = filledReadings.map(r => ({
        day: r.day,
        value: parseFloat(r.value),
        date: r.date!.toISOString()
      }));

      // Save to database
      await createTestMutation.mutateAsync({
        animalId: selectedAnimal.id,
        testDate: filledReadings[0].date!.toISOString().split('T')[0],
        laboratory,
        unit,
        breedingMethod,
        readings: readingsData,
        rating: calculationResult?.rating.rating ? (calculationResult.rating.rating * 10) : undefined,
        alternativeRating: calculationResult?.rating.alternativeRating ? (calculationResult.rating.alternativeRating * 10) : undefined,
        matchedPattern: calculationResult?.rating.matchedPattern || undefined,
        confidence: calculationResult?.rating.confidence || undefined,
        trend: calculationResult?.trend.trend || undefined,
        averageChange: calculationResult?.trend.averageChange || undefined,
        isOptimal: calculationResult?.trend.isOptimal !== undefined ? String(calculationResult.trend.isOptimal) : undefined,
        recommendation: calculationResult?.recommendation.recommendation || undefined,
        recommendationMessage: calculationResult?.recommendation.message || undefined,
        suggestedAction: calculationResult?.recommendation.suggestedAction || undefined,
        breedingWindow: calculationResult?.breedingWindow ? {
          startDay: calculationResult.breedingWindow.startDay,
          endDay: calculationResult.breedingWindow.endDay,
          confidence: calculationResult.breedingWindow.confidence
        } : undefined,
      });

      // Also save to Zustand store for local state
      filledReadings.forEach(reading => {
        progesteroneStore.addReading({
          day: reading.day,
          value: parseFloat(reading.value),
          date: reading.date!
        });
      });

      setLastSaved(new Date());

      toast({
        title: "Test saved successfully",
        description: `Saved ${filledReadings.length} progesterone reading(s) to database.`
      });
    } catch (error) {
      console.error('Error saving progesterone test:', error);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Could not save progesterone test. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setReadings([
      { day: 1, value: '', date: undefined },
    ]);
    setValidationErrors({});
    setCalculationResult(null);
    progesteroneStore.reset();

    toast({
      title: "Form reset",
      description: "All readings have been cleared."
    });
  };

  const hasAnyReadings = readings.some(r => r.value && r.value.trim() !== '');
  const hasSavedProgress = progesteroneStore.readings.length > 0;

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return null;
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `Saved ${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl">Progesterone Calculator</div>
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  Enter daily progesterone readings to calculate optimal breeding timing
                </div>
              </div>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {getLastSavedText()}
              </div>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Saved Progress Alert */}
      {hasSavedProgress && (
        <Alert className="border-chart-3/50 bg-chart-3/10">
          <Info className="h-4 w-4 text-chart-3" />
          <AlertDescription className="ml-2">
            You have {progesteroneStore.readings.length} saved progesterone reading(s).
            Continue adding more readings or click Reset to start fresh.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animal Selection */}
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <CardTitle className="text-base">Select Bitch</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the bitch for progesterone testing
              </p>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedAnimal?.id || ''} 
                onValueChange={(value) => {
                  const animal = femaleAnimals.find((a: any) => a.id === value);
                  setSelectedAnimal(animal || null);
                }}
              >
                <SelectTrigger className="bg-background border-primary/20">
                  <SelectValue placeholder="Select a bitch..." />
                </SelectTrigger>
                <SelectContent>
                  {femaleAnimals.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No bitch animals available
                    </div>
                  ) : (
                    femaleAnimals.map((animal: any) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="w-8 h-8 border-2 border-primary/20">
                            <AvatarImage src={animal.profileImageUrl || undefined} alt={animal.name} />
                            <AvatarFallback className="bg-gradient-brand text-white text-xs">
                              {animal.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{animal.name}</div>
                            <div className="text-xs text-muted-foreground">{animal.breed?.name || 'Unknown breed'}</div>
                          </div>
                          {animal.registeredName && (
                            <Badge variant="outline" className="text-xs">
                              Registered
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Laboratory Selection */}
          <LabSelectorCard
            laboratory={laboratory}
            unit={unit}
            breedingMethod={breedingMethod}
            onLaboratoryChange={setLaboratory}
            onUnitChange={setUnit}
            onBreedingMethodChange={setBreedingMethod}
          />

          {/* Daily Readings */}
          <Card className="shadow-card border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Daily Progesterone Readings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start with Day 1 (first day of heat) and add Day 5 reading. System will remind you based on results.
                  </p>
                </div>
                {canAddDay && (
                  <Button
                    onClick={addDay}
                    variant="outline"
                    size="sm"
                    className="hover:bg-primary/10 hover:border-primary"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Day {readings.length}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {readings.map((reading) => {
                const validation = validateReading(reading.value, reading.day);
                return (
                  <DailyReadingInput
                    key={reading.day}
                    day={reading.day}
                    value={reading.value}
                    date={reading.date}
                    unit={unit}
                    onChange={(value) => updateReading(reading.day, value)}
                    onDateChange={(date) => updateReadingDate(reading.day, date)}
                    hasValue={!!reading.value && reading.value.trim() !== ''}
                    isValid={validation.isValid}
                    validationMessage={validationErrors[reading.day]}
                  />
                );
              })}
              
              {readings.length < 6 && (
                <Button
                  onClick={addDay}
                  variant="ghost"
                  className="w-full border-2 border-dashed hover:bg-primary/5 hover:border-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Day {readings.length}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveReadings}
              disabled={!hasAnyReadings || Object.keys(validationErrors).length > 0 || isSaving || !selectedAnimal}
              className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save to Database'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasAnyReadings && !hasSavedProgress}
              className="hover:bg-primary/10 hover:border-primary"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Column: Rating Display */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ProgesteroneRatingDisplay
              rating={calculationResult?.rating || null}
              trend={calculationResult?.trend}
              recommendation={calculationResult?.recommendation}
              breedingWindow={calculationResult?.breedingWindow}
              hasReadings={hasAnyReadings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
