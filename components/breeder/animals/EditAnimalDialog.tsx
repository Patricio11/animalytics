"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUpdateAnimal } from "@/lib/api/queries/animals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, Check, CalendarIcon, ChevronsUpDown, Upload, X, ImageIcon, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

interface EditAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalData: {
    name: string;
    sex: 'male' | 'female';
    breed: string;
    dateOfBirth: Date;
    color?: string;
    markings?: string;
    weight?: string;
    microchipId?: string;
    registrationNumber?: string;
    bloodline?: string;
    description?: string;
    location?: string;
    imageUrl?: string;
  };
}

interface AnimalFormData {
  profilePhotoUrl: string | null;
  name: string;
  type: 'dog' | 'bitch';
  breed: string;
  dateOfBirth: Date | undefined;
  color: string;
  markings: string;
  weight: string;
  microchipId: string;
  registrationNumber: string;
  bloodline: string;
  description: string;
  location: string;
}

// Fetch breeds from API
function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const response = await fetch('/api/breeds');
      if (!response.ok) throw new Error('Failed to fetch breeds');
      return response.json();
    },
  });
}

export function EditAnimalDialog({ open, onOpenChange, animalId, animalData }: EditAnimalDialogProps) {
  const { toast } = useToast();
  const [breedSearchOpen, setBreedSearchOpen] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch breeds from API
  const { data: breedsData, isLoading: breedsLoading } = useBreeds();
  const breeds = breedsData?.breeds || [];
  
  // Update animal mutation
  const updateAnimalMutation = useUpdateAnimal();
  
  // Filter breeds based on search
  const filteredBreeds = useMemo(() => {
    if (!breedSearch) return breeds;
    return breeds.filter((breed: any) => 
      breed.name.toLowerCase().includes(breedSearch.toLowerCase())
    );
  }, [breeds, breedSearch]);

  const [formData, setFormData] = useState<AnimalFormData>({
    profilePhotoUrl: animalData.imageUrl || null,
    name: animalData.name,
    type: animalData.sex === 'male' ? 'dog' : 'bitch',
    breed: animalData.breed,
    dateOfBirth: animalData.dateOfBirth,
    color: animalData.color || "",
    markings: animalData.markings || "",
    weight: animalData.weight || "",
    microchipId: animalData.microchipId || "",
    registrationNumber: animalData.registrationNumber || "",
    bloodline: animalData.bloodline || "",
    description: animalData.description || "",
    location: animalData.location || ""
  });

  // Update form when animalData changes
  useEffect(() => {
    if (open) {
      setFormData({
        profilePhotoUrl: animalData.imageUrl || null,
        name: animalData.name,
        type: animalData.sex === 'male' ? 'dog' : 'bitch',
        breed: animalData.breed,
        dateOfBirth: animalData.dateOfBirth,
        color: animalData.color || "",
        markings: animalData.markings || "",
        weight: animalData.weight || "",
        microchipId: animalData.microchipId || "",
        registrationNumber: animalData.registrationNumber || "",
        bloodline: animalData.bloodline || "",
        description: animalData.description || "",
        location: animalData.location || ""
      });
    }
  }, [open, animalData]);

  const updateFormData = (field: keyof AnimalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async () => {
    if (!formData.name || !formData.breed || !formData.dateOfBirth) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Sex, Breed, Date of Birth)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find breed ID
      const selectedBreed = breeds.find((b: any) => b.name === formData.breed);
      
      // Prepare update data
      const updateData: any = {
        name: formData.name,
        sex: formData.type === 'dog' ? 'male' : 'female',
        breedId: selectedBreed?.id,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        color: formData.color || undefined,
        markings: formData.markings || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        microchipNumber: formData.microchipId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        bio: formData.description || undefined,
      };

      await updateAnimalMutation.mutateAsync({
        id: animalId,
        data: updateData
      });

      // If profile photo was changed, update it in animal_photos table
      if (formData.profilePhotoUrl && formData.profilePhotoUrl !== animalData.imageUrl) {
        try {
          // First, delete existing profile photo if any
          const existingPhotos = await fetch(`/api/animals/${animalId}/photos?category=profile`);
          const photosData = await existingPhotos.json();
          
          if (photosData.photos && photosData.photos.length > 0) {
            // Delete old profile photo
            await fetch(`/api/animals/${animalId}/photos/${photosData.photos[0].id}`, {
              method: 'DELETE',
            });
          }

          // Add new profile photo
          await fetch(`/api/animals/${animalId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'profile',
              fileUrl: formData.profilePhotoUrl,
              fileName: 'profile-photo.jpg',
            }),
          });
        } catch (photoError) {
          console.error('Failed to update profile photo:', photoError);
          // Don't fail the whole operation if photo update fails
        }
      }

      toast({
        title: "Animal Updated Successfully!",
        description: `${formData.name} has been updated.`,
      });

      setIsSubmitting(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to update animal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update animal. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
              <DialogTitle className="text-2xl">Edit Animal</DialogTitle>
              <DialogDescription>
                Update {animalData.name}'s information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Photo and Animal Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Photo Upload */}
            <ImageUpload
              storagePath={STORAGE_PATHS.ANIMAL_PHOTOS}
              onUploadSuccess={(result) => {
                setFormData(prev => ({ ...prev, profilePhotoUrl: result.url! }));
              }}
              currentImageUrl={formData.profilePhotoUrl || undefined}
              label="Profile Photo"
              helperText="PNG, JPG up to 5MB"
              showPreview={true}
              aspectRatio="square"
              maxSizeInMB={5}
            />

            {/* Animal Name */}
            <div className="space-y-3 flex flex-col justify-center">
              <Label htmlFor="edit-name">Animal Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter animal name"
                className="bg-background border-primary/20 focus:border-primary text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Choose a unique name for your animal
              </p>
            </div>
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label>Sex *</Label>
            <RadioGroup value={formData.type} onValueChange={(value: 'dog' | 'bitch') => updateFormData("type", value)}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border-2 border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary hover:border-primary/30 transition-all">
                  <RadioGroupItem value="bitch" id="edit-bitch" />
                  <Label htmlFor="edit-bitch" className="flex-1 cursor-pointer font-medium">
                    ♀ Bitch (Female)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border-2 border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary hover:border-primary/30 transition-all">
                  <RadioGroupItem value="dog" id="edit-dog" />
                  <Label htmlFor="edit-dog" className="flex-1 cursor-pointer font-medium">
                    ♂ Dog (Male)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Breed */}
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

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="edit-dateOfBirth">Date of Birth *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="edit-dateOfBirth"
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

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                value={formData.color}
                onChange={(e) => updateFormData("color", e.target.value)}
                placeholder="e.g., Golden, Black, Brindle"
                className="bg-background border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-weight">Weight (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => updateFormData("weight", e.target.value)}
                placeholder="e.g., 25.5"
                className="bg-background border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-markings">Markings</Label>
            <Textarea
              id="edit-markings"
              value={formData.markings}
              onChange={(e) => updateFormData("markings", e.target.value)}
              placeholder="Describe any distinctive markings..."
              rows={2}
              className="bg-background border-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Additional information about the animal..."
              rows={3}
              className="bg-background border-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.breed || !formData.dateOfBirth}
            className="bg-gradient-brand hover:opacity-90 shadow-card"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
