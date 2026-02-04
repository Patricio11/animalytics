"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
import { DatePicker } from "@/components/ui/date-picker";
import { PawPrint, ArrowLeft, ArrowRight, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

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
  height: string;

  // Step 3: Registration & Parentage
  microchipId: string;
  registrationNumber: string;
  dndProfileNumber: string;
  
  // Breeder information
  breederMode: 'account_owner' | 'manual';
  breederName: string;
  breederRegistrationNumber: string;
  
  // Owner information
  ownerMode: 'account_owner' | 'manual';
  ownerName: string;
  ownerRegistrationNumber: string;
  
  // Parent information
  sireMode: 'none' | 'manual';
  damMode: 'none' | 'manual';
  sireRegistrationNumber: string;
  sireRegisteredName: string;
  damRegistrationNumber: string;
  damRegisteredName: string;

  // Step 4: Additional Info
  description: string;
  location: string;
}

interface AdminAddAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  animalId?: string;
  initialData?: Partial<AnimalFormData> & { breedId?: string };
  mode?: 'create' | 'edit';
}

export function AdminAddAnimalDialog({ open, onOpenChange, userId, userName, animalId, initialData, mode = 'create' }: AdminAddAnimalDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [breedSearchOpen, setBreedSearchOpen] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  
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
    height: "",
    microchipId: "",
    registrationNumber: "",
    dndProfileNumber: "",
    breederMode: "account_owner",
    breederName: "",
    breederRegistrationNumber: "",
    ownerMode: "account_owner",
    ownerName: "",
    ownerRegistrationNumber: "",
    sireMode: "none",
    damMode: "none",
    sireRegistrationNumber: "",
    sireRegisteredName: "",
    damRegistrationNumber: "",
    damRegisteredName: "",
    description: "",
    location: "",
  });

  const totalSteps = 4;

  // Populate form data when editing
  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      setFormData({
        profilePhotoUrl: initialData.profilePhotoUrl || null,
        name: initialData.name || '',
        registeredName: initialData.registeredName || '',
        type: initialData.type || 'bitch',
        breed: initialData.breed || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
        color: initialData.color || '',
        markings: initialData.markings || '',
        weight: initialData.weight || '',
        height: initialData.height || '',
        microchipId: initialData.microchipId || '',
        registrationNumber: initialData.registrationNumber || '',
        dndProfileNumber: (initialData as any).dndProfileNumber || '',
        breederMode: initialData.breederName ? 'manual' : 'account_owner',
        breederName: initialData.breederName || '',
        breederRegistrationNumber: (initialData as any).breederRegistrationNumber || '',
        ownerMode: initialData.ownerName ? 'manual' : 'account_owner',
        ownerName: initialData.ownerName || '',
        ownerRegistrationNumber: (initialData as any).ownerRegistrationNumber || '',
        sireMode: (initialData as any).sireRegisteredName ? 'manual' : 'none',
        damMode: (initialData as any).damRegisteredName ? 'manual' : 'none',
        sireRegistrationNumber: (initialData as any).sireRegistrationNumber || '',
        sireRegisteredName: (initialData as any).sireRegisteredName || '',
        damRegistrationNumber: (initialData as any).damRegistrationNumber || '',
        damRegisteredName: (initialData as any).damRegisteredName || '',
        description: initialData.description || '',
        location: (initialData as any).location || '',
      });
    } else if (open && mode === 'create') {
      // Reset form for create mode
      setFormData({
        profilePhotoUrl: null,
        name: '',
        registeredName: '',
        type: 'bitch',
        breed: '',
        dateOfBirth: undefined,
        color: '',
        markings: '',
        weight: '',
        height: '',
        microchipId: '',
        registrationNumber: '',
        dndProfileNumber: '',
        breederMode: 'account_owner',
        breederName: '',
        breederRegistrationNumber: '',
        ownerMode: 'account_owner',
        ownerName: '',
        ownerRegistrationNumber: '',
        sireMode: 'none',
        damMode: 'none',
        sireRegistrationNumber: '',
        sireRegisteredName: '',
        damRegistrationNumber: '',
        damRegisteredName: '',
        description: '',
        location: '',
      });
      setCurrentStep(1);
      setPendingImageFile(null);
    }
  }, [open, mode, initialData]);

  const updateFormData = (field: keyof AnimalFormData, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch breeds
  const { data: allBreeds, isLoading: breedsLoading } = useBreeds();
  
  // Filter breeds based on search
  const filteredBreeds = useMemo(() => {
    if (!allBreeds) return [];
    if (!breedSearch) return allBreeds;
    return allBreeds.filter((breed: any) => 
      breed.name.toLowerCase().includes(breedSearch.toLowerCase())
    );
  }, [allBreeds, breedSearch]);

  // Create/Update animal mutation using admin API
  const saveAnimalMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = mode === 'edit' && animalId
        ? `/api/admin/users/${userId}/animals/${animalId}`
        : `/api/admin/users/${userId}/animals`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${mode} animal`);
      }
      return res.json();
    },
  });

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

      // If there's a pending image file, upload it first
      let uploadedImageUrl = formData.profilePhotoUrl;
      if (pendingImageFile) {
        try {
          const { uploadFile, FILE_VALIDATION } = await import('@/lib/supabase/upload');
          const result = await uploadFile(
            pendingImageFile,
            STORAGE_PATHS.ANIMAL_PHOTOS,
            { ...FILE_VALIDATION.IMAGE, maxSizeInMB: 5 }
          );
          
          if (result.success && result.url) {
            uploadedImageUrl = result.url;
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
        }
      }

      // Find the breed ID from the breed name
      const selectedBreed = allBreeds?.find((b: any) => b.name === formData.breed);
      
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
        dateOfBirth: formData.dateOfBirth 
          ? `${formData.dateOfBirth.getFullYear()}-${String(formData.dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(formData.dateOfBirth.getDate()).padStart(2, '0')}`
          : undefined,
        color: formData.color || undefined,
        markings: formData.markings || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        microchipNumber: formData.microchipId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        dndProfileNumber: formData.dndProfileNumber || undefined,
        
        // Breeder information - send based on mode
        breederMode: formData.breederMode,
        breederName: formData.breederMode === 'manual' ? formData.breederName || undefined : undefined,
        breederRegistrationNumber: formData.breederMode === 'manual' ? formData.breederRegistrationNumber || undefined : undefined,
        
        // Owner information - send based on mode
        ownerMode: formData.ownerMode,
        ownerName: formData.ownerMode === 'manual' ? formData.ownerName || undefined : undefined,
        ownerRegistrationNumber: formData.ownerMode === 'manual' ? formData.ownerRegistrationNumber || undefined : undefined,
        
        // Parent information - send based on mode
        sireRegistrationNumber: formData.sireMode === 'manual' ? formData.sireRegistrationNumber || undefined : undefined,
        sireRegisteredName: formData.sireMode === 'manual' ? formData.sireRegisteredName || undefined : undefined,
        damRegistrationNumber: formData.damMode === 'manual' ? formData.damRegistrationNumber || undefined : undefined,
        damRegisteredName: formData.damMode === 'manual' ? formData.damRegisteredName || undefined : undefined,
        
        profileImageUrl: uploadedImageUrl || undefined,
        bio: formData.description || undefined,
        location: formData.location || undefined,
      };

      // Create or update animal via admin API
      const savedAnimal = await saveAnimalMutation.mutateAsync(animalData);

      // If profile photo was uploaded, save it to animal_photos table (only for create mode)
      const finalAnimalId = mode === 'edit' ? animalId : savedAnimal?.animal?.id;
      if (uploadedImageUrl && finalAnimalId && mode === 'create') {
        try {
          await fetch(`/api/animals/${finalAnimalId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'profile',
              fileUrl: uploadedImageUrl,
              fileName: 'profile-photo.jpg',
            }),
          });
        } catch (photoError) {
          console.error('Failed to save profile photo:', photoError);
        }
      }

      // Invalidate queries to refresh animal data
      await queryClient.invalidateQueries({ queryKey: ['admin-user-animals', userId] });

      toast({
        title: mode === 'edit' ? "Animal Updated Successfully!" : "Animal Added Successfully!",
        description: mode === 'edit' 
          ? `${formData.name} has been updated.`
          : `${formData.name} has been added to ${userName}'s animals.`,
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
        height: "",
        microchipId: "",
        registrationNumber: "",
        dndProfileNumber: "",
        breederMode: "account_owner",
        breederName: "",
        breederRegistrationNumber: "",
        ownerMode: "account_owner",
        ownerName: "",
        ownerRegistrationNumber: "",
        sireMode: "none",
        damMode: "none",
        sireRegistrationNumber: "",
        sireRegisteredName: "",
        damRegistrationNumber: "",
        damRegisteredName: "",
        description: "",
        location: "",
      });
      setCurrentStep(1);
      setPendingImageFile(null);
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
        return formData.color && formData.markings && formData.weight;
      case 3:
        return true; // Registration fields are optional
      case 4:
        return true; // Description is optional
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
              <DialogTitle className="text-2xl">
                {mode === 'edit' ? `Edit ${initialData?.name || 'Animal'}` : `Add Animal for ${userName}`}
              </DialogTitle>
              <DialogDescription>
                Step {currentStep} of {totalSteps} - Fill in the animal details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
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
              <div className="max-w-[200px]">
                <ImageUpload
                  storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
                  onUploadSuccess={(result) => {
                    setFormData(prev => ({ ...prev, profilePhotoUrl: result.url! }));
                    setPendingImageFile(null);
                  }}
                  onFileSelect={(file) => {
                    setPendingImageFile(file);
                  }}
                  currentImageUrl={formData.profilePhotoUrl || undefined}
                  label="Profile Photo (Optional)"
                  helperText="PNG, JPG up to 5MB."
                  showPreview={true}
                  aspectRatio="square"
                  maxSizeInMB={5}
                  hideUploadButton={true}
                />
              </div>

              {/* Animal Names */}
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
                <Label>Breed *</Label>
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
                          <CommandEmpty>No breed found.</CommandEmpty>
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
                <DatePicker
                  date={formData.dateOfBirth}
                  onDateChange={(date) => updateFormData("dateOfBirth", date)}
                  placeholder="Select date of birth"
                  maxDate={new Date()}
                />
                {formData.dateOfBirth && (
                  <p className="text-xs text-muted-foreground">
                    Age: {Math.floor((new Date().getTime() - formData.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years old
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
                <p className="text-sm text-muted-foreground">Essential information about the animal</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                    placeholder="Enter weight in kg"
                    className="bg-background border-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => updateFormData("height", e.target.value)}
                    placeholder="Height at shoulder"
                    className="bg-background border-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Registration & Parentage */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Registration & Parentage</h3>
                <p className="text-sm text-muted-foreground">Official registration and parent information</p>
              </div>

              {/* Registration Numbers - Grid Layout */}
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

                <div className="space-y-2">
                  <Label htmlFor="dndProfileNumber">DND Profile No.</Label>
                  <Input
                    id="dndProfileNumber"
                    value={formData.dndProfileNumber}
                    onChange={(e) => updateFormData("dndProfileNumber", e.target.value)}
                    placeholder="DND profile number"
                    className="bg-background border-primary/20"
                  />
                </div>
              </div>

              {/* Breeder Information - Fieldset */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Breeder</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.breederMode} 
                  onValueChange={(value: 'account_owner' | 'manual') => {
                    updateFormData("breederMode", value);
                    if (value === 'account_owner') {
                      updateFormData("breederName", "");
                      updateFormData("breederRegistrationNumber", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="account_owner" id="breeder-account" />
                      <Label htmlFor="breeder-account" className="font-normal cursor-pointer">
                        Account owner ({userName})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="breeder-manual" />
                      <Label htmlFor="breeder-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.breederMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breederName">Breeder Name</Label>
                      <Input
                        id="breederName"
                        value={formData.breederName}
                        onChange={(e) => updateFormData("breederName", e.target.value)}
                        placeholder="e.g., John Smith Kennels"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breederRegistrationNumber">Registration Number</Label>
                      <Input
                        id="breederRegistrationNumber"
                        value={formData.breederRegistrationNumber}
                        onChange={(e) => updateFormData("breederRegistrationNumber", e.target.value)}
                        placeholder="e.g., AKC-BREEDER-123"
                        className="bg-background border-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Account Owner Mode - Show confirmation */}
                {formData.breederMode === 'account_owner' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      ✓ {userName} will be recorded as the breeder of this animal.
                    </p>
                  </div>
                )}
              </fieldset>

              {/* Owner Information - Fieldset */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Owner</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.ownerMode} 
                  onValueChange={(value: 'account_owner' | 'manual') => {
                    updateFormData("ownerMode", value);
                    if (value === 'account_owner') {
                      updateFormData("ownerName", "");
                      updateFormData("ownerRegistrationNumber", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="account_owner" id="owner-account" />
                      <Label htmlFor="owner-account" className="font-normal cursor-pointer">
                        Account owner ({userName})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="owner-manual" />
                      <Label htmlFor="owner-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.ownerMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => updateFormData("ownerName", e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerRegistrationNumber">Registration Number</Label>
                      <Input
                        id="ownerRegistrationNumber"
                        value={formData.ownerRegistrationNumber}
                        onChange={(e) => updateFormData("ownerRegistrationNumber", e.target.value)}
                        placeholder="e.g., AKC-OWNER-456"
                        className="bg-background border-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Account Owner Mode - Show confirmation */}
                {formData.ownerMode === 'account_owner' && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      ✓ {userName} will be recorded as the owner of this animal.
                    </p>
                  </div>
                )}
              </fieldset>

              {/* Sire (Father) Information */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Sire (Father)</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.sireMode} 
                  onValueChange={(value: 'none' | 'manual') => {
                    updateFormData("sireMode", value);
                    if (value === 'none') {
                      updateFormData("sireRegistrationNumber", "");
                      updateFormData("sireRegisteredName", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="sire-none" />
                      <Label htmlFor="sire-none" className="font-normal cursor-pointer">
                        Unknown / Not specified
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="sire-manual" />
                      <Label htmlFor="sire-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.sireMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sireRegisteredName">Registered Name</Label>
                      <Input
                        id="sireRegisteredName"
                        value={formData.sireRegisteredName}
                        onChange={(e) => updateFormData("sireRegisteredName", e.target.value)}
                        placeholder="e.g., Champion Goldcrest's Maximus Rex"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sireRegistrationNumber">Registration Number</Label>
                      <Input
                        id="sireRegistrationNumber"
                        value={formData.sireRegistrationNumber}
                        onChange={(e) => updateFormData("sireRegistrationNumber", e.target.value)}
                        placeholder="e.g., AKC-12345678"
                        className="bg-background border-primary/20"
                      />
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Dam (Mother) Information */}
              <fieldset className="border border-primary/20 rounded-lg p-4 bg-muted/20">
                <legend className="text-sm font-semibold px-2 text-primary">Dam (Mother)</legend>
                
                {/* Mode Selection */}
                <RadioGroup 
                  value={formData.damMode} 
                  onValueChange={(value: 'none' | 'manual') => {
                    updateFormData("damMode", value);
                    if (value === 'none') {
                      updateFormData("damRegistrationNumber", "");
                      updateFormData("damRegisteredName", "");
                    }
                  }}
                  className="mb-4"
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="dam-none" />
                      <Label htmlFor="dam-none" className="font-normal cursor-pointer">
                        Unknown / Not specified
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="dam-manual" />
                      <Label htmlFor="dam-manual" className="font-normal cursor-pointer">
                        Enter manually
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Manual Entry */}
                {formData.damMode === 'manual' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="damRegisteredName">Registered Name</Label>
                      <Input
                        id="damRegisteredName"
                        value={formData.damRegisteredName}
                        onChange={(e) => updateFormData("damRegisteredName", e.target.value)}
                        placeholder="e.g., Champion Goldcrest's Bella Rose"
                        className="bg-background border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="damRegistrationNumber">Registration Number</Label>
                      <Input
                        id="damRegistrationNumber"
                        value={formData.damRegistrationNumber}
                        onChange={(e) => updateFormData("damRegistrationNumber", e.target.value)}
                        placeholder="e.g., AKC-87654321"
                        className="bg-background border-primary/20"
                      />
                    </div>
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
                <p className="text-sm text-muted-foreground">Location and additional notes</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="e.g., Cape Town, Western Cape, South Africa"
                  className="bg-background border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  City, Region, Country - Used for filtering and search
                </p>
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
                  {mode === 'edit' ? 'Update Animal' : 'Add Animal'}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
