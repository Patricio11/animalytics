"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AnimalCombobox } from "@/components/ui/animal-combobox";
import { ListingCategorySelector } from "./ListingCategorySelector";
import { ClinicSelector } from "./ClinicSelector";
import type { ListingCategory } from "@/lib/types/marketplace";
import { categoryRequiresClinic, getCategoryLabel } from "@/lib/utils/marketplace";
import { useRegionalSettings } from "@/lib/contexts/regional-settings-context";
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Plus, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MultipleImageUpload } from "@/components/upload";
import { STORAGE_PATHS } from "@/lib/supabase";

interface ListingFormData {
  // Step 1: Animal Selection
  category: ListingCategory;
  animalId?: string;
  frozenSemenId?: string;

  // Step 2: Contact Details
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactLocation: string;
  availabilityNotes?: string;

  // Step 3: Listing Details
  title: string;
  description: string;
  price?: number;
  clinicId?: string;

  // Step 4: Additional Images (optional)
  additionalImages?: string[];
}

const steps = [
  { id: 1, name: 'Animal Selection', icon: '🐕' },
  { id: 2, name: 'Contact Details', icon: '📞' },
  { id: 3, name: 'Listing Details', icon: '📝' },
  { id: 4, name: 'Listing Images', icon: '📸' },
];

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Callback to refresh marketplace data
}

export function CreateListingDialog({ open, onOpenChange, onSuccess }: CreateListingDialogProps) {
  const { toast } = useToast();
  const { settings } = useRegionalSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [selectedAnimalPhotoUrls, setSelectedAnimalPhotoUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    category: 'stud-dog',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactLocation: '',
    title: '',
    description: '',
    additionalImages: [],
  });

  // Fetch user's animals
  const { data: animalsData, isLoading: animalsLoading } = useQuery({
    queryKey: ['user-animals'],
    queryFn: async () => {
      const response = await fetch('/api/animals');
      if (!response.ok) throw new Error('Failed to fetch animals');
      return response.json();
    },
    enabled: open, // Only fetch when dialog is open
  });

  // Fetch user's active listings to filter out already listed animals
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listings'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/listings?userOnly=true');
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: open,
  });

  // Fetch breeder profile for contact details
  const { data: profileData } = useQuery({
    queryKey: ['breeder-profile'],
    queryFn: async () => {
      const response = await fetch('/api/breeder/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: open,
  });

  const allAnimals = animalsData?.data || [];
  const activeListings = listingsData?.listings || [];
  const profile = profileData?.profile;

  // Filter out animals that are already listed (have active listings)
  const listedAnimalIds = new Set(
    activeListings
      .filter((listing: any) => listing.status === 'active' && listing.animalId)
      .map((listing: any) => listing.animalId)
  );

  const availableAnimals = allAnimals.filter((animal: any) => !listedAnimalIds.has(animal.id));
  const animals = availableAnimals;

  // Pre-fill contact details from breeder profile or regional settings
  useEffect(() => {
    if (open) {
      setFormData(prev => {
        let contactLocation = prev.contactLocation;
        
        // Try profile location first
        if (profile?.location) {
          contactLocation = `${profile.location.city || ''}, ${profile.location.state || ''}, ${profile.location.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
        }
        // Fallback to regional settings if no profile location
        else if (settings && !contactLocation) {
          const locationParts = [];
          if (settings.city) locationParts.push(settings.city);
          if (settings.region) locationParts.push(settings.region);
          if (settings.country) locationParts.push(settings.country);
          contactLocation = locationParts.join(', ');
        }
        
        return {
          ...prev,
          contactName: profile?.displayName || prev.contactName,
          contactEmail: profile?.publicEmail || prev.contactEmail,
          contactPhone: profile?.publicPhone || prev.contactPhone,
          contactLocation,
        };
      });
    }
  }, [profile, settings, open]);

  const updateFormData = (field: keyof ListingFormData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // Category is always required
        if (!formData.category) return false;
        // For frozen-semen, require semen ID
        if (formData.category === 'frozen-semen') {
          return !!formData.frozenSemenId;
        }
        // For 'other' category, animal selection is optional
        if (formData.category === 'other') {
          return true;
        }
        // For all other categories, require animal selection
        return !!formData.animalId;
      case 2:
        return !!(
          formData.contactName &&
          formData.contactPhone &&
          formData.contactEmail &&
          formData.contactLocation
        );
      case 3:
        const basicValid = !!(formData.title && formData.description);
        if (categoryRequiresClinic(formData.category)) {
          return basicValid && !!formData.clinicId;
        }
        return basicValid;
      case 4:
        // Images are optional, always valid
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting listing with data:', formData);

      // Start with selected animal photos, then any already-uploaded images
      let uploadedImageUrls = [...selectedAnimalPhotoUrls, ...(formData.additionalImages || [])];
      if (pendingImageFiles.length > 0) {
        try {
          const { uploadMultipleFiles, FILE_VALIDATION } = await import('@/lib/supabase/upload');
          const results = await uploadMultipleFiles(
            pendingImageFiles,
            STORAGE_PATHS.MARKETPLACE_IMAGES,
            { ...FILE_VALIDATION.IMAGE, maxSizeInMB: 5 }
          );
          
          const successfulUploads = results.filter(r => r.success && r.url).map(r => r.url!);
          uploadedImageUrls = [...uploadedImageUrls, ...successfulUploads];
          
          if (results.some(r => !r.success)) {
            toast({
              title: "Image Upload Warning",
              description: `${results.filter(r => !r.success).length} image(s) failed to upload, but will continue creating listing.`,
              variant: "destructive",
            });
          }
        } catch (uploadError) {
          console.error('Failed to upload images:', uploadError);
          toast({
            title: "Image Upload Warning",
            description: "Some images could not be uploaded, but will continue creating listing.",
            variant: "destructive",
          });
        }
      }

      // Convert category from hyphen format to underscore format for database
      const categoryMap: Record<string, string> = {
        'dog-for-sale': 'dog_for_sale',
        'pups-for-sale': 'pups_for_sale',
        'frozen-semen': 'frozen_semen',
        'stud-dog': 'stud_dog',
        'other': 'other',
      };

      const submissionData = {
        ...formData,
        category: categoryMap[formData.category] || formData.category,
        currency: settings.currency, // Add owner's currency
        additionalImages: uploadedImageUrls, // Include all uploaded images
      };

      console.log('Converted submission data:', submissionData);

      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create listing');
      }

      toast({
        title: "Listing Created!",
        description: "Your listing has been successfully published to the marketplace.",
      });

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
      
      // Refresh marketplace data without full page reload
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPendingImageFiles([]); // Clear pending files
    setSelectedAnimalPhotoUrls([]);
    setFormData({
      category: 'stud-dog',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      contactLocation: '',
      title: '',
      description: '',
      additionalImages: [],
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedAnimal = animals.find((a: any) => a.id === formData.animalId);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Create Listing</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                List your animal or services in the marketplace
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all",
                    currentStep >= step.id
                      ? "bg-gradient-brand shadow-card"
                      : "bg-surface-secondary border-2 border-primary/20"
                  )}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.name}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-4 transition-all",
                    currentStep > step.id
                      ? "bg-gradient-brand"
                      : "bg-primary/20"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Animal Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select Animal & Category</h3>
                <p className="text-sm text-muted-foreground">
                  Choose what you want to list and select the appropriate category
                </p>
              </div>

              <ListingCategorySelector
                value={formData.category}
                onChange={(category) => {
                  updateFormData('category', category);
                  // Reset animal/semen selection when category changes
                  updateFormData('animalId', undefined);
                  updateFormData('frozenSemenId', undefined);
                }}
              />

              {/* Animal Selection - Only show for categories that need it */}
              {formData.category !== 'other' && (
                <div className="space-y-3">
                  <Label htmlFor="animal" className="text-sm font-medium">
                    {formData.category === 'frozen-semen' ? 'Frozen Semen ID *' : 'Select Animal *'}
                  </Label>
                  {formData.category === 'frozen-semen' ? (
                  <Input
                    id="frozen-semen"
                    placeholder="Enter frozen semen ID"
                    value={formData.frozenSemenId || ''}
                    onChange={(e) => updateFormData('frozenSemenId', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                ) : (
                  <>
                    <AnimalCombobox
                      animals={animals.map((animal: any) => ({
                        id: animal.id,
                        name: animal.name,
                        breed: animal.breed?.name,
                        profileImageUrl: animal.profileImageUrl,
                        sex: animal.sex,
                      }))}
                      value={formData.animalId}
                      onValueChange={(value) => {
                        updateFormData('animalId', value);
                        setSelectedAnimalPhotoUrls([]); // Reset photo selection when animal changes
                      }}
                      placeholder={animalsLoading || listingsLoading ? "Loading animals..." : "Select an animal"}
                      emptyText={
                        animalsLoading || listingsLoading 
                          ? "Loading..." 
                          : allAnimals.length === 0 
                            ? "No animals found. Add an animal first." 
                            : "All your animals are already listed. Remove a listing to create a new one."
                      }
                      disabled={false}
                      className="bg-background border-primary/20 focus:border-primary"
                    />
                    {allAnimals.length > 0 && animals.length === 0 && !animalsLoading && !listingsLoading && (
                      <Alert className="border-yellow-500/50 bg-yellow-500/10">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="ml-2 text-sm">
                          <strong>All animals already listed:</strong> You have {allAnimals.length} animal(s), but they all have active listings. You can only list each animal once at a time.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                  )}
                </div>
              )}

              {/* Selected Animal Preview */}
              {selectedAnimal && (
                <Alert className="border-chart-3/50 bg-chart-3/10">
                  <CheckCircle className="h-4 w-4 text-chart-3" />
                  <AlertDescription className="ml-2">
                    <strong>Selected:</strong> {selectedAnimal.name} - {selectedAnimal.breed?.name || 'Unknown Breed'}
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs">{selectedAnimal.sex === 'female' ? 'Female' : 'Male'}</Badge>
                      {selectedAnimal.dateOfBirth && (
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const birth = new Date(selectedAnimal.dateOfBirth);
                            const today = new Date();
                            const years = today.getFullYear() - birth.getFullYear();
                            return years > 0 ? `${years} years` : 'Less than 1 year';
                          })()}
                        </Badge>
                      )}
                      {selectedAnimal.color && (
                        <Badge variant="outline" className="text-xs">{selectedAnimal.color}</Badge>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!validateStep(1) && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm text-foreground">
                    {formData.category === 'frozen-semen' 
                      ? 'Please enter a frozen semen ID to continue'
                      : formData.category === 'other'
                      ? 'Please select a category to continue'
                      : 'Please select an animal to continue'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  Contact details pre-filled from your breeder profile. You can edit them if needed.
                </p>
              </div>

              {profile && (
                <Alert className="border-chart-3/50 bg-chart-3/10">
                  <CheckCircle className="h-4 w-4 text-chart-3" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>Info:</strong> These details are from your breeder profile and can be updated here for this listing only.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Name *</Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number *</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+61 xxx xxx xxx"
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData('contactPhone', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-location">Location *</Label>
                  <Input
                    id="contact-location"
                    placeholder="City, State"
                    value={formData.contactLocation}
                    onChange={(e) => updateFormData('contactLocation', e.target.value)}
                    className="bg-background border-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability-notes">Availability Notes</Label>
                <Textarea
                  id="availability-notes"
                  placeholder="E.g., Available weekdays after 5pm, prefer email contact first..."
                  rows={3}
                  value={formData.availabilityNotes || ''}
                  onChange={(e) => updateFormData('availabilityNotes', e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              {!validateStep(2) && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm text-foreground">
                    All fields marked with * are required
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Listing Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Listing Details</h3>
                <p className="text-sm text-muted-foreground">
                  Provide details about your listing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  placeholder="E.g., Champion Golden Retriever Stud - Max"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your listing in detail. Include health testing, temperament, achievements, etc."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ({settings.currency})</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => updateFormData('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="bg-background border-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if price is negotiable or by inquiry
                </p>
              </div>

              {/* Clinic Selector for Reproductive Services and Frozen Semen */}
              {categoryRequiresClinic(formData.category) && (
                <ClinicSelector
                  value={formData.clinicId}
                  onChange={(clinicId) => updateFormData('clinicId', clinicId)}
                  required
                />
              )}

              {!validateStep(3) && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm text-foreground">
                    {categoryRequiresClinic(formData.category)
                      ? 'Please fill in all required fields including clinic selection'
                      : 'Please fill in all required fields'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview */}
              <Alert className="border-primary/50 bg-gradient-subtle">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="ml-2">
                  <strong>Preview:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Category: <Badge variant="outline">{getCategoryLabel(formData.category)}</Badge></div>
                    <div>Title: {formData.title || 'Not set'}</div>
                    {formData.price && <div>Price: {formData.price.toLocaleString()} {settings.currency}</div>}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 4: Listing Images */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Listing Images</h3>
                <p className="text-sm text-muted-foreground">
                  Select images from your animal's gallery and/or upload new ones for this listing
                </p>
              </div>

              {/* Animal Photos Selection */}
              {selectedAnimal?.photos && selectedAnimal.photos.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {selectedAnimal.name}'s Photos
                    <Badge variant="outline" className="text-xs">
                      {selectedAnimalPhotoUrls.length} selected
                    </Badge>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Click to select which photos to include in your listing
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {selectedAnimal.photos.map((photo: any) => {
                      const isSelected = selectedAnimalPhotoUrls.includes(photo.fileUrl);
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setSelectedAnimalPhotoUrls(prev =>
                              isSelected
                                ? prev.filter(url => url !== photo.fileUrl)
                                : [...prev, photo.fileUrl]
                            );
                          }}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90",
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-muted hover:border-primary/40"
                          )}
                        >
                          <img
                            src={photo.fileUrl}
                            alt={photo.caption || selectedAnimal.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          {photo.category === 'profile' && (
                            <div className="absolute top-1 left-1">
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/80">Profile</Badge>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnimalPhotoUrls.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Select at least one photo so buyers can see your animal
                    </p>
                  )}
                </div>
              )}

              {/* No animal photos message */}
              {selectedAnimal && (!selectedAnimal.photos || selectedAnimal.photos.length === 0) && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="ml-2 text-sm">
                    <strong>No photos found</strong> for {selectedAnimal.name}. Upload images below for your listing.
                  </AlertDescription>
                </Alert>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground flex items-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    Upload Additional Images
                  </span>
                </div>
              </div>

              <MultipleImageUpload
                storagePath={STORAGE_PATHS.MARKETPLACE_IMAGES}
                onUploadSuccess={(results) => {
                  const urls = results.map(r => r.url!);
                  updateFormData('additionalImages', [...(formData.additionalImages || []), ...urls]);
                }}
                onPendingFilesChange={(files) => {
                  setPendingImageFiles(files);
                }}
                currentImages={formData.additionalImages || []}
                maxFiles={10}
                maxSizeInMB={5}
                label="Upload New Images"
                helperText="Upload facility photos, certificates, or other images not in your animal's gallery"
              />

              <Alert className="border-primary/50 bg-gradient-subtle">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="ml-2">
                  <strong>Ready to publish!</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Animal: {selectedAnimal?.name || 'Selected'}</div>
                    <div>Category: <Badge variant="outline">{getCategoryLabel(formData.category)}</Badge></div>
                    <div>Title: {formData.title}</div>
                    {formData.price && <div>Price: {formData.price.toLocaleString()} {settings.currency}</div>}
                    <div>Images: {selectedAnimalPhotoUrls.length + (formData.additionalImages?.length || 0)} selected</div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-primary/10">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="hover:bg-primary/10 hover:border-primary shadow-card"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-gradient-brand hover:opacity-90 shadow-card"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(3) || isSubmitting}
                className="bg-gradient-brand hover:opacity-90 shadow-card"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
