"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Check,
  ChevronRight,
  ArrowLeft,
  Heart,
  Beaker
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Animal } from "@/types";

type SelectionStep = 'bitch' | 'dog';

interface AnimalPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals: Animal[];
  onComplete: (bitchId: string, dogId: string | null, frozenSemenId: string | null) => void;
}

export function AnimalPickerDialog({
  open,
  onOpenChange,
  animals,
  onComplete
}: AnimalPickerDialogProps) {
  const [step, setStep] = useState<SelectionStep>('bitch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBitch, setSelectedBitch] = useState<Animal | null>(null);
  const [selectedDog, setSelectedDog] = useState<Animal | null>(null);
  const [useFrozenSemen, setUseFrozenSemen] = useState(false);

  // Filter animals based on step and search
  const getFilteredAnimals = () => {
    const filtered = animals.filter(animal => {
      if (step === 'bitch' && animal.type !== 'bitch') return false;
      if (step === 'dog' && animal.type !== 'dog') return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          animal.name.toLowerCase().includes(query) ||
          animal.breed.toLowerCase().includes(query)
        );
      }

      return true;
    });

    return filtered;
  };

  const handleAnimalSelect = (animal: Animal) => {
    if (step === 'bitch') {
      setSelectedBitch(animal);
      // Don't auto-advance - let user confirm
    } else {
      setSelectedDog(animal);
    }
  };

  const handleNextStep = () => {
    if (step === 'bitch' && selectedBitch) {
      setStep('dog');
      setSearchQuery('');
    }
  };

  const handleBack = () => {
    setStep('bitch');
    setSelectedDog(null);
    setSearchQuery('');
  };

  const handleComplete = () => {
    if (!selectedBitch) return;

    if (useFrozenSemen) {
      // For now, pass null for frozen semen
      // In the future, this would open a frozen semen selector
      onComplete(selectedBitch.id, null, 'frozen-semen-1');
    } else if (selectedDog) {
      onComplete(selectedBitch.id, selectedDog.id, null);
    }

    // Reset state
    setStep('bitch');
    setSelectedBitch(null);
    setSelectedDog(null);
    setUseFrozenSemen(false);
    setSearchQuery('');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setStep('bitch');
      setSelectedBitch(null);
      setSelectedDog(null);
      setUseFrozenSemen(false);
      setSearchQuery('');
    }
    onOpenChange(open);
  };

  const filteredAnimals = getFilteredAnimals();
  const canProceedToNextStep = step === 'bitch' && selectedBitch;
  const canComplete = step === 'dog' && selectedBitch && (selectedDog || useFrozenSemen);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            {step === 'dog' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {step === 'bitch' ? 'Select Bitch' : 'Select Dog or Frozen Semen'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === 'bitch'
                  ? 'Choose the female for this mating'
                  : 'Choose the male or frozen semen for breeding'}
              </DialogDescription>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                selectedBitch
                  ? "bg-gradient-brand text-white shadow-md"
                  : step === 'bitch'
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {selectedBitch ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                selectedBitch ? 'bg-primary' : 'bg-muted'
              )} />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                selectedDog || useFrozenSemen ? 'bg-primary' : 'bg-muted'
              )} />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                selectedDog || useFrozenSemen
                  ? "bg-gradient-brand text-white shadow-md"
                  : step === 'dog'
                  ? "bg-primary/20 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {selectedDog || useFrozenSemen ? <Check className="w-4 h-4" /> : '2'}
              </div>
            </div>
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className={cn(
              "font-medium transition-colors",
              step === 'bitch' ? "text-primary" : selectedBitch ? "text-foreground" : "text-muted-foreground"
            )}>
              Step 1: Select Bitch
            </span>
            <span className={cn(
              "font-medium transition-colors",
              step === 'dog' ? "text-primary" : (selectedDog || useFrozenSemen) ? "text-foreground" : "text-muted-foreground"
            )}>
              Step 2: Select Dog
            </span>
          </div>
        </DialogHeader>

        <Separator />

        {/* Selected Bitch Preview (on dog selection step) */}
        {step === 'dog' && selectedBitch && (
          <>
            <div className="px-6 py-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={selectedBitch.photos[0]} alt={selectedBitch.name} />
                  <AvatarFallback>{selectedBitch.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{selectedBitch.registeredName || selectedBitch.name}</span>
                    <Badge variant="outline" className="text-xs">Bitch</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBitch.breed}</p>
                </div>
                <Check className="w-5 h-5 text-chart-3" />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${step === 'bitch' ? 'bitches' : 'dogs'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-primary/20"
            />
          </div>

          {/* Frozen Semen Option (dog step only) */}
          {step === 'dog' && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-primary/10">
              <Label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFrozenSemen}
                  onChange={(e) => {
                    setUseFrozenSemen(e.target.checked);
                    if (e.target.checked) {
                      setSelectedDog(null);
                    }
                  }}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Beaker className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Use Frozen Semen Instead</span>
                </div>
              </Label>
            </div>
          )}
        </div>

        <Separator />

        {/* Animal List */}
        <ScrollArea className="flex-1 px-6" style={{ maxHeight: 'calc(80vh - 400px)' }}>
          <div className="space-y-2 py-4">
            {filteredAnimals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No animals found</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              filteredAnimals.map((animal) => {
                const isSelected = step === 'bitch'
                  ? selectedBitch?.id === animal.id
                  : selectedDog?.id === animal.id;

                return (
                  <button
                    key={animal.id}
                    onClick={() => handleAnimalSelect(animal)}
                    disabled={useFrozenSemen && step === 'dog'}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                      "hover:border-primary/50 hover:bg-accent",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-background",
                      useFrozenSemen && step === 'dog' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src={animal.photos[0]} alt={animal.name} />
                      <AvatarFallback>{animal.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{animal.registeredName || animal.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {animal.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{animal.breed}</p>
                      {animal.bloodline && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {animal.bloodline}
                        </p>
                      )}
                    </div>

                    {isSelected ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer Actions */}
        <div className="px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            className="flex-1"
          >
            Cancel
          </Button>

          {step === 'bitch' ? (
            <Button
              onClick={handleNextStep}
              disabled={!canProceedToNextStep}
              className="flex-1 bg-gradient-brand hover:opacity-90"
            >
              Next: Select Dog
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="flex-1 bg-gradient-brand hover:opacity-90"
            >
              <Heart className="w-4 h-4 mr-2" />
              Create Mating Record
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}