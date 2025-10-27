"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { AnimalCombobox, AnimalOption } from "@/components/ui/animal-combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  CalendarIcon, 
  Dna, 
  Syringe,
  Snowflake,
  Info,
  CheckCircle2,
  Globe
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAnimals } from "@/lib/api/queries/animals";

interface CreateMatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    bitchId: string;
    dogId?: string;
    frozenSemenId?: string;
    matingDate: string;
    breedingMethod: 'natural_ai' | 'tci' | 'surgical_ai' | 'frozen';
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export function CreateMatingDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateMatingDialogProps) {
  const { data: myAnimalsData } = useAnimals();
  const myAnimals = myAnimalsData || [];

  // Form state
  const [bitchId, setBitchId] = useState("");
  const [breedingType, setBreedingType] = useState<'natural' | 'frozen'>('natural');
  const [dogId, setDogId] = useState("");
  const [frozenSemenId, setFrozenSemenId] = useState("");
  const [breedingMethod, setBreedingMethod] = useState<'natural_ai' | 'tci' | 'surgical_ai' | 'frozen'>('natural_ai');
  const [matingDate, setMatingDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Toggle for searching all animals
  const [searchAllBitches, setSearchAllBitches] = useState(false);
  const [searchAllDogs, setSearchAllDogs] = useState(false);
  const [allBitchesData, setAllBitchesData] = useState<any[]>([]);
  const [allDogsData, setAllDogsData] = useState<any[]>([]);
  const [loadingAllAnimals, setLoadingAllAnimals] = useState(false);

  // Fetch all animals from system when toggle is enabled
  const fetchAllAnimals = async (sex: 'male' | 'female') => {
    setLoadingAllAnimals(true);
    try {
      const response = await fetch(`/api/mating-partners?sex=${sex}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch animals');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching all animals:', error);
      return [];
    } finally {
      setLoadingAllAnimals(false);
    }
  };

  // Handle toggle for bitches
  const handleSearchAllBitchesToggle = async (enabled: boolean) => {
    setSearchAllBitches(enabled);
    if (enabled && allBitchesData.length === 0) {
      const data = await fetchAllAnimals('female');
      setAllBitchesData(data);
    }
  };

  // Handle toggle for dogs
  const handleSearchAllDogsToggle = async (enabled: boolean) => {
    setSearchAllDogs(enabled);
    if (enabled && allDogsData.length === 0) {
      const data = await fetchAllAnimals('male');
      setAllDogsData(data);
    }
  };

  // Filter animals based on toggle
  const bitchesSource = searchAllBitches ? allBitchesData : myAnimals.filter((a: any) => a.sex === 'female');
  const dogsSource = searchAllDogs ? allDogsData : myAnimals.filter((a: any) => a.sex === 'male');

  const bitches = bitchesSource.map((animal: any) => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name,
    profileImageUrl: animal.profileImageUrl,
    sex: animal.sex,
  }));

  const dogs = dogsSource.map((animal: any) => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name,
    profileImageUrl: animal.profileImageUrl,
    sex: animal.sex,
  }));

  const selectedBitch = bitchesSource.find((a: any) => a.id === bitchId);
  const selectedDog = dogsSource.find((a: any) => a.id === dogId);

  const breedingMethods = [
    { value: 'natural_ai', label: 'Natural/AI', icon: Heart, description: 'Natural mating or artificial insemination' },
    { value: 'tci', label: 'TCI', icon: Syringe, description: 'Transcervical insemination' },
    { value: 'surgical_ai', label: 'Surgical AI', icon: Dna, description: 'Surgical artificial insemination' },
    { value: 'frozen', label: 'Frozen Semen', icon: Snowflake, description: 'Using frozen semen' },
  ] as const;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!bitchId) newErrors.bitchId = 'Please select a bitch';
    if (breedingType === 'natural' && !dogId) newErrors.dogId = 'Please select a dog';
    if (breedingType === 'frozen' && !frozenSemenId) newErrors.frozenSemenId = 'Please enter frozen semen ID';
    if (!matingDate) newErrors.matingDate = 'Please select a mating date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      bitchId,
      dogId: breedingType === 'natural' ? dogId : undefined,
      frozenSemenId: breedingType === 'frozen' ? frozenSemenId : undefined,
      matingDate: format(matingDate, 'yyyy-MM-dd'),
      breedingMethod: breedingType === 'frozen' ? 'frozen' : breedingMethod,
      notes: notes || undefined,
    });
  };

  const handleClose = () => {
    setBitchId("");
    setDogId("");
    setFrozenSemenId("");
    setBreedingMethod('natural_ai');
    setMatingDate(new Date());
    setNotes("");
    setErrors({});
    onOpenChange(false);
  };

  const getAnimalInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-pink-500" />
            Create Mating Record
          </DialogTitle>
          <DialogDescription>
            Select the breeding pair and enter mating details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Breeding Type Selection - Full Width */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Dna className="w-4 h-4 text-blue-500" />
              Breeding Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup value={breedingType} onValueChange={(v) => setBreedingType(v as 'natural' | 'frozen')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="natural" id="natural" />
                  <Label htmlFor="natural" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">Natural / AI with Dog</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Select a male dog from your kennel</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="frozen" id="frozen" />
                  <Label htmlFor="frozen" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4" />
                      <span className="font-medium">Frozen Semen</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Use frozen semen from external source</p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Animal Selection Grid - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bitch Selection - Left */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Select Bitch <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="search-all-bitches" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Search All
                  </Label>
                  <Switch
                    id="search-all-bitches"
                    checked={searchAllBitches}
                    onCheckedChange={handleSearchAllBitchesToggle}
                    disabled={loadingAllAnimals}
                  />
                </div>
              </div>
              <AnimalCombobox
                animals={bitches}
                value={bitchId}
                onValueChange={setBitchId}
                placeholder={searchAllBitches ? "Search all bitches in system..." : "Choose from your bitches..."}
                emptyText={searchAllBitches ? "No bitches found in system." : "No female animals found. Add a bitch first."}
                disabled={loadingAllAnimals}
              />
              {errors.bitchId && (
                <p className="text-sm text-destructive">{errors.bitchId}</p>
              )}
              {searchAllBitches && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Showing all available bitches from public breeders
                </p>
              )}

              {/* Selected Bitch Card */}
              {selectedBitch && (
                <Card className="border-pink-200 bg-pink-50/50 dark:bg-pink-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedBitch.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-gradient-brand text-white">
                          {getAnimalInitials(selectedBitch.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg">{selectedBitch.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedBitch.breed?.name || 'Unknown breed'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-pink-100 dark:bg-pink-900">
                            Female
                          </Badge>
                          {selectedBitch.isChampion && (
                            <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">
                              Champion
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Dog Selection or Frozen Semen - Right */}
            <div className="space-y-3">
              {breedingType === 'natural' ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-500" />
                      Select Dog <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="search-all-dogs" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Search All
                      </Label>
                      <Switch
                        id="search-all-dogs"
                        checked={searchAllDogs}
                        onCheckedChange={handleSearchAllDogsToggle}
                        disabled={loadingAllAnimals}
                      />
                    </div>
                  </div>
                  <AnimalCombobox
                    animals={dogs}
                    value={dogId}
                    onValueChange={setDogId}
                    placeholder={searchAllDogs ? "Search all dogs in system..." : "Choose from your dogs..."}
                    emptyText={searchAllDogs ? "No dogs found in system." : "No male animals found. Add a dog first."}
                    disabled={loadingAllAnimals}
                  />
                  {errors.dogId && (
                    <p className="text-sm text-destructive">{errors.dogId}</p>
                  )}
                  {searchAllDogs && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Showing all available studs from public breeders
                    </p>
                  )}

                  {/* Selected Dog Card */}
                  {selectedDog && (
                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedDog.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-gradient-brand text-white">
                              {getAnimalInitials(selectedDog.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg">{selectedDog.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedDog.breed?.name || 'Unknown breed'}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                                Male
                              </Badge>
                              {selectedDog.isChampion && (
                                <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">
                                  Champion
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  <Label htmlFor="frozenSemenId" className="text-base font-semibold flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    Frozen Semen Batch ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="frozenSemenId"
                    value={frozenSemenId}
                    onChange={(e) => setFrozenSemenId(e.target.value)}
                    placeholder="Enter batch ID..."
                    className="h-11"
                  />
                  {errors.frozenSemenId && (
                    <p className="text-sm text-destructive">{errors.frozenSemenId}</p>
                  )}
                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Snowflake className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">Frozen Semen</h4>
                          <p className="text-sm text-muted-foreground">External source</p>
                          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 mt-2">
                            Frozen
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Breeding Method (only for natural) */}
          {breedingType === 'natural' && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Breeding Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {breedingMethods.slice(0, 3).map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.value}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        breedingMethod === method.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                      onClick={() => setBreedingMethod(method.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            breedingMethod === method.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{method.label}</span>
                              {breedingMethod === method.value && (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mating Date */}
          <div className="space-y-2">
            <Label htmlFor="mating-date" className="text-base font-semibold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Mating Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mating-date"
              type="date"
              value={format(matingDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  setMatingDate(date);
                }
              }}
              className="h-11"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.matingDate && (
              <p className="text-sm text-destructive">{errors.matingDate}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this mating..."
              rows={3}
            />
          </div>

          {/* Info Box */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p className="text-muted-foreground">
                    After creating this mating record, you'll be able to enter progesterone readings,
                    run conception calculations, and track the pregnancy progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-gradient-brand hover:opacity-90"
          >
            {isLoading ? "Creating..." : "Create Mating Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
