"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Plus, Save } from "lucide-react";

interface VeterinaryClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: any; // For editing existing clinic
}

export function VeterinaryClinicDialog({
  open,
  onOpenChange,
  clinic,
}: VeterinaryClinicDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!clinic;

  const [formData, setFormData] = useState({
    clinicName: "",
    veterinarianName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    emergencyAvailable: false,
    emergencyPhone: "",
    isPrimary: false,
    isFavorite: false,
    notes: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (clinic && open) {
      setFormData({
        clinicName: clinic.clinicName || "",
        veterinarianName: clinic.veterinarianName || "",
        email: clinic.email || "",
        phone: clinic.phone || "",
        website: clinic.website || "",
        address: clinic.address || "",
        city: clinic.city || "",
        state: clinic.state || "",
        postalCode: clinic.postalCode || "",
        country: clinic.country || "",
        emergencyAvailable: clinic.emergencyAvailable || false,
        emergencyPhone: clinic.emergencyPhone || "",
        isPrimary: clinic.isPrimary || false,
        isFavorite: clinic.isFavorite || false,
        notes: clinic.notes || "",
      });
    } else if (!open) {
      resetForm();
    }
  }, [clinic, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/clinics/${clinic.id}` : '/api/clinics';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'add'} clinic`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast({
        title: isEditing ? "Clinic Updated" : "Clinic Added",
        description: `${formData.clinicName} has been ${isEditing ? 'updated' : 'added'} successfully`,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      clinicName: "",
      veterinarianName: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      emergencyAvailable: false,
      emergencyPhone: "",
      isPrimary: false,
      isFavorite: false,
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.clinicName) {
        toast({
          title: "Missing Clinic Name",
          description: "Please enter the clinic name",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.email) {
        toast({
          title: "Missing Email",
          description: "Please enter the clinic email",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      await saveMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving clinic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEditing ? 'Edit' : 'Add'} Veterinary Clinic</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update' : 'Save'} your veterinary clinic information for quick access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinic Name */}
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name *</Label>
            <Input
              id="clinicName"
              value={formData.clinicName}
              onChange={(e) => updateField("clinicName", e.target.value)}
              placeholder="Animal Hospital"
              required
            />
          </div>

          {/* Veterinarian & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianName">Veterinarian Name</Label>
              <Input
                id="veterinarianName"
                value={formData.veterinarianName}
                onChange={(e) => updateField("veterinarianName", e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="clinic@example.com"
                required
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+27 12 345 6789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://clinic.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Johannesburg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="Gauteng"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="2000"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="South Africa"
            />
          </div>

          {/* Emergency Services */}
          <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergencyAvailable"
                checked={formData.emergencyAvailable}
                onCheckedChange={(checked) => updateField("emergencyAvailable", checked)}
              />
              <Label htmlFor="emergencyAvailable" className="text-sm font-medium cursor-pointer">
                24/7 Emergency Services Available
              </Label>
            </div>
            
            {formData.emergencyAvailable && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="emergencyPhone" className="text-sm">
                  Emergency Phone Number
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                  placeholder="+27 12 345 6789"
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3 p-4 border border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => updateField("isPrimary", checked)}
              />
              <Label htmlFor="isPrimary" className="text-sm font-medium cursor-pointer">
                Set as primary clinic
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                checked={formData.isFavorite}
                onCheckedChange={(checked) => updateField("isFavorite", checked)}
              />
              <Label htmlFor="isFavorite" className="text-sm font-medium cursor-pointer">
                Add to favorites
              </Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any additional information about this clinic..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Update Clinic' : 'Add Clinic'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
