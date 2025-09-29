"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyReadingInput } from './DailyReadingInput';
import { LabSelectorCard } from './LabSelectorCard';
import { ProgesteroneRatingDisplay } from './ProgesteroneRatingDisplay';
import { Calculator, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  // Testing parameters state
  const [laboratory, setLaboratory] = useState<Laboratory>('VIDAS');
  const [unit, setUnit] = useState<Unit>('nanograms');
  const [breedingMethod, setBreedingMethod] = useState<BreedingMethod>('natural_ai');

  // Daily readings state (6 days: 0-5)
  const [readings, setReadings] = useState<DailyReading[]>([
    { day: 0, value: '', date: undefined },
    { day: 1, value: '', date: undefined },
    { day: 2, value: '', date: undefined },
    { day: 3, value: '', date: undefined },
    { day: 4, value: '', date: undefined },
    { day: 5, value: '', date: undefined },
  ]);

  // Calculation results state
  const [calculationResult, setCalculationResult] = useState<{
    rating: any;
    trend: any;
    recommendation: any;
    breedingWindow: any;
  } | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  // Real-time calculation as readings are entered
  useEffect(() => {
    calculateRating();
  }, [readings, laboratory, unit, breedingMethod]);

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

  const handleSaveReadings = () => {
    const filledReadings = readings.filter(r => r.value && r.value.trim() !== '');

    if (filledReadings.length === 0) {
      toast({
        variant: "destructive",
        title: "No readings to save",
        description: "Please enter at least one progesterone reading."
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

    // TODO: Persist to backend/mating record
    // For now, save to local storage
    localStorage.setItem('progesterone_readings', JSON.stringify({
      laboratory,
      unit,
      breedingMethod,
      readings: filledReadings,
      calculationResult,
      savedAt: new Date().toISOString()
    }));

    toast({
      title: "Readings saved",
      description: `Successfully saved ${filledReadings.length} progesterone reading(s).`
    });
  };

  const handleReset = () => {
    setReadings([
      { day: 0, value: '', date: undefined },
      { day: 1, value: '', date: undefined },
      { day: 2, value: '', date: undefined },
      { day: 3, value: '', date: undefined },
      { day: 4, value: '', date: undefined },
      { day: 5, value: '', date: undefined },
    ]);
    setValidationErrors({});
    setCalculationResult(null);

    toast({
      title: "Form reset",
      description: "All readings have been cleared."
    });
  };

  const hasAnyReadings = readings.some(r => r.value && r.value.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-primary/10 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl">Progesterone Calculator</div>
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Enter daily progesterone readings to calculate optimal breeding timing
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
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
              <CardTitle className="text-lg">Daily Progesterone Readings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter readings for Day 0 through Day 5. At least 2 readings are recommended for accurate calculations.
              </p>
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveReadings}
              disabled={!hasAnyReadings || Object.keys(validationErrors).length > 0}
              className="flex-1 bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Readings
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasAnyReadings}
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