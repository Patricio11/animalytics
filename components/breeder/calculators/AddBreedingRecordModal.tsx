'use client';

import { useState, useEffect } from 'react';
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
import { Heart, AlertCircle, Loader2, Calendar, Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { AnimalCombobox, AnimalOption } from '@/components/ui/animal-combobox';

interface Animal {
  id: string;
  name: string;
  registeredName?: string;
  breed?: { name: string };
  profileImageUrl?: string;
  sex?: string;
}

interface AddBreedingRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heatCycleId: string;
  startDate: string;
  studs: Animal[];
  onSubmit: (data: {
    breedingDate: string;
    breedingMethod: string;
    studId?: string;
    studName?: string;
    studRegistration?: string;
    semenQuality?: string;
    motility?: number;
    concentration?: number;
    notes?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddBreedingRecordModal({
  open,
  onOpenChange,
  heatCycleId,
  startDate,
  studs,
  onSubmit,
  isSubmitting = false,
}: AddBreedingRecordModalProps) {
  const [breedingDate, setBreedingDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [breedingMethod, setBreedingMethod] = useState<string>('natural');
  const [studType, setStudType] = useState<'own' | 'external'>('own');
  const [studId, setStudId] = useState<string>('');
  const [studName, setStudName] = useState<string>('');
  const [studRegistration, setStudRegistration] = useState<string>('');
  const [semenQuality, setSemenQuality] = useState<string>('');
  const [motility, setMotility] = useState<string>('');
  const [concentration, setConcentration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Calculate breeding day
  const breedingDay = breedingDate
    ? differenceInDays(new Date(breedingDate), new Date(startDate)) + 1
    : 1;

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setBreedingDate(format(new Date(), 'yyyy-MM-dd'));
      setBreedingMethod('natural');
      setStudType('own');
      setStudId('');
      setStudName('');
      setStudRegistration('');
      setSemenQuality('');
      setMotility('');
      setConcentration('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (breedingDate && breedingMethod) {
      await onSubmit({
        breedingDate,
        breedingMethod,
        studId: studType === 'own' ? studId : undefined,
        studName: studType === 'external' ? studName : undefined,
        studRegistration: studType === 'external' ? studRegistration : undefined,
        semenQuality: semenQuality || undefined,
        motility: motility ? parseInt(motility) : undefined,
        concentration: concentration ? parseFloat(concentration) : undefined,
        notes: notes || undefined,
      });
    }
  };

  const isAI = ['ai_fresh', 'ai_chilled', 'ai_frozen', 'tci', 'surgical'].includes(breedingMethod);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            Add Breeding Record
          </DialogTitle>
          <DialogDescription>
            Record breeding information for this heat cycle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* Breeding Date */}
          <div className="space-y-2">
            <Label htmlFor="breedingDate">Breeding Date *</Label>
            <Input
              id="breedingDate"
              type="date"
              value={breedingDate}
              onChange={(e) => setBreedingDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              This is <strong>Day {breedingDay}</strong> of the heat cycle
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
                <SelectItem value="natural">Natural Tie</SelectItem>
                <SelectItem value="ai_fresh">AI - Fresh Semen</SelectItem>
                <SelectItem value="ai_chilled">AI - Chilled Semen</SelectItem>
                <SelectItem value="ai_frozen">AI - Frozen Semen</SelectItem>
                <SelectItem value="tci">TCI (Transcervical Insemination)</SelectItem>
                <SelectItem value="surgical">Surgical AI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stud Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <Label>Stud Information *</Label>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant={studType === 'own' ? 'default' : 'outline'}
                onClick={() => setStudType('own')}
                className="flex-1"
              >
                Own Stud
              </Button>
              <Button
                type="button"
                variant={studType === 'external' ? 'default' : 'outline'}
                onClick={() => setStudType('external')}
                className="flex-1"
              >
                External Stud
              </Button>
            </div>

            {studType === 'own' ? (
              <div className="space-y-2">
                <Label htmlFor="studId">Select Stud</Label>
                <AnimalCombobox
                  animals={studs.map((stud) => ({
                    id: stud.id,
                    name: stud.name,
                    breed: stud.breed?.name || 'Unknown',
                    profileImageUrl: stud.profileImageUrl,
                    sex: stud.sex || 'male',
                  }))}
                  value={studId}
                  onValueChange={setStudId}
                  placeholder="Search for a stud..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="studName">Stud Name</Label>
                  <Input
                    id="studName"
                    value={studName}
                    onChange={(e) => setStudName(e.target.value)}
                    placeholder="e.g., CH Mighty Max"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studReg">Registration Number (Optional)</Label>
                  <Input
                    id="studReg"
                    value={studRegistration}
                    onChange={(e) => setStudRegistration(e.target.value)}
                    placeholder="e.g., AKC WS12345678"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI-Specific Fields */}
          {isAI && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Info className="w-4 h-4" />
                <Label className="text-sm font-semibold">Semen Information (Optional)</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quality">Semen Quality</Label>
                  <Select value={semenQuality} onValueChange={setSemenQuality}>
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motility">Motility (%)</Label>
                  <Input
                    id="motility"
                    type="number"
                    min="0"
                    max="100"
                    value={motility}
                    onChange={(e) => setMotility(e.target.value)}
                    placeholder="e.g., 85"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concentration">Concentration (million/mL)</Label>
                <Input
                  id="concentration"
                  type="number"
                  step="0.1"
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                  placeholder="e.g., 250"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the breeding..."
              rows={3}
            />
          </div>

          {/* Validation Alert */}
          {breedingDate && breedingDay < 1 && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Breeding date cannot be before the heat cycle start date
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
            disabled={
              !breedingDate || 
              !breedingMethod || 
              (studType === 'own' && !studId) ||
              (studType === 'external' && !studName) ||
              breedingDay < 1 || 
              isSubmitting
            }
            className="bg-gradient-to-r from-pink-500 to-rose-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Save Breeding Record
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
