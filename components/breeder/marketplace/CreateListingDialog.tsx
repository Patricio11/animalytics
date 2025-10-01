"use client";

import { useState } from "react";
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
import { ListingCategorySelector } from "./ListingCategorySelector";
import { ClinicSelector } from "./ClinicSelector";
import { ListingCategory, categoryRequiresClinic, getCategoryLabel } from "@/lib/mock-data/marketplace-listings";
import { mockAnimals } from "@/data/mockData";
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
}

const steps = [
  { id: 1, name: 'Animal Selection', icon: '🐕' },
  { id: 2, name: 'Contact Details', icon: '📞' },
  { id: 3, name: 'Listing Details', icon: '📝' },
];

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingDialog({ open, onOpenChange }: CreateListingDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    category: 'stud-dog',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactLocation: '',
    title: '',
    description: '',
  });

  const updateFormData = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (formData.category === 'frozen-semen') {
          return !!formData.frozenSemenId;
        }
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
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Here you would normally save the listing
      console.log('Listing created:', formData);

      toast({
        title: "Listing Created!",
        description: "Your listing has been successfully published to the marketplace.",
      });

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      category: 'stud-dog',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      contactLocation: '',
      title: '',
      description: '',
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedAnimal = mockAnimals.find(a => a.id === formData.animalId);

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

              {/* Animal Selection */}
              <div className="space-y-3">
                <Label htmlFor="animal" className="text-sm font-medium">
                  {formData.category === 'frozen-semen' ? 'Frozen Semen ID' : 'Select Animal'} *
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
                  <Select
                    value={formData.animalId}
                    onValueChange={(value) => updateFormData('animalId', value)}
                  >
                    <SelectTrigger className="bg-background border-primary/20 focus:border-primary">
                      <SelectValue placeholder="Choose an animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAnimals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} - {animal.breed} ({animal.type === 'bitch' ? 'Female' : 'Male'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Selected Animal Preview */}
              {selectedAnimal && (
                <Alert className="border-chart-3/50 bg-chart-3/10">
                  <CheckCircle className="h-4 w-4 text-chart-3" />
                  <AlertDescription className="ml-2">
                    <strong>Selected:</strong> {selectedAnimal.name} - {selectedAnimal.breed}
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className="text-xs">{selectedAnimal.type === 'bitch' ? 'Female' : 'Male'}</Badge>
                      <Badge variant="outline" className="text-xs">{selectedAnimal.age}</Badge>
                      <Badge variant="outline" className="text-xs">{selectedAnimal.color}</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!validateStep(1) && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2 text-sm text-foreground">
                    Please select both a category and an animal/semen ID to continue
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
                  Provide contact details for interested buyers
                </p>
              </div>

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
                <Label htmlFor="price">Price (AUD)</Label>
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
                    {formData.price && <div>Price: ${formData.price.toLocaleString()} AUD</div>}
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

            {currentStep < 3 ? (
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
                disabled={!validateStep(3)}
                className="bg-gradient-brand hover:opacity-90 shadow-card"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
