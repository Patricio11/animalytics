"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCreateAnimal, useAnimals } from "@/lib/api/queries/animals";
import { useBreedPreferences } from "@/lib/api/queries/breed-preferences";
import { useBreeds } from "@/lib/api/queries/breeds";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, ArrowLeft, ArrowRight, Check, CalendarIcon, ChevronsUpDown, Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

interface AddAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnimalFormData {
  // Step 1: Basic Info & Photo
  profilePhotoUrl: string | null;
  name: string;
  registeredName: string;
  type: 'dog' | 'bitch';
  breed: string;
  dateOfBirth: Date | undefined;

  // Step 2: Physical Details
  color: string;
  markings: string;
  weight: string;

  // Step 3: Registration & Parentage
  microchipId: string;
  registrationNumber: string;
  
  // Parent selection mode
  sireMode: 'manual' | 'select';
  damMode: 'manual' | 'select';
  
  // For selecting from animals (if in system)
  sireId: string;
  damId: string;
  
  // For manual entry (if not in system)
  sireName: string;
  sireRegisteredName: string;
  damName: string;
  damRegisteredName: string;

  // Step 4: Additional Info
  description: string;
  location: string;
}

export function AddAnimalDialog({ open, onOpenChange }: AddAnimalDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [breedSearchOpen, setBreedSearchOpen] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllBreeds, setShowAllBreeds] = useState(false);
  
  // Form data state - must be declared before useMemo hooks that depend on it
  const [formData, setFormData] = useState<AnimalFormData>({
    profilePhotoUrl: null,
    name: "",
    registeredName: "",
    type: "bitch",
    breed: "",
    dateOfBirth: undefined,
    color: "",
    markings: "",
    weight: "",
    microchipId: "",
    registrationNumber: "",
    sireMode: "manual",
    damMode: "manual",
    sireId: "",
    damId: "",
    sireName: "",
    sireRegisteredName: "",
    damName: "",
    damRegisteredName: "",
    description: "",
    location: ""
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof AnimalFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch breeds and preferences
  const { data: allBreeds, isLoading: breedsLoading } = useBreeds();
  const { data: preferences } = useBreedPreferences();
  
  // Fetch user's animals for parent selection
  const { data: allAnimals } = useAnimals({ isActive: true });
  
  // Create animal mutation
  const createAnimalMutation = useCreateAnimal();
  
  // Get preferred breed IDs
  const preferredBreedIds = useMemo(() => {
    return preferences?.map(p => p.breedId) || [];
  }, [preferences]);
  
  // Filter and sort breeds: preferred first, then others
  const breeds = useMemo(() => {
    if (!allBreeds) return [];
    
    // If showing all breeds or no preferences, return all
    if (showAllBreeds || preferredBreedIds.length === 0) {
      return allBreeds;
    }
    
    // Only show preferred breeds
    return allBreeds.filter(breed => preferredBreedIds.includes(breed.id));
  }, [allBreeds, preferredBreedIds, showAllBreeds]);
  
  // Filter breeds based on search
  const filteredBreeds = useMemo(() => {
    if (!breedSearch) return breeds;
    return breeds.filter((breed: any) => 
      breed.name.toLowerCase().includes(breedSearch.toLowerCase())
    );
  }, [breeds, breedSearch]);
  
  // Filter animals for sire selection (males only, same breed if selected)
  const availableSires = useMemo(() => {
    if (!allAnimals) return [];
    
    // Get selected breed ID
    const selectedBreed = breeds.find((b: any) => b.name === formData.breed);
    const selectedBreedId = selectedBreed?.id;
    
    return allAnimals.filter((animal: any) => {
      const isMale = animal.sex === 'male';
      const breedMatches = !selectedBreedId || animal.breedId === selectedBreedId;
      return isMale && breedMatches;
    });
  }, [allAnimals, formData.breed, breeds]);
  
  // Filter animals for dam selection (females only, same breed if selected)
  const availableDams = useMemo(() => {
    if (!allAnimals) return [];
    
    // Get selected breed ID
    const selectedBreed = breeds.find((b: any) => b.name === formData.breed);
    const selectedBreedId = selectedBreed?.id;
    
    return allAnimals.filter((animal: any) => {
      const isFemale = animal.sex === 'female';
      const breedMatches = !selectedBreedId || animal.breedId === selectedBreedId;
      return isFemale && breedMatches;
    });
  }, [allAnimals, formData.breed, breeds]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Find the breed ID from the breed name
      const selectedBreed = breeds.find((b: any) => b.name === formData.breed);
      
      if (!selectedBreed) {
        toast({
          title: "Error",
          description: "Please select a valid breed.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Map form data to API format
      const animalData = {
        name: formData.name,
        registeredName: formData.registeredName || undefined,
        breedId: selectedBreed.id,
        sex: formData.type === 'dog' ? 'male' as const : 'female' as const,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : undefined,
        color: formData.color || undefined,
        markings: formData.markings || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        microchipNumber: formData.microchipId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        bio: formData.description || undefined,
        
        // Parent information - send based on mode
        sireId: formData.sireMode === 'select' ? formData.sireId || undefined : undefined,
        damId: formData.damMode === 'select' ? formData.damId || undefined : undefined,
        sireName: formData.sireMode === 'manual' ? formData.sireName || undefined : undefined,
        sireRegisteredName: formData.sireMode === 'manual' ? formData.sireRegisteredName || undefined : undefined,
        damName: formData.damMode === 'manual' ? formData.damName || undefined : undefined,
        damRegisteredName: formData.damMode === 'manual' ? formData.damRegisteredName || undefined : undefined,
      };

      // Create animal via API
      const createdAnimal = await createAnimalMutation.mutateAsync(animalData);

      // If profile photo was uploaded, save it to animal_photos table
      if (formData.profilePhotoUrl && createdAnimal?.id) {
        try {
          await fetch(`/api/animals/${createdAnimal.id}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'profile',
              fileUrl: formData.profilePhotoUrl,
              fileName: 'profile-photo.jpg',
            }),
          });
        } catch (photoError) {
          console.error('Failed to save profile photo:', photoError);
          // Don't fail the whole operation if photo save fails
        }
      }

      toast({
        title: "Animal Added Successfully!",
        description: `${formData.name} has been added to your animals.`,
      });

      // Reset and close
      setFormData({
        profilePhotoUrl: null,
        name: "",
        registeredName: "",
        type: "bitch",
        breed: "",
        dateOfBirth: undefined,
        color: "",
        markings: "",
        weight: "",
        microchipId: "",
        registrationNumber: "",
        sireMode: "manual",
        damMode: "manual",
        sireId: "",
        damId: "",
        sireName: "",
        sireRegisteredName: "",
        damName: "",
        damRegisteredName: "",
        description: "",
        location: ""
      });
      setCurrentStep(1);
      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create animal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add animal. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.type && formData.breed && formData.dateOfBirth;
      case 2:
        return formData.color && formData.markings && formData.weight; // Required fields
      case 3:
        // Validate parent selection based on mode
        const sireValid = formData.sireMode === 'select' 
          ? formData.sireId !== '' 
          : (formData.sireName !== '' && formData.sireRegisteredName !== '');
        const damValid = formData.damMode === 'select'
          ? formData.damId !== ''
          : (formData.damName !== '' && formData.damRegisteredName !== '');
        return sireValid && damValid;
      case 4:
        return formData.location !== ''; // Location is required
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-brand shadow-md">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Add New Animal</DialogTitle>
              <DialogDescription>
                Step {currentStep} of {totalSteps} - Fill in the animal details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator - Full Width */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between w-full">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center" style={{ flex: step < 4 ? '1' : '0 0 auto' }}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep >= step
                      ? "bg-gradient-brand text-white shadow-md"
                      : "bg-surface-secondary text-muted-foreground"
                  )}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={cn(
                      "h-1 mx-2 rounded transition-colors flex-1",
                      currentStep > step ? "bg-gradient-brand" : "bg-surface-secondary"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information & Photo */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Add a photo and essential details</p>
              </div>

              {/* Profile Photo Upload */}
              <ImageUpload
                storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
                onUploadSuccess={(result) => {
                  setFormData(prev => ({ ...prev, profilePhotoUrl: result.url! }));
                }}
                currentImageUrl={formData.profilePhotoUrl || undefined}
                label="Profile Photo (Optional)"
                helperText="PNG, JPG up to 5MB"
                showPreview={true}
                aspectRatio="square"
                maxSizeInMB={5}
              />

              {/* Animal Names - Side by Side */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Call Name) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="e.g., Max"
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registeredName">Registered Name</Label>
                    <Input
                      id="registeredName"
                      value={formData.registeredName}
                      onChange={(e) => updateFormData("registeredName", e.target.value)}
                      placeholder="e.g., Champion Goldcrest's Maximus Rex"
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Call name is for everyday use. Registered name is the official kennel club name (optional).
                </p>
              </div>

              <div className="space-y-2">
                <Label>Sex *</Label>
                <RadioGroup value={formData.type} onValueChange={(value: 'dog' | 'bitch') => updateFormData("type", value)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border-2 border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary hover:border-primary/30 transition-all">
                      <RadioGroupItem value="bitch" id="bitch" />
                      <Label htmlFor="bitch" className="flex-1 cursor-pointer font-medium">
                        ♀ Bitch (Female)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border-2 border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary hover:border-primary/30 transition-all">
                      <RadioGroupItem value="dog" id="dog" />
                      <Label htmlFor="dog" className="flex-1 cursor-pointer font-medium">
                        ♂ Dog (Male)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Breed * <span className="text-xs text-muted-foreground">({breeds.length} {showAllBreeds || preferredBreedIds.length === 0 ? 'breeds' : 'preferred breeds'})</span></Label>
                  {preferredBreedIds.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllBreeds(!showAllBreeds)}
                      className="text-xs h-7"
                    >
                      {showAllBreeds ? '✨ Show Preferred' : '🌍 Show All'}
                    </Button>
                  )}
                </div>
                <Popover open={breedSearchOpen} onOpenChange={setBreedSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={breedSearchOpen}
                      className="w-full justify-between bg-background border-primary/20 hover:bg-surface-secondary"
                      disabled={breedsLoading}
                    >
                      {breedsLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading breeds...
                        </span>
                      ) : formData.breed ? (
                        formData.breed
                      ) : (
                        "Search breed..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search breed..." 
                        value={breedSearch}
                        onValueChange={setBreedSearch}
                      />
                      <CommandList>
                        {filteredBreeds.length === 0 ? (
                          <CommandEmpty>
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">No breed found.</p>
                              {!showAllBreeds && preferredBreedIds.length > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowAllBreeds(true)}
                                  className="text-xs"
                                >
                                  Show all breeds
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {filteredBreeds.map((breed: any) => (
                              <CommandItem
                                key={breed.id}
                                value={breed.name}
                                onSelect={() => {
                                  updateFormData("breed", breed.name);
                                  setBreedSearchOpen(false);
                                  setBreedSearch("");
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.breed === breed.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="font-medium">{breed.name}</div>
                                  {breed.sizeCategory && (
                                    <div className="text-xs text-muted-foreground capitalize">
                                      {breed.sizeCategory} breed
                                    </div>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? format(formData.dateOfBirth, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        updateFormData("dateOfBirth", new Date(dateValue));
                      } else {
                        updateFormData("dateOfBirth", undefined);
                      }
                    }}
                    max={format(new Date(), "yyyy-MM-dd")}
                    min="1990-01-01"
                    className="pl-10 bg-background border-primary/20 focus:border-primary [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:bg-primary/10 [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1"
                  />
                </div>
                {formData.dateOfBirth && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {format(formData.dateOfBirth, "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Physical Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Physical Details</h3>
                <p className="text-sm text-muted-foreground">Essential information about your animal</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateFormData("color", e.target.value)}
                  placeholder="e.g., Black, Brown, White"
                  className="bg-background border-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markings">Markings *</Label>
                <Input
                  id="markings"
                  value={formData.markings}
                  onChange={(e) => updateFormData("markings", e.target.value)}
                  placeholder="e.g., White chest, Black mask"
                  className="bg-background border-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  className="bg-background border-primary/20"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Registration & Parentage */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Registration & Parentage</h3>
                <p className="text-sm text-muted-foreground">Official registration and parent information</p>
              </div>

              {/* Registration Numbers - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="microchipId">Microchip ID</Label>
                  <Input
                    id="microchipId"
                    value={formData.microchipId}
                    onChange={(e) => updateFormData("microchipId", e.target.value)}
                    placeholder="Enter microchip number"
                    className="bg-background border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                    placeholder="Kennel club number"
                    className="bg-background border-primary/20"
                  />
                </div>
              </div>

              {/* Sire (Father) Information - Fieldset */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Sire (Father) *</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.sireMode} 
                  onValueChange={(value: 'manual' | 'select') => {
                    updateFormData("sireMode", value);
                    // Clear fields when switching modes
                    if (value === 'manual') {
                      updateFormData("sireId", "");
                    } else {
                      updateFormData("sireName", "");
                      updateFormData("sireRegisteredName", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="sire-manual" />
                      <Label htmlFor="sire-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="select" id="sire-select" />
                      <Label htmlFor="sire-select" className="font-normal cursor-pointer">
                        Select from my animals ({availableSires.length})
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.sireMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sireName">Name *</Label>
                      <Input
                        id="sireName"
                        value={formData.sireName}
                        onChange={(e) => updateFormData("sireName", e.target.value)}
                        placeholder="e.g., Max"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sireRegisteredName">Registered Name *</Label>
                      <Input
                        id="sireRegisteredName"
                        value={formData.sireRegisteredName}
                        onChange={(e) => updateFormData("sireRegisteredName", e.target.value)}
                        placeholder="e.g., Champion Goldcrest's Maximus Rex"
                        className="bg-background border-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Select from Animals */}
                {formData.sireMode === 'select' && (
                  <div className="space-y-2">
                    <Label htmlFor="sireId">Select Sire *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-background border-primary/20"
                        >
                          {formData.sireId ? (
                            availableSires.find((a: any) => a.id === formData.sireId)?.name || "Select sire..."
                          ) : (
                            "Select sire..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search sires..." className="h-9" />
                          <CommandList>
                            {availableSires.length === 0 ? (
                              <CommandEmpty className="py-6 text-center text-sm">No male animals found. Add a male animal first.</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {availableSires.map((animal: any) => (
                                  <CommandItem
                                    key={animal.id}
                                    value={animal.id}
                                    onSelect={() => updateFormData("sireId", animal.id)}
                                    className="px-3 py-3"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-3 h-4 w-4 shrink-0",
                                        formData.sireId === animal.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span className="font-medium truncate">{animal.name}</span>
                                      {animal.registeredName && (
                                        <span className="text-xs text-muted-foreground truncate">{animal.registeredName}</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </fieldset>

              {/* Dam (Mother) Information - Fieldset */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Dam (Mother) *</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.damMode} 
                  onValueChange={(value: 'manual' | 'select') => {
                    updateFormData("damMode", value);
                    // Clear fields when switching modes
                    if (value === 'manual') {
                      updateFormData("damId", "");
                    } else {
                      updateFormData("damName", "");
                      updateFormData("damRegisteredName", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="dam-manual" />
                      <Label htmlFor="dam-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="select" id="dam-select" />
                      <Label htmlFor="dam-select" className="font-normal cursor-pointer">
                        Select from my animals ({availableDams.length})
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.damMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="damName">Name *</Label>
                      <Input
                        id="damName"
                        value={formData.damName}
                        onChange={(e) => updateFormData("damName", e.target.value)}
                        placeholder="e.g., Bella"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="damRegisteredName">Registered Name *</Label>
                      <Input
                        id="damRegisteredName"
                        value={formData.damRegisteredName}
                        onChange={(e) => updateFormData("damRegisteredName", e.target.value)}
                        placeholder="e.g., Grand Champion Silverstone's Bella Luna"
                        className="bg-background border-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Select from Animals */}
                {formData.damMode === 'select' && (
                  <div className="space-y-2">
                    <Label htmlFor="damId">Select Dam *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-background border-primary/20"
                        >
                          {formData.damId ? (
                            availableDams.find((a: any) => a.id === formData.damId)?.name || "Select dam..."
                          ) : (
                            "Select dam..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search dams..." className="h-9" />
                          <CommandList>
                            {availableDams.length === 0 ? (
                              <CommandEmpty className="py-6 text-center text-sm">No female animals found. Add a female animal first.</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {availableDams.map((animal: any) => (
                                  <CommandItem
                                    key={animal.id}
                                    value={animal.id}
                                    onSelect={() => updateFormData("damId", animal.id)}
                                    className="px-3 py-3"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-3 h-4 w-4 shrink-0",
                                        formData.damId === animal.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span className="font-medium truncate">{animal.name}</span>
                                      {animal.registeredName && (
                                        <span className="text-xs text-muted-foreground truncate">{animal.registeredName}</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </fieldset>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                <p className="text-sm text-muted-foreground">Location is required for your animal profile</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="City, State"
                  className="bg-background border-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Add any additional notes about this animal..."
                  rows={4}
                  className="bg-background border-primary/20"
                />
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-subtle border border-primary/10">
                <h4 className="font-semibold mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{formData.type === 'bitch' ? 'Bitch (Female)' : 'Dog (Male)'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breed:</span>
                    <span className="font-medium">{formData.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="font-medium">
                      {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="hover:bg-surface-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Add Animal
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}