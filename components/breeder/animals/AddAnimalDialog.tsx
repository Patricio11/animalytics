"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PawPrint, ArrowLeft, ArrowRight, Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnimalFormData {
  // Step 1: Basic Info
  name: string;
  type: 'dog' | 'bitch';
  breed: string;
  dateOfBirth: Date | undefined;

  // Step 2: Physical Details
  color: string;
  markings: string;
  weight: string;

  // Step 3: Registration
  microchipId: string;
  registrationNumber: string;
  bloodline: string;

  // Step 4: Additional Info
  description: string;
  location: string;
}

const popularBreeds = [
  "German Shepherd",
  "Golden Retriever",
  "Labrador Retriever",
  "French Bulldog",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Rottweiler",
  "German Shorthaired Pointer",
  "Dachshund",
  "Pembroke Welsh Corgi",
  "Australian Shepherd",
  "Yorkshire Terrier",
  "Boxer",
  "Cavalier King Charles Spaniel",
  "Doberman Pinscher",
  "Great Dane",
  "Miniature Schnauzer",
  "Siberian Husky",
  "Bernese Mountain Dog"
];

export function AddAnimalDialog({ open, onOpenChange }: AddAnimalDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AnimalFormData>({
    name: "",
    type: "bitch",
    breed: "",
    dateOfBirth: undefined,
    color: "",
    markings: "",
    weight: "",
    microchipId: "",
    registrationNumber: "",
    bloodline: "",
    description: "",
    location: ""
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof AnimalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = () => {
    console.log("Animal data:", formData);

    // TODO: Save to backend
    toast({
      title: "Animal Added Successfully!",
      description: `${formData.name} has been added to your animals.`,
    });

    // Reset and close
    setFormData({
      name: "",
      type: "bitch",
      breed: "",
      dateOfBirth: undefined,
      color: "",
      markings: "",
      weight: "",
      microchipId: "",
      registrationNumber: "",
      bloodline: "",
      description: "",
      location: ""
    });
    setCurrentStep(1);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.type && formData.breed && formData.dateOfBirth;
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
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

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
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
                    "flex-1 h-1 mx-2 rounded transition-colors",
                    currentStep > step ? "bg-gradient-brand" : "bg-surface-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Animal Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter animal name"
                  className="bg-background border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Sex *</Label>
                <RadioGroup value={formData.type} onValueChange={(value: 'dog' | 'bitch') => updateFormData("type", value)}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary">
                      <RadioGroupItem value="bitch" id="bitch" />
                      <Label htmlFor="bitch" className="flex-1 cursor-pointer font-medium">
                        Bitch (Female)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 flex-1 p-4 rounded-lg border border-primary/10 bg-background cursor-pointer hover:bg-surface-secondary">
                      <RadioGroupItem value="dog" id="dog" />
                      <Label htmlFor="dog" className="flex-1 cursor-pointer font-medium">
                        Dog (Male)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Select value={formData.breed} onValueChange={(value) => updateFormData("breed", value)}>
                  <SelectTrigger id="breed" className="bg-background border-primary/20">
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {popularBreeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-primary/20",
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
                      onSelect={(date) => updateFormData("dateOfBirth", date)}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Step 2: Physical Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Physical Details</h3>
                <p className="text-sm text-muted-foreground">Optional - You can skip this step</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateFormData("color", e.target.value)}
                  placeholder="e.g., Black, Brown, White"
                  className="bg-background border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="markings">Markings</Label>
                <Input
                  id="markings"
                  value={formData.markings}
                  onChange={(e) => updateFormData("markings", e.target.value)}
                  placeholder="e.g., White chest, Black mask"
                  className="bg-background border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  className="bg-background border-primary/20"
                />
              </div>
            </div>
          )}

          {/* Step 3: Registration */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Registration Details</h3>
                <p className="text-sm text-muted-foreground">Optional - You can skip this step</p>
              </div>

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
                  placeholder="Enter registration number"
                  className="bg-background border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodline">Bloodline</Label>
                <Input
                  id="bloodline"
                  value={formData.bloodline}
                  onChange={(e) => updateFormData("bloodline", e.target.value)}
                  placeholder="Enter bloodline information"
                  className="bg-background border-primary/20"
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                <p className="text-sm text-muted-foreground">Optional - You can skip this step</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="City, State"
                  className="bg-background border-primary/20"
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
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="hover:bg-surface-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

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
              className="bg-gradient-brand hover:opacity-90 shadow-card"
            >
              <Check className="w-4 h-4 mr-2" />
              Add Animal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}