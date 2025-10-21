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
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, Check, CalendarIcon, ChevronsUpDown, Upload, X, ImageIcon, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  profilePhoto: File | null;
  profilePhotoPreview: string | null;
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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
    profilePhoto: null,
    profilePhotoPreview: animalData.imageUrl || null,
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
        profilePhoto: null,
        profilePhotoPreview: animalData.imageUrl || null,
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: file,
          profilePhotoPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    if (formData.profilePhotoPreview && formData.profilePhoto) {
      URL.revokeObjectURL(formData.profilePhotoPreview);
    }
    setFormData(prev => ({
      ...prev,
      profilePhoto: null,
      profilePhotoPreview: animalData.imageUrl || null
    }));
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

      // TODO: Handle photo upload if new photo selected
      // if (formData.profilePhoto) {
      //   const uploadedUrl = await uploadPhoto(formData.profilePhoto);
      //   updateData.profileImageUrl = uploadedUrl;
      // }

      await updateAnimalMutation.mutateAsync({
        id: animalId,
        data: updateData
      });

      toast({
        title: "Animal Updated Successfully!",
        description: `${formData.name} has been updated.`,
      });

      // Cleanup photo URL if it was a new upload
      if (formData.profilePhotoPreview && formData.profilePhoto) {
        URL.revokeObjectURL(formData.profilePhotoPreview);
      }

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
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              {!formData.profilePhotoPreview ? (
                <div className="relative">
                  <input
                    type="file"
                    id="edit-profile-photo"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-profile-photo"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/20 rounded-lg cursor-pointer hover:border-primary/40 hover:bg-surface-secondary transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-brand/10 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative flex flex-col items-center gap-3 p-4 border border-primary/10 rounded-lg bg-surface-secondary h-40 justify-center">
                  <Avatar className="w-20 h-20 border-2 border-primary/20">
                    <AvatarImage src={formData.profilePhotoPreview} alt="Profile preview" />
                    <AvatarFallback>
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePhoto}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </div>

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
            <Label>Date of Birth *</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-primary/20 hover:bg-surface-secondary",
                    !formData.dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  onSelect={(date) => {
                    updateFormData("dateOfBirth", date);
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
