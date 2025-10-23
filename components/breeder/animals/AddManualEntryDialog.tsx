"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  position: string; // 'dam', 'sire', 'dam.dam', etc.
  generation: number;
  positionLabel: string; // 'Dam', 'Sire', 'Granddam', etc.
  onSuccess?: () => void;
}

export function AddManualEntryDialog({
  open,
  onOpenChange,
  animalId,
  position,
  generation,
  positionLabel,
  onSuccess,
}: AddManualEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    registeredName: "",
    registrationNumber: "",
    breed: "",
    sex: "" as "male" | "female" | "",
    dateOfBirth: "",
    color: "",
    notes: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Create manual entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/animals/${animalId}/pedigree/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          generation,
          name: formData.name,
          registeredName: formData.registeredName || null,
          registrationNumber: formData.registrationNumber || null,
          breed: formData.breed || null,
          sex: formData.sex || null,
          dateOfBirth: formData.dateOfBirth || null,
          color: formData.color || null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add manual entry");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Added",
        description: `${positionLabel} has been added to the pedigree`,
      });

      // Reset form
      setFormData({
        name: "",
        registeredName: "",
        registrationNumber: "",
        breed: "",
        sex: "",
        dateOfBirth: "",
        color: "",
        notes: "",
      });

      // Invalidate pedigree queries
      queryClient.invalidateQueries({ queryKey: ["pedigree", animalId] });
      
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {positionLabel} (External Animal)</DialogTitle>
          <DialogDescription>
            Add an external animal that's not in your system. This will be stored as a manual pedigree entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter name"
                className="border-primary/20 focus:border-primary"
                required
              />
            </div>

            {/* Registered Name */}
            <div className="space-y-2">
              <Label htmlFor="registeredName">Registered Name</Label>
              <Input
                id="registeredName"
                value={formData.registeredName}
                onChange={(e) => updateFormData("registeredName", e.target.value)}
                placeholder="Full registered name (optional)"
                className="border-primary/20 focus:border-primary"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sex */}
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) => updateFormData("sex", value)}
                >
                  <SelectTrigger className="border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Breed */}
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => updateFormData("breed", e.target.value)}
                  placeholder="Enter breed"
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateFormData("color", e.target.value)}
                  placeholder="Enter color"
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                placeholder="Enter registration number"
                className="border-primary/20 focus:border-primary"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Additional information about this animal..."
                className="border-primary/20 focus:border-primary min-h-[80px]"
              />
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This animal will be marked as an external entry and will appear with a special indicator in the pedigree tree.
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {createEntryMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createEntryMutation.error?.message || "Failed to add entry"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createEntryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEntryMutation.isPending || !formData.name.trim()}
              className="bg-gradient-brand hover:opacity-90"
            >
              {createEntryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
