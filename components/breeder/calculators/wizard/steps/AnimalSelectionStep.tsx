"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AnimalCombobox, AnimalOption } from "@/components/ui/animal-combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Globe, Info, CheckCircle2, Snowflake } from "lucide-react";
import { useAnimals } from "@/lib/api/queries/animals";
import { WizardData } from "@/lib/types/wizard";
import { getBreedRating } from "@/lib/mock-data/conception-factors";
import { cn } from "@/lib/utils";

interface AnimalSelectionStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
}

export function AnimalSelectionStep({ data, onUpdate, onNext }: AnimalSelectionStepProps) {
  const { data: myAnimalsData } = useAnimals();
  const myAnimals = myAnimalsData || [];

  const [bitchId, setBitchId] = useState(data?.bitchId || "");
  const [dogId, setDogId] = useState(data?.dogId || "");
  const [useFrozenSemen, setUseFrozenSemen] = useState(data?.useFrozenSemen || false);
  const [frozenSemenId, setFrozenSemenId] = useState(data?.frozenSemenId || "");
  
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
      const result = await response.json();
      return result.partners || [];
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
    breed: animal.breed?.name || animal.breedName,
    profileImageUrl: animal.profileImageUrl,
    sex: animal.sex,
  }));

  const dogs = dogsSource.map((animal: any) => ({
    id: animal.id,
    name: animal.name,
    breed: animal.breed?.name || animal.breedName,
    profileImageUrl: animal.profileImageUrl,
    sex: animal.sex,
  }));

  const selectedBitch = bitchesSource.find((a: any) => a.id === bitchId);
  const selectedDog = dogsSource.find((a: any) => a.id === dogId);

  const getAnimalInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleContinue = () => {
    if (!bitchId || (!dogId && !useFrozenSemen)) {
      return;
    }

    const bitchBreed = selectedBitch?.breed?.name || selectedBitch?.breedName || "Unknown";
    const dogBreed = selectedDog?.breed?.name || selectedDog?.breedName || "Unknown";
    
    const bitchBreedRating = getBreedRating(bitchBreed);
    const dogBreedRating = getBreedRating(dogBreed);
    const averageRating = (bitchBreedRating + dogBreedRating) / 2;

    onUpdate({
      bitchId,
      dogId: useFrozenSemen ? undefined : dogId,
      useFrozenSemen,
      frozenSemenId: useFrozenSemen ? frozenSemenId : undefined,
      bitchBreed,
      dogBreed,
      bitchBreedRating,
      dogBreedRating,
      breedRating: averageRating,
      // Store selected animal data for later steps
      selectedBitch,
      selectedDog: useFrozenSemen ? null : selectedDog,
    });
    onNext();
  };

  const canContinue = bitchId && (dogId || useFrozenSemen);

  return (
    <div className="space-y-6">
      {/* Animal Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitch Selection */}
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
                    <h4 className="font-semibold text-lg">{selectedBitch.registeredName || selectedBitch.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedBitch.breed?.name || selectedBitch.breedName || 'Unknown breed'}</p>
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

        {/* Dog Selection or Frozen Semen */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-blue-500" />
              Select Dog <span className="text-destructive">*</span>
            </Label>
            {!useFrozenSemen && (
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
            )}
          </div>

          {!useFrozenSemen ? (
            <>
              <AnimalCombobox
                animals={dogs}
                value={dogId}
                onValueChange={setDogId}
                placeholder={searchAllDogs ? "Search all dogs in system..." : "Choose from your dogs..."}
                emptyText={searchAllDogs ? "No dogs found in system." : "No male animals found. Add a dog first."}
                disabled={loadingAllAnimals}
              />
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
                        <h4 className="font-semibold text-lg">{selectedDog.registeredName || selectedDog.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedDog.breed?.name || selectedDog.breedName || 'Unknown breed'}</p>
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
          )}

          {/* Frozen Semen Toggle */}
          <div className="flex items-center space-x-2 p-3 rounded-lg border border-primary/10 bg-background">
            <input
              type="checkbox"
              id="use-frozen"
              checked={useFrozenSemen}
              onChange={(e) => {
                setUseFrozenSemen(e.target.checked);
                if (e.target.checked) {
                  setDogId("");
                }
              }}
              className="w-4 h-4 text-primary"
            />
            <Label htmlFor="use-frozen" className="flex-1 cursor-pointer text-sm">
              Use Frozen Semen Instead
            </Label>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {canContinue && (
        <Alert className="border-chart-3/50 bg-chart-3/10">
          <CheckCircle2 className="h-4 w-4 text-chart-3" />
          <AlertDescription className="ml-2">
            Animals selected. Continue to provide more details about the breeding pair.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!canContinue}
          className="bg-gradient-brand hover:opacity-90 shadow-card"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
